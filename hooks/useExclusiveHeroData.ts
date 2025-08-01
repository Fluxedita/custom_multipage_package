import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import { HeroSectionType } from '@/types/sections';
import { Database } from '@/types/supabase';

type ContentRow = Database['public']['Tables']['page_content']['Row'];

const DEFAULT_HERO: HeroSectionType = {
  id: 'exclusive-hero',
  type: 'hero',
  title: 'Exclusive Gallery',
  description: 'Premium content and exclusive photoshoots',
  backgroundMedia: '/placeholder.svg?height=1080&width=1920',
  mediaType: 'image',
  width: '100%',
  height: '40vh',
  enableSpeech: false,
  enableTitleSpeech: false,
  enableDescriptionSpeech: false,
};

export function useExclusiveHeroData() {
  const [heroSection, setHeroSection] = useState<HeroSectionType>(DEFAULT_HERO);
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchExclusiveHero() {
      setLoading(true);
      setError(null);
      try {
        // 1. Get the exclusive page row from custom_pages
        const { data: pageRow, error: pageError } = await supabase
          .from('custom_pages')
          .select('id, slug')
          .eq('slug', 'exclusive')
          .single();
        if (pageError || !pageRow) throw pageError || new Error('Exclusive page not found');
        const typedPageRow = pageRow as Database['public']['Tables']['custom_pages']['Row'];
        // 2. Get the page_content row for exclusive
        const { data: contentRow, error: contentError } = await supabase
          .from('page_content')
          .select('sections')
          .eq('page_id', typedPageRow.id)
          .single();
        if (contentError || !contentRow) throw contentError || new Error('Exclusive page content not found');
        const typedContentRow = contentRow as ContentRow;
        // Find hero section
        const hero = (typedContentRow.sections as { hero?: any })?.hero;
        if (hero && !cancelled) {
          const typedHero = ensureHeroSection(hero);
          if (typedHero) {
            setHeroSection(typedHero);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load exclusive hero section');
      } finally {
        setLoading(false);
      }
    }
    fetchExclusiveHero();
    return () => { cancelled = true; };
  }, []);

  // Helper to ensure section is complete
  function ensureHeroSection(section: Partial<HeroSectionType>): HeroSectionType {
    return {
      id: section.id || 'exclusive-hero',
      type: section.type || 'hero',
      title: section.title || 'Exclusive Gallery',
      description: section.description || 'Premium content and exclusive photoshoots',
      backgroundMedia: section.backgroundMedia || '/placeholder.svg?height=1080&width=1920',
      mediaType: section.mediaType || 'image',
      width: section.width || '100%',
      height: section.height || '40vh',
      enableSpeech: section.enableSpeech ?? false,
      enableTitleSpeech: section.enableTitleSpeech ?? false,
      enableDescriptionSpeech: section.enableDescriptionSpeech ?? false,
    };
  }

  return {
    heroSection,
    setHeroSection,
    isDirty,
    setIsDirty,
    loading,
    error,
  };
} 