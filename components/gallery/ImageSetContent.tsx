'use client';

import { useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Trash2, Edit, Check, X, ChevronLeft, ArrowLeft, Maximize2 } from 'lucide-react';
import { useDropzone } from 'react-dropzone';

import { ImageLightbox } from '@/components/gallery/ImageLightbox';
import MediaDialog from '@/components/gallery/MediaDialog';
import type { MediaItem } from '@/lib/types';

export type ImageSet = MediaItem & {
  imageUrls: string[];
  videoUrl?: string;
  coverImage: string;
  galleryType: 'public' | 'exclusive' | 'behind-scenes' | 'gallery';
  slug: string;
  title: string;
  description: string;
  type: 'image' | 'video';
  isPremium: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
};

export interface ImageSetContentProps {
  imageSet: MediaItem & {
    type: 'image' | 'video';
    videoUrl?: string;
    coverImage: string;
    imageUrls: string[];
    tags: string[];
    galleryType: 'public' | 'exclusive' | 'behind-scenes' | 'gallery';
  };
  onEditAction: (data: any) => Promise<{ success: boolean }>;
  onDeleteAction: (id: string) => Promise<{ success: boolean }>;
  isAdmin: boolean;
  backLinkHref: string;
  backLinkText: string;
}

export function ImageSetContent({ 
  imageSet, 
  onEditAction, 
  onDeleteAction, 
  isAdmin,
  backLinkHref,
  backLinkText
}: ImageSetContentProps) {
  const [currentIndex, setCurrentIndex] = useState(-1);
  const isVideo = imageSet.type === 'video';

  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const router = useRouter();

  const allMedia = imageSet.type === 'video' && imageSet.videoUrl 
    ? [imageSet.videoUrl] 
    : [imageSet.coverImage, ...(imageSet.imageUrls || [])];

  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleDeleteItems = async () => {
    if (selectedItems.length === 0) return;

    const message = selectedItems.length === 1
      ? 'Are you sure you want to delete the selected item?'
      : `Are you sure you want to delete ${selectedItems.length} selected items?`;

    if (!window.confirm(message)) return;

    try {
      setIsDeleting(true);
      await Promise.all(selectedItems.map(id => onDeleteAction(id)));
      toast.success(`Successfully deleted ${selectedItems.length} item${selectedItems.length !== 1 ? 's' : ''}`);
      setSelectedItems([]);
      // Refresh the page to show updated data
      window.location.reload();
    } catch (error) {
      console.error('Error deleting items:', error);
      toast.error('Failed to delete items');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDelete = async () => {
    if (!imageSet?.id) return;
    
    setIsDeleting(true);
    try {
      const { success } = await onDeleteAction(imageSet.id);
      if (success) {
        toast.success('Media deleted successfully');
        // Optionally redirect or close the dialog
      }
    } catch (error) {
      console.error('Error deleting media:', error);
      toast.error('Failed to delete media');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <Button asChild variant="ghost" className="flex items-center gap-2">
            <Link href={backLinkHref}>
              <ArrowLeft className="w-4 h-4" />
              {backLinkText}
            </Link>
          </Button>

          {isAdmin && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsEditDialogOpen(true)}
                className="flex items-center gap-2"
              >
                <Edit className="w-4 h-4" />
                Edit
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Delete'}
              </Button>
            </div>
          )}
        </div>

        <h1 className="text-3xl font-bold mb-2">{imageSet.title}</h1>
        {imageSet.description && (
          <p className="text-muted-foreground mb-6">{imageSet.description}</p>
        )}
      </div>

      <div className="mb-8">
        {isVideo && imageSet.videoUrl ? (
          <div className="relative aspect-video w-full max-w-4xl mx-auto rounded-lg overflow-hidden border">
            <video
              src={imageSet.videoUrl}
              controls
              className="w-full h-full object-contain bg-black"
              poster={imageSet.coverImage}
            >
              Your browser does not support the video tag.
            </video>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div
              className="relative aspect-square w-full max-w-4xl mx-auto rounded-lg overflow-hidden border group cursor-zoom-in"
              onClick={() => setIsLightboxOpen(true)}
            >
              <Image
                src={imageSet.coverImage}
                alt={imageSet.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-300"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
          </div>
        )}
      </div>

      {imageSet.type !== 'video' && (
        <>
          {isAdmin && selectedItems.length > 0 && (
            <div className="mb-4 flex justify-end">
              <Button
                variant="destructive"
                size="sm"
                onClick={handleDeleteItems}
                disabled={isDeleting}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete {selectedItems.length > 1 ? 'Items' : 'Item'}
              </Button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {imageSet.imageUrls?.map((image, index) => {
              const imageId = `${imageSet.id}-${index}`;
              const isSelected = selectedItems.includes(imageId);

              return (
                <div key={index} className="relative group">
                  {isAdmin && (
                    <div
                      className={`absolute top-2 left-2 z-10 w-8 h-8 rounded-full flex items-center justify-center cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-600' : 'bg-white/80 hover:bg-white/60'
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleItemSelection(imageId);
                      }}
                    >
                      {isSelected && <Check className="h-5 w-5 text-white" />}
                    </div>
                  )}

                  <div
                    className="relative aspect-square w-full rounded-lg overflow-hidden border group-hover:opacity-80 transition-opacity cursor-pointer"
                    onClick={() => {
                      setSelectedImageIndex(index);
                      setIsLightboxOpen(true);
                    }}
                  >
                    <Image
                      src={image}
                      alt={`${imageSet.title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {isLightboxOpen && (
        <ImageLightbox
          images={allMedia}
          initialIndex={selectedImageIndex}
          onClose={() => setIsLightboxOpen(false)}
        />
      )}

      {isEditDialogOpen && (
        <MediaDialog
          isOpen={isEditDialogOpen}
          onCloseAction={() => setIsEditDialogOpen(false)}
          onSaveAction={onEditAction}
          initialData={imageSet}
          type={imageSet.type}
          galleryType={imageSet.galleryType}
        />
      )}
    </div>
  );
} 