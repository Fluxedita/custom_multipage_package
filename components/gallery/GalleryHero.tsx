"use client"

import { HeroSection } from "@/app/custom_pages/components/sections/HeroSection";
import { HeroSectionType, Section } from '@/types/sections';
import { useAuth } from "@/components/providers/AuthProvider";
import { useEditMode } from "@/hooks/EditModeContext";
import { useState, useEffect } from "react";
import supabase from '@/lib/supabase/client';
import { cloudinary } from '@/lib/cloudinary';
import { toast } from 'sonner';

interface GalleryHeroProps {
  defaultHeroSection: HeroSectionType;
}

export default function GalleryHero({ defaultHeroSection }: GalleryHeroProps) {
  const { isAdmin } = useAuth();
  const { isEditMode, toggleEditMode, setEditMode } = useEditMode();
  const [heroSection, setHeroSection] = useState<HeroSectionType>(defaultHeroSection);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Helper function to format Cloudinary URL
  const formatUrl = (url: string, type: 'image' | 'video' = 'image') => {
    if (!url || url.startsWith('/placeholder')) return url;
    if (/^https?:\/\//.test(url)) return url;
    return cloudinary.url(url, {
      width: type === 'image' ? 1920 : 1280,
      height: type === 'image' ? 1080 : 720,
      crop: 'fill',
      resource_type: type,
      secure: true
    });
  };

  const handleSectionChange = async (section: Section) => {
    // Convert Section to HeroSectionType
    const heroSection = section as HeroSectionType;
    setHeroSection(heroSection);
    setIsDirty(true);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Get the gallery page ID
      const { data: pageRow } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('slug', 'gallery')
        .single();

      if (!pageRow) throw new Error('Gallery page not found');

      // Get current page content
      const { data: contentRow } = await supabase
        .from('page_content')
        .select('*')
        .eq('page_id', pageRow.id)
        .single();

      // Update the hero section in the sections object
      const baseSections = (contentRow && typeof contentRow.content === 'object' && contentRow.content !== null)
        ? contentRow.content
        : {};
      const updatedSections = {
        ...baseSections,
        hero: {
          ...heroSection,
          backgroundMedia: heroSection.backgroundMedia
        }
      };

      // If content row exists, update it; otherwise, insert new
      const { error } = contentRow 
        ? await supabase
            .from('page_content')
            .update({
              content: updatedSections,
              updated_at: new Date().toISOString()
            })
            .eq('id', contentRow.id)
        : await supabase
            .from('page_content')
            .insert({
              page_slug: 'gallery',
              section_type: 'hero',
              sort_order: 0,
              is_published: true,
              content: updatedSections,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            });

      if (error) throw error;

      setIsDirty(false);
      setEditMode(false);
      toast.success('Hero section saved successfully');
    } catch (err) {
      console.error('Error saving hero section:', err);
      toast.error('Failed to save hero section');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      {/* Edit Mode Controls */}
      {isAdmin && (
        <div className="fixed bottom-8 right-8 z-[120] flex flex-col gap-3 items-end">
          <button
            className="inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 w-10 shadow-lg"
            onClick={toggleEditMode}
            aria-label="Toggle Edit Mode"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6"
            >
              <path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z" />
            </svg>
          </button>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative h-[40vh] min-h-[300px] max-h-[400px]">
        <HeroSection
          section={heroSection}
          isEditMode={isEditMode}
          idx={0}
          onSectionChangeAction={handleSectionChange}
          speakTextAction={() => {}}
          renderSectionControlsAction={() => null}
          onSave={handleSave}
          isDirty={isDirty}
          onExitEditMode={() => setEditMode(false)}
        />
      </section>
    </>
  );
} 