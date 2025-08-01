'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Edit, X, Mail, Phone, MapPin } from 'lucide-react'
import { toast } from 'sonner'
import ContactHero from '@/components/contact/ContactHero'
import ContactDetails from '@/components/contact/ContactDetails'
import ContactForm from '@/components/contact/ContactForm'
import CommentsSection from '@/components/CommentsSection'
import { ContactEditProvider, useContactEdit } from '@/components/contact/ContactEditContext'
import EditModeControls from '@/components/contact/EditModeControls'
import { useAuth } from '@/components/providers/AuthProvider'
import supabase from '@/lib/supabase/client'
import { FeatureSection } from '@/app/custom_pages/components/sections/FeatureSection';
import { Section, FeatureSection as FeatureSectionType, HeroSection as HeroSectionType } from '@/app/custom_pages/types/sections';
import { TwoColumnTextSection } from '@/app/custom_pages/components/sections/TwoColumnTextSection';
import { SliderSection } from '@/app/custom_pages/components/sections/SliderSection';
import { HeroSection } from '@/app/custom_pages/components/sections/HeroSection';
import { TextSection } from '@/app/custom_pages/components/sections/TextSection';
import { QuoteSection } from '@/app/custom_pages/components/sections/QuoteSection';

type ContactMethod = {
  icon: React.ReactNode;
  title: string;
  value: string;
  action: string;
};

// Main client component wrapped with ContactEditProvider
export default function ContactPageClient() {
  return (
    <ContactEditProvider>
      <ContactPageContent />
    </ContactEditProvider>
  )
}

// Inner component that uses the contact edit context
function ContactPageContent() {
  const { isAdmin } = useAuth()
  const { isEditMode, toggleEditMode, saveContactData, getContactData, reloadFlag } = useContactEdit()
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  // Remove old profileImage/contactMethods state
  // Add feature section state
  const [featureSection, setFeatureSection] = useState<FeatureSectionType | null>(null)
  const [profileImage, setProfileImage] = useState<string>('/placeholder.svg?height=1000&width=800')
  const [contactMethods, setContactMethods] = useState<ContactMethod[]>([])
  const [sections, setSections] = useState<Section[]>([]); // Add this line for sections state
  const [isDirty, setIsDirty] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);

  // Load contact data from Supabase
  useEffect(() => {
    const loadContactData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Fetch the page_content row for the contact page by page_slug and section_type
        const { data: contentRow, error: contentError } = await supabase
          .from('page_content')
          .select('content')
          .eq('page_slug', 'contact')
          .eq('section_type', 'contact')
          .single()

        if (contentError || !contentRow) {
          // No content yet, use placeholder
          setProfileImage('/placeholder.svg?height=1000&width=800')
          setContactMethods([])
          saveContactData('profileImage', '/placeholder.svg?height=1000&width=800')
          saveContactData('contactMethods', [])
          return
        }

        const contactData = contentRow.content as any
        // Load profile image from Supabase and save to context
        if (contactData.profileImage) {
          setProfileImage(contactData.profileImage)
          saveContactData('profileImage', contactData.profileImage)
        } else {
          setProfileImage('/placeholder.svg?height=1000&width=800')
          saveContactData('profileImage', '/placeholder.svg?height=1000&width=800')
        }
        // Load contact methods from Supabase and save to context
        if (contactData.contactMethods) {
          setContactMethods(contactData.contactMethods)
          saveContactData('contactMethods', contactData.contactMethods)
        } else {
          setContactMethods([])
          saveContactData('contactMethods', [])
        }
      } catch (err) {
        console.error('Error loading contact page data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load contact page data')
        toast.error('Failed to load contact page data')
      } finally {
        setIsLoading(false)
      }
    }

    loadContactData()
  }, [saveContactData, reloadFlag])

  // Load feature section from Supabase
  useEffect(() => {
    const loadContactFeatureSection = async () => {
      try {
        setIsLoading(true)
        setError(null)
        // 1. Get the contact page row from custom_pages
        const { data: page, error: pageError } = await supabase
          .from('custom_pages')
          .select('id')
          .eq('slug', 'contact')
          .single()
        if (pageError || !page) throw new Error('Contact page not found')
        // 2. Get the page_content row for the contact page
        const { data: contentRow, error: contentError } = await supabase
          .from('page_content')
          .select('content')
          .eq('page_id', page.id)
          .single()
        if (contentError || !contentRow) {
          // No content yet, use default feature section
          setFeatureSection({
            id: 'contact-feature',
            type: 'feature',
            title: 'Get in Touch',
            description: 'We are always excited to connect! Whether you have questions, want to collaborate, or just want to say hi, feel free to reach out.',
            features: [
              { icon: 'star', title: 'Email', description: 'Reach us at hello@example.com' },
              { icon: 'heart', title: 'Phone', description: '+1 (555) 123-4567' },
              { icon: 'sparkles', title: 'Location', description: 'London, United Kingdom' }
            ],
            layout: 'grid',
            enableTitleSpeech: false,
            enableDescriptionSpeech: false,
            enableFeatureSpeech: false,
            enableSpeech: false,
            visible: true,
          })
          return
        }
        // Load feature section from content
        if (contentRow.content && contentRow.content.featureSection) {
          setFeatureSection(contentRow.content.featureSection)
        } else {
          setFeatureSection({
            id: 'contact-feature',
            type: 'feature',
            title: 'Get in Touch',
            description: 'We are always excited to connect! Whether you have questions, want to collaborate, or just want to say hi, feel free to reach out.',
            features: [
              { icon: 'star', title: 'Email', description: 'Reach us at hello@example.com' },
              { icon: 'heart', title: 'Phone', description: '+1 (555) 123-4567' },
              { icon: 'sparkles', title: 'Location', description: 'London, United Kingdom' }
            ],
            layout: 'grid',
            enableTitleSpeech: false,
            enableDescriptionSpeech: false,
            enableFeatureSpeech: false,
            enableSpeech: false,
            visible: true,
          })
        }
      } catch (err) {
        console.error('Error loading contact page data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load contact page data')
        toast.error('Failed to load contact page data')
      } finally {
        setIsLoading(false)
      }
    }
    loadContactFeatureSection()
  }, [reloadFlag])

  // Save handler for feature section
  const handleSaveFeatureSection = async (section: FeatureSectionType) => {
    try {
      // 1. Get the contact page row from custom_pages
      const { data: page, error: pageError } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('slug', 'contact')
        .single()
      if (pageError || !page) throw new Error('Contact page not found')
      // 2. Upsert the feature section in page_content
      const { data: existingContent, error: contentCheckError } = await supabase
        .from('page_content')
        .select('id, content')
        .eq('page_id', page.id)
        .single()
      let saveError
      if (existingContent) {
        // Update existing record
        const { error } = await supabase
          .from('page_content')
          .update({ content: { ...existingContent.content, featureSection: section } })
          .eq('page_id', page.id)
        saveError = error
      } else {
        // Create new record
        const { error } = await supabase
          .from('page_content')
          .insert({
            page_id: page.id,
            page_slug: 'contact',
            section_type: 'contact',
            sort_order: 0,
            is_published: true,
            content: { featureSection: section }
          })
        saveError = error
      }
      if (saveError) throw saveError
      toast.success('Contact feature section saved!')
    } catch (err) {
      toast.error('Failed to save contact feature section')
    }
  }

  // Handle profile image change
  const handleProfileImageChange = (url: string) => {
    setProfileImage(url)
    // Save to context (localStorage) instead of directly to Supabase
    saveContactData('profileImage', url)
  }

  // Handle contact method change
  const handleContactMethodChange = (index: number, field: string, value: string) => {
    const updatedMethods = [...contactMethods]
    updatedMethods[index] = { ...updatedMethods[index], [field]: value }
    setContactMethods(updatedMethods)

    // Save to context (localStorage) instead of directly to Supabase
    saveContactData('contactMethods', updatedMethods)
  }

  // Section creation logic (add this function if not present, or update existing one)
  const handleAddSection = (type: string) => {
    let newSection: Section;
    const id = `${type}-${Date.now()}`;
    switch (type) {
      case 'feature':
        newSection = {
          id,
          type: 'feature',
          title: 'New Feature Section',
          description: '',
          features: [],
          layout: 'grid',
          enableTitleSpeech: false,
          enableDescriptionSpeech: false,
          enableFeatureSpeech: false,
          enableSpeech: false,
          visible: true,
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
      default:
        return;
    }
    setSections(prev => [...prev, newSection]);
  };

  // Section rendering logic (add to your main render/switch statement)
  // Example:
  // switch (section.type) {
  //   case 'feature':
  //     // ...
  //     break;
  // case 'twoColumnText':
  //   return (
  //     <section className="py-16 bg-white">
  //       <div className="container px-4 md:px-6">
  //         <TwoColumnTextSection
  //           section={section as any}
  //           isEditMode={isEditMode}
  //           onSectionChange={s => {
  //             // Update your sections state here
  //           }}
  //           speakText={() => {}}
  //         />
  //       </div>
  //     </section>
  //   );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

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
    <div className="min-h-screen bg-white">
      {/* Edit mode controls - only show when user is admin */}
      {isAdmin && <EditModeControls />}
      {/* Preview mode toggle for admin */}
      {isAdmin && (
        <div className="fixed top-6 right-6 z-[2147483647] flex gap-2 items-center">
          <Button
            variant={previewMode ? "default" : "outline"}
            onClick={() => setPreviewMode((prev) => !prev)}
          >
            {previewMode ? "Exit Preview" : "Preview as Member"}
          </Button>
        </div>
      )}
      {/* Hero section */}
      <ContactHero />
      {/* Contact details section */}
      <div className="py-8">
        <div className="max-w-4xl mx-auto px-4 md:px-6">
          <ContactDetails 
            profileImage={profileImage}
            contactMethods={contactMethods}
            onMediaChange={handleProfileImageChange}
            onContactMethodChangeAction={handleContactMethodChange}
          />
        </div>
      </div>
      {/* Render dynamic sections */}
      {sections.map((section, idx) => {
        let renderedSection: React.ReactNode;
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
          case 'hero': {
            const heroSection = section as import('@/app/custom_pages/types/sections').HeroSection;
            renderedSection = (
              <HeroSection
                section={heroSection}
                isEditMode={isEditMode && !previewMode}
                idx={idx}
                onSectionChangeAction={s => {
                  const newSections = [...sections];
                  newSections[idx] = s as Section;
                  setSections(newSections);
                  setIsDirty(true);
                }}
                speakTextAction={() => {}}
                isDirty={isDirty}
              />
            );
            break;
          }
          case 'feature': {
            const featureSection = section as import('@/app/custom_pages/types/sections').FeatureSection;
            renderedSection = (
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
            );
            break;
          }
          case 'twoColumnText': {
            const twoColumnTextSection = section as import('@/app/custom_pages/types/sections').TwoColumnTextSection;
            renderedSection = (
              <section className="py-16 bg-white">
                <div className="container px-4 md:px-6">
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
              </section>
            );
            break;
          }
          case 'text': {
            const textSection = section as import('@/app/custom_pages/types/sections').TextSection;
            renderedSection = (
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
            );
            break;
          }
          // Add more cases for all supported section types as needed
          default:
            renderedSection = null;
            break;
        }
        return renderedSection;
      })}
      {/* Contact form section */}
      <div id="contact-form" className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <ContactForm 
            isAuthenticated={isAdmin}
            user={isAdmin ? { name: 'Admin', email: 'janscroanin@gmail.com' } : null}
          />
        </div>
      </div>
    </div>
  );
} 