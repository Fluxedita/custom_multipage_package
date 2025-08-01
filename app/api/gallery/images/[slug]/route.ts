import { NextResponse } from 'next/server';
import { getImageSetBySlug } from '@/app/actions/gallery';

interface Params {
  params: {
    slug: string;
  };
}

export async function GET(
  request: Request,
  { params }: Params
) {
  try {
    const imageSet = await getImageSetBySlug(params.slug);
    if (!imageSet) {
      return NextResponse.json(
        { error: 'Image set not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(imageSet);
  } catch (error) {
    console.error('Error fetching image set:', error);
    return NextResponse.json(
      { error: 'Failed to fetch image set' },
      { status: 500 }
    );
  }
} 