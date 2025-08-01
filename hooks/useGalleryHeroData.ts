// useGalleryHeroData.ts
'use client';

import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import supabase from '@/lib/supabaseClient';
import { HeroSectionType } from '@/types/sections';
import { Database } from '@/lib/supabase/database.types';

type PageRow = Database['public']['Tables']['custom_pages']['Row'];

type ContentRow = Database['public']['Tables']['page_content']['Row'];



type HeroSection = Required<Pick<HeroSectionType, 'id' | 'type'>> & Partial<Omit<HeroSectionType, 'id' | 'type'>>; // Make id and type required, other fields optional

type ValidHeroType = 'hero' | 'new_hero';

// Helper function to find hero section
const findHeroSection = (sections: any[], type: ValidHeroType): HeroSectionType | undefined => {
  return sections.find((s: any) => s.type === type);
}

// Helper function to ensure proper typing
const ensureHeroSection = (section: HeroSectionType | undefined): HeroSection | undefined => {
  if (!section) return undefined;
  return {
    ...section,
    id: section.id || 'gallery-hero',
    type: section.type as ValidHeroType
  };
}

const DEFAULT_HERO: HeroSection = {
  id: 'gallery-hero',
  type: 'hero',
  title: 'Public Gallery',
  description: 'Explore our collection of public photoshoots and videos',
  backgroundMedia: '/images/gallery-hero.jpg',
  mediaType: 'image',
  width: '100%',
  height: '60vh',
  enableSpeech: false,
  enableTitleSpeech: false,
  enableDescriptionSpeech: false,
};

export function useGalleryHeroData() {
  const [heroSection, setHeroSection] = useState<HeroSection>(DEFAULT_HERO as HeroSection);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchGalleryHero() {
      setLoading(true);
      setError(null);
      try {
        // Get gallery page components
        const { data: components, error: componentsError } = await supabase
          .from('root_page_components')
          .select('component_type, content')
          .eq('page_slug', 'gallery')
          .eq('is_active', true);

        if (componentsError) throw new Error('Failed to fetch gallery page data');

        if (components && components.length > 0) {
          // Find the hero component
          const heroComponent = components.find(c => c.component_type === 'hero');
          if (heroComponent?.content && !cancelled) {
            const hero = heroComponent.content as any;
            const typedHero = ensureHeroSection(hero);
            if (typedHero) {
              setHeroSection(typedHero);
            }
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load gallery hero section');
      } finally {
        setLoading(false);
      }
    }
    fetchGalleryHero();
    return () => { cancelled = true; };
  }, []);

  // Helper to ensure section is complete
  function normalizeHeroSection(section: Partial<HeroSectionType>): HeroSection {
    return {
      id: section.id || 'gallery-hero',
      type: section.type || 'hero',
      title: section.title || 'Public Gallery',
      description: section.description || 'Explore our collection of public photoshoots and videos',
      backgroundMedia: section.backgroundMedia || '/images/gallery-hero.jpg',
      mediaType: section.mediaType || 'image',
      width: section.width || '100%',
      height: section.height || '60vh',
      enableSpeech: section.enableSpeech ?? false,
      enableTitleSpeech: section.enableTitleSpeech ?? false,
      enableDescriptionSpeech: section.enableDescriptionSpeech ?? false,
    };
  }

  const saveHeroSection = async (section: Partial<HeroSectionType>) => {
    setLoading(true);
    setError(null);
    try {
      const normalized = normalizeHeroSection(section);
      
      // Save hero section to root_page_components
      const { error: upsertError } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'gallery',
          component_type: 'hero',
          content: normalized as any,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,component_type'
        });
      
      if (upsertError) throw upsertError;
      
      setHeroSection(normalized as HeroSection);
      setIsDirty(false);
      toast.success('Gallery hero section saved!');
      console.log('Gallery hero section saved:', normalized);
    } catch (err: any) {
      setError(err.message || 'Failed to save gallery hero section');
      toast.error('Failed to save gallery hero section: ' + (err.message || err));
      console.error('Failed to save gallery hero section:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    heroSection,
    setHeroSection: (section: HeroSection) => { setHeroSection(section); setIsDirty(true); },
    isDirty,
    saveHeroSection,
    loading,
    error,
  };
}
