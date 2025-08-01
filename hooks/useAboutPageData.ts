'use client';

import { useState, useEffect } from "react";
import supabase from '@/lib/supabaseClient';
import { cloudinary } from '@/lib/cloudinary';
import { HeroSectionType } from '@/types/sections';

// Types for about page content
interface AboutProfile {
  image: string;
  imageType: 'image' | 'video';
  title: string;
  description: string;
  socialLinks: {
    instagram: string;
    twitter: string;
    email: string;
  };
}

interface AboutStoryItem {
  image: string;
  imageType: 'image' | 'video';
  title: string;
  description: string;
}

interface AboutStory {
  title: string;
  description: string;
  items: AboutStoryItem[];
}

interface AboutPageContent {
  hero?: HeroSectionType;
  profile?: AboutProfile;
  story?: AboutStory;
}

const defaultHeroSection: HeroSectionType = {
  id: 'about-hero',
  type: 'hero',
  title: "About Me",
  description: "Get to know the person behind the content",
  backgroundMedia: "/placeholder.svg?height=1080&width=1920",
  mediaType: 'image',
  width: '100%',
  height: '60vh',
  enableSpeech: true,
  enableTitleSpeech: true,
  enableDescriptionSpeech: true,
};

const defaultProfile: AboutProfile = {
  image: "/placeholder.svg?height=1000&width=800",
  imageType: 'image',
  title: "This is the Default Abour Page",
  description: "This is the default about page, you can edit this page by clicking the edit buttons available in the page, when logged in as the admin user.",
  socialLinks: {
    instagram: "https://instagram.com",
    twitter: "https://twitter.com",
    email: "contact@example.com"
  }
};

const defaultStory: AboutStory = {
  title: "This is the Default About Page",
  description: "This is the default about page, you can edit this page by clicking the edit buttons available in the page, when logged in as the admin user.",
  items: [
    {
      image: "/placeholder.svg?height=600&width=800",
      imageType: 'image',
      title: "This is the Default About Page",
      description: "This is the default about page, you can edit this page by clicking the edit buttons available in the page, when logged in as the admin user."
    },
    {
      image: "/placeholder.svg?height=600&width=800",
      imageType: 'image',
      title: "This is the Default About Page",
      description: "This is the default about page, you can edit this page by clicking the edit buttons available in the page, when logged in as the admin user."
    },
    {
      image: "/placeholder.svg?height=600&width=800",
      imageType: 'image',
      title: "Today",
      description: "Creating content full-time and sharing my passion with the world."
    }
  ]
};

export function useAboutPageData() {
  const [pageContent, setPageContent] = useState<AboutPageContent>({
    hero: defaultHeroSection,
    profile: defaultProfile,
    story: defaultStory
  });
  const [isDirty, setIsDirty] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Format Cloudinary URLs
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

  // Fetch about page content from Supabase on mount
  useEffect(() => {
    let cancelled = false;
    async function fetchAboutPageContent() {
      setLoading(true);
      setError(null);
      try {
        // Get about page components
        const { data: components, error: componentsError } = await supabase
          .from('root_page_components')
          .select('component_type, content')
          .eq('page_slug', 'about')
          .eq('is_active', true);

        if (componentsError) throw new Error('Failed to fetch about page data');

        if (components && components.length > 0) {
          // Find the about content component
          const aboutContentComponent = components.find(c => c.component_type === 'about_content');
          if (aboutContentComponent?.content && !cancelled) {
            const sections: AboutPageContent = aboutContentComponent.content as any;
            
            // Format all media URLs
            if (sections.hero?.backgroundMedia) {
              sections.hero.backgroundMedia = formatUrl(sections.hero.backgroundMedia, sections.hero.mediaType);
            }
            if (sections.profile?.image) {
              sections.profile.image = formatUrl(sections.profile.image, sections.profile.imageType);
            }
            if (sections.story?.items) {
              sections.story.items = sections.story.items.map(item => ({
                ...item,
                image: formatUrl(item.image, item.imageType)
              }));
            }
            setPageContent(sections);
          }
        }
      } catch (err: any) {
        setError(err?.message || 'Failed to load about page content');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchAboutPageContent();
    return () => {
      cancelled = true;
    };
  }, []);

  const handleHeroChange = (section: HeroSectionType) => {
    if (section.backgroundMedia) {
      section.backgroundMedia = formatUrl(section.backgroundMedia, section.mediaType);
    }
    setPageContent(prev => ({
      ...prev,
      hero: section
    }));
    setIsDirty(true);
  };

  const handleProfileChange = (profile: AboutProfile) => {
    if (profile.image) {
      profile.image = formatUrl(profile.image, profile.imageType);
    }
    setPageContent(prev => ({
      ...prev,
      profile
    }));
    setIsDirty(true);
  };

  const handleStoryChange = (story: AboutStory) => {
    if (story.items) {
      story.items = story.items.map(item => ({
        ...item,
        image: formatUrl(item.image, item.imageType)
      }));
    }
    setPageContent(prev => ({
      ...prev,
      story
    }));
    setIsDirty(true);
  };

  const saveChanges = async () => {
    setIsDirty(false);
    setLoading(true);
    setError(null);
    try {
      // Save about content to root_page_components
      const { error } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'about',
          component_type: 'about_content',
          content: pageContent as any,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,component_type'
        });

      if (error) {
        console.error('Supabase error:', error);
        throw error;
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save about page content');
    } finally {
      setLoading(false);
    }
  };

  return {
    pageContent,
    handleHeroChange,
    handleProfileChange,
    handleStoryChange,
    saveChanges,
    isDirty,
    loading,
    error,
  };
} 