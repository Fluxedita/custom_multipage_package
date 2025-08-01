"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Image from "next/image"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronLeft, ChevronRight, X, Edit, ArrowLeft, Tag, Image as ImageIcon, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import type { MediaItem } from "@/lib/types"
import { useAuth } from "@/components/providers/AuthProvider"
import { getImageSetBySlug, updateMedia } from "@/app/actions/gallery"

interface ImageDetailPageProps {
  imageSet: MediaItem;
}

const ImageDetailPage = ({ imageSet }: ImageDetailPageProps) => {
  const router = useRouter()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLightboxOpen, setIsLightboxOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const { isAdmin } = useAuth()
  
  const images = imageSet?.imageUrls?.filter((url): url is string => !!url) || []
  const currentImage = images[currentIndex] || ''

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleThumbnailClick = (index: number) => {
    setCurrentIndex(index);
  };

  const handleMainImageClick = () => {
    if (images.length > 0) {
      console.log('Opening lightbox with image:', images[currentIndex]);
      console.log('Current index:', currentIndex);
      console.log('All images:', images);
      setIsLightboxOpen(true);
    }
  };

  const handleSaveEdit = async (data: { 
    title: string; 
    description?: string; 
    isPremium?: boolean; 
    coverImage?: string | File; 
    imageUrls?: string[]; 
    tags?: string[] 
  }) => {
    if (!imageSet?.id) return { success: false, error: 'No image set selected' };
    
    try {
      // Convert File to base64 if it's a File object
      let coverImageUrl = data.coverImage;
      if (coverImageUrl instanceof File) {
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.readAsDataURL(coverImageUrl as File);
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = error => reject(error);
        });
        coverImageUrl = base64;
      }

      const updateData = {
        ...data,
        coverImage: coverImageUrl as string,
        type: 'image' as const,
        imageUrls: data.imageUrls || [],
        tags: data.tags || [],
      };

      const result = await updateMedia(imageSet.id, updateData);
      // No need to fetch data here as we receive it as a prop
      if (result) {
        setIsEditDialogOpen(false);
        return { success: true, data: result };
      }
      
      return { success: false, error: 'Failed to update image set' };
    } catch (error) {
      console.error('Error saving changes:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to save changes' 
      };
    }
  };

  useEffect(() => {
    // No need to fetch data here as we receive it as a prop
    return () => {};
  }, []);

  // Image with fallback component
  const ImageWithFallback = ({ 
    src, 
    alt, 
    className = "",
    ...props 
  }: { 
    src: string; 
    alt: string; 
    className?: string;
    [key: string]: any;
  }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [hasError, setHasError] = useState(false);
    const [imgSrc, setImgSrc] = useState(src);

    useEffect(() => {
      setImgSrc(src);
      setHasError(false);
      setIsLoading(true);
    }, [src]);

    if (!imgSrc || hasError) {
      return (
        <div className={`relative flex items-center justify-center bg-gray-100 rounded-lg ${className}`}>
          <div className="flex flex-col items-center text-gray-400">
            <ImageIcon className="w-12 h-12 mb-2" />
            <span>Image not available</span>
          </div>
        </div>
      );
    }

    return (
      <div className="relative w-full h-full">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        )}
        <Image
          src={imgSrc}
          alt={alt}
          fill
          className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            console.error(`Failed to load image: ${src}`);
            setHasError(true);
          }}
          unoptimized={imgSrc.startsWith('data:') || imgSrc.startsWith('blob:')}
          {...props}
        />
      </div>
    );
  };

  const featuredImage = images[currentIndex] || imageSet?.coverImage || '';

  if (!imageSet) {
    return (
      <div className="container mx-auto px-4 py-12">
        <div className="text-center py-12">
          <Loader2 className="h-12 w-12 mx-auto animate-spin text-gray-400 mb-4" />
          <p className="text-gray-600">Loading image set...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="flex justify-between items-center mb-8">
        <Link href="/gallery" className="flex items-center text-gray-600 hover:text-gray-900">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Gallery
        </Link>

        {isAdmin && (
          <Button onClick={() => setIsEditDialogOpen(true)} variant="outline" className="flex items-center">
            <Edit className="h-4 w-4 mr-2" />
            Edit Image Set
          </Button>
        )}
      </div>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{imageSet?.title}</h1>
        <p className="text-gray-600 mb-4">{imageSet?.description}</p>

        {imageSet?.tags && imageSet.tags.length > 0 && (
          <div className="flex items-center gap-2 mb-4">
            <Tag className="h-4 w-4 text-gray-500" />
            {imageSet.tags.map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {imageSet?.isPremium && <Badge className="bg-rose-500">Premium Content</Badge>}
      </div>

      {/* Featured Image */}
      <div className="relative w-full h-[60vh] mb-8 rounded-lg overflow-hidden">
        <div className="w-full h-full">
          <ImageWithFallback
            src={featuredImage}
            alt={`${imageSet?.title || 'Image'} - Featured`}
            className="object-contain bg-gray-50 cursor-zoom-in"
            onClick={handleMainImageClick}
          />
        </div>

        {images.length > 1 && (
          <>
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full h-10 w-10"
              onClick={handlePrevious}
            >
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/30 text-white hover:bg-black/50 rounded-full h-10 w-10"
              onClick={handleNext}
            >
              <ChevronRight className="h-6 w-6" />
            </Button>
          </>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4 mb-8">
          {images.map((image, index) => (
            <div
              key={image}
              className={`relative aspect-square rounded-md overflow-hidden cursor-pointer border-2 transition-colors ${
                index === currentIndex ? "border-rose-500" : "border-transparent hover:border-gray-300"
              }`}
              onClick={() => handleThumbnailClick(index)}
            >
              <ImageWithFallback
                src={image}
                alt={`${imageSet?.title || 'Image'} - ${index + 1}`}
                className="object-cover hover:opacity-90 transition-opacity w-full h-full"
              />
            </div>
          ))}
        </div>
      )}

      {/* Lightbox */}
      <AnimatePresence mode="wait">
        {isLightboxOpen && (
          <motion.div
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setIsLightboxOpen(false)}
          >
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
              onClick={(e) => {
                e.stopPropagation();
                setIsLightboxOpen(false);
              }}
            >
              <X className="h-8 w-8" />
            </button>

            <div className="relative w-full h-[90vh] max-w-6xl" onClick={(e) => e.stopPropagation()}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="relative w-full h-full flex items-center justify-center p-4"
                >
                  <div className="relative w-full h-full max-w-full max-h-full bg-black/20 rounded-lg overflow-hidden">
                    {images[currentIndex] && (
                      <ImageWithFallback
                        src={images[currentIndex]}
                        alt={`${imageSet.title} - Full View`}
                        className="object-contain"
                        fill
                        sizes="(max-width: 1024px) 90vw, 80vw"
                        priority
                        unoptimized={images[currentIndex].startsWith('/')}
                      />
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePrevious();
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleNext();
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
                  >
                    <ChevronRight className="h-8 w-8" />
                  </button>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {isAdmin && isEditDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">Edit Image Set</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  defaultValue={imageSet.title}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={3}
                  defaultValue={imageSet.description}
                />
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPremium"
                  defaultChecked={imageSet.isPremium}
                  className="h-4 w-4 text-rose-500 rounded"
                />
                <label htmlFor="isPremium" className="ml-2 text-sm text-gray-700">
                  Premium Content
                </label>
              </div>
              <div className="flex justify-end gap-4 mt-6">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="button"
                  onClick={async () => {
                    // Handle save logic here
                    setIsEditDialogOpen(false);
                  }}
                >
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageDetailPage;
