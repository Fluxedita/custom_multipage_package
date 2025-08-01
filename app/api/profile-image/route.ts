import { NextResponse } from 'next/server';

// Simple in-memory storage for demo purposes
const profileImages = new Map<string, string>();

export async function POST(req: Request) {
  try {
    const { imageUrl, userId } = await req.json();
    
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }
    
    // Store the image URL with the user ID
    profileImages.set(userId, imageUrl);
    
    console.log('Profile image saved for user:', userId);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error saving profile image:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return new NextResponse("User ID is required", { status: 400 });
    }
    
    // Get the stored image URL
    const profileImage = profileImages.get(userId) || null;
    
    console.log('Retrieved profile image for user:', userId, profileImage);
    return NextResponse.json({ profileImage });
  } catch (error) {
    console.error('Error fetching profile image:', error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
