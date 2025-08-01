import type { MediaItem } from '../lib/types';
export type { MediaItem, GalleryData } from '../lib/types';

export interface MediaSettings {
  name: string;
  description: string;
  cloudinary_preset: string;
  allowed_formats: string[];
  transformation_settings: {
    quality: string;
    fetch_format: string;
    responsive: boolean;
    loading: string;
  };
}

export type GalleryType = 'public' | 'exclusive' | 'behind-scenes' | 'gallery';
export type MediaType = 'image' | 'video';

export type SaveMediaData = Omit<MediaItem, 'id' | 'created_at' | 'updated_at'> & {
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
};

export type MediaUpdateData = Omit<SaveMediaData, 'galleryType'> & {
  id?: string;
  galleryType?: GalleryType;
};
