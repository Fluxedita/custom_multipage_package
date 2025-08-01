"use client";
import React, { useState, useEffect, Suspense, useCallback, useRef } from "react";
import useSWR from "swr";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { PageControls } from '../components/PageControls';
import { Section, HeroSectionType, SliderSectionType } from '@/types/sections';
import supabase from '@/lib/supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import { Database } from '@/types/supabase';

// Initialize Supabase client with proper typing
// const supabase = createClient();
import SearchParamsProvider from '@/components/providers/SearchParamsProvider';
import { Button } from '@/components/ui/button';
import { Pencil, Plus, Trash2, MoveUp, MoveDown, Save, Eye, ChevronRight } from 'lucide-react';
import { useAuth } from '@/components/providers/AuthProvider';
import { useEditMode } from '@/hooks/EditModeContext';
import { ClientFooter } from "@/components/ClientFooter";
import { useToast } from '@/hooks/use-toast';
import MediaLibrary from '@/components/media/MediaLibrary';
// Import section components from the custom pages directory
import {
  HeroSection,
  SliderSection,
  TextSection,
  FeatureSection,
  CTASection,
  GallerySection,
  DividerSection,
  InfoCardSection,
  FeatureCardGridSection,
  AdvancedSliderSection,
  MediaTextSection,
  MediaTextColumnsSection,
  TwoColumnTextSection,
  QuoteSection,
  HeadingSection,
  FooterSection,
  PrivacySection,
  MediaPlaceholderSection,
  ProductPackageLeftSection,
  ProductPackageRightSection,
  TextWithVideoLeftSection,
  TextWithVideoRightSection,
  EditableTitleSection,
} from '@/app/custom_pages/components/sections';
import { HeroSectionResponsive } from '../components/sections/HeroSectionResponsive';
import FluxeditaAdvancedFormSection from '@/app/custom_contact_section/FluxeditaAdvancedFormSection';
import { cn } from '@/lib/utils';
import { createDefaultCustomCodeSection } from '@/app/custom_code_section/utils';
import CustomCodeSection from '@/app/custom_code_section/CustomCodeSection';
import CustomCodeSectionEditor from '@/app/custom_code_section/CustomCodeSectionEditor';
import ContactFormSection from '@/app/custom_contact_section/ContactFormSection';
// Import updated custom section components

const fetcher = async (url: string) => {
  // Get the current session from the auth provider
  const { data: { session } } = await supabase.auth.getSession();
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };
  
  if (session) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }
  
  const response = await fetch(url, {
    credentials: 'include',
    headers,
  });
  
  if (!response.ok) {
    let errorMessage = 'An error occurred while fetching the data.';
    try {
      const errorData = await response.json();
      errorMessage = errorData.error || errorData.message || errorMessage;
    } catch (e) {
      // If we can't parse the error response, use the status text
      errorMessage = response.statusText || errorMessage;
    }
    
    const error = new Error(errorMessage);
    (error as any).status = response.status;
    throw error;
  }
  
  return response.json();
};

export default function CustomPageClient() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;
  const { data, error: swrError, isLoading, mutate } = useSWR(slug ? `/api/pages/${slug}/content` : null, fetcher);
  const { user, loading: authLoading, isAdmin } = useAuth();
  const { isEditMode, setEditMode, toggleEditMode } = useEditMode();
  const { toast } = useToast();
  
  // State management
  const [sections, setSections] = useState<Section[]>([]);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showControls, setShowControls] = useState(false);
  const [isMediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaDialogIdx, setMediaDialogIdx] = useState<number | null>(null);
  const [currentMediaCardId, setCurrentMediaCardId] = useState<string | null>(null);
  const [currentMediaSectionIdx, setCurrentMediaSectionIdx] = useState<number | null>(null);
  // Remove isSidebarCollapsed state since we'll use showControls instead
  const [pageProperties, setPageProperties] = useState({
    backgroundColor: '#ffffff',
    backgroundOpacity: 1,
    backgroundImage: '',
    backgroundVideo: '',
    fontFamily: 'sans-serif',
    textColor: '#000000',
    linkColor: '#2563eb',
    textShadow: '0 0 0 transparent',
    lineHeight: 1.5,
    letterSpacing: 0,
    maxWidth: '1200px',
    isFullWidth: false,
    sectionSpacing: 2,
    pageTitle: '',
    metaDescription: '',
    language: 'en',
  });

  const router = useRouter();
  const searchParams = useSearchParams();

  // --- Footer visibility on scroll ---
  const footerSentinelRef = useRef<HTMLDivElement | null>(null);
  const [showFooter, setShowFooter] = useState(false);
  useEffect(() => {
    const sentinel = footerSentinelRef.current;
    if (!sentinel) return;
    const observer = new window.IntersectionObserver(
      ([entry]) => setShowFooter(entry.isIntersecting),
      { root: null, threshold: 0.01 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);
  // --- End footer visibility logic ---

  // Handle media selection for media/text and media placeholder sections
  const handleMediaSelect = (sectionIdx: number, cardId?: string) => {
    if (cardId) {
      // For media placeholder sections, store both the section index and card ID
      setCurrentMediaCardId(cardId);
    }
    setMediaDialogIdx(sectionIdx);
  };

  // Handle duplicate section
  const handleDuplicateSection = (duplicatedSection: any) => {
    setSections(prevSections => {
      const index = prevSections.findIndex(s => s.id === duplicatedSection.id);
      if (index === -1) return prevSections;
      
      // Create a new section with a new ID and any other necessary updates
      const newSection = {
        ...duplicatedSection,
        id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
      };
      
      // Insert the duplicated section after the original one
      const newSections = [...prevSections];
      newSections.splice(index + 1, 0, newSection);
      setIsDirty(true);
      return newSections;
    });
  };

  const handleAddSection = (type: string) => {
    console.log('handleAddSection called with type:', type);
    console.log('Current sections before adding:', sections);
    
    // Automatically enter edit mode when adding sections
    if (!isEditMode) {
      console.log('Entering edit mode to add section');
      handleToggleEditMode(); // Use the existing toggle function instead of manual URL updates
    }
    
    const newSection = createDefaultSection(type);
    console.log('Created new section:', newSection);
    
    setSections(prevSections => {
      const updatedSections = [...prevSections, newSection];
      console.log('Updated sections:', updatedSections);
      return updatedSections;
    });
    
    setIsDirty(true);
    console.log('Section added successfully');
  };

  // Handle delete
  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this page? This action cannot be undone.')) {
      // TODO: Implement delete logic here
      console.log('Page deleted');
      router.push('/');
    }
  };
  
  // Handle toggle TTS
  const handleToggleTTS = () => {
    // TODO: Implement TTS toggle logic here
    console.log('TTS toggled');
  };
  
  // Handle preview
  const handlePreview = () => {
    const newParams = new URLSearchParams(searchParams?.toString() ?? '');
    newParams.set('edit', 'false');
    router.push(`?${newParams.toString()}`);
  };


  // Debug auth state
  useEffect(() => {
    console.log('Auth state updated in CustomPageClient:', { 
      user: user ? { email: user.email, id: user.id } : null, 
      isAdmin, 
      authLoading,
      isEditMode,
      searchParams: Object.fromEntries(searchParams?.entries?.() ?? [])
    });
  }, [user, isAdmin, authLoading, isEditMode, searchParams]);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // No need for separate sidebar collapse state persistence
  // We'll handle it with showControls state

  // Set edit mode based on URL and admin status
  useEffect(() => {
    if (authLoading) return;
    
    const editParam = searchParams?.get('edit');
    const shouldBeInEditMode = isAdmin && editParam === 'true';
    
    if (isEditMode !== shouldBeInEditMode) {
      console.log('Updating edit mode from URL:', { isAdmin, editParam, shouldBeInEditMode });
      setEditMode(shouldBeInEditMode);
      setShowControls(shouldBeInEditMode);
    }
  }, [searchParams, isAdmin, authLoading, isEditMode]);

  // Initialize sections with fetched data
  useEffect(() => {
    console.log('Data received from SWR:', data);
    if (data) {
      if (data.content?.sections) {
        console.log('Initializing sections with fetched data:', data.content.sections);
        setSections(data.content.sections);
        setIsDirty(false);
      }
      
      // Initialize page properties from API data if available
      if (data.content?.properties) {
        console.log('Initializing page properties:', data.content.properties);
        setPageProperties(prev => ({
          ...prev,
          ...data.content.properties
        }));
      }
      
      if (!isLoading) {
        setLoading(false);
      }
    }
  }, [data, isLoading]);

  // Handle edit mode toggle
  const handleToggleEditMode = useCallback(() => {
    if (!isAdmin) return;
    // Always force edit mode ON and update the URL param, so user can re-enter edit mode for editing existing sections
    setEditMode(true);
    setShowControls(true);
    const newSearchParams = new URLSearchParams(searchParams?.toString() ?? '');
    newSearchParams.set('edit', 'true');
    router.replace(`?${newSearchParams.toString()}`, { scroll: false });
  }, [isAdmin, setEditMode, searchParams, router]); // Already correct: always enables edit mode and controls


  // Section management functions
  const handleSectionMoveUp = (sectionId: string) => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex <= 0) return;
    
    const newSections = [...sections];
    const [movedSection] = newSections.splice(currentIndex, 1);
    newSections.splice(currentIndex - 1, 0, movedSection);
    
    setSections(newSections);
    setIsDirty(true);
  };

  const handleSectionMoveDown = (sectionId: string) => {
    const currentIndex = sections.findIndex(s => s.id === sectionId);
    if (currentIndex === -1 || currentIndex >= sections.length - 1) return;
    
    const newSections = [...sections];
    const [movedSection] = newSections.splice(currentIndex, 1);
    newSections.splice(currentIndex + 1, 0, movedSection);
    
    setSections(newSections);
    setIsDirty(true);
  };

  const handleSectionDelete = (sectionId: string) => {
    if (!window.confirm('Are you sure you want to delete this section? This action cannot be undone.')) {
      return;
    }
    
    const newSections = sections.filter(s => s.id !== sectionId);
    setSections(newSections);
    setIsDirty(true);
  };

  const handleSectionChange = (updatedSection: Section) => {
    setSections(prevSections => 
      prevSections.map(section => 
        section.id === updatedSection.id ? updatedSection : section
      )
    );
    setIsDirty(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      console.log('Starting save operation...');
      
      // Get the current session to include the auth token
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Authentication error: ' + sessionError.message);
      }
      
      if (!session) {
        throw new Error('No active session. Please sign in again.');
      }
      
      const headers: HeadersInit = {
        'Content-Type': 'application/json',
      };
      
      if (session.access_token) {
        headers['Authorization'] = `Bearer ${session.access_token}`;
        console.log('Using access token for authorization');
      } else {
        console.warn('No access token found in session');
      }
      
      console.log('Sending PATCH request to /api/pages/${slug}/content');
      console.log('Request payload:', { sections, properties: pageProperties });
      
      const response = await fetch(`/api/pages/${slug}/content`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ 
          sections,
          properties: pageProperties 
        }),
      });
      
      console.log('Save response status:', response.status);
      
      if (!response.ok) {
        let errorMessage = `HTTP error! Status: ${response.status}`;
        try {
          const errorData = await response.json();
          console.error('Error response data:', errorData);
          errorMessage = errorData.error || errorData.message || errorMessage;
        } catch (e) {
          const text = await response.text();
          console.error('Failed to parse error response:', text);
          errorMessage = `Failed to save page: ${text}`;
        }
        toast({ title: 'Error', description: errorMessage, variant: 'destructive' });
        throw new Error(errorMessage);
      }
      
      toast({ title: 'Page saved', description: 'Your changes have been saved.', variant: 'default' });
      console.log('Save successful, triggering revalidation...');
      await mutate();
      setIsDirty(false);
      console.log('Save completed successfully');
    } catch (error) {
      console.error('Error in handleSave:', error);
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Unknown error', variant: 'destructive' });
      if (error instanceof Error) {
        alert(`Error saving page: ${error.message}`);
      } else {
        alert('An unknown error occurred while saving the page');
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handlePagePropertiesChange = (newProperties: Partial<typeof pageProperties>) => {
    setPageProperties(prev => ({
      ...prev,
      ...newProperties
    }));
    if (!isDirty) {
      setIsDirty(true);
    }
  };

  const createDefaultSection = (type: string): Section => {
    const baseSection = {
      id: `section-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      visible: true
    };

    if (type === 'custom-code') {
      return createDefaultCustomCodeSection();
    }

    switch (type) {
      case 'editable-title':
        return {
          ...baseSection,
          type: 'editable-title',
          title: 'Page Title',
          slug: 'page-title',
          titleTextStyle: {
            fontSize: '2.5rem',
            fontWeight: 'bold',
            color: '#000000',
            textAlign: 'left',
            lineHeight: 1.2,
            letterSpacing: '0',
            textTransform: 'none',
            fontStyle: 'normal',
            textDecoration: 'none',
            fontFamily: 'inherit'
          },
          alignment: 'left'
        };

      case 'hero':
        return {
          ...baseSection,
          type: 'hero',
          title: 'Hero Section',
          description: 'Add a compelling description here',
          buttonText: 'Learn More',
          buttonUrl: '#',
          backgroundImage: '',
          overlayColor: 'rgba(0,0,0,0.5)',
          textColor: '#ffffff',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableSpeech: false
        };

      case 'slider':
        return {
          ...baseSection,
          type: 'slider',
          slides: [],
          autoplay: true,
          autoplayDelay: 5000,
          effect: 'slide',
          height: '70vh',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          showNavigation: true,
          showPagination: true,
          loop: true,
          width: '100%',
          enableSpeech: false
        };

      case 'info-card':
        return {
          ...baseSection,
          type: 'info-card',
          backgroundUrl: '',
          numCards: 3,
          cards: [
            {
              id: `card-${Date.now()}-1`,
              mediaUrl: '',
              mediaType: 'image',
              title: 'Card Title',
              description: 'Card description goes here',
              ctaText: 'Learn More',
              ctaUrl: '#',
              ctaOpenInNewTab: false,
              textStyle: {}
            }
          ]
        };

      case 'text':
        return {
          ...baseSection,
          type: 'text',
          content: 'New Text Section',
          alignment: 'left',
          fontSize: '16px',
          fontColor: '#333333',
          backgroundColor: 'transparent',
          padding: '16px',
          margin: '16px 0',
          textStyle: {},
          mediaUrl: '',
          mediaType: 'image',
          mediaPosition: 'top',
          mediaWidth: '100%',
          mediaHeight: 'auto'
        };

      case 'content':
        return {
          ...baseSection,
          type: 'content',
          content: 'This is the default content section. You can edit this to add your own content.',
          alignment: 'left',
          fontSize: '16px',
          fontColor: '#333333',
          backgroundColor: 'transparent',
          padding: '16px',
          margin: '16px 0',
          textStyle: {
            fontStyle: 'normal',
            fontColor: '#333333',
            fontSize: '16px',
          },
          enableSpeech: false,
          visible: true
        };

      case 'feature':
        return {
          ...baseSection,
          type: 'feature',
          title: 'Features',
          description: 'Highlight your key features',
          features: [
            {
              title: 'Feature 1',
              description: 'Description for feature 1',
              icon: 'check'
            },
            {
              title: 'Feature 2',
              description: 'Description for feature 2',
              icon: 'check'
            }
          ],
          layout: 'grid',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableFeatureSpeech: false
        };

      case 'cta':
        return {
          ...baseSection,
          type: 'cta',
          title: 'Call to Action',
          description: 'Encourage users to take action',
          buttonText: 'Get Started',
          buttonUrl: '#',
          backgroundImage: '',
          overlayColor: 'rgba(0,0,0,0.5)',
          textColor: '#ffffff',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableSpeech: false
        };

      case 'gallery':
        return {
          ...baseSection,
          type: 'gallery',
          title: 'Image Gallery',
          description: 'Showcase your images',
          images: [],
          columns: 3,
          enableTitleSpeech: false,
          enableDescriptionSpeech: false
        };

      case 'divider':
        return {
          ...baseSection,
          type: 'divider',
          style: 'solid',
          color: '#e5e7eb',
          thickness: '2px',
          width: '100%',
          margin: '2rem 0',
          alignment: 'center',
          enableSpeech: false,
          visible: true,
        };

      case 'media-text-left':
        return {
          ...baseSection,
          type: 'media-text-left',
          title: '',
          description: '',
          mediaUrl: '',
          mediaType: 'image',
          mediaPosition: 'left',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableSpeech: false,
          visible: true
        };

      case 'media-text-right':
        return {
          ...baseSection,
          type: 'media-text-right',
          title: '',
          description: '',
          mediaUrl: '',
          mediaType: 'image',
          mediaPosition: 'right',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableSpeech: false,
          visible: true
        };

      case 'mediaTextColumns':
        return {
          ...baseSection,
          type: 'mediaTextColumns',
          title: '',
          description: '',
          mediaUrl: '',
          mediaType: 'image',
          mediaPosition: 'left',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableSpeech: false,
          visible: true
        };

      case 'twoColumnText':
        return {
          ...baseSection,
          type: 'twoColumnText',
          leftColumn: '',
          rightColumn: '',
          enableSpeech: false,
          visible: true
        };

      case 'quote':
        return {
          ...baseSection,
          type: 'quote',
          quote: '',
          author: '',
          enableSpeech: false,
          visible: true
        };

      case 'heading':
        return {
          ...baseSection,
          type: 'heading',
          title: '',
          level: 'h2',
          enableSpeech: false,
          visible: true
        };

      case 'footer':
        return {
          ...baseSection,
          type: 'footer',
          numColumns: 3,
          columns: [],
          backgroundColor: '#f8f9fa',
          textColor: '#333333',
          padding: '2rem'
        };

      case 'fluxedita_advanced_form':
        return {
          ...baseSection,
          type: 'fluxedita_advanced_form' as const,
          enableSpeech: false,
          visible: true
        };

      case 'feature-card-grid':
        return {
          ...baseSection,
          type: 'feature-card-grid',
          numCards: 3,
          cards: [],
          enableSpeech: false,
          visible: true
        };

      case 'contact-form':
        return {
          ...baseSection,
          type: 'contact-form',
          formAction: '/api/contact',
          formMethod: 'POST',
          fields: [
            { id: 'name', name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Your name' },
            { id: 'email', name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' },
            { id: 'message', name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Your message' },
          ],
          mediaUpload: false,
        };

      case 'advanced-slider':
        return {
          ...baseSection,
          type: 'advanced-slider',
          slides: [],
          autoplay: false,
          autoplayDelay: 5000,
          effect: 'slide',
          height: '70vh',
          enableSpeech: false,
          visible: true
        };

      case 'privacy':
        return {
          ...baseSection,
          type: 'privacy',
          content: `<p>
            This is a summary of our privacy policy. We respect your privacy and are committed to protecting your personal data.
            We do not sell or share your information with third parties except as required by law or to provide our services.
            For the full policy, please see our <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> page.
          </p>`,
        };

      case 'media-placeholder':
        return {
          ...baseSection,
          type: 'media-placeholder',
          cards: [
            {
              id: 'card-1',
              title: 'Sample Media Card',
              description: 'This is a sample media card. You can add more cards and customize them.',
              mediaUrl: '',
              mediaType: 'image',
            }
          ],
          visibleCount: 3,
          currentPage: 0,
          visible: true,
          enableSpeech: false,
        };

      case 'product-package-left':
        return {
          id: `product-package-left-${Date.now()}`,
          type: 'product-package-left',
          visible: true,
          enableSpeech: false,
          name: 'Product Name',
          subtitle: 'Product Subtitle',
          description: 'Describe your product package here.',
          badge: '',
          features: ['Feature 1', 'Feature 2'],
          perfectFor: ['Use 1', 'Use 2'],
          color: 'from-blue-500 to-blue-700',
          imageSrc: '',
          imageAlt: '',
          horizontalPadding: 0,
          verticalPadding: 0,
          learnMoreText: 'Learn More',
          learnMoreUrl: '#',
        } as Section;
      case 'product-package-right':
        return {
          id: `product-package-right-${Date.now()}`,
          type: 'product-package-right',
          visible: true,
          enableSpeech: false,
          name: 'Product Name',
          subtitle: 'Product Subtitle',
          description: 'Describe your product package here.',
          badge: '',
          features: ['Feature 1', 'Feature 2'],
          perfectFor: ['Use 1', 'Use 2'],
          color: 'from-blue-500 to-blue-700',
          imageSrc: '',
          imageAlt: '',
          horizontalPadding: 0,
          verticalPadding: 0,
          learnMoreText: 'Learn More',
          learnMoreUrl: '#',
        } as Section;
      case 'text-with-video-left':
        return {
          id: `text-with-video-left-${Date.now()}`,
          type: 'text-with-video-left',
          visible: true,
          enableSpeech: false,
          title: 'Text with Video',
          tagline: 'Your Tagline',
          description: 'Add a description for this section.',
          videoId: '',
          buttonText: 'Watch Tutorial',
          horizontalPadding: 0,
          verticalPadding: 0,
        } as Section;
      case 'text-with-video-right':
        return {
          id: `text-with-video-right-${Date.now()}`,
          type: 'text-with-video-right',
          visible: true,
          enableSpeech: false,
          title: 'Text with Video',
          tagline: 'Your Tagline',
          description: 'Add a description for this section.',
          videoId: '',
          buttonText: 'Watch Tutorial',
          horizontalPadding: 0,
          verticalPadding: 0,
        } as Section;

      default:
        return {
          ...baseSection,
          type: 'text',
          content: 'New Section',
          alignment: 'left',
          fontSize: '16px',
          fontColor: '#333333',
          backgroundColor: 'transparent',
          padding: '16px',
          margin: '16px 0',
          textStyle: {}
        };
    }
  };



  const renderWrappedSection = (section: Section, idx: number) => {
    // Determine section background based on type
    let bgClass = 'bg-white dark:bg-gray-900';
    if (section.type === 'cta') {
      bgClass = 'bg-gradient-to-r from-rose-500 to-pink-500 text-white';
    } else if (section.type === 'feature' || section.type === 'feature-card-grid') {
      bgClass = 'bg-gray-50 dark:bg-gray-800';
    }

    const isFullWidth = section.width === '100vw';

    return (
      <section
        id={section.id}
        key={section.id}
        className={
          isFullWidth
            ? `py-0 w-screen left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] relative ${isEditMode ? 'group' : ''}`
            : `py-16 ${bgClass} ${isEditMode ? 'relative group' : ''}`
        }
        style={isFullWidth ? { width: '100vw' } : {}}
      >
        {isFullWidth
          ? renderSection(section, idx)
          : (
            <div className="container mx-auto px-4 md:px-6">
              {renderSection(section, idx)}
            </div>
          )
        }
      </section>
    );
  };

  const renderSection = (section: Section, idx: number) => {
    const handleSectionChange = (updatedSection: Section) => {
      const newSections = [...sections];
      newSections[idx] = updatedSection;
      setSections(newSections);
      setIsDirty(true);
    };

    const handleRemove = () => {
      if (window.confirm('Are you sure you want to remove this section?')) {
        const newSections = sections.filter((_, i) => i !== idx);
        setSections(newSections);
        setIsDirty(true);
      }
    };

    const handleMoveUp = idx > 0 ? () => {
      const newSections = [...sections];
      [newSections[idx - 1], newSections[idx]] = [newSections[idx], newSections[idx - 1]];
      setSections(newSections);
      setIsDirty(true);
    } : undefined;

    const handleMoveDown = idx < sections.length - 1 ? () => {
      const newSections = [...sections];
      [newSections[idx], newSections[idx + 1]] = [newSections[idx + 1], newSections[idx]];
      setSections(newSections);
      setIsDirty(true);
    } : undefined;

    const renderSectionControls = (sectionId: string) => (
      <div className="flex space-x-2 p-2 bg-gray-100 rounded-b">
        <button
          onClick={handleRemove}
          className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
          title="Remove section"
        >
          Remove
        </button>
        {handleMoveUp && (
          <button
            onClick={handleMoveUp}
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            title="Move up"
          >
            ↑
          </button>
        )}
        {handleMoveDown && (
          <button
            onClick={handleMoveDown}
            className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            title="Move down"
          >
            ↓
          </button>
        )}
      </div>
    );

    // Common props for all section components
    const baseProps = {
      key: section.id,
      isEditMode,
      onRemove: handleRemove,
      onMoveUp: handleMoveUp,
      onMoveDown: handleMoveDown,
      idx,
      onSectionChange: handleSectionChange,
      speakText: (text: string) => {
        // Implement text-to-speech if needed
        console.log('Speaking:', text);
      }
    };

    let sectionComponent = null;
    
    switch (section.type) {
      case 'slider':
        const sliderSection: SliderSectionType = {
          ...section,
          type: 'slider' as const,
          slides: (section as any).slides || [],
          autoplay: (section as any).autoplay || false,
          autoplayDelay: (section as any).autoplayDelay || 5000,
          effect: ((section as any).effect || 'slide') as 'slide' | 'fade',
          height: (section as any).height || '70vh',
          enableTitleSpeech: (section as any).enableTitleSpeech || false,
          enableDescriptionSpeech: (section as any).enableDescriptionSpeech || false,
          showNavigation: true,
          showPagination: true,
          loop: true,
          width: '100%',
          enableSpeech: false,
          visible: section.visible !== false
        };
        
        // Create a noop function for renderSectionControls when not in edit mode
        const renderControls = baseProps.isEditMode 
          ? (slideIdx: number) => (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )
          : () => null; // Return null when not in edit mode
        
        sectionComponent = (
          <div className="relative group w-full">
            <SliderSection 
              section={sliderSection}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
              idx={idx}
              renderSectionControls={renderControls}
            />
          </div>
        );
        break;
      
      case 'hero':
      case 'new_hero':
        sectionComponent = (
          <div className="relative group">
            <HeroSection 
              section={{
                ...section,
                type: 'hero' as const,
                title: (section as any).title || 'Hero Section',
                description: (section as any).description || '',
                buttonText: (section as any).buttonText || 'Learn More',
                buttonUrl: (section as any).buttonUrl || '#',
                backgroundImage: (section as any).backgroundImage || '',
                overlayColor: (section as any).overlayColor || 'rgba(0,0,0,0.5)',
                textColor: (section as any).textColor || '#ffffff',
                enableTitleSpeech: (section as any).enableTitleSpeech || false,
                enableDescriptionSpeech: (section as any).enableDescriptionSpeech || false,
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChangeAction={handleSectionChange}
              speakTextAction={baseProps.speakText}
              isDirty={isDirty}
              isSaving={isSaving}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;
      case 'hero-responsive':
        sectionComponent = (
          <div className="relative group">
            <HeroSectionResponsive
              section={section as any}
              isEditMode={baseProps.isEditMode}
              onSectionChangeAction={handleSectionChange}
              speakTextAction={baseProps.speakText}
              isDirty={isDirty}
              isSaving={isSaving}
              renderSectionControlsAction={baseProps.isEditMode ? () => renderSectionControls(section.id) : undefined}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;
      case 'text':
        sectionComponent = (
          <div className="relative group">
            <TextSection
              section={{
                ...section,
                type: 'text' as const,
                content: (section as any).content || '',
                alignment: (section as any).alignment || 'left',
                fontSize: (section as any).fontSize || '16px',
                fontColor: (section as any).fontColor || '#333333',
                backgroundColor: (section as any).backgroundColor || 'transparent',
                padding: (section as any).padding || '0',
                margin: (section as any).margin || '0',
                textStyle: {
                  fontStyle: (section as any).textStyle?.fontStyle || 'normal',
                  fontColor: (section as any).textStyle?.fontColor || (section as any).fontColor || '#333333',
                  fontSize: (section as any).textStyle?.fontSize || (section as any).fontSize || '16px',
                  textShadow: (section as any).textStyle?.textShadow,
                  textOutline: (section as any).textStyle?.textOutline,
                  textBackground: (section as any).textStyle?.textBackground
                },
                mediaUrl: (section as any).mediaUrl || '',
                mediaType: (section as any).mediaType || 'image',
                mediaPosition: (section as any).mediaPosition || 'top',
                mediaWidth: (section as any).mediaWidth || '100%',
                mediaHeight: (section as any).mediaHeight || 'auto',
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
              onMediaSelect={() => setMediaDialogIdx(idx)}
              onDuplicate={(duplicatedSection) => {
                // Add the duplicated section after the current one
                const newSections = [...sections];
                newSections.splice(idx + 1, 0, duplicatedSection);
                setSections(newSections);
                setIsDirty(true);
              }}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;
      
      case 'feature':
        sectionComponent = (
          <div className="relative group">
            <FeatureSection
              section={{
                ...section,
                type: 'feature' as const,
                title: (section as any).title || 'Features',
                description: (section as any).description || '',
                features: (section as any).features || [],
                layout: (section as any).layout || 'grid',
                enableTitleSpeech: (section as any).enableTitleSpeech || false,
                enableDescriptionSpeech: (section as any).enableDescriptionSpeech || false,
                enableFeatureSpeech: false,
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;
      
      case 'info-card':
        sectionComponent = (
          <InfoCardSection
            section={section as any}
            isEditMode={isEditMode}
            onSectionChange={(updated: Partial<Section>) => {
              handleSectionChange({ ...section, ...updated });
            }}
            speakText={baseProps.speakText}
          />
        );
        break;

      case 'cta':
        sectionComponent = (
          <div className="relative group">
            <CTASection
              section={{
                ...section,
                type: 'cta' as const,
                title: (section as any).title || 'Call to Action',
                description: (section as any).description || 'Take the next step',
                buttonText: (section as any).buttonText || 'Click Here',
                buttonUrl: (section as any).buttonUrl || '#',
                backgroundColor: (section as any).backgroundColor || '#4f46e5',
                textColor: (section as any).textColor || '#ffffff',
                enableTitleSpeech: (section as any).enableTitleSpeech || false,
                enableDescriptionSpeech: (section as any).enableDescriptionSpeech || false,
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;
      
      case 'gallery':
        sectionComponent = (
          <div className="relative group">
            <GallerySection
              section={{
                ...section,
                type: 'gallery' as const,
                title: (section as any).title || 'Gallery',
                description: (section as any).description || '',
                images: (section as any).images || [],
                layout: (section as any).layout || 'grid',
                enableTitleSpeech: (section as any).enableTitleSpeech || false,
                enableDescriptionSpeech: (section as any).enableDescriptionSpeech || false,
                enableImageSpeech: false,
                enableSpeech: false,
                visible: section.visible !== false,
              }}
              isEditMode={baseProps.isEditMode}
              speakText={baseProps.speakText}
              onSectionChange={handleSectionChange}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;
      
      case 'content':
        // Handle 'content' sections as text sections
        sectionComponent = (
          <div className="relative group">
            <TextSection
              section={{
                id: section.id,
                type: 'text' as const,
                content: (section as any).content || '',
                alignment: 'left',
                fontSize: '16px',
                fontColor: '#333333',
                backgroundColor: 'transparent',
                padding: '16px',
                margin: '16px 0',
                textStyle: {
                  fontStyle: 'normal',
                  fontColor: '#333333',
                  fontSize: '16px',
                },
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
              onDuplicate={(duplicatedSection) => {
                // Add the duplicated section after the current one
                const newSections = [...sections];
                newSections.splice(idx + 1, 0, duplicatedSection);
                setSections(newSections);
                setIsDirty(true);
              }}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;
        
      case 'divider':
        sectionComponent = (
          <div className="relative group">
            <DividerSection
              section={section as any}
              isEditMode={isEditMode}
              onSectionChange={s => handleSectionChange({ ...section, ...s })}
              onDuplicate={(duplicatedSection) => {
                // Create a new section with a new ID
                const newSection = {
                  ...duplicatedSection,
                  id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)),
                };
                
                // Insert the duplicated section after the current one
                const newSections = [...sections];
                const currentIndex = newSections.findIndex(s => s.id === section.id);
                if (currentIndex !== -1) {
                  newSections.splice(currentIndex + 1, 0, newSection);
                  setSections(newSections);
                  setIsDirty(true);
                }
              }}
              idx={idx}
              renderSectionControls={() => renderSectionControls(section.id)}
            />
            {isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'media-text-left':
        sectionComponent = (
          <div className="relative group">
            <MediaTextSection
              section={{
                ...section,
                type: 'media-text-left' as const,
                title: (section as any).title || '',
                description: (section as any).description || '',
                mediaUrl: (section as any).mediaUrl || '',
                mediaType: (section as any).mediaType || 'image',
                enableTitleSpeech: (section as any).enableTitleSpeech || false,
                enableDescriptionSpeech: (section as any).enableDescriptionSpeech || false,
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
              onMediaSelect={() => setMediaDialogIdx(idx)}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'media-text-right':
        sectionComponent = (
          <div className="relative group">
            <MediaTextSection
              section={{
                ...section,
                type: 'media-text-right' as const,
                title: (section as any).title || '',
                description: (section as any).description || '',
                mediaUrl: (section as any).mediaUrl || '',
                mediaType: (section as any).mediaType || 'image',
                enableTitleSpeech: (section as any).enableTitleSpeech || false,
                enableDescriptionSpeech: (section as any).enableDescriptionSpeech || false,
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
              onMediaSelect={() => setMediaDialogIdx(idx)}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'mediaTextColumns':
        sectionComponent = (
          <div className="relative group">
            <MediaTextColumnsSection
              section={{
                ...section,
                type: 'mediaTextColumns' as const,
                title: (section as any).title || '',
                description: (section as any).description || '',
                mediaUrl: (section as any).mediaUrl || '',
                mediaType: (section as any).mediaType || 'image',
                mediaPosition: (section as any).mediaPosition || 'left',
                enableTitleSpeech: (section as any).enableTitleSpeech || false,
                enableDescriptionSpeech: (section as any).enableDescriptionSpeech || false,
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'twoColumnText':
        sectionComponent = (
          <div className="relative group">
            <TwoColumnTextSection
              section={{
                ...section,
                type: 'twoColumnText' as const,
                leftColumn: (section as any).leftColumn || '',
                rightColumn: (section as any).rightColumn || '',
                enableLeftColumnSpeech: (section as any).enableLeftColumnSpeech || false,
                enableRightColumnSpeech: (section as any).enableRightColumnSpeech || false,
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'quote':
        sectionComponent = (
          <div className="relative group">
            <QuoteSection
              section={{
                ...section,
                type: 'quote' as const,
                text: (section as any).text || (section as any).quote || '',
                author: (section as any).author || '',
                alignment: (section as any).alignment || 'left',
                fontSize: (section as any).fontSize || '18px',
                fontColor: (section as any).fontColor || '#333333',
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'heading':
        sectionComponent = (
          <div className="relative group">
            <HeadingSection
              section={{
                ...section,
                type: 'heading' as const,
                text: (section as any).text || (section as any).title || '',
                level: (section as any).level || 'h2',
                alignment: (section as any).alignment || 'left',
                fontSize: (section as any).fontSize || '24px',
                fontColor: (section as any).fontColor || '#333333',
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
              idx={idx}
              renderSectionControls={() => renderSectionControls(section.id)}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'footer':
        sectionComponent = (
          <div className="relative group">
            <FooterSection
              section={{
                id: section.id,
                type: 'footer' as const,
                numColumns: (section as any).numColumns || 3,
                columns: (section as any).columns || [],
                backgroundColor: (section as any).backgroundColor || '#f8f9fa',
                textColor: (section as any).textColor || '#333333',
                padding: (section as any).padding || '2rem'
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              speakText={baseProps.speakText}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'feature-card-grid':
        sectionComponent = (
          <div className="relative group">
            <FeatureCardGridSection
              section={{
                ...section,
                type: 'feature-card-grid' as const,
                numCards: (section as any).numCards || 3,
                cards: (section as any).cards || [],
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              speakText={baseProps.speakText}
              onSectionChange={handleSectionChange}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'contact-form':
        sectionComponent = (
          <div className="relative group">
            <ContactFormSection section={section as any} />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'fluxedita_advanced_form':
        sectionComponent = (
          <div className="relative group">
            <FluxeditaAdvancedFormSection />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'advanced-slider':
        sectionComponent = (
          <div className="relative group">
            <AdvancedSliderSection
              section={{
                ...section,
                type: 'advanced-slider' as const,
                slides: (section as any).slides || [],
                autoplay: (section as any).autoplay || false,
                autoplayDelay: (section as any).autoplayDelay || 5000,
                effect: (section as any).effect || 'slide',
                height: (section as any).height || '70vh',
                enableSpeech: false,
                visible: section.visible !== false
              }}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              idx={idx}
              renderSectionControls={(slideIdx: number) => (
                <div className="absolute top-2 right-2 z-10">
                  {renderSectionControls(section.id)}
                </div>
              )}
            />
          </div>
        );
        break;
        
      case 'custom-code':
        sectionComponent = baseProps.isEditMode ? (
          <div className="relative group">
            <CustomCodeSectionEditor
              code={(section as any).code || ''}
              onChange={newCode => handleSectionChange({ ...section, code: newCode })}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        ) : (
          <CustomCodeSection code={(section as any).code || ''} />
        );
        break;
        
      case 'privacy':
        sectionComponent = (
          <div className="relative group">
            <PrivacySection
              section={section as any}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'media-placeholder':
        sectionComponent = (
          <div className="relative group">
            <MediaPlaceholderSection
              section={section as any}
              isEditMode={baseProps.isEditMode}
              onSectionChange={handleSectionChange}
              onMoveUp={handleMoveUp}
              onMoveDown={handleMoveDown}
              onDelete={handleRemove}
              onMediaSelect={(cardId) => handleMediaSelect(idx, cardId)}
              onDuplicate={(duplicatedSection: any) => {
                const newSections = [...sections];
                newSections.splice(idx + 1, 0, duplicatedSection as Section);
                setSections(newSections);
                setIsDirty(true);
              }}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      case 'product-package-left':
        sectionComponent = (
          <div className="relative group">
            <ProductPackageLeftSection
              section={section as any}
              isEditMode={isEditMode}
              onSectionChangeAction={handleSectionChange}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;
      case 'editable-title':
        sectionComponent = (
          <div className="relative group">
            <EditableTitleSection
              section={section as any}
              isEditMode={isEditMode}
              onChange={(update) => {
                // Merge the update with the existing section to maintain required fields
                handleSectionChange({ ...section, ...update });
              }}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;
        
      case 'product-package-right':
        sectionComponent = (
          <div className="relative group">
            <ProductPackageRightSection
              section={section as any}
              isEditMode={isEditMode}
              onSectionChangeAction={handleSectionChange}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;
      case 'text-with-video-left':
        sectionComponent = (
          <div className="relative group">
            <TextWithVideoLeftSection
              section={section as any}
              isEditMode={isEditMode}
              onSectionChange={handleSectionChange}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;
      case 'text-with-video-right':
        sectionComponent = (
          <div className="relative group">
            <TextWithVideoRightSection
              section={section as any}
              isEditMode={isEditMode}
              onSectionChange={handleSectionChange}
            />
            {baseProps.isEditMode && (
              <div className="absolute top-2 right-2 z-10">
                {renderSectionControls(section.id)}
              </div>
            )}
          </div>
        );
        break;

      default:
        // For any other unsupported section types, show a minimal message in edit mode only
        if (baseProps.isEditMode) {
          sectionComponent = (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700">Section type "{section.type}" is not supported. Please remove or replace this section.</p>
            </div>
          );
        }
    }

    return (
      <div key={section.id} className="relative group">
        {isEditMode && (
          <div className="absolute -left-12 top-0 h-full flex flex-col justify-center space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={handleRemove}
              className="px-2 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              title="Remove section"
            >
              Remove
            </button>
            {handleMoveUp && (
              <button
                onClick={handleMoveUp}
                className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                title="Move up"
              >
                ↑
              </button>
            )}
            {handleMoveDown && (
              <button
                onClick={handleMoveDown}
                className="px-2 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                title="Move down"
              >
                ↓
              </button>
            )}
          </div>
        )}
        <div className={cn("relative", isEditMode && 'border-2 border-transparent hover:border-blue-500 rounded-lg p-1 transition-colors')}>
          {sectionComponent}
        </div>
      </div>
    );
  };

  // Debug log to check admin status and edit mode
  console.log('CustomPageClient render', { isAdmin, isEditMode });

  // Show loading state while data is being fetched
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
        <div className="ml-4 text-gray-600">Loading page...</div>
      </div>
    );
  }

  // Show error state if there's an error
  if (swrError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">Error loading page: {swrError.message}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    );
  }

  // Show edit button for admin users in top-right corner
  console.log('Rendering CustomPageClient', { isAdmin, user, isEditMode });
  
  const editButton = isAdmin && (
    <div className="fixed top-4 right-4 z-50 flex gap-2">
      <Button 
        onClick={toggleEditMode}
        variant={isEditMode ? "default" : "outline"}
        size="sm"
        className="flex items-center gap-2 shadow-md"
      >
        <Pencil size={16} />
        {isEditMode ? 'Exit Edit Mode' : 'Edit Page'}
      </Button>
      {isEditMode && (
        <Button 
          variant="outline" 
          size="sm"
          className="flex items-center gap-2 shadow-md"
          onClick={() => {
            // Toggle page controls visibility
            const controls = document.querySelector('.page-controls');
            if (controls) {
              controls.classList.toggle('hidden');
            }
          }}
        >
          <Plus size={16} />
          Add Section
        </Button>
      )}
    </div>
  );

  const renderPageControls = () => {
    if (!isAdmin) return null;
    
    return (
      <div className={`fixed inset-0 z-[130] flex transition-all duration-300 ${showControls ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div 
          className={`bg-white w-80 h-full shadow-xl p-0 transform transition-all duration-300 ${showControls ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <PageControls
            isSaving={isSaving}
            isDirty={isDirty}
            isTTSEnabled={false}
            isCollapsed={!showControls}
            onSave={handleSave}
            onDelete={handleDelete}
            onAddSection={handleAddSection}
            onToggleTTS={handleToggleTTS}
            onPreview={() => setShowControls(false)}
            onPagePropertiesChange={handlePagePropertiesChange}
            onToggleCollapse={() => setShowControls(prev => !prev)}
          />
        </div>
        {showControls && (
          <div 
            className="flex-1 bg-black/50 transition-opacity duration-300"
            onClick={() => setShowControls(false)}
            style={{ cursor: 'pointer' }}
          />
        )}
      </div>
    );
  };

  // Floating toggle button for the sidebar
  const renderSidebarToggle = () => {
    console.log('renderSidebarToggle called:', { isEditMode, isAdmin, showControls });
    
    if (!isAdmin) {
      console.log('Not admin, returning null');
      return null;
    }
    
    console.log('Rendering sidebar toggle button');
    
    return (
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowControls(prev => !prev);
        }}
        className="fixed left-8 bottom-8 z-[120] bg-primary text-white rounded-full shadow-lg p-4 hover:bg-primary/90 transition-transform hover:scale-105"
        aria-label={showControls ? 'Close Page Controls' : 'Open Page Controls'}
      >
        {showControls ? (
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
            <path d="M12 4v16m8-8H4"/>
          </svg>
        )}
      </button>
    );
  };

  // Calculate background styles based on page properties
  const getBackgroundStyles = () => {
    const styles: React.CSSProperties = {
      backgroundColor: pageProperties.backgroundColor,
      color: pageProperties.textColor,
      minHeight: '100vh',
      transition: 'all 0.3s ease',
      position: 'relative',
      zIndex: 1,
      // Add padding only when controls are shown
      paddingLeft: showControls ? '20rem' : '0',
    };

    // For video backgrounds, we'll handle it with a separate video element
    // Only set background styles for non-video backgrounds
    if (pageProperties.backgroundImage && !pageProperties.backgroundVideo) {
      styles.backgroundImage = `url(${pageProperties.backgroundImage})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
      styles.backgroundRepeat = 'no-repeat';
      styles.backgroundAttachment = 'fixed';
    }

    return styles;
  };
  
  // Get the background overlay styles
  const getBackgroundOverlayStyles = () => {
    if (!pageProperties.backgroundImage && !pageProperties.backgroundVideo) return {};
    
    return {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: pageProperties.backgroundColor || 'rgba(0, 0, 0, 0.5)',
      opacity: 1 - (pageProperties.backgroundOpacity || 0),
      zIndex: -1,
      pointerEvents: 'none',
    } as React.CSSProperties;
  };

  // --- Footer visibility on scroll ---
  // (declarations moved to top of component)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SearchParamsProvider>
        {() => (
          <div className="relative flex flex-col min-h-screen" style={getBackgroundStyles()}>
            {/* Floating Edit Buttons - Positioned at the root level */}
            {/* PageEditFab temporarily removed as requested */}
            {/* Background image or video */}
            <div className="fixed inset-0 -z-10 pointer-events-none">
              {pageProperties.backgroundImage && !pageProperties.backgroundVideo && (
                <div 
                  className="absolute inset-0 bg-cover bg-center pointer-events-none"
                  style={{
                    backgroundImage: `url(${pageProperties.backgroundImage})`,
                  }}
                />
              )}
              {pageProperties.backgroundVideo && (
                <video
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="absolute inset-0 w-full h-full object-cover pointer-events-none"
                >
                  <source src={pageProperties.backgroundVideo} type="video/mp4" />
                </video>
              )}
              <div 
                className="absolute inset-0 pointer-events-none"
                style={{
                  backgroundColor: pageProperties.backgroundColor || 'rgba(0, 0, 0, 0.5)',
                  opacity: 1 - (pageProperties.backgroundOpacity || 0),
                }}
              />
            </div>

            {/* Save Button Container - Placed outside main content flow */}
            {isEditMode && isAdmin && (
              <div className="fixed bottom-24 left-1/2 z-[2147483647] transform -translate-x-1/2">
                <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border border-gray-200 p-1.5">
                  <Button 
                    variant={isDirty ? 'default' : 'outline'}
                    size="lg"
                    className="rounded-full shadow-md px-5 py-6 text-base font-medium transition-all duration-200"
                    onClick={handleSave}
                    disabled={isSaving || !isDirty}
                  >
                    <Save className="w-5 h-5 mr-2" />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                  <Button 
                    variant="outline" 
                    size="lg"
                    className="rounded-full shadow-md px-5 py-6 text-base font-medium transition-all duration-200"
                    onClick={() => {
                      if (isDirty && !window.confirm('You have unsaved changes. Are you sure you want to cancel?')) {
                        return;
                      }
                      const newParams = new URLSearchParams(searchParams?.toString() ?? '');
                      newParams.set('edit', 'false');
                      router.push(`?${newParams.toString()}`);
                    }}
                  >
                    {isDirty ? 'Discard Changes' : 'Exit Edit Mode'}
                  </Button>
                </div>
              </div>
            )}

            {/* Main content area */}
            <div className="relative">
              {renderPageControls()}
            </div>

            {/* Floating toggle button - moved outside relative container */}
            {renderSidebarToggle()}

            {/* Main content area */}
            <div 
              className="transition-all duration-200 min-h-screen relative z-10 space-y-0 pb-16"
              style={{
                backgroundColor: 'transparent',
                position: 'relative',
              }}
            >
              {/* Save button has been moved outside the main content area */}
              {sections.map((section, idx) => (
                <React.Fragment key={section.id || idx}>
                  {renderWrappedSection(section, idx)}
                </React.Fragment>
              ))}
              <style jsx global>{`
                :root {
                  --sidebar-width: 20rem;
                  --sidebar-collapsed-width: 3rem;
                }
                .page-controls {
                  width: 20rem;
                  left: 0;
                  transform: none;
                  transition: all 0.3s ease-in-out;
                  z-index: 40;
                }
                .page-controls[data-collapsed="true"] {
                  transform: translateX(calc(-100% + 3rem));
                }
                .sections-container {
                  transition: padding 0.3s ease-in-out;
                }
                .sections-container {
                  transition: padding-right 0.3s ease-in-out;
                }
                @media (max-width: 768px) {
                  .page-controls {
                    width: 100%;
                    transform: translateX(-100%);
                  }
                  .page-controls[data-collapsed="false"] {
                    transform: translateX(0);
                  }
                  .sections-container {
                    padding-left: 1rem !important;
                    padding-right: 1rem !important;
                  }
                }
              `}</style>
            </div>
            
            {/* Footer - Only visible when user scrolls to the bottom */}
            <div ref={footerSentinelRef} />
            {showFooter && (
              <div style={{position: 'fixed', left: 0, bottom: 0, width: '100%', zIndex: 2147483647, pointerEvents: 'auto'}}>
                <ClientFooter />
              </div>
            )}

            {/* MediaLibrary dialog for Media/Text sections */}
            {mediaDialogIdx !== null && (
              <MediaLibrary
                isDialog
                type="all"
                onCloseAction={() => setMediaDialogIdx(null)}
                onSelectAction={(url, type) => {
                  setSections(prev => {
                    const newSections = [...prev];
                    if (newSections[mediaDialogIdx]) {
                      const section = newSections[mediaDialogIdx];
                      
                      // Handle media placeholder section
                      if (section.type === 'media-placeholder' && currentMediaCardId) {
                        const updatedCards = section.cards.map((card: { id: string }) => 
                          card.id === currentMediaCardId 
                            ? { ...card, 
                                mediaUrl: url, 
                                mediaType: (type === 'image' || type === 'video') ? type : 'image' 
                              }
                            : card
                        );
                        newSections[mediaDialogIdx] = {
                          ...section,
                          cards: updatedCards
                        };
                      } 
                      // Handle media-text sections
                      else if (section.type === 'media-text-left' || section.type === 'media-text-right') {
                        newSections[mediaDialogIdx] = {
                          ...section,
                          mediaUrl: url,
                          mediaType: (type === 'image' || type === 'video') ? type : 'image',
                        };
                      } 
                      // Handle text sections with media
                      else if (section.type === 'text') {
                        newSections[mediaDialogIdx] = {
                          ...section,
                          mediaUrl: url,
                          mediaType: (type === 'image' || type === 'video') ? type : 'image',
                        };
                      }  
                    }
                    return newSections;
                  });
                  setIsDirty(true);
                  setMediaDialogIdx(null);
                }}
              />
            )}
          </div>
        )}
      </SearchParamsProvider>
    </Suspense>
  );
}