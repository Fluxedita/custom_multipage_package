"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import { Edit, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import SimpleEditableMedia from "@/components/profile/SimpleEditableMedia"
import { useAuth } from "@/components/providers/AuthProvider"
import { updateGalleryHeroImage } from "@/app/actions/gallery"
import { toast } from "sonner"

interface GalleryHeroProps {
  defaultImage: string;
  title: string;
  subtitle: string;
  storageKey: string;
  galleryType: 'public' | 'exclusive' | 'behind-scenes';
  images: any;
  isEditMode: boolean;
  onImagesChange: (imgs: any) => void;
  onOpenMediaLibrary: () => void;
  onOpenLightbox: (imgIdx: any) => void;
  isAdmin: boolean;
}

export default function GalleryHero({ 
  defaultImage, 
  title, 
  subtitle, 
  storageKey,
  galleryType
}: GalleryHeroProps) {
  const { isAdmin } = useAuth()
  const [isEditMode, setIsEditMode] = useState(false)
  const [heroImage, setHeroImage] = useState(defaultImage)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const mediaRef = useRef<{ openEditor: () => void }>(null)

  // Load saved hero image from localStorage on component mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedHeroImage = localStorage.getItem(storageKey)
      if (savedHeroImage) {
        try {
          setHeroImage(JSON.parse(savedHeroImage))
        } catch (error) {
          console.error(`Error parsing saved hero image for ${storageKey}:`, error)
        }
      }
    }
  }, [storageKey])

  const handleImageChange = async (newImage: string) => {
    console.log('New hero image selected:', newImage);
    setHeroImage(newImage);
    setIsDirty(true);
    setIsEditMode(true); // Keep edit mode active after selection
  };

  const saveChanges = async () => {
    if (!isDirty) return;
    
    try {
      setIsSaving(true);
      
      // Save to server
      if (galleryType) {
        const result = await updateGalleryHeroImage(
          heroImage,
          galleryType,
          title,
          subtitle,
          'image'
        );
        
        if (result.success) {
          toast.success('Hero image updated successfully');
          // Save to local storage
          localStorage.setItem(storageKey, JSON.stringify(heroImage));
          setIsDirty(false);
          setIsEditMode(false); // Exit edit mode after successful save
        } else {
          throw new Error(result.error || 'Failed to update hero image');
        }
      }
    } catch (error: any) {
      console.error('Error saving hero image:', error);
      toast.error(error.message || 'Failed to update hero image');
    } finally {
      setIsSaving(false);
    }
  };

  // State for image loading and error handling
  const [imageError, setImageError] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [currentImage, setCurrentImage] = useState<string>(() => {
    // Initial state - ensure the image path is properly formatted
    const img = heroImage || defaultImage;
    return img && !img.startsWith('http') && !img.startsWith('/') ? `/${img}` : img;
  })

  // Reset image state when heroImage changes
  useEffect(() => {
    // Only update if the image source actually changes
    const newImage = heroImage || defaultImage;
    const formattedImage = newImage && !newImage.startsWith('http') && !newImage.startsWith('/') 
      ? `/${newImage}` 
      : newImage;
    
    if (formattedImage !== currentImage) {
      setImageError(false);
      setImageLoaded(false);
      setCurrentImage(formattedImage);
    }
  }, [heroImage, defaultImage, currentImage]);

  const handleImageError = () => {
    // Only log the error if we haven't already tried the default image
    if (currentImage !== defaultImage) {
      console.warn(`Failed to load image: ${currentImage}, falling back to default`);
      setCurrentImage(defaultImage);
      setImageError(false);
    } else {
      console.error(`Failed to load default image: ${defaultImage}`);
      setImageError(true);
    }
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
    setImageError(false);
  };
  
  // Determine the final image source to display
  const displayImage = imageError ? '' : currentImage;

  // Render the image or placeholder
  const renderImage = () => {
    if (imageError || !displayImage) {
      return (
        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-rose-100 to-rose-50">
          <span className="text-gray-400">No image available</span>
        </div>
      )
    }

    return (
      <div className="w-full h-full">
        <SimpleEditableMedia
          ref={mediaRef}
          src={displayImage}
          alt="Gallery Hero"
          width={1600}
          height={800}
          className="w-full h-full object-cover"
          isEditMode={isEditMode}
          onChange={handleImageChange}
        />
      </div>
    )
  }

  return (
    <div className="relative w-full h-[80vh] rounded-xl overflow-hidden">
      {/* Admin Edit Controls */}
      {isAdmin && (
        <div className="absolute top-4 right-4 z-[100] flex gap-2">
          {isEditMode ? (
            <>
              <Button 
                variant="default" 
                onClick={saveChanges} 
                disabled={!isDirty || isSaving} 
                size="sm"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setHeroImage(defaultImage);
                  setIsDirty(true);
                }} 
                size="sm"
              >
                Reset
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => {
                  setIsEditMode(false);
                  setHeroImage(defaultImage);
                  setIsDirty(false);
                }} 
                size="sm"
              >
                Cancel
              </Button>
            </>
          ) : (
            <Button 
              variant="default" 
              onClick={() => {
                if (mediaRef.current) {
                  mediaRef.current.openEditor();
                } else {
                  setIsEditMode(true);
                }
              }} 
              size="sm"
            >
              <Edit className="mr-2 h-4 w-4" /> Edit Hero
            </Button>
          )}
        </div>
      )}

      {/* Background Image Layer */}
      <div className="absolute inset-0 z-0">
        {renderImage()}
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50 z-10" />

      {/* Content Layer */}
      {!isEditMode && (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 z-20">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold text-white drop-shadow-lg mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {title}
          </motion.h1>
          <motion.p 
            className="text-lg md:text-xl text-white drop-shadow-lg max-w-2xl"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {subtitle}
          </motion.p>
        </div>
      )}
    </div>
  )
}
