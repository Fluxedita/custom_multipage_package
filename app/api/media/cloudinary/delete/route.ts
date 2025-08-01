import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

export async function POST(request: Request) {
  try {
    console.log('Delete request received');
    
    // Log environment variables (without exposing secrets)
    console.log('Environment check:', {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? 'set' : 'unset',
      apiKey: process.env.CLOUDINARY_API_KEY ? 'set' : 'unset',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? 'set' : 'unset',
    });
    
    const body = await request.json();
    console.log('Request body:', JSON.stringify(body, null, 2));
    
    const publicId = body.publicId || body.public_id; // Support both camelCase and snake_case
    
    if (!publicId) {
      console.error('No public ID provided in request');
      return NextResponse.json(
        { error: 'No public ID provided' },
        { status: 400 }
      );
    }

    console.log(`Attempting to delete media with public ID: ${publicId}`);
    
    // Validate Cloudinary configuration before attempting delete
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY || 
        !process.env.CLOUDINARY_API_SECRET) {
      console.error('Missing Cloudinary configuration:', {
        cloudName: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: !!process.env.CLOUDINARY_API_KEY,
        apiSecret: !!process.env.CLOUDINARY_API_SECRET,
      });
      throw new Error('Cloudinary configuration is incomplete');
    }
    
    // Test Cloudinary configuration
    console.log('Cloudinary config test:', {
      cloudName: cloudinary.config().cloud_name,
      apiKey: cloudinary.config().api_key ? 'set' : 'unset',
      apiSecret: cloudinary.config().api_secret ? 'set' : 'unset',
    });
    
    // Delete the resource from Cloudinary
    let result;
    try {
      console.log('Calling Cloudinary destroy API...');
      
      // Try to delete as image first
      result = await cloudinary.uploader.destroy(publicId, {
        invalidate: true,
        resource_type: 'image'
      });
      
      // If not found as image, try as video
      if (result.result === 'not found') {
        console.log('Not found as image, trying as video...');
        result = await cloudinary.uploader.destroy(publicId, {
          invalidate: true,
          resource_type: 'video'
        });
      }
      
      console.log('Cloudinary destroy call completed');
    } catch (cloudinaryError) {
      console.error('Cloudinary destroy call failed:', {
        error: cloudinaryError,
        message: cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown Cloudinary error',
        stack: cloudinaryError instanceof Error ? cloudinaryError.stack : undefined,
        publicId,
        timestamp: new Date().toISOString()
      });
      throw new Error(`Cloudinary API error: ${cloudinaryError instanceof Error ? cloudinaryError.message : 'Unknown error'}`);
    }

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
