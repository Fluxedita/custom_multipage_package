// This file is for server-side use only
// Client-side code should use API routes to interact with Cloudinary

// Types shared between client and server
export interface CloudinaryResource {
  id: string;
  public_id: string;
  secure_url: string;
  url: string;
  name: string;
  type: 'image' | 'video';
  resource_type: 'image' | 'video';
  format: string;
  bytes: number;
  width?: number;
  height?: number;
  created_at: string;
  tags: string[];
  context: Record<string, any>;
  asset_id?: string;
}

export interface CloudinaryResponse {
  resources: CloudinaryResource[];
  next_cursor?: string;
  total_count: number;
}

// Client-side stubs that will be replaced by the actual implementation
// when used in a server component
interface CloudinaryOptions {
  [key: string]: string | number | boolean | undefined;
}

// Client-side stub with proper typing
export const cloudinary: any = {
  url: (publicId: string, options: CloudinaryOptions) => {
    // Extract public_id from URL or use as-is
    let cleanPublicId = publicId;
    
    // If it looks like a full URL, try to extract the public_id
    if (publicId.startsWith('http')) {
      try {
        const url = new URL(publicId);
        // Extract from portfolio-assets path
        const match = url.pathname.match(/portfolio-assets\/([^?]+)/);
        cleanPublicId = match ? match[1] : publicId;
      } catch (err) {
        console.warn('Invalid URL format, using as public_id:', publicId);
      }
    } else if (publicId.startsWith('portfolio-assets/')) {
      // Handle direct portfolio-assets path
      const match = publicId.match(/portfolio-assets\/([^?]+)/);
      cleanPublicId = match ? match[1] : publicId;
    }
    
    // Ensure we have a valid Cloudinary cloud name
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    if (!cloudName) {
      console.error('Cloudinary cloud name is not configured');
      return publicId;
    }
    
    // Build the URL with resource type
    const resourceType = options.resource_type || 'image';
    const baseUrl = `https://res.cloudinary.com/${cloudName}/${resourceType}/upload`;
    
    // Add parameters as query params
    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (key !== 'resource_type' && key !== 'transformation' && value !== undefined) {
        params.append(key, value.toString());
      }
    });
    
    // Add the resource type as a parameter
    params.append('resource_type', resourceType as string);
    
    // Add the public_id as the last parameter
    if (cleanPublicId) {
      params.append('public_id', cleanPublicId);
    }
    
    // Return the complete URL with all parameters
    const finalUrl = `${baseUrl}?${params.toString()}`;
    console.log('Generated Cloudinary URL:', finalUrl);
    return finalUrl;
  }
};

// Only import and configure Cloudinary on the server side
if (typeof window === 'undefined') {
  const cloudinaryServer = require('cloudinary').v2;
  
  // Configure Cloudinary with proper validation
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const apiKey = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
  const apiSecret = process.env.CLOUDINARY_API_SECRET;

  if (!cloudName || !apiKey || !apiSecret) {
    console.error('Missing Cloudinary environment variables:', {
      cloudName: !!cloudName,
      apiKey: !!apiKey,
      apiSecret: !!apiSecret,
    });
    throw new Error('Cloudinary configuration is missing required environment variables');
  }

  cloudinaryServer.config({
    cloud_name: cloudName,
    api_key: apiKey,
    api_secret: apiSecret,
    secure: true,
    secure_distribution: 'https://res.cloudinary.com'
  });

  // Override the client-side stub with the server instance
  Object.assign(cloudinary, cloudinaryServer);
}

export async function fetchMediaFromCloudinary(
  type: 'image' | 'video' | 'all' = 'all',
  nextCursor?: string,
  maxResults: number = 30
): Promise<CloudinaryResponse> {
  // On the client side, use the API route
  if (typeof window !== 'undefined') {
    const params = new URLSearchParams();
    if (type !== 'all') params.append('type', type);
    if (nextCursor) params.append('next_cursor', nextCursor);
    params.append('max_results', maxResults.toString());
    
    const response = await fetch(`/api/media/cloudinary?${params.toString()}`);
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || 'Failed to fetch media');
    }
    const data = await response.json();
    return data as CloudinaryResponse;
  }
  
  // Server-side implementation
  try {
    const options = {
      type: 'upload',
      resource_type: type === 'all' ? 'auto' : type,
      max_results: Math.min(maxResults, 100),
      next_cursor: nextCursor,
      context: true,
      tags: true,
      prefix: 'portfolio-assets/'
    } as const;

    // Get resources directly with prefix and type filtering
    const result = await cloudinary.api.resources({
      type: 'upload',
      prefix: 'portfolio-assets/',
      max_results: maxResults,
      resource_type: type === 'all' ? 'auto' : type,
      next_cursor: nextCursor,
      context: true,
      tags: true
    });
    
    // Transform the resources to match the expected format
    const transformedResources = result.resources.map((resource: any) => ({
      id: resource.asset_id || resource.public_id,
      public_id: resource.public_id,
      secure_url: resource.secure_url,
      url: resource.secure_url,
      name: resource.public_id.split('/').pop(),
      type: resource.resource_type,
      format: resource.format,
      bytes: resource.bytes,
      width: resource.width,
      height: resource.height,
      created_at: resource.created_at,
      tags: resource.tags || [],
      context: resource.context || {},
    }));
    
    return {
      resources: transformedResources,
      next_cursor: result.next_cursor,
      total_count: transformedResources.length
    };
  } catch (error) {
    console.error('Error in fetchMediaFromCloudinary:', error);
    throw new Error(`Failed to fetch media: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

async function generateSignature(timestamp: number): Promise<string> {
  const response = await fetch('/api/cloudinary/signature', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ timestamp }),
  })

  if (!response.ok) {
    throw new Error('Failed to generate signature')
  }

  const { signature } = await response.json()
  return signature
}

export async function uploadToCloudinary(file: File): Promise<CloudinaryResource> {
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '')

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/auto/upload`,
    {
      method: 'POST',
      body: formData,
    }
  )

  if (!response.ok) {
    throw new Error('Failed to upload to Cloudinary')
  }

  return response.json()
}

export async function deleteFromCloudinary(publicId: string): Promise<void> {
  const response = await fetch('/api/cloudinary/delete', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId }),
  })

  if (!response.ok) {
    throw new Error('Failed to delete media')
  }
}

export async function updateMediaTags(publicId: string, tags: string[]): Promise<void> {
  const response = await fetch('/api/cloudinary/update-tags', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ publicId, tags }),
  })

  if (!response.ok) {
    throw new Error('Failed to update tags')
  }
} 