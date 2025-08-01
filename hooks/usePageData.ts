'use client';

import { useState, useEffect } from "react";
import supabase from '@/lib/supabase/client';
import { cloudinary } from '@/lib/cloudinary';
import { HeroSection } from '@/app/custom_pages/types/sections';
import type { Json } from '@/lib/supabase/database.types';
import type { HeroSectionData } from '@/lib/types';
import { toast } from 'sonner';

// Define the page section type
interface PageSection {
  hero_image: string;
  about_media: {
    url: string;
    type: 'image' | 'video';
  };
  free_content_image: string;
  premium_content_image: string;
  vip_content_image: string;
}

// Define the custom page type
interface CustomPage {
  id: string;
  slug: string;
};

// Types for homepage content
interface AboutMedia {
  url: string;
  type: 'image' | 'video';
}

interface HomeSections {
  heroImage: string;
  aboutMedia: AboutMedia;
  freeContentImage: string;
  premiumContentImage: string;
  vipContentImage: string;
  heroSection?: HeroSection;
}


export function usePageData() {
  console.log('usePageData: Hook initialized');
  
  const [heroImage, setHeroImage] = useState<string>("/placeholder.svg?height=1080&width=1920");
  const [aboutMedia, setAboutMedia] = useState<AboutMedia>({
    url: "/placeholder.svg?height=800&width=600",
    type: "image"
  });
  const [freeContentImage, setFreeContentImage] = useState<string>("/placeholder.svg?height=400&width=600");
  const [premiumContentImage, setPremiumContentImage] = useState<string>("/placeholder.svg?height=400&width=600");
  const [vipContentImage, setVipContentImage] = useState<string>("/placeholder.svg?height=400&width=600");
  const [heroSection, setHeroSection] = useState<HeroSection>({
    id: 'homepage-hero',
    type: 'hero',
    visible: true,
    title: "Hi, I'm admin",
    description: "27-year-old content creator based in London, sharing my journey and exclusive content with my community.",
    backgroundMedia: "/placeholder.svg?height=1080&width=1920",
    mediaType: 'image',
    width: '100%',
    height: '60vh',
    enableSpeech: false,
    enableTitleSpeech: false,
    enableDescriptionSpeech: false,
    paddingBottom: 4, // Default bottom padding
  });
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Enhanced debug logging for homepage content fetch
  useEffect(() => {
    console.log('usePageData: useEffect triggered');
    let cancelled = false;
    let timeoutId: NodeJS.Timeout;
    
    async function fetchHomePageContent() {
      console.log('usePageData: Starting to fetch homepage content...');
      setLoading(true);
      setError(null);
      
      // Set a timeout to prevent infinite loading
      timeoutId = setTimeout(() => {
        if (!cancelled) {
          console.log('usePageData: Timeout reached, setting loading to false');
          setLoading(false);
          setError('Loading timeout - using fallback content');
        }
      }, 10000); // 10 second timeout
      
      try {
        console.log('usePageData: Got Supabase client');
        
        // Get homepage components from root_page_components table
        console.log('usePageData: Fetching homepage components...');
        const { data: components, error: componentsError } = await supabase
          .from('root_page_components')
          .select('component_type, content')
          .eq('page_slug', 'home')
          .eq('is_active', true);
        
        console.log('usePageData: Components result:', { components, componentsError });
        
        if (componentsError) {
          console.error('usePageData: Components error:', componentsError);
          throw componentsError;
        }
        
        if (!components || components.length === 0) {
          console.log('usePageData: No components found, using default content');
          if (!cancelled) {
            clearTimeout(timeoutId);
            setLoading(false);
            setError('No homepage components found, using fallback content');
          }
          return;
        }
        
        // Process the components
        const sections: HomeSections = {
          heroImage: "/placeholder.svg?height=1080&width=1920",
          aboutMedia: {
            url: "/placeholder.svg?height=800&width=600",
            type: "image"
          },
          freeContentImage: "/placeholder.svg?height=400&width=600",
          premiumContentImage: "/placeholder.svg?height=400&width=600",
          vipContentImage: "/placeholder.svg?height=400&width=600"
        };
        
        let heroSectionData: HeroSection | null = null;
        
        // Process each component
        components.forEach(component => {
          console.log('usePageData: Processing component:', component);
          if (component.component_type === 'sections') {
            Object.assign(sections, component.content);
          } else if (component.component_type === 'hero') {
            heroSectionData = component.content as unknown as HeroSection;
          }
        });
        
        console.log('usePageData: Processed sections:', sections);
        console.log('usePageData: Hero section data:', heroSectionData);
        
        if (!cancelled) {
          // Clear the timeout since we got data
          clearTimeout(timeoutId);
          
          // Format Cloudinary URLs using the SDK
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

          setHeroImage(formatUrl(sections.heroImage || "/placeholder.svg?height=1080&width=1920", 'image'));
          setAboutMedia({
            url: formatUrl(sections.aboutMedia?.url || "/placeholder.svg?height=800&width=600", sections.aboutMedia?.type || "image"),
            type: sections.aboutMedia?.type || "image"
          });
          setFreeContentImage(formatUrl(sections.freeContentImage || "/placeholder.svg?height=400&width=600", 'image'));
          setPremiumContentImage(formatUrl(sections.premiumContentImage || "/placeholder.svg?height=400&width=600", 'image'));
          setVipContentImage(formatUrl(sections.vipContentImage || "/placeholder.svg?height=400&width=600", 'image'));
          
          // Load hero section configuration
          if (heroSectionData) {
            console.log('usePageData: Loading hero section from database:', heroSectionData);
            const heroData = heroSectionData as unknown as HeroSectionData;
            setHeroSection({
              id: heroData.id || 'hero-section',
              type: 'hero',
              visible: true,
              enableSpeech: heroData.enableSpeech || false,
              title: heroData.title,
              description: heroData.description,
              backgroundMedia: formatUrl(heroData.backgroundMedia || "/placeholder.svg?height=1080&width=1920", heroData.mediaType || 'image'),
              mediaType: heroData.mediaType || 'image',
              enableTitleSpeech: heroData.enableTitleSpeech || false,
              enableDescriptionSpeech: heroData.enableDescriptionSpeech || false,
              paddingBottom: heroData.paddingBottom || 4,
            });
          } else {
            console.log('usePageData: No hero section found in database, using default');
          }
          
          console.log('usePageData: State updated, setting loading to false');
        }
      } catch (err: any) {
        console.error('usePageData: Error in fetchHomePageContent:', err);
        if (!cancelled) {
          clearTimeout(timeoutId);
          setError(err?.message || 'Failed to load homepage content');
        }
      } finally {
        if (!cancelled) {
          clearTimeout(timeoutId);
          console.log('usePageData: Setting loading to false (finally block)');
          setLoading(false);
        }
      }
    }
    fetchHomePageContent();
    return () => {
      cancelled = true;
      clearTimeout(timeoutId);
      console.log('usePageData: Cleanup - effect cleanup called');
    };
  }, []);


  const handleHeroImageChange = (url: string, type: 'image' | 'video' = 'image') => {
    let finalUrl = url;
    if (!/^https?:\/\//.test(url) && !url.startsWith('/placeholder')) {
      finalUrl = cloudinary.url(url, {
        width: type === 'image' ? 1920 : 1280,
        height: type === 'image' ? 1080 : 720,
        crop: 'fill',
        resource_type: type,
        secure: true
      });
    }
    setHeroImage(finalUrl);
    setIsDirty(true);
  };

  const handleAboutMediaChange = (url: string, type: "image" | "video" = "image") => {
    let finalUrl = url;
    if (!/^https?:\/\//.test(url) && !url.startsWith('/placeholder')) {
      finalUrl = cloudinary.url(url, {
        width: type === 'image' ? 800 : 640,
        height: type === 'image' ? 600 : 480,
        crop: 'fill',
        resource_type: type,
        secure: true
      });
    }
    setAboutMedia({
      url: finalUrl,
      type
    });
    setIsDirty(true);
  };

  const handleFreeContentImageChange = (url: string, type: 'image' | 'video' = 'image') => {
    let finalUrl = url;
    if (!/^https?:\/\//.test(url) && !url.startsWith('/placeholder')) {
      finalUrl = cloudinary.url(url, {
        width: type === 'image' ? 600 : 640,
        height: type === 'image' ? 400 : 480,
        crop: 'fill',
        resource_type: type,
        secure: true
      });
    }
    setFreeContentImage(finalUrl);
    setIsDirty(true);
  };

  const handlePremiumContentImageChange = (url: string, type: 'image' | 'video' = 'image') => {
    let finalUrl = url;
    if (!/^https?:\/\//.test(url) && !url.startsWith('/placeholder')) {
      finalUrl = cloudinary.url(url, {
        width: type === 'image' ? 600 : 640,
        height: type === 'image' ? 400 : 480,
        crop: 'fill',
        resource_type: type,
        secure: true
      });
    }
    setPremiumContentImage(finalUrl);
    setIsDirty(true);
  };

  const handleVipContentImageChange = (url: string, type: 'image' | 'video' = 'image') => {
    let finalUrl = url;
    if (!/^https?:\/\//.test(url) && !url.startsWith('/placeholder')) {
      finalUrl = cloudinary.url(url, {
        width: type === 'image' ? 600 : 640,
        height: type === 'image' ? 400 : 480,
        crop: 'fill',
        resource_type: type,
        secure: true
      });
    }
    setVipContentImage(finalUrl);
    setIsDirty(true);
  };

  const handleHeroSectionChange = (section: HeroSection) => {
    setHeroSection(section);
    setIsDirty(true);
  };

  // Save changes to Supabase
  const saveChanges = async (data?: { sections: any }) => {
    console.log('usePageData: Saving changes...');
    setLoading(true);
    setError(null);
    try {
      const sectionsPayload = {
        heroImage,
        aboutMedia,
        freeContentImage,
        premiumContentImage,
        vipContentImage
      };
      
      const { error: sectionsError } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'home',
          component_type: 'sections',
          content: sectionsPayload as unknown as Json,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug, component_type'
        });

      if (sectionsError) {
        console.error('usePageData: Error saving sections:', sectionsError);
        throw sectionsError;
      }
      
      // Save the hero section configuration
      const { error: heroError } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'home',
          component_type: 'hero',
          content: heroSection as unknown as Json,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug, component_type'
        });
        
      if (heroError) {
        console.error('usePageData: Error saving hero section:', heroError);
        throw heroError;
      }

      setIsDirty(false);
      console.log('usePageData: Changes saved successfully');
      toast.success('Homepage content saved successfully!');
    } catch (err: any) {
      console.error('usePageData: Error in saveChanges:', err);
      setError(err?.message || 'Failed to save changes');
      toast.error(err?.message || 'Failed to save changes');
    } finally {
      console.log('usePageData: Save operation finished, setting loading to false');
      setLoading(false);
    }
  };

  return {
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
    error,
    isDirty
  };
}