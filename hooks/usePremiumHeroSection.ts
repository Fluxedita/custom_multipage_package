import { useState, useEffect } from 'react';
import supabase from '@/lib/supabaseClient';
import { useAuth } from '@/components/providers/AuthProvider';
import type { HeroSection } from '@/lib/types/page-sections';

export function usePremiumHeroSection(slug: string) {
  const [heroSection, setHeroSection] = useState<HeroSection | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { isAdmin } = useAuth();

  useEffect(() => {
    if (slug) {
      loadHeroSection();
    }
  }, [slug]);

  async function loadHeroSection() {
    setIsLoading(true);
    try {
      // Only admin users can access premium content for now
      if (!isAdmin) {
        throw new Error('Premium access required');
      }

      // Fetch hero section from root_page_components
      const { data, error: heroError } = await supabase
        .from('root_page_components')
        .select('*')
        .eq('component_type', 'hero')
        .eq('page_slug', slug)
        .eq('is_active', true)
        .single();

      if (heroError) throw heroError;

      if (data) {
        const heroData = data.content as any;
        setHeroSection({
          id: data.id,
          slug: slug,
          section_type: 'hero',
          access_level: 'premium',
          title: heroData.title,
          description: heroData.description,
          backgroundMedia: heroData.backgroundMedia,
          mediaType: heroData.mediaType || 'image'
        });
      }
    } catch (err) {
      console.error('Error loading hero section:', err);
      setError(err instanceof Error ? err.message : 'Failed to load hero section');
    } finally {
      setIsLoading(false);
    }
  }

  async function updateHeroSection(updates: Partial<HeroSection>) {
    if (!isAdmin) {
      setError('Only admin users can update hero sections');
      return false;
    }

    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: slug,
          component_type: 'hero',
          content: {
            title: updates.title,
            description: updates.description,
            backgroundMedia: updates.backgroundMedia,
            mediaType: updates.mediaType || 'image'
          },
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug,component_type'
        });

      if (error) throw error;

      await loadHeroSection(); // Reload to ensure we have latest data
      setIsDirty(false);
      return true;
    } catch (err) {
      console.error('Error updating hero section:', err);
      setError(err instanceof Error ? err.message : 'Failed to update hero section');
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  return {
    heroSection,
    isLoading,
    error,
    isDirty,
    isSaving,
    updateHeroSection,
    setIsDirty
  };
}
