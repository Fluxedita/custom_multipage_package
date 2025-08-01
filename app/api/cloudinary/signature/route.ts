import { NextResponse } from 'next/server'
import crypto from 'crypto'

export async function POST(request: Request) {
  try {
    const { timestamp } = await request.json()
    const apiSecret = process.env.CLOUDINARY_API_SECRET

    if (!apiSecret) {
      return NextResponse.json(
        { error: 'Missing Cloudinary API secret' },
        { status: 500 }
      )
    }

    const signature = crypto
      .createHash('sha1')
      .update(`timestamp=${timestamp}${apiSecret}`)
      .digest('hex')

    return NextResponse.json({ signature })
  } catch (error) {
    console.error('Error generating signature:', error)
    return NextResponse.json(
      { error: 'Failed to generate signature' },
      { status: 500 }
    )
  }
} 