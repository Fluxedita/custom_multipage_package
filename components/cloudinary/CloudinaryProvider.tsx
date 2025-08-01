'use client'

import { CldUploadWidget } from 'next-cloudinary'
import { createContext, useContext, useCallback } from 'react'
import { toast } from 'sonner'

type CloudinaryContextType = {
  openUploadWidget: (options?: any) => void
}

export const CloudinaryContext = createContext<CloudinaryContextType | null>(null)

export function CloudinaryProvider({ children }: { children: React.ReactNode }) {
  const onUpload = useCallback((result: any, { widget }: { widget: any }) => {
    if (result.event === 'success') {
      toast.success('Media uploaded successfully')
    } else if (result.event === 'error') {
      console.error('Upload error:', result.info)
      toast.error('Failed to upload media')
      widget?.close({ quiet: true })
    }
  }, [])

  return (
    <CldUploadWidget
      uploadPreset={process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET}
      onUpload={onUpload}
      options={{
        multiple: false,
        resourceType: 'auto',
        maxFileSize: 10485760, // 10MB
        clientAllowedFormats: ['image', 'video'],
        maxVideoFileSize: 10485760, // 10MB
        sources: ['local', 'url', 'camera', 'google_drive', 'dropbox'],
        styles: {
          palette: {
            window: '#FFFFFF',
            sourceBg: '#F4F4F5',
            windowBorder: '#90A0B3',
            tabIcon: '#0078FF',
            inactiveTabIcon: '#555A5F',
            menuIcons: '#555A5F',
            link: '#0078FF',
            action: '#FF620C',
            inProgress: '#0078FF',
            complete: '#20B832',
            error: '#E63737',
            textDark: '#000000',
            textLight: '#FFFFFF',
          },
        },
      }}
    >
      {({ open }) => (
        <CloudinaryContext.Provider
          value={{
            openUploadWidget: (options = {}) => open(undefined, options),
          }}
        >
          {children}
        </CloudinaryContext.Provider>
      )}
    </CldUploadWidget>
  )
}

export const useCloudinary = () => {
  const context = useContext(CloudinaryContext)
  if (!context) {
    throw new Error('useCloudinary must be used within a CloudinaryProvider')
  }
  return context
}
