"use client";

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Edit, Play, Image as ImageIcon, Video as VideoIcon, PlayCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { getGalleryData } from '@/app/actions/gallery';
import type { MediaItem } from '@/lib/types';
import VideoPlayer from './VideoPlayer';

interface MediaGridProps {
  media: MediaItem[];
  searchQuery?: string;
  type?: 'all' | 'images' | 'videos';
  selectedItems?: string[];
  onSelectionChangeAction?: (items: string[]) => void;
  onBulkDelete?: () => void;
  onBulkEdit?: () => void;
  onDeleteItem?: (ids: string[]) => Promise<void>;
  isDeleting?: boolean;
}

// Format file sizes for display
const formatBytes = (bytes: number, decimals = 2): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export default function MediaGrid({
  media,
  searchQuery = '',
  type = 'all',
  selectedItems: externalSelectedItems = [],
  onSelectionChangeAction = () => {},
  onBulkDelete,
  onBulkEdit,
  onDeleteItem,
  isDeleting: externalIsDeleting = false,
}: MediaGridProps) {
  const [selectedItems, setSelectedItems] = useState<string[]>(externalSelectedItems);
  const [isAdmin, setIsAdmin] = useState(true); // Set to true for admin access
  const [currentVideo, setCurrentVideo] = useState<{url: string, title: string, id: string} | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const router = useRouter();

  // Filter media based on type
  const filteredByType = type === 'all'
    ? media
    : type === 'images'
      ? media.filter(item => item.type === 'image')
      : media.filter(item => item.type === 'video');

  // Filter media based on search query
  const filteredMedia = filteredByType.filter(item =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  // Handle item selection
  const handleSelectItem = useCallback((id: string, e?: React.MouseEvent | unknown) => {
    // Only toggle selection if not coming from a checkbox or action buttons
    const target = e && typeof e === 'object' && 'target' in e 
      ? e.target as HTMLElement 
      : null;
      
    const isFromCheckbox = target?.closest?.('.media-actions') || 
                         target?.closest?.('button') || 
                         target?.closest?.('input[type="checkbox"]');
    
    if (!isFromCheckbox) {
      setSelectedItems(prev => {
        const newSelected = prev.includes(id)
          ? prev.filter(itemId => itemId !== id)
          : [...prev, id];
        
        onSelectionChangeAction(newSelected);
        return newSelected;
      });
    }
  }, [onSelectionChangeAction]);
  
  // Handle edit item
  const handleEditItem = useCallback((item: MediaItem, e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger the parent's onBulkEdit with the item's ID
    if (onBulkEdit) {
      setSelectedItems([item.id]);
      onBulkEdit();
    }
  }, [onBulkEdit]);
  
  // Handle delete item
  const handleDeleteItem = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (!onDeleteItem) {
      console.warn('No delete handler provided');
      return;
    }
    
    try {
      setIsDeleting(true);
      await onDeleteItem([id]);
    } catch (error) {
      console.error('Error in delete handler:', error);
      toast.error('Failed to delete item');
    } finally {
      setIsDeleting(false);
    }
  }, [onDeleteItem]);

  // Handle select all
  const handleSelectAll = useCallback(() => {
    if (selectedItems.length === media.length) {
      setSelectedItems([]);
      onSelectionChangeAction([]);
    } else {
      const allIds = media.map(item => item.id);
      setSelectedItems(allIds);
      onSelectionChangeAction(allIds);
    }
  }, [media, selectedItems.length, onSelectionChangeAction]);

  if (filteredMedia.length === 0) {
    return (
      <div className="text-center text-gray-500 p-4">
        No media found. {searchQuery ? 'Try a different search term.' : 'Upload some media to get started.'}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bulk actions toolbar */}
      {isAdmin && selectedItems.length > 0 && (
        <div className="flex items-center space-x-4 p-2 bg-gray-100 dark:bg-gray-800 rounded-md">
          <div className="text-sm text-gray-600 dark:text-gray-300">
            {selectedItems.length} item{selectedItems.length !== 1 ? 's' : ''} selected
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBulkDelete}
            className="text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={onBulkEdit}
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        </div>
      )}

      {/* Media grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {filteredMedia.length > 0 ? (
          filteredMedia.map((item: MediaItem) => (
            <div 
              key={item.id} 
              className={`relative group rounded-md overflow-hidden border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow ${
                item.type === 'image' && item.imageUrls && item.imageUrls.length > 1 ? 'cursor-pointer' : ''
              }`}
            >
              {isAdmin && (
                <div className="absolute top-2 left-2 z-10">
                  <Checkbox 
                    checked={selectedItems.includes(item.id)}
                    onCheckedChange={(checked) => {
                      setSelectedItems(prev => {
                        const newSelected = checked 
                          ? [...prev, item.id]
                          : prev.filter(id => id !== item.id);
                        onSelectionChangeAction(newSelected);
                        return newSelected;
                      });
                    }}
                    className="h-5 w-5 rounded-full border-2 border-white bg-white/80"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>
              )}
              {item.type === 'image' ? (
                <div 
                  className="aspect-square bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:opacity-90 transition-opacity w-full h-full relative overflow-hidden"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (item.imageUrls && item.imageUrls.length > 1) {
                      router.push(`/gallery/image-sets/${item.id}`);
                    }
                  }}
                >
                  {item.imageUrls?.[0] ? (
                    <Image
                      src={item.imageUrls[0]}
                      alt={`${item.title || 'Image set'} thumbnail`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    />
                  ) : (
                    <div className="text-center p-4 w-full">
                      <div className="flex justify-center mb-2">
                        <div className="relative">
                          <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm group-hover:opacity-75 transition-opacity"></div>
                          <div className="relative bg-white dark:bg-gray-800 p-3 rounded-full">
                            <ImageIcon className="w-8 h-8 text-primary" />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-sm text-white font-medium text-center">
                      {item.imageUrls?.length || 0} {item.imageUrls?.length === 1 ? 'image' : 'images'}
                    </p>
                    {item.imageUrls && item.imageUrls.length > 1 && (
                      <p className="text-xs text-white/80 text-center">
                        Click to view all
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                <div 
                  className="aspect-square relative bg-gray-100 dark:bg-gray-800 cursor-pointer group overflow-hidden"
                  onClick={(e) => {
                    if (item.type === 'video') {
                      setCurrentVideo({ 
                        id: item.id,
                        url: item.videoUrl || item.coverImage || (item.imageUrls && item.imageUrls[0]) || '', 
                        title: item.title || 'Video' 
                      });
                      return;
                    }
                    handleSelectItem(item.id, e);
                  }}
                >
                  {item.coverImage || (item.imageUrls && item.imageUrls[0]) ? (
                    <Image
                      src={item.coverImage || (item.imageUrls && item.imageUrls[0]) || item.videoUrl || ''}
                      alt={`${item.title || 'Video'} thumbnail`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                      onError={(e) => {
                        const img = e.target as HTMLImageElement;
                        img.src = '/placeholder.svg';
                        img.onerror = null;
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-200 dark:bg-gray-700">
                      <div className="text-center p-4">
                        <div className="flex justify-center mb-2">
                          <div className="relative">
                            <div className="absolute -inset-1 bg-primary/20 rounded-full blur-sm group-hover:opacity-75 transition-opacity"></div>
                            <div className="relative bg-white dark:bg-gray-800 p-3 rounded-full">
                              <VideoIcon className="w-8 h-8 text-primary" />
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                          {item.type === 'video' ? 'Video' : 'Image'}
                        </p>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/30 transition-opacity">
                    <div className="bg-black/50 rounded-full p-3">
                      <PlayCircle className="w-10 h-10 text-white" />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="p-2">
                <h3 className="text-sm font-medium truncate">{item.title}</h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {item.description}
                </p>
                {item.createdAt && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric'
                    })}
                  </p>
                )}
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center py-8 text-gray-500">
            No media found. {searchQuery ? 'Try a different search term.' : 'Upload some media to get started.'}
          </div>
        )}
      </div>
      
      {/* Video Player Modal */}
      {currentVideo && (
        <VideoPlayer
          isOpen={!!currentVideo}
          onClose={() => setCurrentVideo(null)}
          videoUrl={currentVideo.url}
          title={currentVideo.title}
        />
      )}
    </div>
  );
}
