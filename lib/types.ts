export * from '@/types/media';

// Base MediaItem type
export interface MediaItem {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  imageUrls: string[];
  videoUrl?: string;
  type: 'image' | 'video';
  isPremium: boolean;
  tags: string[];
  featured?: boolean;
  order?: number;
  createdAt: string;
  updatedAt: string;
  slug: string;
  galleryType: GalleryType;
  backgroundImage?: string;
  // Cloudinary specific fields
  cloudinary_public_id?: string;
  cloudinary_format?: string;
  cloudinary_metadata?: Record<string, any>;
  // Media dimensions
  width?: number;
  height?: number;
  // Media metadata
  format?: string;
  bytes?: number;
}

// Type for creating/updating media items
export interface MediaItemInput {
  title: string;
  description: string;
  coverImage: string | File;
  isPremium: boolean;
  type: 'image' | 'video';
  imageUrls?: string[];
  imageFiles?: File[]; // For new uploads
  videoUrl?: string;
  videoFile?: File; // For new video uploads
  backgroundImage?: string;
  tags?: string | string[];
  galleryType: 'public' | 'exclusive' | 'behind-scenes';
  featured?: boolean;
  order?: number;
}

// Type for form values
export type MediaFormValues = Omit<MediaItemInput, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & {
  tags?: string;
};

export type GalleryType = 'public' | 'exclusive' | 'behind-scenes' | 'gallery';
export type MediaType = 'image' | 'video';

export interface HeroSectionData {
  id: string;
  type: 'hero';
  title: string;
  description: string;
  backgroundMedia: string;
  mediaType: 'image' | 'video';
  width?: string;
  height?: string;
  enableSpeech?: boolean;
  enableTitleSpeech?: boolean;
  enableDescriptionSpeech?: boolean;
  paddingBottom?: number;
}

export type GalleryData = {
  images: MediaItem[];
  videos: MediaItem[];
  heroSection?: HeroSectionData;
};

export type SaveMediaData = Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  slug?: string;
  galleryType: GalleryType;
  type: MediaType;
  title: string;
  description: string;
  coverImage: string;
  imageUrls: string[];
  videoUrl?: string;
  isPremium: boolean;
  tags: string[];
  featured?: boolean;
  order?: number;
  backgroundImage?: string;
};

export type MediaUpdateData = Omit<SaveMediaData, 'galleryType'> & {
  id?: string;
  galleryType?: GalleryType;
};

export interface User {
  id: string
  username: string
  email: string
  membership_type: "admin" | "member"
}
