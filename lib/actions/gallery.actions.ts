'use server';

import { getGalleryData } from '@/app/actions/gallery';
import type { MediaItem } from '@/lib/types';

export async function getGalleryMedia(type: 'public' | 'exclusive' | 'behind-scenes' = 'public') {
  try {
    const data = await getGalleryData(type);
    return {
      images: data.images || [],
      videos: data.videos || [],
    };
  } catch (error) {
    console.error('Error fetching gallery media:', error);
    return {
      images: [],
      videos: [],
    };
  }
}

export async function getImageSet(id: string) {
  try {
    const galleryTypes = ['public', 'exclusive', 'behind-scenes'] as const;
    
    for (const type of galleryTypes) {
      const { images } = await getGalleryMedia(type);
      const found = images.find((img: MediaItem) => img.id === id);
      if (found) {
        return found;
      }
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching image set:', error);
    return null;
  }
}
