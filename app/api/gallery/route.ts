import { NextResponse } from 'next/server';
import { getGalleryData, createMedia } from '@/app/actions/gallery';
import type { MediaItem } from '@/lib/types';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') as 'public' | 'exclusive' | 'behind-scenes' || 'public';
    
    const data = await getGalleryData(type);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching gallery data:', error);
    return NextResponse.json(
      { error: 'Failed to fetch gallery data' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const media = await request.json() as Omit<MediaItem, "id" | "createdAt" | "updatedAt">;
    const newMedia = await createMedia(media);
    return NextResponse.json(newMedia);
  } catch (error) {
    console.error('Error creating media:', error);
    return NextResponse.json(
      { error: 'Failed to create media' },
      { status: 500 }
    );
  }
} 