'use server';

import { revalidatePath } from 'next/cache';
import { join } from 'path';
import { mkdir, writeFile } from 'fs/promises';
import { deleteFromCloudinary } from '@/lib/cloudinary';
import { 
  getGalleryData, 
  getImageSetBySlug, 
  getVideoBySlug,
  createMedia, 
  updateMedia, 
  deleteMedia 
} from '@/app/actions/gallery';
import { MediaItem, SaveMediaData } from '@/lib/types';
import { createServerActionClient } from '@supabase/auth-helpers-nextjs';
import { cookies, headers } from 'next/headers';
import { Database } from '@/types/supabase';
import { toast } from 'sonner';
import { supabaseAdmin } from '@/lib/supabase/admin';

// Type guard to check if value is an error
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Helper to convert SaveMediaData to MediaItem format
function toMediaItem(data: SaveMediaData): Omit<MediaItem, 'id'> {
  const now = new Date().toISOString();
  const slug = data.slug || 
    data.title.toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
      
  // Filter out invalid image URLs
  const validImageUrls = (data.imageUrls || [])
    .filter((url): url is string => 
      typeof url === 'string' && 
      url.trim() !== '' && 
      !url.includes('.gitkeep') &&
      (url.startsWith('http') || url.startsWith('/uploads/'))
    );
      
  const mediaItem: Omit<MediaItem, 'id'> = {
    title: data.title,
    slug,
    description: data.description,
    coverImage: data.coverImage,
    isPremium: data.isPremium,
    type: data.type,
    imageUrls: validImageUrls,
    videoUrl: data.videoUrl,
    backgroundImage: data.backgroundImage,
    galleryType: data.galleryType || 'public',
    tags: Array.isArray(data.tags) ? data.tags : (data.tags ? [data.tags] : []),
    featured: data.featured,
    order: data.order,
    createdAt: now,
    updatedAt: now
  };
  
  return mediaItem;
}

// File storage paths
const UPLOAD_DIR = join(process.cwd(), 'public/uploads');
const UPLOAD_URL = '/uploads';

// Helper function to save uploaded files
async function saveFile(file: File | string, type: 'image' | 'video'): Promise<{ path: string; url: string }> {
  console.log(`saveFile called with type: ${type}`, { 
    isFile: file instanceof File,
    isUrl: typeof file === 'string' && (file.startsWith('http') || file.startsWith('https')),
    isLocalPath: typeof file === 'string' && file.startsWith('/uploads/')
  });

  try {
    // If the file is already a URL (from Cloudinary), return it as is
    if (typeof file === 'string' && (file.startsWith('http') || file.startsWith('https'))) {
      console.log('Returning existing URL:', file);
      return {
        path: file,
        url: file
      };
    }

    // If it's a local file path, return it as is
    if (typeof file === 'string' && file.startsWith('/uploads/')) {
      return {
        path: file,
        url: file
      };
    }

    // Otherwise, upload to Cloudinary
    try {
      console.log('Preparing to upload file to Cloudinary...');
      const formData = new FormData();
      formData.append('file', file as File);
      
      const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
      
      if (!uploadPreset || !cloudName) {
        const errorMsg = 'Cloudinary configuration is missing';
        console.error(errorMsg, { uploadPreset: !!uploadPreset, cloudName: !!cloudName });
        throw new Error(errorMsg);
      }
      
      formData.append('upload_preset', uploadPreset);
      
      console.log('Sending request to Cloudinary...');
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cloudinary upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: errorText
        });
        throw new Error(`Failed to upload to Cloudinary: ${response.statusText}`);
      }

      const result = await response.json();
      console.log('Cloudinary upload successful:', {
        public_id: result.public_id,
        secure_url: result.secure_url,
        format: result.format,
        bytes: result.bytes
      });
      
      return {
        path: result.public_id,
        url: result.secure_url
      };
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw new Error('Failed to upload file to Cloudinary');
    }
  } catch (error) {
    console.error('Error saving file:', error);
    throw new Error('Failed to save file');
  }
}

function isFile(value: unknown): value is File {
  return value instanceof File;
}

// Save or update a media item
/* TEMPORARILY DISABLED – migrated to API route
export async function saveMediaAction(data: SaveMediaData): Promise<{ success: boolean; data?: MediaItem; error?: string }> {
  try {
    const supabase = createServerActionClient<Database>({ cookies, headers });

    // Try to retrieve the current user (more reliable than getSession in server actions)
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error('saveMediaAction: user not authenticated', userError);
      return { success: false, error: 'Not authenticated' };
    }

    // Allow only the configured admin
    const adminEmail = process.env.ADMIN_EMAIL;
    if (adminEmail && user.email !== adminEmail) {
      console.error('saveMediaAction: user is not admin', { email: user.email });
      return { success: false, error: 'Insufficient permissions' };
    }

    // Use service-role client for the write so we bypass RLS but still gate via the email check
    const supabaseAdminClient = supabaseAdmin;

    // Ensure the user is authenticated and has admin role
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    if (sessionError || !session) {
      console.error('saveMediaAction: not authenticated', sessionError);
      return { success: false, error: 'Not authenticated' };
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('membership_type')
      .eq('id', session.user.id)
      .single();

    if (profileError || !profile || profile.membership_type !== 'admin') {
      console.error('saveMediaAction: insufficient permissions', profileError);
      return { success: false, error: 'Insufficient permissions' };
    }

    // Convert to database format
    const mediaItem = toMediaItem(data);
    
    // Prepare the data for insertion/update
    const dbData = {
      title: mediaItem.title,
      description: mediaItem.description,
      cover_image: mediaItem.coverImage,
      image_urls: mediaItem.imageUrls,
      video_url: mediaItem.videoUrl,
      is_premium: mediaItem.isPremium,
      type: mediaItem.type,
      tags: mediaItem.tags,
      featured: mediaItem.featured,
      order: mediaItem.order,
      slug: mediaItem.slug || mediaItem.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      gallery_type: mediaItem.galleryType,
      background_image: mediaItem.backgroundImage,
      user_id: session.user.id,
      cloudinary_public_id: mediaItem.cloudinary_public_id,
      cloudinary_format: mediaItem.cloudinary_format,
      cloudinary_metadata: mediaItem.cloudinary_metadata,
      width: mediaItem.width,
      height: mediaItem.height,
      format: mediaItem.format,
      bytes: mediaItem.bytes,
      updated_at: mediaItem.updatedAt
    };

    let result;
    if (data.id) {
      // Update existing media
      result = await supabase
        .from('media_items')
        .update(dbData)
        .eq('id', data.id)
        .select()
        .single();
    } else {
      // Insert new media
      result = await supabase
        .from('media_items')
        .insert([{ ...dbData, created_at: mediaItem.createdAt }])
        .select()
        .single();
    }

    if (result.error) {
      console.error('Supabase error:', result.error);
      throw new Error(result.error.message || 'Database operation failed');
    }

    if (!result.data) {
      throw new Error('No data returned from database');
    }

    // Convert back to MediaItem format
    const savedItem: MediaItem = {
      id: result.data.id,
      title: result.data.title,
      description: result.data.description,
      coverImage: result.data.cover_image,
      imageUrls: result.data.image_urls || [],
      videoUrl: result.data.video_url,
      type: result.data.type,
      isPremium: result.data.is_premium,
      tags: result.data.tags || [],
      featured: result.data.featured,
      order: result.data.order,
      slug: result.data.slug,
      galleryType: result.data.gallery_type,
      backgroundImage: result.data.background_image,
      cloudinary_public_id: result.data.cloudinary_public_id,
      cloudinary_format: result.data.cloudinary_format,
      cloudinary_metadata: result.data.cloudinary_metadata,
      width: result.data.width,
      height: result.data.height,
      format: result.data.format,
      bytes: result.data.bytes,
      createdAt: result.data.created_at,
      updatedAt: result.data.updated_at
    };

    return { success: true, data: savedItem };
  } catch (error) {
    console.error('Error in saveMediaAction:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    };
  }
}
*/

// Delete a media item
export async function deleteMediaAction(
  id: string, 
  type: 'image' | 'video', 
  galleryTypeParam?: 'public' | 'exclusive' | 'behind-scenes'
) {
  // Set default gallery type if not provided
  const targetGalleryType = galleryTypeParam || 'public';
  
  console.log(`[deleteMediaAction] Starting deletion of ${type} with ID: ${id} in gallery type: ${targetGalleryType}`);
  
  try {
    // First, try to get the item with the specified gallery type
    let galleryData = await getGalleryData(targetGalleryType);
    let allItems = [...galleryData.images, ...galleryData.videos];
    let itemToDelete = allItems.find(item => item.id === id);
    
    // If not found and we're not already checking all galleries, try all gallery types
    if (!itemToDelete && galleryTypeParam) {
      console.log(`[deleteMediaAction] Item not found in public gallery, trying all galleries...`);
      // Try exclusive gallery
      const exclusiveData = await getGalleryData('exclusive');
      allItems = [...exclusiveData.images, ...exclusiveData.videos];
      itemToDelete = allItems.find(item => item.id === id);
      
      // If still not found, try behind-scenes
      if (!itemToDelete) {
        const behindScenesData = await getGalleryData('behind-scenes');
        allItems = [...behindScenesData.images, ...behindScenesData.videos];
        itemToDelete = allItems.find(item => item.id === id);
      }
    }
    
    if (!itemToDelete) {
      const errorMsg = `[deleteMediaAction] Item with ID ${id} not found in gallery data`;
      console.warn(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    // Get the gallery type from the item or use the provided one
    const itemGalleryType = itemToDelete.galleryType || targetGalleryType;
    
    console.log(`[deleteMediaAction] Found item to delete:`, {
      id: itemToDelete.id,
      title: itemToDelete.title,
      type: itemToDelete.type,
      galleryType: itemGalleryType,
      isPremium: itemToDelete.isPremium
    });
    
    // Try to delete from Cloudinary if the ID is a valid Cloudinary public ID
    try {
      console.log(`[deleteMediaAction] Attempting to delete ${type} with public ID ${id} from Cloudinary`);
      await deleteFromCloudinary(id);
      console.log(`[deleteMediaAction] Successfully deleted ${type} with public ID ${id} from Cloudinary`);
    } catch (cloudinaryError) {
      console.warn(`[deleteMediaAction] Failed to delete ${type} with ID ${id} from Cloudinary:`, cloudinaryError);
      // Continue with local deletion even if Cloudinary deletion fails
    }
    
    // Delete from our local gallery data
    console.log(`[deleteMediaAction] Deleting ${type} with ID ${id} from local data with gallery type: ${itemGalleryType}`);
    const result = await deleteMedia(id, type, itemGalleryType as 'public' | 'exclusive' | 'behind-scenes');
    
    if (!result.success) {
      const errorMsg = `[deleteMediaAction] Failed to delete ${type} with ID ${id} from local data: ${result.error}`;
      console.error(errorMsg);
      return { success: false, error: errorMsg };
    }
    
    // Revalidate relevant paths
    const basePaths = ['/', '/gallery'];
    
    // Add gallery type specific paths
    if (itemGalleryType === 'exclusive' || itemGalleryType === 'behind-scenes') {
      basePaths.push(`/${itemGalleryType}`);
    }
    
    const pathsToRevalidate = [
      ...basePaths,
      `/${type === 'image' ? 'gallery/images' : 'gallery/videos'}`,
      `/gallery/${type === 'image' ? 'images' : 'videos'}/${id}`,
      `/${itemGalleryType}/${id}`,
      `/${itemGalleryType}`
    ];
    
    // Remove duplicates
    const uniquePaths = [...new Set(pathsToRevalidate)];
    
    console.log('[deleteMediaAction] Revalidating paths after deletion:', uniquePaths);
    try {
      await Promise.all(uniquePaths.map(path => revalidatePath(path)));
      console.log('[deleteMediaAction] Paths revalidated successfully');
    } catch (revalidateError) {
      console.error('[deleteMediaAction] Error revalidating paths:', revalidateError);
      // Don't fail the whole operation if revalidation fails
    }
    
    console.log(`[deleteMediaAction] Successfully completed deletion of ${type} with ID: ${id} from gallery type: ${itemGalleryType}`);
    return { success: true };
  } catch (error) {
    const errorMsg = `[deleteMediaAction] Error deleting ${type} with ID ${id}: ${error instanceof Error ? error.message : 'Unknown error'}`;
    console.error(errorMsg, error);
    return { 
      success: false, 
      error: errorMsg 
    };
  }
}

// Get media items by type
export async function getMediaItemsByType(type: 'image' | 'video', galleryType: 'public' | 'exclusive' | 'behind-scenes' = 'public') {
  try {
    const galleryData = await getGalleryData(galleryType);
    return type === 'image' ? galleryData.images : galleryData.videos;
  } catch (error) {
    console.error(`Error getting ${type} items:`, error);
    return [];
  }
}

// Get media item by slug
export async function getMediaItemBySlug(slug: string, type: 'image' | 'video') {
  try {
    return type === 'image' 
      ? await getImageSetBySlug(slug)
      : await getVideoBySlug(slug);
  } catch (error) {
    console.error(`Error getting ${type} item:`, error);
    return null;
  }
}

// Initialize upload directories on server start
const initUploadDirs = async () => {
  try {
    const dirs = [
      join(UPLOAD_DIR, 'images'),
      join(UPLOAD_DIR, 'videos'),
    ];

    await Promise.all(
      dirs.map((dir) =>
        mkdir(dir, { recursive: true })
          .catch((error) =>
            console.error(`Error creating directory ${dir}:`, error)
          )
      )
    );
  } catch (error) {
    console.error('Error initializing upload directories:', error);
  }
};

// Run initialization
initUploadDirs().catch(console.error);
