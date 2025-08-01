import { NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

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

export async function GET() {
  try {
    console.log('Cloudinary configuration:', {
      cloud_name,
      api_key: api_key ? 'set' : 'unset',
      api_secret: api_secret ? 'set' : 'unset'
    });

    // First, let's test basic configuration
    console.log('Testing Cloudinary configuration...');
    
    // Try to list all images
    try {
      const result = await cloudinary.api.resources({
        type: 'upload',
        resource_type: 'image',
        max_results: 10,
        prefix: 'portfolio-assets'  // Using the same prefix as in your main route
      });

      console.log('Cloudinary API response:', {
        resources: result.resources?.length || 0,
        total_count: result.total_count
      });

      // Try to generate a URL for a specific image
      const testImage = result.resources?.[0];
      const imageUrl = testImage ? cloudinary.url(testImage.public_id, {
        width: 300,
        height: 300,
        crop: 'fill'
      }) : null;

      return NextResponse.json({
        success: true,
        message: 'Cloudinary test successful',
        data: {
          config: {
            cloudName: cloud_name,
            apiKey: api_key ? 'set' : 'unset',
            apiSecret: api_secret ? 'set' : 'unset'
          },
          images: result.resources,
          testImageUrl: imageUrl,
          testImage: testImage
        }
      });
    } catch (apiError) {
      console.error('Cloudinary API error:', {
        error: apiError,
        message: apiError instanceof Error ? apiError.message : 'Unknown API error',
        stack: apiError instanceof Error ? apiError.stack : undefined
      });
      
      return NextResponse.json({
        success: false,
        error: 'Failed to fetch images from Cloudinary',
        details: apiError instanceof Error ? {
          message: apiError.message,
          name: apiError.name
        } : undefined,
        timestamp: new Date().toISOString()
      }, { status: 500 });
    }
  } catch (error) {
    console.error('Cloudinary test failed:', {
      error: error,
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });

    return NextResponse.json({
      success: false,
      error: 'Failed to initialize Cloudinary',
      details: error instanceof Error ? {
        message: error.message,
        name: error.name
      } : undefined,
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}
