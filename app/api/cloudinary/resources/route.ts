import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

// This route needs to be dynamic to handle different requests
export const dynamic = 'force-dynamic';

// Configure Cloudinary with environment variables
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true,
})

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url || '')
    const type = searchParams.get('resource_type') as 'image' | 'video' | undefined
    const nextCursor = searchParams.get('next_cursor') || undefined
    const maxResults = parseInt(searchParams.get('max_results') || '50')

    // Validate required environment variables
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      throw new Error('Cloudinary credentials are not properly configured')
    }

    const result = await cloudinary.api.resources({
      type: 'upload',
      resource_type: type,
      max_results: maxResults,
      next_cursor: nextCursor,
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error fetching Cloudinary resources:', error)
    return NextResponse.json(
      { error: 'Failed to fetch resources' },
      { status: 500 }
    )
  }
} 