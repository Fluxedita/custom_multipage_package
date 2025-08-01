"use client";

import { useState, useEffect } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useEditMode } from "@/hooks/EditModeContext"
import { HeroSectionType } from "@/types/sections"
import supabase from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from "@/components/ui/button"
import { SliderSection } from "@/app/custom_pages/components/sections/SliderSection";
import { SliderSectionType } from "@/app/custom_pages/types/sections";
import { Section } from '@/app/custom_pages/types/sections';
import { PageControls } from '@/app/custom_pages/components/PageControls';
import PageEditFab from '@/components/admin/PageEditFab';
import PageControlsFab from '@/components/admin/PageControlsFab';
import MediaLibrary from '@/components/media/MediaLibrary';
import {
  HeroSection as HeroSectionComponent,
  SliderSection as SliderSectionComponent,
  TextSection,
  FeatureSection as FeatureSectionComponent,
  CTASection,
  GallerySection,
  DividerSection,
  InfoCardSection,
  FeatureCardGridSection,
  AdvancedSliderSection,
  MediaTextSection as MediaTextSectionComponent,
  MediaTextColumnsSection,
  TwoColumnTextSection,
  QuoteSection,
  HeadingSection,
  FooterSection,
  HeroSectionResponsive,
  MediaPlaceholderSection,
  TextWithVideoLeftSection,
  TextWithVideoRightSection,
  ProductPackageLeftSection,
  ProductPackageRightSection
} from '@/app/custom_pages/components/sections';
import ContactFormSection from '@/app/custom_contact_section/ContactFormSection';
import FluxeditaAdvancedFormSection from '@/app/custom_contact_section/FluxeditaAdvancedFormSection';
import PrivacySection from '@/app/custom_pages/components/sections/PrivacySection';
import CustomCodeSection from '@/app/custom_code_section/CustomCodeSection';
import CustomCodeSectionEditor from '@/app/custom_code_section/CustomCodeSectionEditor';

const INITIAL_SECTIONS: Section[] = [
  {
    id: 'products-hero-responsive',
    type: 'hero-responsive',
    title: 'Our Products',
    description: 'Discover our amazing range of products and services',
    buttonText: '',
    buttonUrl: '',
    backgroundImage: '',
    backgroundMedia: '/images/products-hero.jpg',
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
    id: 'products-intro',
    type: 'text',
    content: 'Welcome to our products page. This is a blank canvas where you can build your own custom page with various sections and components.',
    alignment: 'center',
    fontSize: '1.125rem',
    fontColor: '#374151',
    backgroundColor: '#f9fafb',
    padding: '2rem',
    margin: '2rem 0',
    enableSpeech: false,
    visible: true,
  },
  {
    id: 'products-features',
    type: 'feature',
    title: 'Why Choose Our Products',
    description: "We offer the best quality and service in the industry.",
    features: [
      {
        icon: 'star',
        title: 'Premium Quality',
        description: 'All our products meet the highest quality standards.'
      },
      {
        icon: 'heart',
        title: 'Customer Satisfaction',
        description: 'We prioritize your satisfaction above everything else.'
      },
      {
        icon: 'sparkles',
        title: 'Innovation',
        description: 'Cutting-edge technology and innovative solutions.'
      }
    ],
    layout: 'grid',
    enableSpeech: false,
    enableTitleSpeech: false,
    enableDescriptionSpeech: false,
    enableFeatureSpeech: false,
    visible: true,
  },
];

export default function ProductsPageClient() {
  const { isAdmin } = useAuth()
  const { isEditMode, toggleEditMode } = useEditMode()
  const [previewMode, setPreviewMode] = useState(false);
  const [sections, setSections] = useState<Section[]>(INITIAL_SECTIONS)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showControls, setShowControls] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mediaDialogIdx, setMediaDialogIdx] = useState<number | null>(null)

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
    pageTitle: 'Products',
    metaDescription: 'Discover our amazing range of products and services',
    language: 'en',
  });

  // Load sections and page properties from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const { data: components } = await supabase
          .from('root_page_components')
          .select('component_type, content')
          .eq('page_slug', 'products')
          .eq('is_active', true)
        
        if (components && components.length > 0) {
          // Find the sections component
          const sectionsComponent = components.find(c => c.component_type === 'sections')
          if (sectionsComponent?.content && Array.isArray(sectionsComponent.content)) {
            // Ensure mediaPosition is set for all media-text sections
            const fixedSections = sectionsComponent.content.map((section: any) => {
              if ((section.type === 'media-text-left' || section.type === 'media-text-right') && !section.mediaPosition) {
                return {
                  ...section,
                  mediaPosition: section.type === 'media-text-right' ? 'right' : 'left',
                };
              }
              return section;
            });
            setSections(fixedSections)
          }

          // Find the page properties component
          const propertiesComponent = components.find(c => c.component_type === 'properties')
          if (propertiesComponent?.content) {
            setPageProperties(prev => ({
              ...prev,
              ...propertiesComponent.content
            }));
          }
        }
      } catch (err) {
        // ignore
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [supabase])

  // Save sections and page properties to Supabase
  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Save sections
      const { error: sectionsError } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'products',
          component_type: 'sections',
          content: sections as any,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,component_type'
        })
      
      if (sectionsError) throw sectionsError

      // Save page properties
      const { error: propertiesError } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'products',
          component_type: 'properties',
          content: pageProperties,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,component_type'
        })
      
      if (propertiesError) throw propertiesError

      toast.success('Changes saved successfully')
      setIsDirty(false)
    } catch (err) {
      console.error('Error saving changes:', err)
      toast.error('Failed to save changes')
    } finally {
      setIsSaving(false)
    }
  }

  // Page properties handlers
  const handlePagePropertiesChange = (newProperties: Partial<typeof pageProperties>) => {
    setPageProperties(prev => ({
      ...prev,
      ...newProperties
    }));
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

  // Section controls
  const handleAddSection = (type: string, afterIdx?: number) => {
    // Create a new section object by type
    let newSection: Section;
    const id = `${type}-${Date.now()}`;
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
          slides: [],
          autoplay: false,
          autoplayDelay: 3000,
          showNavigation: true,
          showPagination: true,
          effect: 'slide',
          loop: false,
          height: '400px',
          width: '100%',
          enableSpeech: false,
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          visible: true,
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
      case 'feature-card-grid':
        newSection = {
          id,
          type: 'feature-card-grid',
          numCards: 3,
          cards: [],
          enableSpeech: false,
          visible: true,
        };
        break;
      case 'text':
        newSection = {
          id,
          type: 'text',
          content: '',
          alignment: 'left',
          fontSize: '1rem',
          fontColor: '#222',
          backgroundColor: '#fff',
          padding: '1rem',
          margin: '1rem 0',
          enableSpeech: false,
          visible: true,
        };
        break;
      case 'media-text-left':
        newSection = {
          id,
          type: 'media-text-left',
          mediaPosition: 'left',
          title: '',
          description: '',
          mediaUrl: '',
          mediaType: 'image',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableSpeech: false,
          visible: true,
        };
        break;
      case 'media-text-right':
        newSection = {
          id,
          type: 'media-text-right',
          mediaPosition: 'right',
          title: '',
          description: '',
          mediaUrl: '',
          mediaType: 'image',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableSpeech: false,
          visible: true,
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
      case 'heading':
        newSection = {
          id,
          type: 'heading',
          text: 'Heading',
          level: 'h2',
          alignment: 'left',
          fontSize: '2rem',
          fontColor: '#222',
          enableSpeech: false,
          visible: true,
        };
        break;
      case 'quote':
        newSection = {
          id,
          type: 'quote',
          text: '',
          author: '',
          alignment: 'center',
          fontSize: '1.25rem',
          fontColor: '#555',
          enableSpeech: false,
          visible: true,
        };
        break;
      case 'cta':
        newSection = {
          id,
          type: 'cta',
          title: '',
          description: '',
          buttonText: 'Click Me',
          buttonUrl: '',
          backgroundColor: '#f3f4f6',
          textColor: '#222',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableSpeech: false,
          visible: true,
        };
        break;
      case 'gallery':
        newSection = {
          id,
          type: 'gallery',
          title: '',
          description: '',
          images: [],
          layout: 'grid',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableImageSpeech: false,
          enableSpeech: false,
          visible: true,
        };
        break;
      case 'footer':
        newSection = {
          id,
          type: 'footer',
          numColumns: 3,
          columns: [],
          enableSpeech: false,
          visible: true,
        } as any; // If footer type is not in Section union, cast as any
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
      case 'feature':
        newSection = {
          id,
          type: 'feature',
          title: 'New Feature Section',
          description: '',
          features: [
            { icon: 'star', title: 'Feature 1', description: 'Description for feature 1' },
            { icon: 'heart', title: 'Feature 2', description: 'Description for feature 2' }
          ],
          layout: 'grid',
          enableSpeech: false,
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableFeatureSpeech: false,
          visible: true,
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
        // fallback to a text section
        newSection = {
          id,
          type: 'text',
          content: '',
          alignment: 'left',
          fontSize: '1rem',
          fontColor: '#222',
          backgroundColor: '#fff',
          padding: '1rem',
          margin: '1rem 0',
          enableSpeech: false,
          visible: true,
        };
    }
    setSections(prev => {
      if (typeof afterIdx === 'number' && afterIdx >= 0 && afterIdx < prev.length) {
        return [
          ...prev.slice(0, afterIdx + 1),
          newSection,
          ...prev.slice(afterIdx + 1)
        ];
      } else {
        return [...prev, newSection];
      }
    });
    setIsDirty(true);
  }
  const handleRemoveSection = (idx: number) => {
    setSections(prev => prev.filter((_, i) => i !== idx))
    setIsDirty(true)
  }
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

  if (loading) return <div>Loading...</div>

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    )
  }

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
      {/* Add a preview toggle button for admins */}
      {isAdmin && (
        <button
          className="fixed left-8 bottom-24 z-[120] bg-primary text-white rounded-full shadow-lg p-4 hover:bg-primary/90"
          onClick={() => setPreviewMode(pm => !pm)}
          aria-label="Toggle Preview Mode"
        >
          {previewMode ? 'Exit Preview' : 'Preview as Member'}
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
              onSave={handleSave}
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
      {/* Render all sections dynamically */}
      {sections.map((section, idx) => {
        // Check if this is a hero section and should be full width
        const isFullWidthHero = section.type === 'hero' && section.width === '100vw';
        const SectionContent = (
          <div className="relative group">
            {/* Section controls (move, remove, visibility) */}
            {isAdmin && isEditMode && (
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
                        idx={idx}
                        renderSectionControls={() => null}
                        speakText={() => {}}
                      />
                    </div>
                  );
                  break;
                }
                case 'advanced-slider': {
                  const advancedSliderSection = section as import('@/app/custom_pages/types/sections').AdvancedSliderSection;
                  renderedSection = (
                    <div className="relative group w-full">
                      <AdvancedSliderSection
                        section={advancedSliderSection}
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
                  );
                  break;
                }
                case 'feature-card-grid': {
                  const featureCardGridSection = section as import('@/app/custom_pages/types/sections').FeatureCardGridSection;
                  renderedSection = (
                    <div className="relative group w-full">
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
                case 'feature': {
                  const featureSection = section as import('@/app/custom_pages/types/sections').FeatureSection;
                  renderedSection = (
                    <div className="relative group w-full">
                      <FeatureSectionComponent
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
                case 'text': {
                  const textSection = section as import('@/app/custom_pages/types/sections').TextSection;
                  renderedSection = (
                    <div className="relative group w-full">
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
                      />
                    </div>
                  );
                  break;
                }
                case 'media-text-left': {
                  const mediaTextLeftSection = section as import('@/app/custom_pages/types/sections').MediaTextSection;
                  renderedSection = (
                    <div className="relative group w-full">
                      <MediaTextSectionComponent
                        section={mediaTextLeftSection}
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
                case 'media-text-right': {
                  const mediaTextRightSection = section as import('@/app/custom_pages/types/sections').MediaTextSection;
                  renderedSection = (
                    <div className="relative group w-full">
                      <MediaTextSectionComponent
                        section={mediaTextRightSection}
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
                case 'divider': {
                  const dividerSection = section as import('@/app/custom_pages/types/sections').DividerSection;
                  renderedSection = (
                    <div className="relative group w-full">
                      <DividerSection
                        section={dividerSection}
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
                  );
                  break;
                }
                case 'cta': {
                  const ctaSection = section as import('@/app/custom_pages/types/sections').CTASection;
                  renderedSection = (
                    <div className="relative group w-full">
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
                  const gallerySection = section as import('@/app/custom_pages/types/sections').GallerySection;
                  renderedSection = (
                    <div className="relative group w-full">
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
                case 'info-card': {
                  const infoCardSection = section as import('@/app/custom_pages/types/sections').InfoCardSection;
                  renderedSection = (
                    <div className="relative group w-full">
                      <InfoCardSection
                        section={infoCardSection}
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
                case 'contact-form': {
                  const contactFormSection = section as any;
                  renderedSection = (
                    <div className="relative group w-full">
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
                    <div className="relative group w-full">
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
                case 'hero-responsive': {
                  const heroResponsiveSection = section as any;
                  renderedSection = (
                    <HeroSectionResponsive
                      section={heroResponsiveSection}
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
                      onExitEditMode={() => {}}
                      isDirty={isDirty}
                    />
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
                case 'twoColumnText': {
                  const twoColumnTextSection = section as any;
                  renderedSection = (
                    <div className="relative group w-full">
                      <TwoColumnTextSection
                        section={twoColumnTextSection}
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
                    <div className="relative group">
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
                    </div>
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
                        onSectionChangeAction={s => {
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
                default:
                  renderedSection = null
              }
              return renderedSection;
            })()}
          </div>
        );
        return isFullWidthHero ? (
          <section key={section.id} className="py-4 bg-white">
            {SectionContent}
          </section>
        ) : (
          <section key={section.id} className="py-4 bg-white">
            <div className="container px-4 md:px-6">
              {SectionContent}
            </div>
          </section>
        );
      })}
      {/* Floating Edit/Create FAB for admin */}
      {isAdmin && <PageEditFab />}

      {/* Global Save/Cancel controls for edit mode */}
      {isAdmin && isEditMode && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[2147483647] flex gap-4 bg-white/95 backdrop-blur-sm rounded-full shadow-2xl border border-gray-200 px-6 py-3 items-center">
          <Button
            variant="default"
            onClick={handleSave}
            disabled={isSaving || !isDirty}
            className="px-6 py-2 text-base font-medium rounded-full shadow-md"
          >
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          <Button
            variant="outline"
            onClick={toggleEditMode}
            className="px-6 py-2 text-base font-medium rounded-full shadow-md"
          >
            Cancel
          </Button>
        </div>
      )}
    </main>
  )
}
