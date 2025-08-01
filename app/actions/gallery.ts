'use server'

import { promises as fs } from 'fs'
import path from 'path'
import { revalidatePath } from 'next/cache'
import type { GalleryData, MediaItem, HeroSectionData } from "@/lib/types"
import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

// Load gallery data from Supabase
async function loadGalleryData(galleryType: 'public' | 'exclusive' | 'behind-scenes' = 'public'): Promise<GalleryData> {
  const supabase = getSupabaseServerClient();
  const { data: mediaItems, error } = await supabase
    .from('media_items')
    .select('*')
    .eq('gallery_type', galleryType);

  if (error) {
    console.error(`Error loading ${galleryType} media:`, error);
    throw new Error(`Failed to load ${galleryType} media.`);
  }

  const images = mediaItems.filter(item => item.type === 'image');
  const videos = mediaItems.filter(item => item.type === 'video');
  
  const { data: heroSection, error: heroError } = await supabase
    .from('root_page_components')
    .select('*')
    .eq('page_slug', 'gallery')
    .eq('component_type', 'hero')
    .single();
    
  if (heroError && heroError.code !== 'PGRST116') { // Ignore "no rows returned"
    console.error(`Error loading ${galleryType} hero:`, heroError);
  }

  return {
    images: images.map(item => ({ ...item, isPremium: item.is_premium, coverImage: item.cover_image, videoUrl: item.video_url, imageUrls: item.image_urls, galleryType: item.gallery_type, createdAt: item.created_at, updatedAt: item.updated_at })),
    videos: videos.map(item => ({ ...item, isPremium: item.is_premium, coverImage: item.cover_image, videoUrl: item.video_url, imageUrls: item.image_urls, galleryType: item.gallery_type, createdAt: item.created_at, updatedAt: item.updated_at })),
    heroSection: heroSection ? {
      id: heroSection.id,
      type: 'hero',
      title: heroSection.title,
      description: heroSection.description,
      backgroundMedia: heroSection.background_media,
      mediaType: heroSection.media_type,
      width: heroSection.width,
      height: heroSection.height,
    } : undefined
  };
}

// Save gallery data to Supabase
async function saveGalleryData(data: GalleryData & { heroSection?: any }): Promise<void> {
  try {
    const supabase = getSupabaseAdminClient();
    // Save images
    const { error: imagesError } = await supabase
      .from('media_items')
      .upsert(
        data.images.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description ?? null,
          url: item.coverImage || (item.imageUrls && item.imageUrls[0]) || '',
          type: 'image',
          size: null,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
          created_by: null,
          tags: item.tags ?? null,
          category: null,
          is_public: true,
          metadata: null,
        }))
      )
    if (imagesError) throw imagesError
    // Save videos
    const { error: videosError } = await supabase
      .from('media_items')
      .upsert(
        data.videos.map(item => ({
          id: item.id,
          title: item.title,
          description: item.description ?? null,
          url: item.videoUrl || '',
          type: 'video',
          size: null,
          created_at: item.createdAt,
          updated_at: item.updatedAt,
          created_by: null,
          tags: item.tags ?? null,
          category: null,
          is_public: true,
          metadata: null,
        }))
      )
    if (videosError) throw videosError
    // Save hero section if provided
    if (data.heroSection) {
      const { error: heroError } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'gallery',
          component_type: 'hero',
          content: { ...data.heroSection },
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug,component_type'
        })
      if (heroError) throw heroError
    }
  } catch (error) {
    console.error('Error saving gallery data to Supabase:', error)
    throw new Error('Failed to save gallery data')
  }
}

export async function getGalleryData(galleryType: 'public' | 'exclusive' | 'behind-scenes' = 'public'): Promise<GalleryData> {
  return loadGalleryData(galleryType);
}

export async function getFeaturedGalleries(): Promise<MediaItem[]> {
  const data = await loadGalleryData()
  return data.images.filter(item => !item.isPremium)
}

export async function getPremiumGalleries(): Promise<MediaItem[]> {
  const data = await loadGalleryData()
  return data.images.filter(item => item.isPremium)
}

export async function getRecentVideos(): Promise<MediaItem[]> {
  const data = await loadGalleryData()
  return data.videos
}

export async function addGalleryItem(item: MediaItem): Promise<void> {
  const data = await loadGalleryData()
  const type = item.type === 'image' ? 'images' : 'videos'
  data[type].push(item)
  await saveGalleryData(data)
}

export async function updateGalleryItem(id: string, updates: Partial<MediaItem>): Promise<void> {
  const data = await loadGalleryData()
  const type = updates.type === 'image' ? 'images' : 'videos'
  const index = data[type].findIndex(item => item.id === id)
  if (index !== -1) {
    data[type][index] = { ...data[type][index], ...updates }
    await saveGalleryData(data)
  }
}

export async function deleteGalleryItem(id: string, type: 'image' | 'video'): Promise<void> {
  const data = await loadGalleryData()
  const typeKey = type === 'image' ? 'images' : 'videos'
  data[typeKey] = data[typeKey].filter(item => item.id !== id)
  await saveGalleryData(data)
}

export async function getGalleryItemBySlug(slug: string, type: 'image' | 'video'): Promise<MediaItem | null> {
  const data = await loadGalleryData()
  const typeKey = type === 'image' ? 'images' : 'videos'
  return data[typeKey].find(item => item.slug === slug) || null
}

export async function getImageSetBySlug(slug: string): Promise<MediaItem | null> {
  try {
    console.log('getImageSetBySlug - Input slug:', slug);
    const data = await loadGalleryData();
    // Decode the URL-encoded slug for comparison
    const decodedSlug = decodeURIComponent(slug);
    console.log('getImageSetBySlug - Decoded slug:', decodedSlug);
    // Function to find an item in a collection with all the fallback methods
    const findItem = (collection: MediaItem[], type: 'image' | 'video' = 'image') => {
      console.log(`Searching in ${type}s collection...`);
      // Try to find by slug first (exact match)
      let item = collection.find(item => item.slug === decodedSlug);
      if (item) {
        console.log(`Found ${type} by slug:`, { id: item.id, title: item.title });
        return item;
      }
      // If not found by slug, try to find by ID
      console.log(`Not found by slug, trying to find ${type} by ID...`);
      item = collection.find(item => item.id === decodedSlug || item.id === `item-${decodedSlug}`);
      if (item) {
        console.log(`Found ${type} by ID:`, { id: item.id, title: item.title });
        return item;
      }
      // If still not found, try to find by matching the slug with Cloudinary public ID in URLs
      console.log(`Not found by ID, trying to match Cloudinary public ID in ${type}s...`);
      item = collection.find(item => {
        const urlsToCheck = [
          item.coverImage,
          item.videoUrl,
          ...(item.imageUrls || [])
        ].filter(Boolean);
        return urlsToCheck.some(url => url && url.includes(decodedSlug));
      });
      if (item) {
        console.log(`Found ${type} by URL matching:`, { id: item.id, title: item.title });
        return item;
      }
      return null;
    };
    // Try images first, then videos
    let found = findItem(data.images, 'image');
    if (!found) {
      found = findItem(data.videos, 'video');
    }
    return found || null;
  } catch (error) {
    console.error('Error in getImageSetBySlug:', error);
    return null;
  }
}

export async function getVideoBySlug(slug: string): Promise<MediaItem | null> {
  const data = await loadGalleryData();
  return data.videos.find(item => item.slug === slug) || null;
}

export async function createMedia(media: Omit<MediaItem, "id" | "createdAt" | "updatedAt">): Promise<MediaItem> {
  const supabase = getSupabaseAdminClient();
  
  // Map MediaItem to database schema
  const dbMedia = {
    title: media.title,
    description: media.description,
    url: media.coverImage,
    type: media.type,
    size: media.bytes || null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    created_by: null,
    tags: media.tags || null,
    category: media.galleryType,
    is_public: !media.isPremium,
    metadata: {
      imageUrls: media.imageUrls,
      videoUrl: media.videoUrl,
      backgroundImage: media.backgroundImage,
      featured: media.featured,
      order: media.order,
      slug: media.slug,
      cloudinary_public_id: media.cloudinary_public_id,
      cloudinary_format: media.cloudinary_format,
      cloudinary_metadata: media.cloudinary_metadata,
      width: media.width,
      height: media.height,
      format: media.format,
    },
  };
  
  const { data, error } = await supabase
    .from('media_items')
    .insert(dbMedia)
    .select()
    .single();
  if (error) throw error;
  
  // Map database response back to MediaItem format
  const metadata = data.metadata as any;
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    coverImage: data.url,
    imageUrls: metadata?.imageUrls || [],
    videoUrl: metadata?.videoUrl,
    type: data.type as 'image' | 'video',
    isPremium: !data.is_public,
    tags: data.tags || [],
    featured: metadata?.featured || false,
    order: metadata?.order || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    slug: metadata?.slug || data.id,
    galleryType: (data.category as 'public' | 'exclusive' | 'behind-scenes') || 'public',
    backgroundImage: metadata?.backgroundImage,
    cloudinary_public_id: metadata?.cloudinary_public_id,
    cloudinary_format: metadata?.cloudinary_format,
    cloudinary_metadata: metadata?.cloudinary_metadata,
    width: metadata?.width,
    height: metadata?.height,
    format: metadata?.format,
    bytes: data.size || undefined,
  };
}

export async function updateMedia(id: string, updates: Partial<MediaItem>): Promise<MediaItem> {
  const supabase = getSupabaseAdminClient();
  
  // Map MediaItem updates to database schema
  const dbUpdates: any = {};
  if (updates.title) dbUpdates.title = updates.title;
  if (updates.description) dbUpdates.description = updates.description;
  if (updates.coverImage) dbUpdates.url = updates.coverImage;
  if (updates.type) dbUpdates.type = updates.type;
  if (updates.bytes) dbUpdates.size = updates.bytes;
  if (updates.tags) dbUpdates.tags = updates.tags;
  if (updates.galleryType) dbUpdates.category = updates.galleryType;
  if (updates.isPremium !== undefined) dbUpdates.is_public = !updates.isPremium;
  
  // Handle metadata updates
  const metadata: any = {};
  if (updates.imageUrls) metadata.imageUrls = updates.imageUrls;
  if (updates.videoUrl) metadata.videoUrl = updates.videoUrl;
  if (updates.backgroundImage) metadata.backgroundImage = updates.backgroundImage;
  if (updates.featured !== undefined) metadata.featured = updates.featured;
  if (updates.order !== undefined) metadata.order = updates.order;
  if (updates.slug) metadata.slug = updates.slug;
  if (updates.cloudinary_public_id) metadata.cloudinary_public_id = updates.cloudinary_public_id;
  if (updates.cloudinary_format) metadata.cloudinary_format = updates.cloudinary_format;
  if (updates.cloudinary_metadata) metadata.cloudinary_metadata = updates.cloudinary_metadata;
  if (updates.width) metadata.width = updates.width;
  if (updates.height) metadata.height = updates.height;
  if (updates.format) metadata.format = updates.format;
  
  if (Object.keys(metadata).length > 0) {
    dbUpdates.metadata = metadata;
  }
  
  dbUpdates.updated_at = new Date().toISOString();
  
  const { data, error } = await supabase
    .from('media_items')
    .update(dbUpdates)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  
  // Map database response back to MediaItem format
  const responseMetadata = data.metadata as any;
  return {
    id: data.id,
    title: data.title,
    description: data.description || '',
    coverImage: data.url,
    imageUrls: responseMetadata?.imageUrls || [],
    videoUrl: responseMetadata?.videoUrl,
    type: data.type as 'image' | 'video',
    isPremium: !data.is_public,
    tags: data.tags || [],
    featured: responseMetadata?.featured || false,
    order: responseMetadata?.order || 0,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    slug: responseMetadata?.slug || data.id,
    galleryType: (data.category as 'public' | 'exclusive' | 'behind-scenes') || 'public',
    backgroundImage: responseMetadata?.backgroundImage,
    cloudinary_public_id: responseMetadata?.cloudinary_public_id,
    cloudinary_format: responseMetadata?.cloudinary_format,
    cloudinary_metadata: responseMetadata?.cloudinary_metadata,
    width: responseMetadata?.width,
    height: responseMetadata?.height,
    format: responseMetadata?.format,
    bytes: data.size || undefined,
  };
}

export async function clearAllGalleryData(): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  try {
    await supabase.from('media_items').delete().neq('id', '');
    await supabase.from('root_page_components').delete().eq('page_slug', 'gallery');
    return { success: true };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

export async function deleteMedia(id: string, type: 'image' | 'video', galleryTypeParam?: 'public' | 'exclusive' | 'behind-scenes'): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('media_items')
    .delete()
    .eq('id', id);
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function updateGalleryHeroImage(
  imageUrl: string,
  galleryType: string,
  title?: string,
  description?: string,
  mediaType: string = 'image'
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('root_page_components')
    .upsert({
      page_slug: 'gallery',
      component_type: 'hero',
      content: {
        backgroundMedia: imageUrl,
        title: title || '',
        description: description || '',
        mediaType: mediaType,
      },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'page_slug,component_type' });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}

export async function getGalleryHeroSection(galleryType: string = 'public') {
  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from('root_page_components')
    .select('*')
    .eq('page_slug', 'gallery')
    .eq('component_type', 'hero')
    .single();
  if (error) {
    return null;
  }
  return data;
}

export async function updateGalleryHeroSection(
  galleryType: string,
  heroData: HeroSectionData
): Promise<{ success: boolean; error?: string }> {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase
    .from('root_page_components')
    .upsert({
      page_slug: 'gallery',
      component_type: 'hero',
      content: { ...heroData },
      updated_at: new Date().toISOString(),
    }, { onConflict: 'page_slug,component_type' });
  if (error) {
    return { success: false, error: error.message };
  }
  return { success: true };
}