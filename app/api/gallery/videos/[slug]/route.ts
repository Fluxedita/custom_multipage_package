import { NextResponse } from 'next/server';
import { getVideoBySlug } from '@/app/actions/gallery';

export async function GET(
  request: Request,
  { params }: { params: { slug: string } }
) {
  try {
    const video = await getVideoBySlug(params.slug);
    if (!video) {
      return NextResponse.json(
        { error: 'Video not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(video);
  } catch (error) {
    console.error('Error fetching video:', error);
    return NextResponse.json(
      { error: 'Failed to fetch video' },
      { status: 500 }
    );
  }
} 