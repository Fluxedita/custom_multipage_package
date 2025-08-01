import { NextResponse } from 'next/server';
import { updateMedia, deleteMedia } from '@/app/actions/gallery';
import type { MediaItem } from '@/lib/types';

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const updates = await request.json() as Partial<MediaItem>;
    const updatedMedia = await updateMedia(params.id, updates);
    return NextResponse.json(updatedMedia);
  } catch (error) {
    console.error('Error updating media:', error);
    return NextResponse.json(
      { error: 'Failed to update media' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Extract type and galleryType from the request body (or set defaults)
    let type: 'image' | 'video' = 'image';
    let galleryType: 'public' | 'exclusive' | 'behind-scenes' = 'public';
    try {
      const body = await request.json();
      if (body && body.type) type = body.type;
      if (body && body.galleryType) galleryType = body.galleryType;
    } catch (e) {
      // If no body or invalid JSON, use defaults
    }
    await deleteMedia(params.id, type, galleryType);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting media:', error);
    return NextResponse.json(
      { error: 'Failed to delete media' },
      { status: 500 }
    );
  }
} 