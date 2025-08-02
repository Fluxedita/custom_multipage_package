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
  FooterSection,
  PrivacySection,
  HeroSectionResponsive,
  MediaPlaceholderSection,
  TextWithVideoLeftSection,
  TextWithVideoRightSection,
  ProductPackageLeftSection,
  ProductPackageRightSection,
} 
from '@/app/custom_pages/components/sections'
import PageEditFab from "@/components/admin/PageEditFab"
import PageControlsFab from "@/components/admin/PageControlsFab"
import { toast } from "sonner"
import SimpleEditableMedia from "@/components/profile/SimpleEditableMedia"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { SliderSectionType } from "@/app/custom_pages/types/sections"
import supabase from '@/lib/supabase/client'
import { Section, InfoCard } from "@/app/custom_pages/types/sections"
import { PageControls, PageProperties } from "@/app/custom_pages/components/PageControls"
import { MediaTextSection as MediaTextSectionType } from "@/app/custom_pages/types/sections"
import { FeatureSection as FeatureSectionType } from "@/app/custom_pages/types/sections"
import MediaLibrary from '@/components/media/MediaLibrary'
import { InfoCardSection as InfoCardSectionType } from '@/app/custom_pages/types/sections'
import ContactFormSection from '@/app/custom_contact_section/ContactFormSection';
import FluxeditaAdvancedFormSection from '@/app/custom_contact_section/FluxeditaAdvancedFormSection';
import { Mail } from 'lucide-react';
import CustomCodeSection from '@/app/custom_code_section/CustomCodeSection';
import CustomCodeSectionEditor from '@/app/custom_code_section/CustomCodeSectionEditor';
import EditableTitleSection from '@/components/sections/EditableTitleSection';
import { MediaStoryCardSection } from '@/app/custom_pages/components/sections/MediaStoryCardSection';

// Section type for home page
type HomeSectionType =
  | { type: 'hero' }
  | { type: 'cta' }
  | { type: 'feature-card-grid' }
  | { type: 'media-story-cards' }
  | { type: 'divider' }

const DEFAULT_SECTIONS: HomeSectionType[] = [
  { type: 'hero' },
  { type: 'cta' },
  { type: 'feature-card-grid' },
  { type: 'media-story-cards' },
  { type: 'divider' },
];

// Initial sections for the home page, matching the current layout
const INITIAL_SECTIONS: Section[] = [
  {
    id: 'hero-responsive',
    type: 'hero-responsive',
    title: 'Welcome to Our Amazing Editable Web Application',
    description: 'Our Editable Web Application is a Revolution in Website Creation.',
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
    showMoreEnabled: true,
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

  const handlePagePropertiesChange = (properties: Partial<PageProperties>) => {
    setPageProperties(prev => {
      // If showMoreEnabled is being turned off, reset visibleCount to show all sections
      if (prev.showMoreEnabled && properties.showMoreEnabled === false) {
        setVisibleCount(1000); // A high number to ensure all sections are shown
      }
      return {
        ...prev,
        ...properties
      };
    });
    setIsDirty(true);
  };

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
      case 'hero-responsive':
        newSection = {
          id,
          type: 'hero-responsive',
          title: 'New Responsive Hero Section',
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
            { id: 'email', name: 'email', label: 'Email', type: 'email', required: true, placeholder: 'jamescroanin@gmail.com' },
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
      case 'twoColumnText':
        newSection = {
          id,
          type: 'twoColumnText',
          leftColumn: '',
          rightColumn: '',
          enableLeftColumnSpeech: false,
          enableRightColumnSpeech: false,
          enableSpeech: false,
          visible: true,
        };
        break;
      case 'content':
        newSection = {
          id,
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
        break;
      case 'mediaTextColumns':
        newSection = {
          id,
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
        break;
      case 'footer':
        newSection = {
          id,
          type: 'footer',
          numColumns: 3,
          columns: [],
          backgroundColor: '#f8f9fa',
          textColor: '#333333',
          padding: '2rem',
          visible: true
        } as any;
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
        };
        break;
      case 'media-story-cards':
        newSection = {
          id,
          type: 'media-story-cards',
          title: 'Featured Stories',
          cards: [
            {
              id: `card-${Date.now()}-1`,
              title: 'Story 1',
              tagline: 'A short description of story 1',
              mediaUrl: '',
              mediaType: 'image',
              thumbnailUrl: '',
              linkUrl: '#'
            },
            {
              id: `card-${Date.now()}-2`,
              title: 'Story 2',
              tagline: 'A short description of story 2',
              mediaUrl: '',
              mediaType: 'image',
              thumbnailUrl: '',
              linkUrl: '#'
            },
            {
              id: `card-${Date.now()}-3`,
              title: 'Story 3',
              tagline: 'A short description of story 3',
              mediaUrl: '',
              mediaType: 'image',
              thumbnailUrl: '',
              linkUrl: '#'
            }
          ],
          columns: 3,
          visible: true,
          enableSpeech: false
        };
        break;
      case 'heading':
        newSection = {
          id,
          type: 'heading',
          text: 'New Heading',
          level: 'h2',
          alignment: 'center',
          fontSize: '2rem',
          fontColor: '#222',
          enableSpeech: false,
          visible: true,
        };
        break;
      case 'editable-title':
        newSection = {
          id,
          type: 'editable-title',
          title: 'New Page Title',
          slug: 'new-page-title',
          visible: true,
          enableSpeech: false,
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

  const [visibleCount, setVisibleCount] = useState(30);

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
      {sections.slice(0, visibleCount).map((section, idx) => {
        const isFullWidth = (section as any).width === '100vw';
        return (
          <section
            key={section.id}
            className={
              isFullWidth
                ? 'w-screen left-1/2 right-1/2 ml-[-50vw] mr-[-50vw] relative'
                : ''
            }
            style={isFullWidth ? { width: '100vw' } : {}}
          >
            {isFullWidth ? (
              <div className="relative group">
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
                {(() => {
                  let renderedSection = null;
                  switch (section.type as any) {
                    case 'slider': {
                      const sliderSection = section as import('@/app/custom_pages/types/sections').SliderSectionType;
                      renderedSection = (
                        <div className="relative group w-full">
                          <SliderSection
                            section={sliderSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={s => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                            speakText={() => {}}
                            idx={idx}
                            renderSectionControls={() => null}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'hero-responsive': {
                      const heroResponsiveSection = section as import('@/app/custom_pages/types/sections').HeroSectionResponsiveType;
                      renderedSection = (
                        <div className="relative group">
                          <HeroSectionResponsive
                            section={heroResponsiveSection}
                            isEditMode={isEditMode && !previewMode}
                            idx={idx}
                            onSectionChangeAction={(s: Section) => {
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
                          {isEditMode && (
                            <div className="absolute top-2 right-2 z-10">
                              {/* Section controls if needed */}
                            </div>
                          )}
                        </div>
                      );
                      break;
                    }
                    case 'text': {
                      const textSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <TextSection
                            section={textSection}
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
                              const newSections = [...sections];
                              newSections.splice(idx + 1, 0, duplicatedSection);
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'content': {
                      const contentSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <TextSection
                            section={{
                              ...contentSection,
                              type: 'text',
                            }}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={s => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                            speakText={() => {}}
                            onDuplicate={(duplicatedSection) => {
                              const newSections = [...sections];
                              newSections.splice(idx + 1, 0, duplicatedSection);
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'feature': {
                      const featureSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <FeatureSection
                            section={featureSection}
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
                      );
                      break;
                    }
                    case 'feature-card-grid': {
                      const featureCardGridSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <FeatureCardGridSection
                            section={featureCardGridSection}
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
                      );
                      break;
                    }
                    case 'media-story-cards': {
                      const mediaStoryCardSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <MediaStoryCardSection
                            section={mediaStoryCardSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={s => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                            onMediaSelect={(cardId) => {
                              setMediaDialogIdx(idx);
                              (window as any).__mediaDialogCardId = cardId;
                              (window as any).__mediaDialogIsThumbnail = false;
                            }}
                            onThumbnailSelect={(cardId) => {
                              setMediaDialogIdx(idx);
                              (window as any).__mediaDialogCardId = cardId;
                              (window as any).__mediaDialogIsThumbnail = true;
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'info-card': {
                      const infoCardSection = section as any;
                      renderedSection = (
                        <InfoCardSection
                          section={infoCardSection}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={(update: Partial<any>) => {
                            const newSections = [...sections];
                            newSections[idx] = { ...sections[idx], ...update } as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      );
                      break;
                    }
                    case 'divider': {
                      const dividerSection = section as any;
                      renderedSection = (
                        <DividerSection
                          section={dividerSection}
                          isEditMode={isEditMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          onDuplicate={(duplicatedSection) => {
                            const newSections = [...sections];
                            newSections.splice(idx + 1, 0, duplicatedSection);
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          idx={idx}
                          renderSectionControls={() => null}
                        />
                      );
                      break;
                    }
                    case 'heading': {
                      const headingSection = section as any;
                      renderedSection = (
                        <HeadingSection
                          section={headingSection}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                          idx={idx}
                          renderSectionControls={() => null}
                        />
                      );
                      break;
                    }
                    case 'quote': {
                      const quoteSection = section as any;
                      renderedSection = (
                        <QuoteSection
                          section={quoteSection}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      );
                      break;
                    }
                    case 'cta': {
                      const ctaSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <CTASection
                            section={ctaSection}
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
                      );
                      break;
                    }
                    case 'gallery': {
                      const gallerySection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <GallerySection
                            section={gallerySection}
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
                      );
                      break;
                    }
                    case 'media-text-left':
                    case 'media-text-right': {
                      const mediaTextSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <MediaTextSection
                            section={mediaTextSection}
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
                      );
                      break;
                    }
                    case 'mediaTextColumns': {
                      const mediaTextColumnsSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <MediaTextColumnsSection
                            section={mediaTextColumnsSection}
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
                      );
                      break;
                    }
                    case 'twoColumnText': {
                      const twoColumnTextSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <TwoColumnTextSection
                            section={twoColumnTextSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={(s: Section) => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                            speakText={() => {}}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'media-placeholder': {
                      const mediaPlaceholderSection = section as any;
                      renderedSection = (
                        <MediaPlaceholderSection
                          section={mediaPlaceholderSection}
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
                            const card = (section as any).cards.find((c: any) => c.id === cardId);
                            if (card) {
                              setMediaDialogIdx(idx);
                              (window as any).__mediaDialogCardId = cardId;
                              (window as any).__mediaDialogIsThumbnail = false;
                            }
                          }}
                          onDuplicate={(duplicatedSection) => {
                            const newSections = [...sections];
                            newSections.splice(idx + 1, 0, duplicatedSection);
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                        />
                      );
                      break;
                    }
                    case 'footer': {
                      const footerSection = section as any;
                      renderedSection = (
                        <FooterSection
                          section={footerSection}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as unknown as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      );
                      break;
                    }
                    case 'contact-form': {
                      const contactFormSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <ContactFormSection section={contactFormSection} />
                        </div>
                      );
                      break;
                    }
                    case 'fluxedita_advanced_form': {
                      renderedSection = <FluxeditaAdvancedFormSection />;
                      break;
                    }
                    case 'privacy': {
                      const privacySection = section as any;
                      renderedSection = (
                        <PrivacySection
                          section={privacySection}
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
                    }
                    case 'custom-code': {
                      const customCodeSection = section as any;
                      renderedSection = isEditMode && !previewMode ? (
                        <div className="relative group">
                          <CustomCodeSectionEditor
                            code={customCodeSection.code || ''}
                            onChange={newCode => {
                              const newSections = [...sections];
                              if (section.type === 'custom-code') {
                                newSections[idx] = { ...section, code: newCode };
                              } else {
                                newSections[idx] = section;
                              }
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      ) : (
                        <CustomCodeSection code={customCodeSection.code || ''} />
                      );
                      break;
                    }
                    case 'text-with-video-left': {
                      const textWithVideoLeftSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <TextWithVideoLeftSection
                            section={textWithVideoLeftSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={s => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'text-with-video-right': {
                      const textWithVideoRightSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <TextWithVideoRightSection
                            section={textWithVideoRightSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={s => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'product-package-left': {
                      const productPackageLeftSection = section as any;
                      renderedSection = (
                        <ProductPackageLeftSection
                          section={productPackageLeftSection}
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
                    }
                    case 'product-package-right': {
                      const productPackageRightSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <ProductPackageRightSection
                            section={productPackageRightSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChangeAction={(s: Section) => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'heading':
                      const headingSection = section as any;
                      renderedSection = (
                        <HeadingSection
                          section={headingSection}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                          idx={idx}
                          renderSectionControls={() => null}
                        />
                      );
                      break;
                    case 'editable-title': {
                      const editableTitleSection = section as any;
                      renderedSection = (
                        <EditableTitleSection
                          section={editableTitleSection}
                          isEditMode={isEditMode && !previewMode}
                          onChange={update => {
                            const newSections = [...sections];
                            newSections[idx] = { ...sections[idx], ...update };
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                        />
                      );
                      break;
                    }
                    default:
                      renderedSection = null;
                  }
                  return renderedSection;
                })()}
              </div>
            ) : (
              <div className="container mx-auto px-4 md:px-6 relative group">
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
                {(() => {
                  let renderedSection = null;
                  switch (section.type as any) {
                    case 'slider': {
                      const sliderSection = section as import('@/app/custom_pages/types/sections').SliderSectionType;
                      renderedSection = (
                        <div className="relative group w-full">
                          <SliderSection
                            section={sliderSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={s => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                            speakText={() => {}}
                            idx={idx}
                            renderSectionControls={() => null}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'hero-responsive': {
                      const heroResponsiveSection = section as import('@/app/custom_pages/types/sections').HeroSectionResponsiveType;
                      renderedSection = (
                        <div className="relative group">
                          <HeroSectionResponsive
                            section={heroResponsiveSection}
                            isEditMode={isEditMode && !previewMode}
                            idx={idx}
                            onSectionChangeAction={(s: Section) => {
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
                          {isEditMode && (
                            <div className="absolute top-2 right-2 z-10">
                              {/* Section controls if needed */}
                            </div>
                          )}
                        </div>
                      );
                      break;
                    }
                    case 'text': {
                      const textSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <TextSection
                            section={textSection}
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
                              const newSections = [...sections];
                              newSections.splice(idx + 1, 0, duplicatedSection);
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'content': {
                      const contentSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <TextSection
                            section={{
                              ...contentSection,
                              type: 'text',
                            }}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={s => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                            speakText={() => {}}
                            onDuplicate={(duplicatedSection) => {
                              const newSections = [...sections];
                              newSections.splice(idx + 1, 0, duplicatedSection);
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'feature': {
                      const featureSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <FeatureSection
                            section={featureSection}
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
                      );
                      break;
                    }
                    case 'feature-card-grid': {
                      const featureCardGridSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <FeatureCardGridSection
                            section={featureCardGridSection}
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
                      );
                      break;
                    }
                    case 'media-story-cards': {
                      const mediaStoryCardSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <MediaStoryCardSection
                            section={mediaStoryCardSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={s => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                            onMediaSelect={(cardId) => {
                              setMediaDialogIdx(idx);
                              (window as any).__mediaDialogCardId = cardId;
                              (window as any).__mediaDialogIsThumbnail = false;
                            }}
                            onThumbnailSelect={(cardId) => {
                              setMediaDialogIdx(idx);
                              (window as any).__mediaDialogCardId = cardId;
                              (window as any).__mediaDialogIsThumbnail = true;
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'info-card': {
                      const infoCardSection = section as any;
                      renderedSection = (
                        <InfoCardSection
                          section={infoCardSection}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={(update: Partial<any>) => {
                            const newSections = [...sections];
                            newSections[idx] = { ...sections[idx], ...update } as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      );
                      break;
                    }
                    case 'divider': {
                      const dividerSection = section as any;
                      renderedSection = (
                        <DividerSection
                          section={dividerSection}
                          isEditMode={isEditMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          onDuplicate={(duplicatedSection) => {
                            const newSections = [...sections];
                            newSections.splice(idx + 1, 0, duplicatedSection);
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          idx={idx}
                          renderSectionControls={() => null}
                        />
                      );
                      break;
                    }
                    case 'heading': {
                      const headingSection = section as any;
                      renderedSection = (
                        <HeadingSection
                          section={headingSection}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                          idx={idx}
                          renderSectionControls={() => null}
                        />
                      );
                      break;
                    }
                    case 'quote': {
                      const quoteSection = section as any;
                      renderedSection = (
                        <QuoteSection
                          section={quoteSection}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      );
                      break;
                    }
                    case 'cta': {
                      const ctaSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <CTASection
                            section={ctaSection}
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
                      );
                      break;
                    }
                    case 'gallery': {
                      const gallerySection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <GallerySection
                            section={gallerySection}
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
                      );
                      break;
                    }
                    case 'media-text-left':
                    case 'media-text-right': {
                      const mediaTextSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <MediaTextSection
                            section={mediaTextSection}
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
                      );
                      break;
                    }
                    case 'mediaTextColumns': {
                      const mediaTextColumnsSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <MediaTextColumnsSection
                            section={mediaTextColumnsSection}
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
                      );
                      break;
                    }
                    case 'twoColumnText': {
                      const twoColumnTextSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <TwoColumnTextSection
                            section={twoColumnTextSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={(s: Section) => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                            speakText={() => {}}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'media-placeholder': {
                      const mediaPlaceholderSection = section as any;
                      renderedSection = (
                        <MediaPlaceholderSection
                          section={mediaPlaceholderSection}
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
                            const card = (section as any).cards.find((c: any) => c.id === cardId);
                            if (card) {
                              setMediaDialogIdx(idx);
                              (window as any).__mediaDialogCardId = cardId;
                              (window as any).__mediaDialogIsThumbnail = false;
                            }
                          }}
                          onDuplicate={(duplicatedSection) => {
                            const newSections = [...sections];
                            newSections.splice(idx + 1, 0, duplicatedSection);
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                        />
                      );
                      break;
                    }
                    case 'footer': {
                      const footerSection = section as any;
                      renderedSection = (
                        <FooterSection
                          section={footerSection}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as unknown as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                        />
                      );
                      break;
                    }
                    case 'contact-form': {
                      const contactFormSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <ContactFormSection section={contactFormSection} />
                        </div>
                      );
                      break;
                    }
                    case 'fluxedita_advanced_form': {
                      renderedSection = <FluxeditaAdvancedFormSection />;
                      break;
                    }
                    case 'privacy': {
                      const privacySection = section as any;
                      renderedSection = (
                        <PrivacySection
                          section={privacySection}
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
                    }
                    case 'custom-code': {
                      const customCodeSection = section as any;
                      renderedSection = isEditMode && !previewMode ? (
                        <div className="relative group">
                          <CustomCodeSectionEditor
                            code={customCodeSection.code || ''}
                            onChange={newCode => {
                              const newSections = [...sections];
                              if (section.type === 'custom-code') {
                                newSections[idx] = { ...section, code: newCode };
                              } else {
                                newSections[idx] = section;
                              }
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      ) : (
                        <CustomCodeSection code={customCodeSection.code || ''} />
                      );
                      break;
                    }
                    case 'text-with-video-left': {
                      const textWithVideoLeftSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <TextWithVideoLeftSection
                            section={textWithVideoLeftSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={s => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'text-with-video-right': {
                      const textWithVideoRightSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <TextWithVideoRightSection
                            section={textWithVideoRightSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChange={s => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'product-package-left': {
                      const productPackageLeftSection = section as any;
                      renderedSection = (
                        <ProductPackageLeftSection
                          section={productPackageLeftSection}
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
                    }
                    case 'product-package-right': {
                      const productPackageRightSection = section as any;
                      renderedSection = (
                        <div className="relative group">
                          <ProductPackageRightSection
                            section={productPackageRightSection}
                            isEditMode={isEditMode && !previewMode}
                            onSectionChangeAction={(s: Section) => {
                              const newSections = [...sections];
                              newSections[idx] = s as Section;
                              setSections(newSections);
                              setIsDirty(true);
                            }}
                          />
                        </div>
                      );
                      break;
                    }
                    case 'heading':
                      const headingSection = section as any;
                      renderedSection = (
                        <HeadingSection
                          section={headingSection}
                          isEditMode={isEditMode && !previewMode}
                          onSectionChange={s => {
                            const newSections = [...sections];
                            newSections[idx] = s as Section;
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                          speakText={() => {}}
                          idx={idx}
                          renderSectionControls={() => null}
                        />
                      );
                      break;
                    case 'editable-title': {
                      const editableTitleSection = section as any;
                      renderedSection = (
                        <EditableTitleSection
                          section={editableTitleSection}
                          isEditMode={isEditMode && !previewMode}
                          onChange={update => {
                            const newSections = [...sections];
                            newSections[idx] = { ...sections[idx], ...update };
                            setSections(newSections);
                            setIsDirty(true);
                          }}
                        />
                      );
                      break;
                    }
                    default:
                      renderedSection = null;
                  }
                  return renderedSection;
                })()}
              </div>
            )}
          </section>
        );
      })}

      {/* Show More Button */}
      {(pageProperties.showMoreEnabled ?? true) && visibleCount < sections.length && (
        <div className="flex justify-center my-8">
          <button
            onClick={() => setVisibleCount(c => Math.min(c + 2, sections.length))}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow transition-colors focus:outline-none focus:ring-2 focus:ring-blue-400"
          >
            Show More
          </button>
        </div>
      )}

      {/* MediaLibrary dialog for Media/Text sections */}
      {mediaDialogIdx !== null && (
        <MediaLibrary
          isDialog
          type="all"
          onCloseAction={() => {
            setMediaDialogIdx(null);
            (window as any).__mediaDialogCardId = null;
            (window as any).__mediaDialogIsThumbnail = null;
          }}
          onSelectAction={(url, type) => {
            setSections(prev => {
              const newSections = [...prev];
              const section = newSections[mediaDialogIdx];
              
              if (section) {
                if (section.type === 'media-story-cards') {
                  const cardId = (window as any).__mediaDialogCardId;
                  const isThumbnail = (window as any).__mediaDialogIsThumbnail;
                  if (cardId && section.cards) {
                    const updatedCards = section.cards.map((card: any) =>
                      card.id === cardId
                        ? isThumbnail
                          ? { ...card, thumbnailUrl: url }
                          : { ...card, mediaUrl: url, mediaType: (type === 'image' || type === 'video') ? type : 'image' }
                        : card
                    );
                    newSections[mediaDialogIdx] = {
                      ...section,
                      cards: updatedCards,
                    };
                  }
                } else if (section.type === 'media-placeholder') {
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
                }
              }
              return newSections;
            });
            setIsDirty(true);
            setMediaDialogIdx(null);
            (window as any).__mediaDialogCardId = null;
            (window as any).__mediaDialogIsThumbnail = null;
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