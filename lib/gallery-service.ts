import supabase from '@/lib/supabase/client';
import type { MediaItem, GalleryData } from '@/lib/types';

// Default mock data for the gallery
const defaultGalleryData: GalleryData = {
  images: [
    {
      id: "img-1",
      slug: "summer-photoshoot",
      title: "Summer Photoshoot",
      description: "Beach vibes and summer feels in this casual outdoor photoshoot.",
      coverImage: "/placeholder.svg?height=400&width=600",
      isPremium: false,
      type: 'image' as const,
      createdAt: "2023-06-15T10:00:00Z",
      updatedAt: "2023-06-15T10:00:00Z",
      tags: ["summer", "beach", "fashion"],
      imageUrls: [
        "/placeholder.svg?height=800&width=1200",
        "/placeholder.svg?height=800&width=1200",
        "/placeholder.svg?height=800&width=1200",
        "/placeholder.svg?height=800&width=1200",
        "/placeholder.svg?height=800&width=1200",
      ],
      galleryType: "public"
    },
    {
      id: "img-2",
      slug: "urban-exploration",
      title: "Urban Exploration",
      description: "Exploring the city streets and urban landscapes in this edgy photoshoot.",
      coverImage: "/placeholder.svg?height=400&width=600",
      isPremium: false,
      type: 'image' as const,
      createdAt: "2023-07-22T14:30:00Z",
      updatedAt: "2023-07-22T14:30:00Z",
      tags: ["urban", "street", "fashion"],
      imageUrls: [
        "/placeholder.svg?height=800&width=1200",
        "/placeholder.svg?height=800&width=1200",
        "/placeholder.svg?height=800&width=1200",
      ],
      galleryType: "public"
    },
  ],
  videos: [
    {
      id: "vid-1",
      slug: "behind-the-scenes-video-1",
      title: "Behind the Scenes: Video 1",
      description: "A look at the making of our first video",
      coverImage: "/placeholder.svg?height=1080&width=1920",
      isPremium: false,
      type: "video",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      tags: ["behind-the-scenes", "video"],
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      backgroundImage: "/placeholder.svg?height=1080&width=1920",
      imageUrls: [],
      galleryType: "public"
    },
    {
      id: "vid-2",
      slug: "behind-the-scenes-video-2",
      title: "Behind the Scenes: Video 2",
      description: "A look at the making of our second video",
      coverImage: "/placeholder.svg?height=1080&width=1920",
      isPremium: false,
      type: "video",
      createdAt: "2024-01-01T00:00:00Z",
      updatedAt: "2024-01-01T00:00:00Z",
      tags: ["behind-the-scenes", "video"],
      videoUrl: "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4",
      imageUrls: [],
      galleryType: "public"
    },
  ],
};

// Helper function to get base URL
function getBaseUrl() {
  if (typeof window !== 'undefined') {
    return window.location.origin;
  }
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

// New type for gallery set with media
export interface GallerySet {
  id: string;
  title: string;
  description?: string | null;
  slug: string;
  media: MediaItem[];
  is_published?: boolean;
  created_at?: string;
  updated_at?: string;
  created_by?: string | null;
  category?: string | null;
  tags?: string[] | null;
  featured_image?: string | null;
  sort_order?: number | null;
}

// Refactored getGalleryData: fetch sets/pages from gallery_data, and media from media_items
export async function getGalleryData(): Promise<GallerySet[]> {
  try {
    // Fetch all gallery sets/pages
    const { data: sets, error: setsError } = await supabase
      .from('gallery_data')
      .select('*')
      .order('sort_order', { ascending: true });
    if (setsError) throw setsError;
    if (!sets) return [];

    // Gather all unique media item IDs
    const allMediaIds = sets
      .flatMap(set => set.media_items || [])
      .filter((id, idx, arr) => id && arr.indexOf(id) === idx);
    if (allMediaIds.length === 0) {
      // No media items at all
      return sets.map(set => ({ ...set, media: [] }));
    }

    // Fetch all media items in one query
    const { data: mediaItems, error: mediaError } = await supabase
      .from('media_items')
      .select('*')
      .in('id', allMediaIds);
    if (mediaError) throw mediaError;
    const mediaMap = new Map(mediaItems.map(item => [item.id, {
      id: item.id,
      title: item.title,
      description: item.description,
      coverImage: item.cover_image,
      imageUrls: item.image_urls || [],
      videoUrl: item.video_url,
      type: item.type,
      isPremium: item.is_premium,
      tags: item.tags || [],
      featured: item.featured,
      order: item.order,
      slug: item.slug,
      galleryType: item.gallery_type,
      backgroundImage: item.background_image,
      cloudinary_public_id: item.cloudinary_public_id,
      cloudinary_format: item.cloudinary_format,
      cloudinary_metadata: item.cloudinary_metadata,
      width: item.width,
      height: item.height,
      format: item.format,
      bytes: item.bytes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }]));

    // Build the gallery sets with their media
    return sets.map(set => ({
      id: set.id,
      title: set.title,
      description: set.description,
      slug: set.slug,
      is_published: set.is_published,
      created_at: set.created_at,
      updated_at: set.updated_at,
      created_by: set.created_by,
      category: set.category,
      tags: set.tags,
      featured_image: set.featured_image,
      sort_order: set.sort_order,
      media: (set.media_items || []).map((id: string) => mediaMap.get(id)).filter(Boolean)
    }));
  } catch (error) {
    console.error('Error fetching gallery sets/pages:', error);
    return [];
  }
}

// Get a single media item by ID
export async function getMediaItemById(id: string): Promise<MediaItem | null> {
  try {
    const { data: item, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !item) {
      return null;
    }

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      coverImage: item.cover_image,
      imageUrls: item.image_urls || [],
      videoUrl: item.video_url,
      type: item.type,
      isPremium: item.is_premium,
      tags: item.tags || [],
      featured: item.featured,
      order: item.order,
      slug: item.slug,
      galleryType: item.gallery_type,
      backgroundImage: item.background_image,
      cloudinary_public_id: item.cloudinary_public_id,
      cloudinary_format: item.cloudinary_format,
      cloudinary_metadata: item.cloudinary_metadata,
      width: item.width,
      height: item.height,
      format: item.format,
      bytes: item.bytes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  } catch (error) {
    console.error('Error fetching media item:', error);
    return null;
  }
}

// Get a single media item by slug
export async function getMediaItemBySlug(slug: string): Promise<MediaItem | null> {
  try {
    const { data: item, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('slug', slug)
      .single();

    if (error || !item) {
      return null;
    }

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      coverImage: item.cover_image,
      imageUrls: item.image_urls || [],
      videoUrl: item.video_url,
      type: item.type,
      isPremium: item.is_premium,
      tags: item.tags || [],
      featured: item.featured,
      order: item.order,
      slug: item.slug,
      galleryType: item.gallery_type,
      backgroundImage: item.background_image,
      cloudinary_public_id: item.cloudinary_public_id,
      cloudinary_format: item.cloudinary_format,
      cloudinary_metadata: item.cloudinary_metadata,
      width: item.width,
      height: item.height,
      format: item.format,
      bytes: item.bytes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  } catch (error) {
    console.error('Error fetching media item:', error);
    return null;
  }
}

export async function createMedia(media: Omit<MediaItem, "id" | "createdAt" | "updatedAt">): Promise<MediaItem> {
  const response = await fetch(`${getBaseUrl()}/api/gallery`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(media),
  });

  if (!response.ok) {
    throw new Error('Failed to create media');
  }

  return response.json();
}

export async function updateMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
  const response = await fetch(`${getBaseUrl()}/api/gallery/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(updates),
  });

  if (!response.ok) {
    throw new Error('Failed to update media');
  }

  return response.json();
}

export async function deleteMedia(id: string): Promise<void> {
  const response = await fetch(`${getBaseUrl()}/api/gallery/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('Failed to delete media');
  }
}

// Get an image set by slug
export async function getImageSetBySlug(slug: string): Promise<MediaItem | null> {
  try {
    const { data: item, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('slug', slug)
      .eq('type', 'image')
      .single();

    if (error || !item) {
      return null;
    }

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      coverImage: item.cover_image,
      imageUrls: item.image_urls || [],
      videoUrl: item.video_url,
      type: item.type,
      isPremium: item.is_premium,
      tags: item.tags || [],
      featured: item.featured,
      order: item.order,
      slug: item.slug,
      galleryType: item.gallery_type,
      backgroundImage: item.background_image,
      cloudinary_public_id: item.cloudinary_public_id,
      cloudinary_format: item.cloudinary_format,
      cloudinary_metadata: item.cloudinary_metadata,
      width: item.width,
      height: item.height,
      format: item.format,
      bytes: item.bytes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  } catch (error) {
    console.error('Error fetching image set:', error);
    return null;
  }
}

// Get a video by slug
export async function getVideoBySlug(slug: string): Promise<MediaItem | null> {
  try {
    const { data: item, error } = await supabase
      .from('media_items')
      .select('*')
      .eq('slug', slug)
      .eq('type', 'video')
      .single();

    if (error || !item) {
      return null;
    }

    return {
      id: item.id,
      title: item.title,
      description: item.description,
      coverImage: item.cover_image,
      imageUrls: item.image_urls || [],
      videoUrl: item.video_url,
      type: item.type,
      isPremium: item.is_premium,
      tags: item.tags || [],
      featured: item.featured,
      order: item.order,
      slug: item.slug,
      galleryType: item.gallery_type,
      backgroundImage: item.background_image,
      cloudinary_public_id: item.cloudinary_public_id,
      cloudinary_format: item.cloudinary_format,
      cloudinary_metadata: item.cloudinary_metadata,
      width: item.width,
      height: item.height,
      format: item.format,
      bytes: item.bytes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    };
  } catch (error) {
    console.error('Error fetching video:', error);
    return null;
  }
}
