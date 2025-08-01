"use client";

import { forwardRef, useImperativeHandle, useState } from "react";
import Image from "next/image";
import { Camera, Edit, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import MediaLibrary from "@/components/media/MediaLibrary";
import { useProfileEdit } from "./ProfileEditContext";
import { cn } from "@/lib/utils";

interface SimpleEditableImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  isEditMode?: boolean;
  isEditing?: boolean;
  onChange?: (url: string) => void;
  type?: 'profile' | 'background' | 'gallery' | 'video';
  setIsDirty?: (dirty: boolean) => void;
}

const SimpleEditableImage = forwardRef<{ openEditor: () => void }, SimpleEditableImageProps>((props, ref) => {
  const {
    src,
    alt,
    width,
    height,
    className = "",
    priority = false,
    isEditMode = false,
    isEditing = false,
    onChange,
    type = 'gallery',
    setIsDirty: propSetIsDirty,
  } = props;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedTab, setSelectedTab] = useState('upload');
  const { isEditMode: contextEditMode, setIsDirty: contextSetIsDirty } = useProfileEdit() || {};
  
  // Use the context's isEditMode if not explicitly provided
  const editMode = isEditMode || contextEditMode;
  // Use the provided setIsDirty or the context's setIsDirty
  const handleSetDirty = propSetIsDirty || contextSetIsDirty;

  const handleSaveImage = (url: string) => {
    console.log('Saving image URL:', url);
    if (onChange) {
      onChange(url);
    }
    if (handleSetDirty) {
      handleSetDirty(true);
    }
    setIsDialogOpen(false);
  };

  const handleEditClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    console.log('Edit button clicked, opening dialog...');
    setIsDialogOpen(true);
  };

  // Expose the openEditor method to parent components
  const openEditor = () => {
    console.log('openEditor called, opening dialog...');
    setIsDialogOpen(true);
  };

  // Forward the ref to expose the openEditor method
  useImperativeHandle(ref, () => ({
    openEditor,
  }));

  return (
    <div className={cn("relative group w-full h-full", className)}>
      <div className="relative w-full h-full">
        {src ? (
          <Image
            src={src}
            alt={alt}
            width={width}
            height={height}
            fill={!width || !height}
            className={cn("object-cover w-full h-full")}
            priority={priority}
            unoptimized={src.startsWith('data:')}
          />
        ) : (
          <div className="w-full h-full bg-gray-100 flex items-center justify-center">
            <ImageIcon className="h-12 w-12 text-gray-400" />
          </div>
        )}
        
        {(editMode || isEditing) && (
          <button
            onClick={handleEditClick}
            className={cn(
              "absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity cursor-pointer",
              isEditing ? "opacity-100" : "opacity-0 group-hover:opacity-100"
            )}
            aria-label="Edit image"
            style={{ zIndex: 50 }}
          >
            <Edit className="h-8 w-8 text-white" />
          </button>
        )}
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Update {type === 'profile' ? 'Profile' : type === 'background' ? 'Background' : 'Gallery'} Image</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Upload a new image or select one from your media library
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
                  onSelectAction={handleSaveImage}
                  type="image"
                    isDialog={true}
                />
                </div>
              </TabsContent>
              
              <TabsContent value="library" className="mt-4">
                <div className="h-[400px] overflow-y-auto">
                  <MediaLibrary 
                    onSelectAction={handleSaveImage}
                    type="image"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
});

SimpleEditableImage.displayName = 'SimpleEditableImage';

export default SimpleEditableImage;
