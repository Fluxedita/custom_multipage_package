import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import type { CloudinaryResponse } from '@/lib/cloudinary';

// This route needs to be dynamic to handle different requests
export const dynamic = 'force-dynamic';

// Get environment variables with validation
const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '';
const api_key = process.env.CLOUDINARY_API_KEY || '';
const api_secret = process.env.CLOUDINARY_API_SECRET || '';

// Configure Cloudinary
cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true,
});

export async function GET(request: Request) {
  try {
    // Validate environment variables on each request in development
    if (process.env.NODE_ENV !== 'production' && (!cloud_name || !api_key || !api_secret)) {
      console.error('Missing required Cloudinary environment variables:', {
        cloud_name: !!cloud_name,
        api_key: !!api_key,
        api_secret: !!api_secret,
      });
      throw new Error('Missing Cloudinary configuration');
    }

    const { searchParams } = new URL(request.url || '');
    const type = searchParams.get('type') as 'image' | 'video' | 'all' || 'all';
    const maxResults = Math.min(parseInt(searchParams.get('max_results') || '30'), 100); // Limit max results
    const nextCursor = searchParams.get('next_cursor') || undefined;
    const folder = searchParams.get('folder') || undefined;

    console.log('Fetching Cloudinary resources with params:', {
      type,
      maxResults,
      nextCursor,
      cloudName: cloud_name,
      apiKey: api_key ? 'set' : 'unset',
    });

    let resources: any[] = [];
    let totalCount = 0;

    if (type === 'all') {
      // For 'all', fetch both images and videos
      const [imageResult, videoResult] = await Promise.all([
        cloudinary.api.resources({
          type: 'upload',
          resource_type: 'image',
          max_results: Math.ceil(maxResults / 2),
          next_cursor: nextCursor,
          folder: folder,
          context: true,
          tags: true,
        }).catch(() => ({ resources: [], total_count: 0 })),
        cloudinary.api.resources({
          type: 'upload',
          resource_type: 'video',
          max_results: Math.ceil(maxResults / 2),
          next_cursor: nextCursor,
          folder: folder,
          context: true,
          tags: true,
        }).catch(() => ({ resources: [], total_count: 0 }))
      ]);

      resources = [...(imageResult.resources || []), ...(videoResult.resources || [])];
      totalCount = (imageResult.total_count || 0) + (videoResult.total_count || 0);
      
      // Sort by creation date (newest first) and limit to maxResults
      resources.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      resources = resources.slice(0, maxResults);
    } else {
      // For specific type (image or video)
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: type,
        max_results: maxResults,
        next_cursor: nextCursor,
        folder: folder,
        context: true,
        tags: true,
      }).catch((error) => {
        console.error('Cloudinary API error:', error);
        return { resources: [], total_count: 0 };
      });

      
      resources = result.resources || [];
      totalCount = result.total_count || 0;
    }

    if (!resources || resources.length === 0) {
      console.log('No resources found in Cloudinary response');
      return NextResponse.json({
        error: 'No resources found',
        timestamp: new Date().toISOString(),
        cloudName: cloud_name,
        apiKey: api_key ? 'set' : 'unset',
        type,
        maxResults,
        nextCursor
      }, { status: 404 });
    }

    const response: CloudinaryResponse = {
      resources: resources.map((resource: any) => ({
        id: resource.asset_id || resource.public_id,
        public_id: resource.public_id,
        secure_url: resource.secure_url,
        url: resource.secure_url,
        name: resource.public_id.split('/').pop(),
        type: resource.resource_type,
        resource_type: resource.resource_type,
        format: resource.format,
        bytes: resource.bytes,
        width: resource.width,
        height: resource.height,
        created_at: resource.created_at,
        tags: resource.tags || [],
        context: resource.context || {},
        asset_id: resource.asset_id
      })),
      total_count: totalCount,
      next_cursor: nextCursor || ''
    };

    console.log('Successfully fetched resources:', {
      count: response.resources.length,
      total: response.total_count
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error('Cloudinary API error:', error);
    return NextResponse.json({
      error: 'Failed to fetch media from Cloudinary',
      timestamp: new Date().toISOString(),
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}