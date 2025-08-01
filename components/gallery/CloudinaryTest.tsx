'use client'

import { useEffect } from 'react'
import { toast } from 'sonner'

export default function CloudinaryTest() {
  useEffect(() => {
    const config = {
      cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
      uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET,
    }

    console.log('Cloudinary Config:', config)

    // Check if all required values are present
    const missingValues = Object.entries(config)
      .filter(([_, value]) => !value)
      .map(([key]) => key)

    if (missingValues.length > 0) {
      toast.error(`Missing Cloudinary configuration: ${missingValues.join(', ')}`)
    } else {
      toast.success('Cloudinary configuration loaded successfully')
    }
  }, [])

  return null
} 