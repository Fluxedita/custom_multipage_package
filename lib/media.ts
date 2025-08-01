import { cloudinary } from './cloudinary';

export function getMediaDimensions(url: string): { width?: number; height?: number } {
  // Extract dimensions from Cloudinary URL parameters
  const dimensionsMatch = url.match(/w_(\d+),h_(\d+)/);
  if (dimensionsMatch) {
    return {
      width: parseInt(dimensionsMatch[1]),
      height: parseInt(dimensionsMatch[2])
    };
  }

  // Try to get dimensions from Cloudinary metadata if available
  try {
    const publicId = url.split('/').pop() || '';
    const metadata = cloudinary.url(publicId, {
      secure: true,
      transformation: [{ width: 1, height: 1, crop: 'scale' }]
    });
    
    // Extract dimensions from the transformation
    const transformMatch = metadata.match(/w_(\d+),h_(\d+)/);
    if (transformMatch) {
      return {
        width: parseInt(transformMatch[1]),
        height: parseInt(transformMatch[2])
      };
    }
  } catch (error) {
    console.error('Error getting media dimensions:', error);
  }

  // Default dimensions
  return {
    width: 1920,
    height: 1080
  };
}
