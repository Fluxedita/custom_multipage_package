import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { timestamp, publicId, uploadPreset } = await request.json();
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!apiSecret) {
      throw new Error('CLOUDINARY_API_SECRET is not set');
    }

    // Create the signature
    const signatureStr = `public_id=${publicId}&timestamp=${timestamp}&upload_preset=${uploadPreset}${apiSecret}`;
    const signature = crypto
      .createHash('sha1')
      .update(signatureStr)
      .digest('hex');

    return NextResponse.json(signature);
  } catch (error) {
    console.error('Error generating signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    );
  }
}
