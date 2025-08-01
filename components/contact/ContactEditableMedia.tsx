"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import Image from "next/image";
import { Camera, Edit, Image as ImageIcon, User, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaLibrary from "@/components/media/MediaLibrary";
import { useContactEdit } from "./ContactEditContext";
import { cn } from "@/lib/utils";

interface ContactEditableMediaProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  onChange?: (url: string) => void;
  type?: 'image' | 'video' | 'all';
}

const ContactEditableMedia = forwardRef<{ openEditor: () => void }, ContactEditableMediaProps>((props, ref) => {
  const {
    src,
    alt,
    width,
    height,
    className = "",
    priority = false,
    onChange,
    type = 'image',
  } = props;
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { isEditMode, setIsDirty } = useContactEdit();
  
  // Determine if the source is a video based on type or file extension
  const isVideo = type === 'video' || (src?.match(/\.(mp4|webm|mov|avi|mkv)$/i));
  
  // Get media type for FileUploader (only accepts 'images' or 'videos')
  const getFileUploaderType = (): 'images' | 'videos' => {
    return isVideo ? 'videos' : 'images';
  };
  
  // Get media type for MediaLibrary (accepts 'image', 'video', or 'all')
  const getMediaLibraryType = () => {
    if (type === 'all') return 'all' as const;
    return isVideo ? 'video' as const : 'image' as const;
  };
  
  const fileUploaderType = getFileUploaderType();
  const mediaLibraryType = getMediaLibraryType();

  const handleSaveMedia = (url: string) => {
    console.log('Saving media URL:', url);
    if (onChange) {
      onChange(url);
      setIsDirty(true);
    }
    setIsDialogOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isEditMode) {
      setIsDialogOpen(true);
    }
  };

  // Expose the openEditor method to parent components
  const openEditor = () => {
    if (isEditMode) {
      setIsDialogOpen(true);
    }
  };

  // Forward the ref to expose the openEditor method
  useImperativeHandle(ref, () => ({
    openEditor,
  }));

  // If there's no source or it's a transparent pixel, show a placeholder
  if (!src || src.includes('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=')) {
    return (
      <div 
        className={cn(
          "bg-gray-100 flex flex-col items-center justify-center gap-4",
          className,
          isEditMode && "cursor-pointer hover:bg-gray-200 transition-colors"
        )}
        onClick={handleEditClick}
      >
        <Camera className="w-12 h-12 text-gray-400" />
        {isEditMode && (
          <div className="text-gray-500 text-center">
            <p className="font-medium">Click to change photo</p>
            <p className="text-sm">Upload or select from media library</p>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div 
        className={cn("relative group", className)}
        onClick={handleEditClick}
      >
        {isVideo ? (
          <video
            src={src}
            width={width}
            height={height}
            className="w-full h-full object-cover"
            controls={!isEditMode}
            autoPlay
            loop
            muted
          />
        ) : (
          <Image
            src={src}
            alt={alt}
            fill
            className={cn("w-full h-full object-cover", isEditMode && "cursor-pointer")}
            priority={priority}
          />
        )}
        
        {isEditMode && (
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center">
            <Button
              variant="outline"
              size="icon"
              className="opacity-0 group-hover:opacity-100 bg-white/80 hover:bg-white"
              onClick={(e) => {
                e.stopPropagation();
                openEditor();
              }}
            >
              <Edit className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Change Media</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="upload" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload</TabsTrigger>
              <TabsTrigger value="library">Media Library</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-4">
              <div className="h-[400px] overflow-y-auto">
                <MediaLibrary 
                  onSelectAction={handleSaveMedia}
                  type={mediaLibraryType}
                  isDialog={true}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="library" className="mt-4">
              <div className="h-[400px] overflow-y-auto">
              <MediaLibrary 
                onSelectAction={handleSaveMedia}
                type={mediaLibraryType}
                  isDialog={true}
              />
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </>
  );
});

ContactEditableMedia.displayName = "ContactEditableMedia";

export default ContactEditableMedia;
