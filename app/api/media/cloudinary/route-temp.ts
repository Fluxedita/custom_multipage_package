import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';
import type { CloudinaryResponse } from '@/lib/cloudinary';

// Get environment variables with validation
const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
const api_key = process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY;
const api_secret = process.env.CLOUDINARY_API_SECRET;

if (!cloud_name || !api_key || !api_secret) {
  console.error('Missing required Cloudinary environment variables:', {
    cloud_name: !!cloud_name,
    api_key: !!api_key,
    api_secret: !!api_secret,
  });
  throw new Error('Missing Cloudinary configuration');
}

// Configure Cloudinary
cloudinary.config({
  cloud_name,
  api_key,
  api_secret,
  secure: true,
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'image' | 'video' | 'all' || 'all';
    const maxResults = parseInt(searchParams.get('max_results') || '30');
    const nextCursor = searchParams.get('next_cursor') || undefined;

    console.log('Fetching Cloudinary resources with params:', {
      type,
      maxResults,
      nextCursor,
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'set' : 'unset',
    });

    const cloudinaryResult = await cloudinary.api.resources({
      type: type as 'image' | 'video' | 'all',
      prefix: 'portfolio-assets',
      max_results: maxResults,
      resource_type: 'auto',
      next_cursor: nextCursor,
      context: true,
      tags: true,
    });

    if (!cloudinaryResult || !cloudinaryResult.resources) {
      console.log('No resources found in Cloudinary response');
      return NextResponse.json({
        error: 'No resources found',
        timestamp: new Date().toISOString(),
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY ? 'set' : 'unset',
        prefix: 'portfolio-assets',
        type,
        maxResults,
        nextCursor
      }, { status: 404 });
    }

    const response: CloudinaryResponse = {
      resources: cloudinaryResult.resources.map((resource: any) => ({
        public_id: resource.public_id,
        url: cloudinary.url(resource.public_id, {
          resource_type: resource.resource_type,
          type: resource.type,
          format: resource.format
        }),
        format: resource.format,
        type: resource.type,
        resource_type: resource.resource_type,
        created_at: resource.created_at,
        bytes: resource.bytes,
        width: resource.width,
        height: resource.height,
        tags: resource.tags || [],
        context: resource.context || {},
        next_cursor: cloudinaryResult.next_cursor
      })),
      total_count: cloudinaryResult.total_count || 0,
      next_cursor: cloudinaryResult.next_cursor || ''
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
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
