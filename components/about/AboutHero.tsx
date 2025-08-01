"use client"

import { HeroSection } from "@/app/custom_pages/components/sections/HeroSection";
import { HeroSectionType, Section } from '@/types/sections';
import { useAuth } from "@/components/providers/AuthProvider";
import { useEditMode } from "@/hooks/EditModeContext";
import { useState } from "react";
import supabase from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AboutHeroProps {
  defaultSection: HeroSectionType;
  onSectionChange?: (section: HeroSectionType) => void;
  previewMode?: boolean;
}

export default function AboutHero({ defaultSection, onSectionChange, previewMode }: AboutHeroProps) {
  const { isAdmin } = useAuth();
  const { isEditMode, toggleEditMode } = useEditMode();
  const [section, setSection] = useState<HeroSectionType>(defaultSection);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const handleSectionChange = async (newSection: Section) => {
    try {
      setSection(newSection as HeroSectionType);
      setIsDirty(true);
      setError(null);
      if (onSectionChange) {
        onSectionChange(newSection as HeroSectionType);
      }
    } catch (err) {
      console.error('Error updating hero section:', err);
      setError('Failed to update hero section');
      toast.error('Failed to update hero section');
    }
  };

  const handleSave = async () => {
    if (!isDirty) return;
    
    try {
      setIsSaving(true);
      setError(null);

      // Update the hero section in the root_page_components table
      const { error: saveError } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'about',
          component_type: 'hero',
          content: {
            ...section,
            backgroundMedia: section.backgroundMedia
          } as any,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,component_type'
        });

      if (saveError) throw saveError;

      setIsDirty(false);
      toggleEditMode();
      toast.success('Hero section saved successfully');
    } catch (err) {
      console.error('Error saving hero section:', err);
      setError(err instanceof Error ? err.message : 'Failed to save hero section');
      toast.error('Failed to save hero section');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <section className="relative h-[40vh] min-h-[300px] max-h-[400px]">
      {/* Error Message */}
      {error && (
        <div className="fixed top-4 right-4 z-[130] bg-red-500 text-white px-4 py-2 rounded-md shadow-lg">
          {error}
        </div>
      )}

      <HeroSection
        section={section}
        isEditMode={isEditMode && !previewMode}
        idx={0}
        onSectionChangeAction={handleSectionChange}
        speakTextAction={() => {}}
        renderSectionControlsAction={() => (isEditMode && !previewMode) ? (
          <div className="flex gap-2">
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/90 h-9 px-4 py-2"
              onClick={() => {
                setIsDirty(false);
                setError(null);
                toggleEditMode();
              }}
              disabled={isSaving}
            >
              Cancel
            </button>
            <button
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground shadow-sm hover:bg-primary/90 h-9 px-4 py-2"
              onClick={handleSave}
              disabled={!isDirty || isSaving}
            >
              {isSaving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        ) : null}
        onSave={handleSave}
        isDirty={isDirty}
        onExitEditMode={() => {
          toggleEditMode();
          setError(null);
        }}
      />
    </section>
  );
} 