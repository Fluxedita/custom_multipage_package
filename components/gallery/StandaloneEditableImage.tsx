"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Camera, X, Upload, Edit, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import FileUploader from "@/components/gallery/FileUploader"

interface StandaloneEditableImageProps {
  src: string
  alt: string
  className?: string
  aspectRatio?: "square" | "portrait" | "landscape" | "cover" | "contain"
  width?: number
  height?: number
  priority?: boolean
  onChangeAction: (url: string) => void
  type?: "profile" | "background" | "gallery"
  isEditMode: boolean
  onDirtyChange?: (isDirty: boolean) => void
}

export default function StandaloneEditableImage({
  src,
  alt,
  className = "",
  aspectRatio = "cover",
  width,
  height,
  priority = false,
  onChangeAction,
  type = "gallery",
  isEditMode,
  onDirtyChange,
}: StandaloneEditableImageProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [previewImage, setPreviewImage] = useState<string>(src)
  const [uploadTab, setUploadTab] = useState<"upload" | "url" | "samples">("samples")
  const [imageUrl, setImageUrl] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isImageLoading, setIsImageLoading] = useState(false)
  const [imageLoadError, setImageLoadError] = useState<boolean>(false)

  // Update preview image when src changes
  useEffect(() => {
    setPreviewImage(src)
    setImageLoadError(false)
  }, [src])

  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case "square":
        return "aspect-square"
      case "portrait":
        return "aspect-[3/4]"
      case "landscape":
        return "aspect-[4/3]"
      case "cover":
        return "object-cover"
      case "contain":
        return "object-contain"
      default:
        return "object-cover"
    }
  }

  // Update the uploadCompleteAction handler to accept a File instead of a string
  const handleUploadComplete = (file: File) => {
    // Implement your logic to handle the uploaded file
    // For example, you might want to generate a URL or process the file
    // ...your logic here...
  }

  const handleUrlSubmit = () => {
    if (imageUrl) {
      setIsImageLoading(true)
      setError(null)

      // Test if the image URL is valid
      const img = new window.Image()
      img.onload = () => {
        setPreviewImage(imageUrl)
        onChangeAction(imageUrl)
        onDirtyChange?.(true)
        setIsDialogOpen(false)
        setIsImageLoading(false)
        setImageLoadError(false)
      }
      img.onerror = () => {
        setError("Could not load image from the provided URL. Please check the URL and try again.")
        setIsImageLoading(false)
      }
      img.src = imageUrl
    }
  }

  const handleImageError = () => {
    console.error(`Failed to load image: ${previewImage}`)
    setImageLoadError(true)
  }

  const handleSampleImageSelect = (url: string) => {
    setPreviewImage(url)
    onChangeAction(url)
    onDirtyChange?.(true)
    setImageLoadError(false)
  }

  // Determine which image to display
  const getDisplayImage = () => {
    if (imageLoadError) return "/placeholder.svg"
    if (!previewImage) return "/placeholder.svg"
    
    // Handle relative paths
    if (previewImage && !previewImage.startsWith('http') && !previewImage.startsWith('/') && !previewImage.startsWith('data:')) {
      return `/${previewImage}`
    }
    
    return previewImage
  }
  
  const displayImage = getDisplayImage()
  
  // Check if the image is a data URL or blob URL
  const isUnoptimized = Boolean(
    (previewImage && previewImage.startsWith("data:")) || 
    (previewImage && previewImage.startsWith("blob:"))
  )

  if (!isEditMode) {
    return (
      <>
        <Image
          src={displayImage}
          alt={alt}
          fill={width === undefined || height === undefined}
          width={width}
          height={height}
          className={`${getAspectRatioClass()} ${className}`}
          priority={priority}
          onError={handleImageError}
          unoptimized={isUnoptimized}
        />
        {imageLoadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70">
            <div className="text-center p-4">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Image could not be loaded</p>
            </div>
          </div>
        )}
      </>
    )
  }

  return (
    <>
      <div className="group relative cursor-pointer">
        <Image
          src={displayImage}
          alt={alt}
          fill={width === undefined || height === undefined}
          width={width}
          height={height}
          className={`${getAspectRatioClass()} ${className}`}
          priority={priority}
          onError={handleImageError}
          unoptimized={isUnoptimized}
        />

        {imageLoadError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-70 z-10">
            <div className="text-center p-4">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto mb-2" />
              <p className="text-sm text-gray-700">Image could not be loaded</p>
              <p className="text-xs text-gray-500 mt-1">Click to replace</p>
            </div>
          </div>
        )}

        {/* Always visible edit overlay in edit mode */}
        <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity flex items-center justify-center z-20">
          {/* Edit button */}
          <Button
            variant="secondary"
            size="sm"
            className="absolute top-2 right-2 bg-white hover:bg-gray-100 text-gray-800 shadow-md"
            onClick={() => setIsDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-1" />
            Edit
          </Button>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Image</DialogTitle>
          </DialogHeader>
          
          <Tabs value={uploadTab} onValueChange={(value) => setUploadTab(value as any)} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-4">
              <TabsTrigger value="samples">Samples</TabsTrigger>
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="url">URL</TabsTrigger>
            </TabsList>
            
            <TabsContent value="samples" className="mt-0">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[
                  "/images/hero-1.jpg",
                  "/images/hero-2.jpg",
                  "/images/hero-3.jpg",
                ].map((sample) => (
                  <button
                    key={sample}
                    className="relative aspect-video rounded-md overflow-hidden hover:ring-2 hover:ring-primary transition-all"
                    onClick={() => handleSampleImageSelect(sample)}
                  >
                    <Image
                      src={sample}
                      alt="Sample background"
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            </TabsContent>
            
            <TabsContent value="upload" className="mt-0">
              <FileUploader
                uploadCompleteAction={handleUploadComplete}
                type="images"
                className="min-h-[200px]"
              />
            </TabsContent>
            
            <TabsContent value="url" className="mt-0">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="imageUrl">Image URL</Label>
                  <Input
                    id="imageUrl"
                    type="url"
                    placeholder="https://example.com/image.jpg"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  onClick={handleUrlSubmit} 
                  disabled={!imageUrl || isImageLoading}
                  className="w-full"
                >
                  {isImageLoading ? "Loading..." : "Use Image"}
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {error && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
