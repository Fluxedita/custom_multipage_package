'use client'

import { useState, useCallback } from 'react'
import { useCloudinary } from '@/components/cloudinary/CloudinaryProvider'
import { toast } from 'sonner'

export function useCloudinaryUpload() {
  const [isUploading, setIsUploading] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const { openUploadWidget } = useCloudinary()

  const uploadFile = useCallback(
    (options: {
      onSuccess?: (result: any) => void
      onError?: (error: Error) => void
      folder?: string
      resourceType?: 'image' | 'video' | 'auto'
    } = {}) => {
      setIsUploading(true)
      setUploadError(null)

      return new Promise((resolve, reject) => {
        try {
          openUploadWidget({
            ...options,
            onSuccess: (result: any) => {
              setIsUploading(false)
              options.onSuccess?.(result)
              resolve(result)
            },
            onError: (error: any) => {
              console.error('Upload error:', error)
              setIsUploading(false)
              setUploadError(error?.message || 'Failed to upload file')
              toast.error('Failed to upload file')
              options.onError?.(error)
              reject(error)
            },
          })
        } catch (error) {
          console.error('Error opening upload widget:', error)
          setIsUploading(false)
          setUploadError('Failed to open upload widget')
          toast.error('Failed to open upload widget')
          options.onError?.(error as Error)
          reject(error)
        }
      })
    },
    [openUploadWidget]
  )

  return { uploadFile, isUploading, error: uploadError }
}
