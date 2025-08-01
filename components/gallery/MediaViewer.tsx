"use client";

import { MediaItem } from "@/lib/types";
import Image from "next/image";
import { useState } from "react";
import PremiumContentGuard from "./PremiumContentGuard";
import { Loader2, Image as ImageIcon } from "lucide-react";

interface MediaViewerProps {
  media: MediaItem;
}

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

  if (!src || hasError) {
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
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
      )}
      <Image
        src={src}
        alt={alt}
        className={`${className} ${isLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-300`}
        onLoad={() => setIsLoading(false)}
        onError={() => {
          console.error(`Failed to load image: ${src}`);
          setHasError(true);
        }}
        {...props}
      />
    </div>
  );
};

export function MediaViewer({ media }: MediaViewerProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  if (media.type === 'video') {
    const [hasError, setHasError] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement, Event>) => {
      console.error('Video playback error:', e);
      setHasError(true);
      setIsLoading(false);
    };

    const handleVideoLoad = () => {
      setIsLoading(false);
      setHasError(false);
    };

    return (
      <PremiumContentGuard isPremium={media.isPremium}>
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{media.title}</h1>
          {media.description && (
            <p className="text-gray-600">{media.description}</p>
          )}
          <div className="aspect-video relative bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
              </div>
            )}
            
            {!hasError && media.videoUrl ? (
              <>
                <video
                  key={media.videoUrl} // Force re-render when URL changes
                  src={media.videoUrl}
                  controls
                  className={`w-full h-full object-contain ${isLoading ? 'opacity-0' : 'opacity-100'}`}
                  poster={media.coverImage}
                  onError={handleVideoError}
                  onCanPlay={handleVideoLoad}
                  onLoadedData={handleVideoLoad}
                  preload="metadata"
                >
                  <source src={media.videoUrl} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
                {hasError && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-75 text-white p-4 text-center">
                    <p className="text-lg font-medium mb-2">Error loading video</p>
                    <p className="text-sm text-gray-300 mb-4">The video could not be loaded. Please try again later.</p>
                    <button
                      onClick={() => {
                        setHasError(false);
                        setIsLoading(true);
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                    >
                      Retry
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center p-6">
                <p className="text-gray-500">Video not available</p>
                {media.coverImage && (
                  <div className="mt-4">
                    <Image
                      src={media.coverImage}
                      alt={media.title}
                      width={800}
                      height={450}
                      className="max-w-full h-auto rounded-lg"
                    />
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Video URL for debugging */}
          {process.env.NODE_ENV === 'development' && media.videoUrl && (
            <div className="mt-4 p-3 bg-gray-100 rounded text-xs break-all">
              <p className="font-medium text-gray-700">Video Source:</p>
              <code className="text-gray-600">{media.videoUrl}</code>
            </div>
          )}
        </div>
      </PremiumContentGuard>
    );
  }

  // At this point, TypeScript knows media is an image type
  const supportingImages = media.imageUrls?.filter(url => !!url) || [];
  const hasImages = supportingImages.length > 0;
  const currentImage = supportingImages[currentImageIndex] || '';

  return (
    <PremiumContentGuard isPremium={media.isPremium}>
      <div className="space-y-8">
        {/* Hero section with cover image */}
        <div className="space-y-4">
          <h1 className="text-3xl font-bold">{media.title}</h1>
          {media.description && (
            <p className="text-gray-600">{media.description}</p>
          )}
          
          {/* Cover image */}
          <div className="relative aspect-[4/3] w-full">
            <ImageWithFallback
              src={media.coverImage}
              alt={`${media.title} - Cover Image`}
              fill
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>

        {/* Supporting images section */}
        {hasImages ? (
          <div className="space-y-4">
            <h2 className="text-2xl font-semibold">Gallery</h2>
            
            {/* Main supporting image display */}
            <div className="relative aspect-[4/3] w-full">
              <ImageWithFallback
                src={currentImage}
                alt={`${media.title} - Image ${currentImageIndex + 1}`}
                fill
                className="object-cover rounded-lg"
              />
            </div>

            {/* Thumbnail navigation */}
            {supportingImages.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {supportingImages.map((url, index) => (
                  <button
                    key={url}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`relative aspect-square transition-opacity ${
                      currentImageIndex === index
                        ? 'ring-2 ring-primary opacity-100'
                        : 'opacity-70 hover:opacity-100'
                    }`}
                  >
                    <ImageWithFallback
                      src={url}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover rounded-md"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500">
            <p>No additional images available</p>
          </div>
        )}
      </div>
    </PremiumContentGuard>
  );
}