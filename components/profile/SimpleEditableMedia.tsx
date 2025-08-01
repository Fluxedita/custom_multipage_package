"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import Image from "next/image";
import { CloudinaryResponse } from "@/lib/cloudinary";
import { Camera, Edit, Image as ImageIcon, User, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaLibrary from "@/components/media/MediaLibrary";
import { useProfileEdit } from "./ProfileEditContext";
import { cn } from "@/lib/utils";
import { cloudinary } from "@/lib/cloudinary";

interface SimpleEditableMediaProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  isEditMode?: boolean;
  onChange?: (url: string, mediaType: 'image' | 'video', width?: number, height?: number) => void;
  type?: 'image' | 'video' | 'all';
}

const SimpleEditableMedia = forwardRef<{ openEditor: () => void }, SimpleEditableMediaProps>((props, ref) => {
  // DEBUG: Log all props
  console.log('SimpleEditableMedia render:', { src: props.src, alt: props.alt, width: props.width, height: props.height, className: props.className });
  const {
    src,
    alt,
    className = "",
    priority = false,
    isEditMode = false,
    onChange,
    type = 'image',
  } = props;

  const isVideo = src?.match(/\.(mp4|webm|mov|avi|mkv)$/i) || type === 'video';
  const height = isVideo ? 720 : 600;

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('upload');
  const [selectedMedia, setSelectedMedia] = useState<string | null>(null);
  const [mediaDimensions, setMediaDimensions] = useState<{ width: number; height: number } | null>(null);
  const { isEditMode: contextEditMode, setIsDirty } = useProfileEdit() || {};
  
  // Use the context's isEditMode if not explicitly provided
  const editMode = isEditMode || contextEditMode;

  const handleSaveMedia = (url: string, type?: 'image' | 'video', dimensions?: { width: number; height: number }) => {
    console.log('Media selected:', { url, type, dimensions });
    setSelectedMedia(url);
    // Prefer dimensions from argument, then props, then fallback
    const finalDimensions = dimensions || {
      width: props.width ?? mediaDimensions?.width ?? (type === 'video' ? 1280 : 800),
      height: props.height ?? mediaDimensions?.height ?? (type === 'video' ? 720 : 600)
    };
    setMediaDimensions(finalDimensions);
    
    // Set dirty state immediately when media is selected
    if (setIsDirty) {
      setIsDirty(true);
    }
  };

  const handleConfirm = () => {
    if (!selectedMedia) return;

    try {
      const mediaType = selectedMedia.match(/\.(mp4|webm|mov|avi|mkv)$/i) ? 'video' : 'image';
      let finalUrl = selectedMedia;

      // Handle placeholder SVGs
      if (selectedMedia.startsWith('/placeholder.svg')) {
        const [width, height] = selectedMedia.match(/width=(\d+)&height=(\d+)/)?.slice(1) || [1920, 1080];
        const svgUrl = new URL(selectedMedia, window.location.origin);
        svgUrl.search = `width=${width}&height=${height}`;
        finalUrl = svgUrl.toString();
      } 
      // If it's already a full URL (from media library), use it as-is
      else if (selectedMedia.startsWith('http://') || selectedMedia.startsWith('https://')) {
        finalUrl = selectedMedia;
      }
      // For public_ids, generate a Cloudinary URL
      else {
        const publicIdMatch = selectedMedia.match(/portfolio-assets\/([^?]+)/);
        const publicId = publicIdMatch ? publicIdMatch[1] : selectedMedia;
        
        finalUrl = cloudinary.url(publicId, {
          resource_type: mediaType === 'video' ? 'video' : 'image',
          secure: true,
          width: 1920,
          height: 1080,
          crop: 'fill',
          quality: 'auto',
          format: 'auto'
        });
      }

      // Get dimensions
      const width = mediaDimensions?.width ?? props.width ?? (mediaType === 'video' ? 1280 : 800);
      const height = mediaDimensions?.height ?? props.height ?? (mediaType === 'video' ? 720 : 600);

      // Call onChange with the final URL, media type, and dimensions
      if (onChange) {
        onChange(finalUrl, mediaType, width, height);
      }
      
      // Close the dialog and reset state
      setIsDialogOpen(false);
      setSelectedMedia(null);
      
      // Set dirty state to enable save button
      if (setIsDirty) {
        setIsDirty(true);
      }
    } catch (error) {
      console.error('Error in handleConfirm:', error);
      // You can add error handling UI here if needed
    }
  };

  const handleCancel = () => {
    console.log('Canceling media selection');
    setIsDialogOpen(false);
    setSelectedMedia(null);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDialogOpen(true);
  };

  // Expose the openEditor method to parent components
  const openEditor = () => {
    setIsDialogOpen(true);
  };

  // Forward the ref to expose the openEditor method
  useImperativeHandle(ref, () => ({
    openEditor,
  }));

  return (
    <div
      className={cn("relative group w-full h-full", className)}
    >
      <div className="relative w-full h-full">

        {src ? (
          isVideo ? (
            <video
              src={src}
              className="w-full h-full object-cover"
              controls={!editMode}
              muted
              playsInline
              ref={el => {
                // Assign ref for hover play/pause
                if (el) {
                  el.onmouseenter = () => { el.play(); };
                  el.onmouseleave = () => { el.pause(); el.currentTime = 0; };
                }
              }}
            />
          ) : (
            <div className="relative w-full h-full">
              <div className="relative w-full h-full">
                <Image
                  src={src}
                  alt={alt}
                  className={cn("object-cover w-full h-full", {
                    'brightness-90': editMode,
                    'opacity-0': !src || src === '/images/contact-details.jpg' // Hide while loading
                  })}
                  priority={priority}
                  unoptimized={src.startsWith('data:')}
                  {...(!mediaDimensions ? { width: 800, height: 600 } : { fill: true, sizes: '100vw' })}
                />
                {(!src || src === '/images/contact-details.jpg') && (
                  <div className="absolute inset-0 bg-gray-100 flex flex-col items-center justify-center text-gray-400">
                    <User className="h-16 w-16 mb-2 text-gray-300" />
                    <span className="text-sm">Profile image</span>
                  </div>
                )}
              </div>
            </div>
          )
        ) : (
          <div className="w-full h-full bg-gray-100 flex flex-col items-center justify-center text-gray-400">
            {isVideo ? (
              <Video className="h-12 w-12 mb-2" />
            ) : (
              <User className="h-12 w-12 mb-2" />
            )}
            <span className="text-sm">{isVideo ? 'No video selected' : 'No image selected'}</span>
          </div>
        )}
        
        {editMode && (
          <button
            onClick={handleEditClick}
            className={cn(
              type === "image" && editMode
                ? "absolute top-4 left-4 bg-black/50 flex items-center justify-center rounded-full p-2 transition-opacity cursor-pointer opacity-100 z-[99] pointer-events-auto"
                : "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity cursor-pointer",
              editMode ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            aria-label="Edit image"
            style={type === "image" && editMode ? { zIndex: 99, pointerEvents: 'auto' } : { zIndex: 50 }}
          >
            <div className="bg-white/90 hover:bg-white text-black p-2 rounded-full">
              <Edit className="h-6 w-6" />
            </div>
          </button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        if (!open) {
          handleCancel();
        }
      }}>
        <DialogContent 
          className="max-w-2xl max-h-[80vh] overflow-y-auto"
          aria-label="Select media"
          aria-describedby="media-dialog-description"
        >
          <DialogHeader>
            <DialogTitle>Select Media</DialogTitle>
            <p id="media-dialog-description" className="text-sm text-muted-foreground">
              Choose an image or video from your media library
            </p>
          </DialogHeader>
          <DialogHeader>
            <DialogTitle>Update {isVideo ? 'Video' : 'Image'}</DialogTitle>
            <p className="text-sm text-muted-foreground">
              {isVideo 
                ? 'Upload a new video or select one from your media library'
                : 'Upload a new image or select one from your media library'}
            </p>
          </DialogHeader>
          <div className="py-4">
            <Tabs 
              value={selectedTab} 
              onValueChange={setSelectedTab}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="upload">Upload New</TabsTrigger>
                <TabsTrigger value="library">Media Library</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="mt-4">
                <div className="h-[400px] overflow-y-auto">
                <MediaLibrary 
                  type={isVideo ? 'video' : 'image'}
                  onSelectAction={handleSaveMedia}
                  isDialog={true}
                  onCloseAction={handleCancel}
                />
                </div>
              </TabsContent>
              
              <TabsContent value="library" className="mt-4">
                <div className="h-[400px] overflow-y-auto">
                  <MediaLibrary 
                    type={isVideo ? 'video' : 'image'}
                    onSelectAction={handleSaveMedia}
                    isDialog={true}
                    onCloseAction={handleCancel}
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
          <DialogFooter className="flex justify-end gap-2">
            <Button variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!selectedMedia}
              className="min-w-[100px]"
            >
              {selectedMedia ? 'Confirm' : 'Select Media'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
});

SimpleEditableMedia.displayName = 'SimpleEditableMedia';

export default SimpleEditableMedia;
