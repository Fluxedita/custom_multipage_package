// Types for page sections and access levels
export type PageAccessLevel = 'public' | 'premium' | 'admin';

export interface PageSection {
  id: string;
  slug: string;
  section_type: string;
  access_level: PageAccessLevel;
  title?: string;
  description?: string;
  backgroundMedia?: string;
  mediaType: 'image' | 'video';
  enableSpeech?: boolean;
  enableTitleSpeech?: boolean;
  enableDescriptionSpeech?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  additional_data?: Record<string, any>;
}

export interface PageSectionUpdate {
  title?: string;
  description?: string;
  backgroundMedia?: string;
  mediaType?: 'image' | 'video';
  enableSpeech?: boolean;
  enableTitleSpeech?: boolean;
  enableDescriptionSpeech?: boolean;
  additional_data?: Record<string, any>;
}

// Helper type for hero sections specifically
export interface HeroSection extends PageSection {
  section_type: 'hero';
  mediaType: 'image' | 'video';
  enableSpeech?: boolean;
  enableTitleSpeech?: boolean;
  enableDescriptionSpeech?: boolean;
  width?: string;
  height?: string;
}
