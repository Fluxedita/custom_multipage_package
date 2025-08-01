import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// Maximum file size: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024;

// Supported file types
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const isVideo = formData.get('isVideo') === 'true';

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = isVideo ? ALLOWED_VIDEO_TYPES : ALLOWED_IMAGE_TYPES;
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: `Invalid file type. ${isVideo ? 'Videos' : 'Images'} only.` },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 100MB.' },
        { status: 400 }
      );
    }

    // Convert file to base64
    const arrayBuffer = await file.arrayBuffer();
    const base64File = Buffer.from(arrayBuffer).toString('base64');
    const dataUri = `data:${file.type};base64,${base64File}`;
    
    // Upload to Cloudinary
    try {
      const result = await cloudinary.uploader.upload(dataUri, {
        resource_type: isVideo ? 'video' : 'image',
        folder: 'portfolio-assets',
        use_filename: true,
        unique_filename: true,
        overwrite: false,
        invalidate: true,
        type: 'upload',
        context: `alt=${file.name}|caption=${file.name}`
      });
      
      return NextResponse.json({
        public_id: result.public_id,
        secure_url: result.secure_url,
        resource_type: result.resource_type,
        format: result.format,
        bytes: result.bytes,
        created_at: result.created_at,
        width: result.width,
        height: result.height,
        asset_id: result.asset_id
      });
    } catch (uploadError) {
      console.error('Error uploading to Cloudinary:', uploadError);
      const errorMessage = uploadError instanceof Error ? uploadError.message : 'Failed to upload file to Cloudinary';
      return NextResponse.json(
        { error: errorMessage },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}
