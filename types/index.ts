export type { MediaItem, GalleryData } from '../lib/types';

export interface CloudinaryResource {
  public_id: string;
  secure_url: string;
  resource_type: 'image' | 'video';
  format: string;
  bytes: number;
  width: number;
  height: number;
  created_at: string;
  tags?: string[];
  context?: {
    alt?: string;
    caption?: string;
  };
  filename?: string;
}
