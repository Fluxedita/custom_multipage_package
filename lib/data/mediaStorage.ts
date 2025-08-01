import { promises as fs } from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';
import type { MediaItem } from '@/lib/types';

const DATA_FILE_PATH = path.join(process.cwd(), 'data', 'media.json');

// Ensure the data directory exists
async function ensureDataDirectory() {
  const dir = path.dirname(DATA_FILE_PATH);
  try {
    await fs.mkdir(dir, { recursive: true });
  } catch (error: any) {
    if (error.code !== 'EEXIST') {
      throw error;
    }
  }
}

// Read media data from file
async function readMediaData(): Promise<MediaItem[]> {
  try {
    await ensureDataDirectory();
    const data = await fs.readFile(DATA_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File doesn't exist yet, return empty array
      return [];
    }
    console.error('Error reading media data:', error);
    throw new Error('Failed to read media data');
  }
}

// Write media data to file
async function writeMediaData(data: MediaItem[]): Promise<void> {
  try {
    await ensureDataDirectory();
    await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing media data:', error);
    throw new Error('Failed to save media data');
  }
}

// Get all media items
export async function getAllMediaItems(): Promise<MediaItem[]> {
  return readMediaData();
}

// Get media items by type
export async function getMediaItemsByType(type: 'image' | 'video'): Promise<MediaItem[]> {
  const items = await readMediaData();
  return items.filter(item => item.type === type);
}

// Get a single media item by ID
export async function getMediaItem(id: string): Promise<MediaItem | undefined> {
  const items = await readMediaData();
  return items.find(item => item.id === id);
}

// Get a single media item by slug
export async function getMediaItemBySlug(slug: string): Promise<MediaItem | undefined> {
  const items = await readMediaData();
  return items.find(item => item.slug === slug);
}

// Save a media item (create or update)
export async function saveMediaItem(mediaData: Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt' | 'slug'> & { id?: string }): Promise<MediaItem> {
  const items = await readMediaData();
  const now = new Date().toISOString();
  
  if (mediaData.id) {
    // Update existing item
    const index = items.findIndex(item => item.id === mediaData.id);
    if (index === -1) {
      throw new Error('Media item not found');
    }
    
    const updatedItem: MediaItem = {
      ...items[index],
      ...mediaData,
      updatedAt: now,
      galleryType: "public",
    };
    
    items[index] = updatedItem;
    await writeMediaData(items);
    return updatedItem;
  } else {
    // Create new item
    const newItem: MediaItem = {
      ...mediaData,
      id: uuidv4(),
      slug: mediaData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      createdAt: now,
      updatedAt: now,
      galleryType: "public",
    };
    
    items.push(newItem);
    await writeMediaData(items);
    return newItem;
  }
}

// Delete a media item
export async function deleteMediaItem(id: string): Promise<boolean> {
  const items = await readMediaData();
  const index = items.findIndex(item => item.id === id);
  
  if (index === -1) {
    return false;
  }
  
  items.splice(index, 1);
  await writeMediaData(items);
  return true;
}
