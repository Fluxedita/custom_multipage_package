import { useState, useEffect } from 'react';
import { HeroSectionType } from '@/types/sections';
import supabase from '@/lib/supabaseClient';
import { cloudinary } from '@/lib/cloudinary';

interface UsePageHeroSectionReturn {
  heroSection: HeroSectionType | null;
  isLoading: boolean;
  error: string | null;
  isDirty: boolean;
  isSaving: boolean;
  updateHeroSection: (updates: Partial<HeroSectionType>) => Promise<void>;
  saveChanges: () => Promise<void>;
}

export function usePageHeroSection(slug: string): UsePageHeroSectionReturn {
  const [heroSection, setHeroSection] = useState<HeroSectionType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [pendingUpdates, setPendingUpdates] = useState<Partial<HeroSectionType> | null>(null);

  // Helper function to format Cloudinary URL
  const formatUrl = (url: string, type: 'image' | 'video' = 'image') => {
    if (!url) return null;
    if (url.startsWith('/placeholder')) return url;
    // If it's already a full URL, return it as is
    if (/^https?:\/\//.test(url)) return url;
    // Only format if it's a Cloudinary public_id
    return cloudinary.url(url, {
      width: type === 'image' ? 1920 : 1280,
      height: type === 'image' ? 1080 : 720,
      crop: 'fill',
      resource_type: type,
      secure: true
    });
  };

  useEffect(() => {
    loadHeroSection();
  }, [slug]);

  const loadHeroSection = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the hero section directly from page_sections
      const { data: section, error: sectionError } = await supabase
        .from('page_sections')
        .select('*')
        .eq('page_id', slug)
        .eq('section_type', 'hero')
        .single();

      if (sectionError) {
        throw new Error(sectionError.message);
      }

      // Transform the data to match HeroSectionType
      const heroData: HeroSectionType | null = section ? {
        id: section.id || 'hero',
        type: 'hero' as const,
        title: section.title,
        description: section.description,
        backgroundMedia: section.background_media ? formatUrl(section.background_media, section.media_type || 'image') : null,
        mediaType: section.media_type || 'image',
        width: section.width || '100%',
        height: section.height || '25vh',
        enableSpeech: false,
        enableTitleSpeech: false,
        enableDescriptionSpeech: false
      } : null;

      setHeroSection(heroData);
    } catch (err: any) {
      setError(err?.message || 'Failed to load hero section');
    } finally {
      setIsLoading(false);
    }
  };

  const updateHeroSection = async (updates: Partial<HeroSectionType>) => {
    setPendingUpdates(updates);
    setHeroSection(prev => prev ? { ...prev, ...updates } : null);
    setIsDirty(true);
  };

  const saveChanges = async () => {
    if (!pendingUpdates) return;

    try {
      setIsSaving(true);
      setError(null);

      // Get the raw public_id from the backgroundMedia URL if it's a Cloudinary URL
      let backgroundMedia = pendingUpdates.backgroundMedia;
      if (backgroundMedia && backgroundMedia.includes('cloudinary.com')) {
        // Extract the public_id from the Cloudinary URL
        const urlParts = backgroundMedia.split('/');
        const publicId = urlParts.slice(urlParts.indexOf('upload') + 1).join('/').split('.')[0];
        backgroundMedia = publicId;
      }

      // Update the hero section directly in page_sections
      const { data: updatedSection, error: updateError } = await supabase
        .from('page_sections')
        .upsert({
          page_id: slug,
          section_type: 'hero',
          title: pendingUpdates.title,
          description: pendingUpdates.description,
          background_media: backgroundMedia,
          media_type: pendingUpdates.mediaType || 'image',
          width: pendingUpdates.width || '100%',
          height: pendingUpdates.height || '25vh',
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_id,section_type'
        })
        .select()
        .single();

      if (updateError) {
        throw new Error(updateError.message);
      }

      // Transform the response data to match HeroSectionType
      const transformedHero: HeroSectionType | null = updatedSection ? {
        id: updatedSection.id || 'hero',
        type: 'hero' as const,
        title: updatedSection.title,
        description: updatedSection.description,
        backgroundMedia: updatedSection.background_media ? formatUrl(updatedSection.background_media, updatedSection.media_type || 'image') : null,
        mediaType: updatedSection.media_type || 'image',
        width: updatedSection.width || '100%',
        height: updatedSection.height || '25vh',
        enableSpeech: false,
        enableTitleSpeech: false,
        enableDescriptionSpeech: false
      } : null;

      setHeroSection(transformedHero);
      setPendingUpdates(null);
      setIsDirty(false);
    } catch (err: any) {
      setError(err?.message || 'Failed to save hero section');
    } finally {
      setIsSaving(false);
    }
  };

  return {
    heroSection,
    isLoading,
    error,
    isDirty,
    isSaving,
    updateHeroSection,
    saveChanges
  };
}
