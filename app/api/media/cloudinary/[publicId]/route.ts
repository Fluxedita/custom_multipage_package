import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function DELETE(
  request: Request,
  { params }: { params: { publicId: string } }
) {
  try {
    const { publicId } = params;
    
    if (!publicId) {
      return NextResponse.json(
        { error: 'No public ID provided' },
        { status: 400 }
      );
    }

    console.log(`Attempting to delete media with public ID: ${publicId}`);
    
    // Delete the resource from Cloudinary
    const result = await cloudinary.uploader.destroy(publicId, {
      invalidate: true,
      resource_type: 'auto' // Automatically detect the resource type
    });

    console.log('Cloudinary delete result:', JSON.stringify(result, null, 2));

    if (result.result !== 'ok') {
      const errorMessage = `Cloudinary deletion failed: ${result.result || 'Unknown error'}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    console.log(`Successfully deleted media: ${publicId}`);
    
    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Error in delete endpoint:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined,
      timestamp: new Date().toISOString()
    });
    
    return NextResponse.json(
      { 
        error: 'Failed to delete media',
        details: errorMessage
      },
      { status: 500 }
    );
  }
} 