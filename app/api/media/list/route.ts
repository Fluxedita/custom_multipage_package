import { NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET() {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const imagesDir = path.join(uploadsDir, 'images')
    const videosDir = path.join(uploadsDir, 'videos')

    // Ensure directories exist
    if (!fs.existsSync(imagesDir)) {
      fs.mkdirSync(imagesDir, { recursive: true })
    }
    if (!fs.existsSync(videosDir)) {
      fs.mkdirSync(videosDir, { recursive: true })
    }

    // Get all files from both directories
    const imageFiles = fs.readdirSync(imagesDir)
    const videoFiles = fs.readdirSync(videosDir)

    // Create media items for images
    const imageItems = imageFiles.map(filename => ({
      id: `img-${filename}`,
      url: `/uploads/images/${filename}`,
      name: filename,
      type: 'image' as const,
      size: fs.statSync(path.join(imagesDir, filename)).size,
      uploadedAt: fs.statSync(path.join(imagesDir, filename)).mtime.toISOString()
    }))

    // Create media items for videos
    const videoItems = videoFiles.map(filename => ({
      id: `vid-${filename}`,
      url: `/uploads/videos/${filename}`,
      name: filename,
      type: 'video' as const,
      size: fs.statSync(path.join(videosDir, filename)).size,
      uploadedAt: fs.statSync(path.join(videosDir, filename)).mtime.toISOString()
    }))

    // Combine and return all items
    return NextResponse.json([...imageItems, ...videoItems])
  } catch (error) {
    console.error('Error listing media:', error)
    return NextResponse.json(
      { error: 'Failed to list media files' },
      { status: 500 }
    )
  }
} 