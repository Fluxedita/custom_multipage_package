import { NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
})

export async function POST(request: Request) {
  try {
    const { publicId, tags } = await request.json()

    if (!publicId || !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Public ID and tags array are required' },
        { status: 400 }
      )
    }

    // Add each tag individually
    const results = await Promise.all(
      tags.map(tag => cloudinary.uploader.add_tag(tag, [publicId]))
    )

    return NextResponse.json({ success: true, results })
  } catch (error) {
    console.error('Error updating Cloudinary resource tags:', error)
    return NextResponse.json(
      { error: 'Failed to update tags' },
      { status: 500 }
    )
  }
} 