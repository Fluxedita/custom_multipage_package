'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { FileUploader } from '@/components/ui/file-uploader'
import MediaLibrary from '@/components/media/MediaLibrary'

interface ImageUploadDialogProps {
  isOpen: boolean
  onClose: () => void
  onImageUploaded: (url: string) => void
  aspectRatio: string
  title: string
  description: string
}

export default function ImageUploadDialog({
  isOpen,
  onClose,
  onImageUploaded,
  aspectRatio,
  title,
  description,
}: ImageUploadDialogProps) {
  const [uploadTab, setUploadTab] = useState<'upload' | 'url' | 'library'>('upload')
  const [imageUrl, setImageUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedImage, setSelectedImage] = useState('')

  const handleUrlSubmit = async () => {
    if (!imageUrl) {
      setError('Please enter an image URL')
      return
    }

    try {
      setIsLoading(true)
      setError(null)

      // Validate URL
      const url = new URL(imageUrl)
      if (!url.protocol.startsWith('http')) {
        throw new Error('Invalid URL protocol')
      }

      // Check if image exists and is accessible
      const response = await fetch(imageUrl, { method: 'HEAD' })
      if (!response.ok) {
        throw new Error('Image not accessible')
      }

      // Check if it's an image
      const contentType = response.headers.get('content-type')
      if (!contentType?.startsWith('image/')) {
        throw new Error('URL does not point to an image')
      }

      // If the image is already on our server, use it directly
      if (imageUrl.startsWith('/')) {
        onImageUploaded(imageUrl)
        onClose()
        return
      }

      // Otherwise, upload it to our server
      const formData = new FormData()
      formData.append('url', imageUrl)

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload image')
      }

      const { url: uploadedUrl } = await uploadResponse.json()
      onImageUploaded(uploadedUrl)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to process image URL')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileUpload = async (file: File) => {
    try {
      setIsLoading(true)
      setError(null)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Failed to upload image')
      }

      const { url } = await response.json()
      onImageUploaded(url)
      onClose()
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to upload image')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p className="text-sm text-gray-500 mb-4">{description}</p>

          <Tabs value={uploadTab} onValueChange={(value) => setUploadTab(value as 'upload' | 'url' | 'library')}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
              <TabsTrigger value="library">Library</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="mt-4">
              <FileUploader
                onFileSelect={handleFileUpload}
                accept="image/*"
                maxSize={5 * 1024 * 1024} // 5MB
                aspectRatio={aspectRatio}
                isLoading={isLoading}
              />
            </TabsContent>

            <TabsContent value="url" className="mt-4">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    disabled={isLoading}
                  />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button
                  onClick={handleUrlSubmit}
                  disabled={isLoading || !imageUrl}
                  className="w-full"
                >
                  {isLoading ? 'Processing...' : 'Use Image URL'}
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="library" className="mt-4">
              <div className="h-[400px] overflow-y-auto">
              <MediaLibrary
                onSelectAction={(url: string) => {
                  setSelectedImage(url);
                  onImageUploaded(url);
                  onClose();
                }}
                type="image"
                isDialog={true}
                onCloseAction={onClose}
                selectedUrl={selectedImage}
              />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  )
} 