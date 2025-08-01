"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Star, Edit } from "lucide-react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useEditMode } from "@/hooks/EditModeContext"
import { usePageData } from "@/hooks/usePageData"
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
  PrivacySection,
  HeroSectionResponsive,
  MediaPlaceholderSection,
  TextWithVideoLeftSection,
  TextWithVideoRightSection,
  ProductPackageLeftSection,
  ProductPackageRightSection,
} from '@/app/custom_pages/components/sections'
import PageEditFab from "@/components/admin/PageEditFab"
import PageControlsFab from "@/components/admin/PageControlsFab"
import { toast } from "sonner"
import SimpleEditableMedia from "@/components/profile/SimpleEditableMedia"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SliderSectionType } from "@/app/custom_pages/types/sections"
import supabase from '@/lib/supabase/client'
import { Section, InfoCard } from "@/app/custom_pages/types/sections"
import { PageControls } from "@/app/custom_pages/components/PageControls"
import { MediaTextSection as MediaTextSectionType } from "@/app/custom_pages/types/sections"
import { FeatureSection as FeatureSectionType } from "@/app/custom_pages/types/sections"
import MediaLibrary from '@/components/media/MediaLibrary'
import { InfoCardSection as InfoCardSectionType } from '@/app/custom_pages/types/sections'
import ContactFormSection from '@/app/custom_contact_section/ContactFormSection';
import FluxeditaAdvancedFormSection from '@/app/custom_contact_section/FluxeditaAdvancedFormSection';
import { Mail } from 'lucide-react';
import CustomCodeSection from '@/app/custom_code_section/CustomCodeSection';
import CustomCodeSectionEditor from '@/app/custom_code_section/CustomCodeSectionEditor';

// Section type for home page
type HomeSectionType =
  | { type: 'hero' }
  | { type: 'cta' }
  | { type: 'feature-card-grid' }

const DEFAULT_SECTIONS: HomeSectionType[] = [
  { type: 'hero' },
  { type: 'cta' },
  { type: 'feature-card-grid' },
];

// Initial sections for the home page, matching the current layout
const INITIAL_SECTIONS: Section[] = [
  {
    id: 'hero',
    type: 'hero',
    visible: true,
    enableSpeech: false,
    enableTitleSpeech: false,
    enableDescriptionSpeech: false,
    title: "Welcome to Our Amazing Editable Web Application",
    description: "Our Editable Web Application is a Revolution in Website Creation.",
    backgroundImage: '',
    backgroundMedia: '',
    mediaType: 'image',
    height: 'h-[40vh] min-h-[300px] max-h-[400px]',
    width: 'w-full',
    objectFit: 'cover',
    objectPosition: 'center',
    maxHeight: 400,
  },
  {
    id: 'cta',
    type: 'cta',
    visible: true,
    enableSpeech: false,
    enableTitleSpeech: false,
    enableDescriptionSpeech: false,
    title: 'Ready to see more?',
    description: 'See how amazing the Fluxedita Website Creation App truly is.',
    buttonText: 'See More...',
    buttonUrl: '/members',
    backgroundColor: '#ffffff',
    textColor: '#000000',
  },
  {
    id: 'feature-card-grid',
    type: 'feature-card-grid',
    visible: true,
    enableSpeech: false,
    numCards: 3,
    cards: [
      {
        id: 'card-1',
        mediaUrl: '',
        mediaType: 'image',
        title: 'Example Custom Page',
        description: 'An example of a new custom page. Here you can add \'Editable New Section Components\'. Allowing you to create any type of page you require.',
        ctaText: 'View Custom Page',
        ctaUrl: '/',
        ctaOpenInNewTab: false,
      },
      {
        id: 'card-2',
        mediaUrl: '',
        mediaType: 'image',
        title: 'Example of Editable Section Components',
        description: 'See a selection of the available section components, the admin user can edit live in the browser. Instantly making changes live.',
        ctaText: 'View Editable Components Page',
        ctaUrl: '/',
        ctaOpenInNewTab: false,
      },
      {
        id: 'card-3',
        mediaUrl: '',
        mediaType: 'image',
        title: 'View our Demonstration Videos',
        description: 'See our demonstration videos page. Showing how easy it is to get your own, privately managed website up in less than one hour.',
        ctaText: 'View Demo Videos',
        ctaUrl: '/',
        ctaOpenInNewTab: false,
      },
    ],
  },
];

// Utility to persist/retrieve order from Supabase (to be implemented below)

export default function HomePageClient() {
  const { isAdmin } = useAuth()
  const { isEditMode, setEditMode } = useEditMode()
  const { 
    heroImage,
    aboutMedia,
    freeContentImage,
    premiumContentImage,
    vipContentImage,
    heroSection,
    handleHeroImageChange,
    handleAboutMediaChange,
    handleFreeContentImageChange,
    handlePremiumContentImageChange,
    handleVipContentImageChange,
    handleHeroSectionChange,
    saveChanges,
    loading,
    error
  } = usePageData()

  // State for media dialogs
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false)
  const [editingSection, setEditingSection] = useState<string | null>(null)
  const mediaRef = useRef<{ openEditor: () => void }>(null)
  const [previewMode, setPreviewMode] = useState(false)

  // Slider section state for home page
  const [sliderSection, setSliderSection] = useState<SliderSectionType>({
    id: 'home-slider',
    type: 'slider',
    visible: true,
    enableSpeech: false,
    enableTitleSpeech: false,
    enableDescriptionSpeech: false,
    slides: [],
    autoplay: false,
    autoplayDelay: 3000,
    showNavigation: true,
    showPagination: true,
    effect: 'slide',
    loop: false,
    height: '400px',
    width: '100%',
  })
  const [sliderTitle, setSliderTitle] = useState('Home Slider')
  const [sliderTitleVisible, setSliderTitleVisible] = useState(true)
  const [isSliderEdit, setIsSliderEdit] = useState(false)
  const [isSliderDirty, setIsSliderDirty] = useState(false)
  const [isSliderSaving, setIsSliderSaving] = useState(false)
  
  // Page properties state
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
    pageTitle: 'Home Page',
    metaDescription: '',
    language: 'en',
  })

  // Slider section state for hero area
  const [heroSliderSection, setHeroSliderSection] = useState<SliderSectionType>({
    id: 'home-hero-slider',
    type: 'slider',
    visible: true,
    enableSpeech: false,
    enableTitleSpeech: false,
    enableDescriptionSpeech: false,
    slides: [],
    autoplay: false,
    autoplayDelay: 3000,
    showNavigation: true,
    showPagination: true,
    effect: 'slide',
    loop: false,
    height: '400px',
    width: '100%',
  });
  const [heroSliderTitle, setHeroSliderTitle] = useState('Hero Slider');
  const [heroSliderTitleVisible, setHeroSliderTitleVisible] = useState(true);
  const [isHeroSliderEdit, setIsHeroSliderEdit] = useState(false);
  const [isHeroSliderDirty, setIsHeroSliderDirty] = useState(false);
  const [isHeroSliderSaving, setIsHeroSliderSaving] = useState(false);

  // Section order state
  const [sectionOrder, setSectionOrder] = useState<HomeSectionType[]>(DEFAULT_SECTIONS);

  // Home page sections state
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showControls, setShowControls] = useState(false);

  // MediaLibrary dialog state
  const [mediaDialogIdx, setMediaDialogIdx] = useState<number | null>(null);

  // Load section order from Supabase
  useEffect(() => {
    const loadSectionOrder = async () => {
      try {
        const { data: components } = await supabase
          .from('root_page_components')
          .select('component_type, content')
          .eq('page_slug', 'home')
          .eq('is_active', true);
        
        const sectionOrderComponent = components?.find((c: any) => c.component_type === 'section_order');
        if (sectionOrderComponent?.content) {
          setSectionOrder(sectionOrderComponent.content as HomeSectionType[]);
        }
      } catch (err) {
        // ignore
      }
    };
    loadSectionOrder();
  }, []);

  // Save section order to Supabase
  const saveSectionOrder = async (newOrder: HomeSectionType[]) => {
    try {
      const { error } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'home',
          component_type: 'section_order',
          content: newOrder as any,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,component_type'
        });
      
      if (error) throw error;
    } catch (err) {
      toast.error('Failed to save section order');
    }
  };

  // Move section up/down
  const handleMoveSection = (index: number, direction: 'up' | 'down') => {
    setSections(prevSections => {
      const newSections = [...prevSections];
      if (direction === 'up' && index > 0) {
        [newSections[index], newSections[index - 1]] = [newSections[index - 1], newSections[index]];
      } else if (direction === 'down' && index < newSections.length - 1) {
        [newSections[index], newSections[index + 1]] = [newSections[index + 1], newSections[index]];
      }
      return newSections;
    });
    setIsDirty(true);
  };

  // Add debugging
  console.log('Home page state:', { loading, error, isAdmin, isEditMode })

  // Comprehensive save function that saves both basic page data and sections
  const handleComprehensiveSave = async () => {
    setIsSaving(true);
    try {
      // First, save the basic page data using usePageData's saveChanges
      await saveChanges();

      // Get the authenticated user
      const { data: { user } } = await supabase.auth.getUser();
      const updated_by = user?.id;
      if (!updated_by) throw new Error('No authenticated user found');

      // Save 'sections' component
      const { data: sectionsRow } = await supabase
        .from('root_page_components')
        .select('id')
        .eq('page_slug', 'home')
        .eq('component_type', 'sections')
        .single();
      const sectionsPayload = {
        ...(sectionsRow?.id ? { id: sectionsRow.id } : {}),
        page_slug: 'home',
        component_type: 'sections',
        content: sections,
        is_active: true,
        updated_at: new Date().toISOString(),
        updated_by,
      };
      const { error: sectionsError } = await supabase
        .from('root_page_components')
        .upsert(sectionsPayload, { onConflict: 'page_slug,component_type' });
      if (sectionsError) {
        console.error('Upsert error for sections:', sectionsError);
        toast.error('Failed to save sections');
        throw sectionsError;
      } else {
        toast.success('Sections saved successfully!');
      }
      // Verify after save
      const { data: verifySections, error: verifySectionsError } = await supabase
        .from('root_page_components')
        .select('*')
        .eq('page_slug', 'home')
        .eq('component_type', 'sections');
      console.log('Verify after save (sections):', { verifySections, verifySectionsError });

      // Save 'hero' component
      const { data: heroRow } = await supabase
        .from('root_page_components')
        .select('id')
        .eq('page_slug', 'home')
        .eq('component_type', 'hero')
        .single();
      const heroPayload = {
        ...(heroRow?.id ? { id: heroRow.id } : {}),
        page_slug: 'home',
        component_type: 'hero',
        content: heroSection, // assuming you have heroSection in state
        is_active: true,
        updated_at: new Date().toISOString(),
        updated_by,
      };
      const { error: heroError } = await supabase
        .from('root_page_components')
        .upsert(heroPayload, { onConflict: 'page_slug,component_type' });
      if (heroError) {
        console.error('Upsert error for hero:', heroError);
        toast.error('Failed to save hero section');
        throw heroError;
      } else {
        toast.success('Hero section saved successfully!');
      }
      // Verify after save
      const { data: verifyHero, error: verifyHeroError } = await supabase
        .from('root_page_components')
        .select('*')
        .eq('page_slug', 'home')
        .eq('component_type', 'hero');
      console.log('Verify after save (hero):', { verifyHero, verifyHeroError });

      // Save page properties
      const { data: propertiesRow } = await supabase
        .from('root_page_components')
        .select('id')
        .eq('page_slug', 'home')
        .eq('component_type', 'page_properties')
        .single();
      const propertiesPayload = {
        ...(propertiesRow?.id ? { id: propertiesRow.id } : {}),
        page_slug: 'home',
        component_type: 'page_properties',
        content: pageProperties,
        is_active: true,
        updated_at: new Date().toISOString(),
        updated_by,
      };
      const { error: propertiesError } = await supabase
        .from('root_page_components')
        .upsert(propertiesPayload, { onConflict: 'page_slug,component_type' });
      if (propertiesError) {
        console.error('Upsert error for page properties:', propertiesError);
        toast.error('Failed to save page properties');
        throw propertiesError;
      } else {
        toast.success('Page properties saved successfully!');
      }

      setIsDirty(false);
    } catch (err: any) {
      console.error('Error in comprehensive save:', err);
      toast.error(err?.message || 'Failed to save changes');
      setIsDirty(true); // Mark as dirty again so user can retry
    } finally {
      setIsSaving(false);
    }
  };

  const handlePagePropertiesChange = (newProperties: any) => {
    setPageProperties(newProperties)
    setIsDirty(true)
  }

  // Generate styles from page properties
  const getPageStyles = () => {
    const styles: React.CSSProperties = {
      backgroundColor: pageProperties.backgroundColor,
      color: pageProperties.textColor,
      fontFamily: pageProperties.fontFamily,
      lineHeight: pageProperties.lineHeight,
      letterSpacing: `${pageProperties.letterSpacing}px`,
      textShadow: pageProperties.textShadow,
    };

    if (pageProperties.backgroundImage) {
      styles.backgroundImage = `url(${pageProperties.backgroundImage})`;
      styles.backgroundSize = 'cover';
      styles.backgroundPosition = 'center';
      styles.backgroundRepeat = 'no-repeat';
      styles.backgroundAttachment = 'fixed';
    }

    return styles;
  };

  // Load sections and page properties from Supabase on mount
  useEffect(() => {
    const loadSections = async () => {
      try {
        const { data: components } = await supabase
          .from('root_page_components')
          .select('component_type, content')
          .eq('page_slug', 'home')
          .eq('is_active', true);
        
        const sectionsComponent = components?.find((c: any) => c.component_type === 'sections');
        if (sectionsComponent?.content && Array.isArray(sectionsComponent.content)) {
          // Ensure mediaPosition is set for all media-text sections
          const fixedSections = (sectionsComponent.content as any[]).map((section: any) => {
            if ((section.type === 'media-text-left' || section.type === 'media-text-right') && !section.mediaPosition) {
              return {
                ...section,
                mediaPosition: section.type === 'media-text-right' ? 'right' : 'left',
              };
            }
            return section;
          });
          setSections(fixedSections);
          console.log('Loaded sections from database:', fixedSections);
        } else {
          // If no sections found in database, use initial sections
          console.log('No sections found in database, using initial sections');
          setSections(INITIAL_SECTIONS);
        }

        // Load page properties
        const propertiesComponent = components?.find((c: any) => c.component_type === 'page_properties');
        if (propertiesComponent?.content) {
          setPageProperties(propertiesComponent.content);
          console.log('Loaded page properties from database:', propertiesComponent.content);
        }
      } catch (err) {
        console.error('Error loading sections:', err);
        // Fallback to initial sections on error
        setSections(INITIAL_SECTIONS);
      }
    };
    loadSections();
  }, []);

  // Handle media change for different sections
  const handleMediaChange = (url: string, mediaType: 'image' | 'video') => {
    switch (editingSection) {
      case 'about':
        handleAboutMediaChange(url, mediaType)
        break
      case 'free':
        handleFreeContentImageChange(url, mediaType)
        break
      case 'premium':
        handlePremiumContentImageChange(url, mediaType)
        break
      case 'vip':
        handleVipContentImageChange(url, mediaType)
        break
    }
    setMediaDialogOpen(false)
    setEditingSection(null)
  }

  // Open media dialog for a specific section
  const openMediaDialog = (section: string) => {
    setEditingSection(section)
    setMediaDialogOpen(true)
  }

  // Load slider section from Supabase on mount
  useEffect(() => {
    const loadSlider = async () => {
      try {
        const { data: components } = await supabase
          .from('root_page_components')
          .select('component_type, content')
          .eq('page_slug', 'home')
          .eq('is_active', true);
        
        const sliderComponent = components?.find((c: any) => c.component_type === 'slider');
        if (sliderComponent?.content) {
          const sliderData = sliderComponent.content as any;
          setSliderSection(sliderData.slider);
          if (sliderData.sliderTitle !== undefined) setSliderTitle(sliderData.sliderTitle);
          if (sliderData.sliderTitleVisible !== undefined) setSliderTitleVisible(sliderData.sliderTitleVisible);
        }
      } catch (err) {
        // ignore
      }
    }
    loadSlider()
  }, [supabase])

  // Save slider section to Supabase
  const handleSaveSlider = async () => {
    try {
      setIsSliderSaving(true)
      const { error } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'home',
          component_type: 'slider',
          content: {
            slider: sliderSection,
            sliderTitle,
            sliderTitleVisible,
          } as any,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,component_type'
        });
      
      if (error) throw error;
      toast.success('Slider saved successfully');
    } catch (err) {
      console.error('Error saving slider:', err);
      toast.error('Failed to save slider');
    } finally {
      setIsSliderSaving(false);
    }
  };

  // Load hero slider section from Supabase on mount
  useEffect(() => {
    const loadHeroSlider = async () => {
      try {
        const { data: components } = await supabase
          .from('root_page_components')
          .select('component_type, content')
          .eq('page_slug', 'home')
          .eq('is_active', true);
        
        const heroSliderComponent = components?.find((c: any) => c.component_type === 'hero_slider');
        if (heroSliderComponent?.content) {
          const heroSliderData = heroSliderComponent.content as any;
          setHeroSliderSection(heroSliderData.heroSlider);
          if (heroSliderData.heroSliderTitle !== undefined) setHeroSliderTitle(heroSliderData.heroSliderTitle);
          if (heroSliderData.heroSliderTitleVisible !== undefined) setHeroSliderTitleVisible(heroSliderData.heroSliderTitleVisible);
        }
      } catch (err) {
        // ignore
      }
    };
    loadHeroSlider();
  }, [supabase]);

  // Save hero slider section to Supabase
  const handleSaveHeroSlider = async () => {
    try {
      setIsHeroSliderSaving(true)
      const { error } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'home',
          component_type: 'hero_slider',
          content: {
            heroSlider: heroSliderSection,
            heroSliderTitle,
            heroSliderTitleVisible,
          } as any,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,component_type'
        });
      
      if (error) throw error;
      toast.success('Hero slider saved successfully');
    } catch (err) {
      console.error('Error saving hero slider:', err);
      toast.error('Failed to save hero slider');
    } finally {
      setIsHeroSliderSaving(false);
    }
  };

  // Add section
  const handleAddSection = (type: string, afterIdx?: number) => {
    console.log('handleAddSection type:', JSON.stringify(type));
    const id = typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2);
    let newSection: Section;
    switch (type) {
      case 'hero':
        newSection = {
          id,
          type: 'hero',
          visible: true,
          enableSpeech: false,
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          title: 'New Hero Section',
          description: '',
          backgroundImage: '',
          backgroundMedia: '',
          mediaType: 'image',
          height: 'h-[40vh] min-h-[300px] max-h-[400px]',
          width: 'w-full',
          objectFit: 'cover',
          objectPosition: 'center',
          maxHeight: 400,
        };
        break;
      case 'slider':
        newSection = {
          id,
          type: 'slider',
          visible: true,
          enableSpeech: false,
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          slides: [],
          autoplay: false,
          autoplayDelay: 3000,
          showNavigation: true,
          showPagination: true,
          effect: 'slide',
          loop: false,
          height: '400px',
          width: '100%',
        };
        break;
      case 'advanced-slider':
        newSection = {
          id,
          type: 'advanced-slider',
          visible: true,
          enableSpeech: false,
          slides: [],
          autoplay: true,
          autoplayDelay: 5000,
          showNavigation: true,
          showPagination: true,
          effect: 'fade',
          loop: true,
          height: '500px',
          width: '100%',
        };
        break;
      case 'media-text-left':
      case 'media-text-right':
        newSection = {
          id,
          type: type as 'media-text-left' | 'media-text-right',
          visible: true,
          enableSpeech: false,
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          title: 'New Media Text Section',
          description: '',
          mediaUrl: '',
          mediaType: 'image',
        };
        break;
      case 'feature':
        newSection = {
          id,
          type: 'feature',
          visible: true,
          enableSpeech: false,
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          title: 'New Feature Section',
          description: '',
          features: [],
          layout: 'grid',
          enableFeatureSpeech: false,
        };
        break;
      case 'cta':
        newSection = {
          id,
          type: 'cta',
          visible: true,
          enableSpeech: false,
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          title: 'New CTA Section',
          description: '',
          buttonText: 'Click Me',
          buttonUrl: '/',
          backgroundColor: '#ffffff',
          textColor: '#000000',
        };
        break;
      case 'feature-card-grid':
        newSection = {
          id,
          type: 'feature-card-grid',
          visible: true,
          enableSpeech: false,
          numCards: 3,
          cards: [
            {
              id: 'card-1',
              mediaUrl: '',
              mediaType: 'image',
              title: 'Public Page Editor',
              description: 'Public Page Editor.',
              ctaText: 'View Public Page Editor',
              ctaUrl: '/public_page_editor',
              ctaOpenInNewTab: false,
            },
            {
              id: 'card-2',
              mediaUrl: '',
              mediaType: 'image',
              title: 'Members Page Editor',
              description: 'Members Page Editor.',
              ctaText: 'View Members Page Editor',
              ctaUrl: '/members_page_editor',
              ctaOpenInNewTab: false,
            },
            {
              id: 'card-3',
              mediaUrl: '',
              mediaType: 'image',
              title: 'Admin Page Editor',
              description: 'Full Admin Page Editor.',
              ctaText: 'View Admin Page Editor',
              ctaUrl: '/admin_example',
              ctaOpenInNewTab: false,
            },
          ],
        };
        break;
      case 'info-card':
        newSection = {
          id,
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
          ],
          visible: true,
          enableSpeech: false,
        };
        break;
      case 'divider':
        newSection = {
          id,
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
        break;
      case 'contact-form':
        newSection = {
          id,
          type: 'contact-form',
          formAction: '/api/contact',
          formMethod: 'POST',
          fields: [
            { id: 'name', name: 'name', label: 'Name', type: 'text', required: true, placeholder: 'Your name' },
            { id: 'email', name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'you@example.com' },
            { id: 'message', name: 'message', label: 'Message', type: 'textarea', required: true, placeholder: 'Your message' },
          ],
        };
        break;
      case 'fluxedita_advanced_form':
        newSection = {
          id,
          type: 'fluxedita_advanced_form',
          visible: true,
        };
        break;
      case 'privacy':
        newSection = {
          id,
          type: 'privacy',
          content: `<p>
            This is a summary of our privacy policy. We respect your privacy and are committed to protecting your personal data.
            We do not sell or share your information with third parties except as required by law or to provide our services.
            For the full policy, please see our <a href="/privacy" target="_blank" rel="noopener noreferrer">Privacy Policy</a> page.
          </p>`,
          visible: true,
          enableSpeech: false,
        };
        break;
      case 'custom-code':
        newSection = {
          id,
          type: 'custom-code',
          code: '',
          visible: true,
          enableSpeech: false,
        };
        break;
      case 'media-placeholder':
        newSection = {
          id,
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
        break;
      case 'hero-responsive':
        newSection = {
          id,
          type: 'hero-responsive',
          title: 'Responsive Hero Section',
          description: '',
          buttonText: '',
          buttonUrl: '',
          backgroundImage: '',
          backgroundMedia: '',
          mediaType: 'image',
          overlayColor: 'rgba(0,0,0,0.5)',
          textColor: '#ffffff',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableSpeech: false,
          visible: true,
          height: '50vh',
          objectFit: 'cover',
          objectPosition: 'center',
          textVerticalAlign: 'middle',
          textHorizontalAlign: 'center',
        };
        break;
      case 'text':
        newSection = {
          id,
          type: 'text',
          content: 'Enter your text content here...',
          alignment: 'left',
          fontSize: '1rem',
          fontColor: '#222',
          backgroundColor: '#fff',
          padding: '1rem',
          margin: '1rem 0',
          enableSpeech: false,
          visible: true,
          mediaUrl: '',
          mediaType: 'image',
          mediaPosition: 'top',
          mediaWidth: '100%',
          mediaHeight: 'auto',
          textStyle: {},
        };
        break;
      case 'mediaTextColumns':
        newSection = {
          id,
          type: 'mediaTextColumns',
          visible: true,
          enableSpeech: false,
          title: 'New Media Text Columns',
          description: '',
          mediaUrl: '',
          mediaType: 'image',
          mediaPosition: 'left',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
        };
        break;
      case 'twoColumnText':
        newSection = {
          id,
          type: 'twoColumnText',
          visible: true,
          enableSpeech: false,
          leftColumn: '',
          rightColumn: '',
          enableLeftColumnSpeech: false,
          enableRightColumnSpeech: false,
        };
        break;
      case 'heading':
        newSection = {
          id,
          type: 'heading',
          visible: true,
          enableSpeech: false,
          text: 'New Heading',
          level: 'h2',
          alignment: 'left',
          fontSize: '2rem',
          fontColor: '#222',
        };
        break;
      case 'quote':
        newSection = {
          id,
          type: 'quote',
          visible: true,
          enableSpeech: false,
          text: 'A quote goes here',
          author: '',
          alignment: 'left',
          fontSize: '1.25rem',
          fontColor: '#222',
        };
        break;
      case 'gallery':
        newSection = {
          id,
          type: 'gallery',
          visible: true,
          enableSpeech: false,
          title: 'New Gallery',
          description: '',
          images: [
            { url: '', alt: 'Image 1' },
            { url: '', alt: 'Image 2' },
          ],
          layout: 'grid',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableImageSpeech: false,
        };
        break;
      case 'text-with-video-left':
        newSection = {
          id,
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
        };
        break;
      case 'text-with-video-right':
        newSection = {
          id,
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
        };
        break;
      case 'product-package-left':
        newSection = {
          id,
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
        };
        break;
      case 'product-package-right':
        newSection = {
          id,
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
        };
        break;
      default:
        return;
    }
    if (!newSection) {
      console.error('No newSection created for type:', type);
      return;
    }
    console.log('newSection to add:', newSection);
    setSections(prev => {
      if (typeof afterIdx === 'number' && afterIdx >= 0 && afterIdx < prev.length) {
        return [
          ...prev.slice(0, afterIdx + 1),
          newSection,
          ...prev.slice(afterIdx + 1),
        ];
      }
      return [...prev, newSection];
    });
    setIsDirty(true);
  };

  // Remove section
  const handleRemoveSection = (idx: number) => {
    setSections(prev => prev.filter((_, i) => i !== idx));
    setIsDirty(true);
  };

  // Toggle section visibility
  const handleToggleSectionVisibility = (idx: number, visible: boolean) => {
    const newSections = [...sections];
    if ('visible' in newSections[idx]) {
      newSections[idx] = { ...newSections[idx], visible };
    } else {
      newSections[idx] = { ...newSections[idx] };
    }
    setSections(newSections);
    setIsDirty(true);
  };

  console.log('Home page rendering with data:', { heroImage, aboutMedia, freeContentImage })

  return (
    <main className="min-h-screen" style={getPageStyles()}>
      {/* Floating admin button for opening PageControls */}
      {isAdmin && (
        <button
          className="fixed left-8 bottom-8 z-[120] bg-primary text-white rounded-full shadow-lg p-4 hover:bg-primary/90"
          onClick={() => setShowControls(true)}
          aria-label="Open Page Controls"
        >
          <svg width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
        </button>
      )}

      {/* PageControls sidebar/drawer */}
      {showControls && (
        <div className="fixed inset-0 z-[130] flex">
          <div className="bg-white w-80 h-full shadow-xl p-0">
            <PageControls
              isSaving={isSaving}
              isDirty={isDirty}
              isTTSEnabled={false}
              isCollapsed={false}
              onToggleCollapse={() => {}}
              onSave={handleComprehensiveSave}
              onDelete={() => {}}
              onAddSection={handleAddSection}
              onToggleTTS={() => {}}
              onPreview={() => setShowControls(false)}
              onPagePropertiesChange={handlePagePropertiesChange}
            />
          </div>
          <div className="flex-1 bg-black/30" onClick={() => setShowControls(false)} />
        </div>
      )}

      {/* Render all sections dynamically */}
      {sections.map((section, idx) => (
        <div key={section.id} className="relative group">
          {/* Section controls (move, remove, visibility) */}
          {isAdmin && isEditMode && !previewMode && (
            <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-20">
              <Button size="sm" variant="outline" onClick={() => handleMoveSection(idx, 'up')} disabled={idx === 0}>
                <span className="sr-only">Move Up</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M18 15l-6-6-6 6"/></svg>
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleMoveSection(idx, 'down')} disabled={idx === sections.length - 1}>
                <span className="sr-only">Move Down</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 9l6 6 6-6"/></svg>
              </Button>
              <Button size="sm" variant="outline" onClick={() => handleRemoveSection(idx)}>
                <span className="sr-only">Remove</span>
                <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M6 18L18 6M6 6l12 12"/></svg>
              </Button>
              <Button size="sm" variant={('visible' in section ? section.visible !== false : true) ? "outline" : "destructive"} onClick={() => handleToggleSectionVisibility(idx, !('visible' in section ? section.visible !== false : true))}>
                <span className="sr-only">Toggle Visibility</span>
                {('visible' in section ? section.visible !== false : true) ? (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                ) : (
                  <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-11-8-11-8a21.77 21.77 0 0 1 5.06-7.06M1 1l22 22"/></svg>
                )}
              </Button>
            </div>
          )}
          {/* Render section by type */}
          {
            (() => {
              let renderedSection = null;
              switch (section.type) {
                case 'hero':
                  renderedSection = (
                    <section className="relative h-[40vh] min-h-[300px] max-h-[400px]">
                      <HeroSectionResponsive
                        section={{
                          ...section,
                          type: 'hero-responsive',
                          objectFit: section.objectFit === 'auto' ? 'cover' : section.objectFit,
                          titleTextStyle: {
                            fontColor: '#FFFFFF',
                            fontSize: '3rem',
                            textOutline: { color: '#000', width: '0' },
                            textBackground: { color: 'transparent', opacity: 1, blur: '0px', borderRadius: '0px', padding: '0px' },
                          },
                          descriptionTextStyle: {
                            fontColor: '#FFFFFF',
                            fontSize: '1.75rem',
                            textBackground: { color: 'transparent', opacity: 1, blur: '0px', borderRadius: '0px', padding: '0px' },
                          },
                        }}
                        isEditMode={isEditMode && !previewMode}
                        idx={idx}
                        onSectionChangeAction={s => {
                          const newSections = [...sections];
                          newSections[idx] = { ...s, type: 'hero' } as Section;
                          setSections(newSections);
                          setIsDirty(true);
                        }}
                        speakTextAction={() => {}}
                        renderSectionControlsAction={() => null}
                        isDirty={isDirty}
                        onExitEditMode={() => setEditMode(false)}
                      />
                    </section>
                  );
                  break;
                case 'slider':
                  renderedSection = (
                    <section className="bg-white rounded-lg shadow-md p-6 mb-8">
                      <div className="flex flex-row items-start gap-4">
                        {isAdmin && isEditMode && !previewMode && (
                          <div className="flex flex-col gap-2 min-w-[160px]">
                            <Button
                              onClick={() => saveChanges()}
                              disabled={isSaving || !isDirty}
                              className="w-full"
                            >
                              {isSaving ? 'Saving...' : 'Save Changes'}
                            </Button>
                            <Button
                              variant="secondary"
                              onClick={() => setEditMode(false)}
                              className="w-full"
                            >
                              Exit Edit Mode
                            </Button>
                          </div>
                        )}
                        <div className="flex-1">
                          <SliderSection
                            section={section}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={s => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                            idx={idx}
                            renderSectionControls={() => null}
                          />
                        </div>
                      </div>
                    </section>
                  );
                  break;
                case 'advanced-slider':
                  return (
                    <AdvancedSliderSection
                      key={section.id}
                      section={section}
                      isEditMode={isEditMode}
                      onSectionChange={s => {
                        const newSections = [...sections];
                        newSections[idx] = s as Section;
                        setSections(newSections);
                        setIsDirty(true);
                      }}
                      idx={idx}
                      renderSectionControls={() => null}
                    />
                  );
                case 'media-text-left':
                case 'media-text-right':
                  renderedSection = (
                    <section className="py-16 bg-white">
                      <div className="container px-4 md:px-6">
                        <MediaTextSection
                          section={section}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                          onMediaSelect={() => setMediaDialogIdx(idx)}
                        />
                      </div>
                    </section>
                  );
                  break;
                case 'feature':
                  renderedSection = (
                    <section className="py-16 bg-gray-50">
                      <div className="container px-4 md:px-6">
                        <FeatureSection
                          section={section}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      </div>
                    </section>
                  );
                  break;
                case 'cta':
                  renderedSection = (
                    <section className="py-16 bg-gradient-to-r from-rose-500 to-pink-500 text-white">
                      <div className="container px-4 md:px-6">
                        <CTASection
                          section={section}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      </div>
                    </section>
                  );
                  break;
                case 'feature-card-grid':
                  renderedSection = (
                    <section className="py-16 bg-gray-50">
                      <div className="container px-4 md:px-6">
                        <FeatureCardGridSection
                          section={section}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      </div>
                    </section>
                  );
                  break;
                case 'info-card':
                  renderedSection = (
                    <InfoCardSection
                      section={section as InfoCardSectionType}
                      isEditMode={isEditMode && !previewMode}
                      onSectionChange={(update: Partial<InfoCardSectionType>) => {
                        const newSections = [...sections];
                        newSections[idx] = { ...sections[idx], ...update } as Section;
                        setSections(newSections);
                        setIsDirty(true);
                      }}
                    />
                  );
                  break;
                case 'divider':
                  renderedSection = (
                    <DividerSection
                      section={section as any}
                      isEditMode={isEditMode}
                      onSectionChange={s => {
                        const newSections = [...sections];
                        newSections[idx] = s as Section;
                        setSections(newSections);
                        setIsDirty(true);
                      }}
                      onDuplicate={(duplicatedSection) => {
                        const newSections = [...sections];
                        newSections.splice(idx + 1, 0, duplicatedSection as Section);
                        setSections(newSections);
                        setIsDirty(true);
                      }}
                      idx={idx}
                      renderSectionControls={() => null}
                    />
                  );
                  break;
                case 'contact-form':
                  return (
                    <div className="relative group">
                      <ContactFormSection section={section as any} />
                    </div>
                  );
                case 'fluxedita_advanced_form':
                  return <FluxeditaAdvancedFormSection />;
                case 'privacy':
                  renderedSection = (
                    <PrivacySection
                      section={section as any}
                      isEditMode={isEditMode && !previewMode}
                      onSectionChange={s => {
                        const newSections = [...sections];
                        newSections[idx] = s as Section;
                        setSections(newSections);
                        setIsDirty(true);
                      }}
                    />
                  );
                  break;
                case 'custom-code':
                  renderedSection = isEditMode && !previewMode ? (
                    <div className="relative group">
                      <CustomCodeSectionEditor
                        code={(section as any).code || ''}
                        onChange={newCode => {
                          const newSections = [...sections];
                          newSections[idx] = { ...section, code: newCode };
                          setSections(newSections);
                          setIsDirty(true);
                        }}
                      />
                    </div>
                  ) : (
                    <CustomCodeSection code={(section as any).code || ''} />
                  );
                  break;
                case 'hero-responsive':
                  renderedSection = (
                    <HeroSectionResponsive
                      section={section as any}
                      isEditMode={isEditMode && !previewMode}
                      idx={idx}
                      onSectionChangeAction={s => {
                        const newSections = [...sections];
                        newSections[idx] = s as Section;
                        setSections(newSections);
                        setIsDirty(true);
                      }}
                      speakTextAction={() => {}}
                      renderSectionControlsAction={() => null}
                      onExitEditMode={() => setEditMode(false)}
                      isDirty={isDirty}
                    />
                  );
                  break;
                case 'text':
                  renderedSection = (
                    <section className="py-16 bg-white">
                      <div className="container px-4 md:px-6">
                        <TextSection
                          section={section as any}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                          onMediaSelect={() => setMediaDialogIdx(idx)}
                          onDuplicate={(duplicatedSection) => {
                            // Add the duplicated section after the current one
                            const newSections = [...sections];
                            newSections.splice(idx + 1, 0, duplicatedSection);
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                        />
                      </div>
                    </section>
                  );
                  break;
                case 'media-placeholder':
                  renderedSection = (
                    <section className="py-16">
                      <div className="container px-4 md:px-6">
                        <MediaPlaceholderSection
                          section={section as any}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          onMoveUp={() => handleMoveSection(idx, 'up')}
                          onMoveDown={() => handleMoveSection(idx, 'down')}
                          onDelete={() => handleRemoveSection(idx)}
                          onMediaSelect={(cardId) => {
                            // Find the card and open media dialog for it
                            const card = (section as any).cards.find((c: any) => c.id === cardId);
                            if (card) {
                              setMediaDialogIdx(idx);
                              // Store the card ID for media selection
                              (window as any).__mediaDialogCardId = cardId;
                            }
                          }}
                          onDuplicate={(duplicatedSection) => {
                            // Add the duplicated section after the current one
                            const newSections = [...sections];
                            newSections.splice(idx + 1, 0, duplicatedSection);
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                        />
                      </div>
                    </section>
                  );
                  break;
                case 'mediaTextColumns':
                  renderedSection = (
                    <section className="py-16 bg-white">
                      <div className="container px-4 md:px-6">
                        <MediaTextColumnsSection
                          section={section as any}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      </div>
                    </section>
                  );
                  break;
                case 'twoColumnText':
                  renderedSection = (
                    <section className="py-16 bg-white">
                      <div className="container px-4 md:px-6">
                        <TwoColumnTextSection
                          section={section as any}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      </div>
                    </section>
                  );
                  break;
                case 'heading':
                  renderedSection = (
                    <section className="py-16 bg-white">
                      <div className="container px-4 md:px-6">
                        <HeadingSection
                          section={section as any}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          idx={idx}
                          renderSectionControls={() => null}
                          speakText={() => {}}
                        />
                      </div>
                    </section>
                  );
                  break;
                case 'quote':
                  renderedSection = (
                    <section className="py-16 bg-white">
                      <div className="container px-4 md:px-6">
                        <QuoteSection
                          section={section as any}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      </div>
                    </section>
                  );
                  break;
                case 'gallery':
                  renderedSection = (
                    <section className="py-16 bg-white">
                      <div className="container px-4 md:px-6">
                        <GallerySection
                          section={section as any}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      </div>
                    </section>
                  );
                  break;
                case 'text-with-video-left':
                  renderedSection = (
                    <TextWithVideoLeftSection
                      section={section as any}
                      isEditMode={isEditMode && !previewMode}
                      onSectionChange={s => {
                        const newSections = [...sections];
                        newSections[idx] = s as Section;
                        setSections(newSections);
                        setIsDirty(true);
                      }}
                    />
                  );
                  break;
                case 'text-with-video-right':
                  renderedSection = (
                    <TextWithVideoRightSection
                      section={section as any}
                      isEditMode={isEditMode && !previewMode}
                      onSectionChange={s => {
                        const newSections = [...sections];
                        newSections[idx] = s as Section;
                        setSections(newSections);
                        setIsDirty(true);
                      }}
                    />
                  );
                  break;
                case 'product-package-left':
                  renderedSection = (
                    <ProductPackageLeftSection
                      section={section as any}
                      isEditMode={isEditMode && !previewMode}
                      onSectionChangeAction={s => {
                        const newSections = [...sections];
                        newSections[idx] = s as Section;
                        setSections(newSections);
                        setIsDirty(true);
                      }}
                    />
                  );
                  break;
                case 'product-package-right':
                  renderedSection = (
                    <ProductPackageRightSection
                      section={section as any}
                      isEditMode={isEditMode && !previewMode}
                      onSectionChangeAction={s => {
                        const newSections = [...sections];
                        newSections[idx] = s as Section;
                        setSections(newSections);
                        setIsDirty(true);
                      }}
                    />
                  );
                  break;
                default:
                  renderedSection = null;
              }
              return renderedSection;
            })()
          }
        </div>
      ))}

      {/* MediaLibrary dialog for Media/Text sections */}
      {mediaDialogIdx !== null && (
        <MediaLibrary
          isDialog
          type="all"
          onCloseAction={() => {
            setMediaDialogIdx(null);
            (window as any).__mediaDialogCardId = null;
          }}
          onSelectAction={(url, type) => {
            setSections(prev => {
              const newSections = [...prev];
              const section = newSections[mediaDialogIdx];
              
              if (section) {
                if (section.type === 'media-placeholder') {
                  // Handle media-placeholder section
                  const cardId = (window as any).__mediaDialogCardId;
                  if (cardId && section.cards) {
                    const updatedCards = section.cards.map((card: any) =>
                      card.id === cardId
                        ? { ...card, mediaUrl: url, mediaType: (type === 'image' || type === 'video') ? type : 'image' }
                        : card
                    );
                    newSections[mediaDialogIdx] = {
                      ...section,
                      cards: updatedCards,
                    };
                  }
                } else if (
                  section.type === 'media-text-left' ||
                  section.type === 'media-text-right' ||
                  section.type === 'text'
                ) {
                  // Handle other section types
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
            (window as any).__mediaDialogCardId = null;
          }}
        />
      )}

      {/* Media Dialog */}
      <Dialog open={mediaDialogOpen} onOpenChange={setMediaDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSection === 'about' && 'Edit About Image'}
              {editingSection === 'free' && 'Edit Free Content Image'}
              {editingSection === 'premium' && 'Edit Premium Content Image'}
              {editingSection === 'vip' && 'Edit VIP Content Image'}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <SimpleEditableMedia
              ref={mediaRef}
              src={
                editingSection === 'about' ? aboutMedia?.url || '' :
                editingSection === 'free' ? freeContentImage || '' :
                editingSection === 'premium' ? premiumContentImage || '' :
                editingSection === 'vip' ? vipContentImage || '' : ''
              }
              onChange={handleMediaChange}
              isEditMode={true}
              alt="Media selection"
              type="all"
              className="h-64"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Floating Edit/Create FAB for admin */}
      {isAdmin && <PageEditFab />}
      
      {/* PageControlsFab for page properties */}
      {isAdmin && (
        <PageControlsFab
          pageSlug="home"
          pageTitle="Home Page"
          onSave={handleComprehensiveSave}
          onPreview={() => setPreviewMode(!previewMode)}
          onAddSection={handleAddSection}
          onPagePropertiesChange={handlePagePropertiesChange}
          isDirty={isDirty}
          isSaving={isSaving}
        />
      )}

      {/* Global Save/Cancel controls for edit mode */}
      {isAdmin && isEditMode && !previewMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2147483647] flex gap-4 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border border-gray-200 px-6 py-3 items-center">
          <Button
            variant="default"
            onClick={handleComprehensiveSave}
            disabled={isSaving || !isDirty}
            className="px-6 py-2 text-base font-medium rounded-full shadow-md"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outline"
            onClick={() => setEditMode(false)}
            className="px-6 py-2 text-base font-medium rounded-full shadow-md"
          >
            Cancel
          </Button>
        </div>
      )}
    </main>
  )
} 