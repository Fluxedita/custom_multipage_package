import { fetchMediaFromCloudinary, CloudinaryResource } from '@/lib/cloudinary';

export interface CloudinaryMediaItem {
  publicId: string;
  secureUrl: string;
  resourceType: 'image' | 'video';
  format: string;
  bytes: number;
  width: number;
  height: number;
  createdAt: string;
  tags: string[];
  alt?: string;
  caption?: string;
  title?: string;
  description?: string;
}

export async function getGalleryData(type: 'public' | 'exclusive' | 'behind-scenes'): Promise<CloudinaryMediaItem[]> {
  try {
    // Fetch data from Cloudinary
    const result = await fetchMediaFromCloudinary('all', undefined, 100);

    // Transform Cloudinary resources to our internal format
    return result.resources.map((resource: CloudinaryResource) => {
      // Extract filename from public_id if needed
      const filename = resource.public_id.split('/').pop() || '';
      
      return {
        publicId: resource.public_id,
        secureUrl: resource.secure_url,
        resourceType: resource.resource_type,
        format: resource.format,
        bytes: resource.bytes,
        width: resource.width || 0,
        height: resource.height || 0,
        createdAt: resource.created_at,
        tags: resource.tags || [],
        alt: (resource as any).context?.alt || '',
        caption: (resource as any).context?.caption || '',
        title: filename.split('.')[0] || '',
      };
    });
  } catch (error) {
    console.error('Error fetching gallery data:', error);
    throw new Error('Failed to load gallery data');
  }
}
