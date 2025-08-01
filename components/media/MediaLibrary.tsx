"use client"

import { useState, useEffect } from "react"
import type { MediaItem } from '@/lib/types/media';

// Utility function to format bytes into human-readable format
const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}
import { Search, X, Upload, Image as ImageIcon, Loader2, Check, Video as VideoIcon, Trash2, Play, X as XIcon, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
// import { fetchMediaFromCloudinary, cloudinary } from "@/lib/cloudinary"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { FileUploader } from "@/components/ui/file-upload"
import { toast } from "sonner"
import { Checkbox } from "@/components/ui/checkbox"

interface MediaLibraryProps {
  onSelectAction: (url: string, type?: 'image' | 'video', dimensions?: { width: number; height: number }) => void
  type: 'image' | 'video' | 'all'
  isDialog?: boolean
  onCloseAction?: () => void
  className?: string
  selectedUrl?: string | null
}

export default function MediaLibrary({ 
  onSelectAction, 
  type = 'all', 
  className = '',
  isDialog = false,
  onCloseAction = () => {},
  selectedUrl = null
}: MediaLibraryProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [filteredMedia, setFilteredMedia] = useState<MediaItem[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | undefined>()
  const [hasMore, setHasMore] = useState(true)
  const [activeTab, setActiveTab] = useState('all')
  const [selectedMediaIds, setSelectedMediaIds] = useState<string[]>([])
  const [selectedMediaItem, setSelectedMediaItem] = useState<MediaItem | null>(null)
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false)
  const [isVideoLoading, setIsVideoLoading] = useState(false)
  const [videoError, setVideoError] = useState<string | null>(null)
  const [fetchType, setFetchType] = useState<'image' | 'video' | 'all'>(type)
  
  // Upload state
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadTab, setUploadTab] = useState<'upload' | 'library'>('upload')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image')

  const fetchMedia = async (overrideType?: 'image' | 'video' | 'all') => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      const useType = overrideType || fetchType;
      if (useType !== 'all') params.append('type', useType);
      if (nextCursor) params.append('next_cursor', nextCursor);
      params.append('max_results', '30');
      
      const response = await fetch(`/api/media/cloudinary?${params.toString()}`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch Cloudinary media');
      }

      if (data && Array.isArray(data.resources)) {
        // Create a Set to track unique combinations, initialized with existing IDs
        const uniqueSet = new Set(media.map(item => item.id));
        
        // Ensure each item has a unique ID by combining multiple unique properties
        const uniqueResources = data.resources.map((resource: any, index: number) => {
          // Create a unique key using a combination of properties
          const keyParts = [
            resource.asset_id || '',
            resource.public_id || '',
            resource.version || '',
            resource.created_at || '',
            resource.bytes || '',
            resource.format || '',
            index
          ];
          
          // Create a unique key by joining the parts with a delimiter
          let uniqueKey = keyParts.join('|');
          
          // If this key already exists, append a random string
          if (uniqueSet.has(uniqueKey)) {
            uniqueKey = `${uniqueKey}-${Math.random().toString(36).substring(2, 9)}`;
          }
          
          uniqueSet.add(uniqueKey);
          
          return {
            ...resource,
            id: uniqueKey
          };
        });
        
        setMedia(prev => [...prev, ...uniqueResources]);
        setFilteredMedia(prev => [...prev, ...uniqueResources]);
        setNextCursor(data.next_cursor);
        setHasMore(!!data.next_cursor);
        setError(null);
      } else {
        setError('No media found');
      }
    } catch (err) {
      console.error('Error fetching media:', err);
      setError('Failed to load media. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setMedia([]);
    setFilteredMedia([]);
    setError(null);
    fetchMedia(fetchType);
  }, [fetchType]);

  const loadMore = async () => {
    if (!loading && hasMore && nextCursor) {
      await fetchMedia()
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const { scrollTop, clientHeight, scrollHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - (scrollTop + clientHeight) < 100;
    
    if (isNearBottom && hasMore && !loading) {
      loadMore();
    }
  };

  useEffect(() => {
    if (selectedUrl && media.length > 0) {
      const item = media.find(item => item.url === selectedUrl);
      if (item) {
        setSelectedMediaIds([item.id]);
        setSelectedMediaItem(item);
      }
    }
  }, [selectedUrl, media]);

  const handleSearch = (query: string) => {
    setSearchTerm(query);
    
    if (query.trim()) {
      setFilteredMedia(media.filter(item => 
        (item.name && item.name.toLowerCase().includes(query.toLowerCase())) ||
        (item.public_id && item.public_id.toLowerCase().includes(query.toLowerCase()))
      ));
    } else {
      setFilteredMedia(media);
    }
    setNextCursor(undefined);
    setHasMore(true);
  };

  const handleTabChange = (tab: 'image' | 'video' | 'all') => {
    setActiveTab(tab);
    setFetchType(tab);
    setSearchTerm('');
    setNextCursor(undefined);
    setHasMore(true);
  };

  const handleSelectionChange = (itemId: string) => {
    setSelectedMediaIds(prev => {
      if (prev.includes(itemId)) {
        return prev.filter(id => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  };

  const handleDelete = async () => {
    if (selectedMediaIds.length === 0) return;

    const itemsToDelete = media.filter(item => selectedMediaIds.includes(item.id));
    if (itemsToDelete.length === 0) {
      console.error('Selected media items not found for deletion');
      setSelectedMediaIds([]);
      return;
    }

    setLoading(true);
    const deletePromises = itemsToDelete.map(item =>
      fetch('/api/media/cloudinary/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ publicId: item.public_id }),
      }).then(res => {
        if (!res.ok) {
          console.error(`Failed to delete ${item.public_id}`);
          toast.error(`Failed to delete ${item.name || item.public_id}`);
          return null;
        }
        return item.id;
      })
    );

    try {
      const results = await Promise.all(deletePromises);
      const successfullyDeletedIds = results.filter(id => id !== null) as string[];

      if (successfullyDeletedIds.length > 0) {
        setMedia(prev => prev.filter(item => !successfullyDeletedIds.includes(item.id)));
        setFilteredMedia(prev => prev.filter(item => !successfullyDeletedIds.includes(item.id)));
        setSelectedMediaIds(prev => prev.filter(id => !successfullyDeletedIds.includes(id)));
        toast.success(`${successfullyDeletedIds.length} item(s) deleted successfully.`);
      }
    } catch (error) {
      console.error('Error during bulk delete:', error);
      toast.error('An error occurred during deletion.');
    } finally {
      setLoading(false);
    }
  };

  const handlePreview = (item: MediaItem) => {
    if (isDialog) {
      onSelectAction(item.url || item.secure_url, item.type, {
        width: item.width || 800,
        height: item.height || 600
      });
      return;
    }
    
    if (item.type === 'video') {
      setSelectedMediaItem(item);
      try {
        setIsVideoLoading(true);
        setVideoError(null);
        setIsVideoModalOpen(true);
      } catch (error) {
        console.error('Error preparing video:', error);
        setVideoError('Failed to load video. Please try again.');
      } finally {
        setIsVideoLoading(false);
      }
    } else {
      // For images, we can also open a modal or just use the onSelectAction if needed
      onSelectAction(item.url || item.secure_url, item.type, {
        width: item.width || 800,
        height: item.height || 600
      });
    }
  };

  const uploadToCloudinary = async (file: File, resourceType: 'image' | 'video' = 'image'): Promise<any> => {
    setIsUploading(true);
    
    console.log('Starting server-side Cloudinary upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      resourceType
    });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await fetch('/api/media/cloudinary/upload', {
        method: 'POST',
        body: formData
      });
      
      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse upload response:', {
          status: response.status,
          statusText: response.statusText,
          responseText
        });
        throw new Error('Invalid response from upload service');
      }
      
      if (!response.ok) {
        console.error('Server upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: result.error || 'Unknown error',
          response: result
        });
        throw new Error(result.error || 'Failed to upload file');
      }
      
      if (!result.success || !result.data) {
        console.error('Invalid upload response:', result);
        throw new Error('Upload completed but no data was returned');
      }
      
      console.log('Server upload successful:', {
        secureUrl: result.data.secure_url,
        resourceType: result.data.resource_type,
        format: result.data.format,
        bytes: result.data.bytes
      });
      
      return result.data;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error(
        error instanceof Error 
          ? `Upload failed: ${error.message}` 
          : 'An unknown error occurred during upload'
      );
    } finally {
      setIsUploading(false);
    }
  }

  const handleUpload = async (file: File) => {
    try {
      const result = await uploadToCloudinary(file, uploadType);
      
      if (result.secure_url) {
        // Add the new media item to the local state
        const newMediaItem: MediaItem = {
          id: result.asset_id || result.public_id,
          public_id: result.public_id,
          secure_url: result.secure_url,
          url: result.secure_url,
          name: result.original_filename || result.public_id.split('/').pop() || 'Uploaded file',
          type: result.resource_type,
          resource_type: result.resource_type,
          bytes: result.bytes,
          created_at: result.created_at,
          format: result.format,
          width: result.width,
          height: result.height,
          tags: result.tags || [],
          context: result.context || {},
          asset_id: result.asset_id
        };
        
        setMedia(prev => [newMediaItem, ...prev]);
        setFilteredMedia(prev => [newMediaItem, ...prev]);
        
        toast.success('Media uploaded successfully');
        setShowUploadDialog(false);
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return (
    <div className={cn("relative", className, isDialog && "h-full")}>
      <div className={cn("flex flex-col", isDialog ? "h-full max-h-[70vh]" : "h-full")}>
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex space-x-4">
            <button
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium",
                activeTab === 'image' ? "bg-gray-100" : "hover:bg-gray-50"
              )}
              onClick={() => handleTabChange('image')}
            >
              Images
            </button>
            <button
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium",
                activeTab === 'video' ? "bg-gray-100" : "hover:bg-gray-50"
              )}
              onClick={() => handleTabChange('video')}
            >
              Videos
            </button>
            <button
              className={cn(
                "px-4 py-2 rounded-md text-sm font-medium",
                activeTab === 'all' ? "bg-gray-100" : "hover:bg-gray-50"
              )}
              onClick={() => handleTabChange('all')}
            >
              All
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="text"
              placeholder="Search media..."
              value={searchTerm}
              onChange={(e) => handleSearch(e.target.value)}
              className="flex-1 px-3 py-1.5 rounded-md border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <Button
              onClick={() => setShowUploadDialog(true)}
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Upload</span>
            </Button>
            <button
              onClick={handleDelete}
              disabled={selectedMediaIds.length === 0}
              className="px-3 py-1.5 rounded-md text-red-600 hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Delete
            </button>
          </div>
        </div>
        <div
          className={cn("flex-1 overflow-y-auto p-4", isDialog && "max-h-[calc(70vh-80px)]")}
          onScroll={handleScroll}
        >
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
          ) : filteredMedia.length === 0 ? (
            <div className="flex items-center justify-center h-full text-gray-500">
              No media found
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {filteredMedia.map((item, idx) => (
                <div
                  key={`${item.id || item.asset_id}-${idx}`}
                  className={cn(
                    "relative group rounded-lg overflow-hidden",
                    selectedMediaIds.includes(item.id) ? "ring-2 ring-blue-500" : "hover:ring-2 hover:ring-gray-300"
                  )}
                  onClick={() => handlePreview(item)}
                >
                  <div className="absolute top-2 left-2 z-10">
                    <Checkbox
                      checked={selectedMediaIds.includes(item.id)}
                      onCheckedChange={() => handleSelectionChange(item.id)}
                      onClick={(e) => e.stopPropagation()}
                      aria-label={`Select ${item.name}`}
                    />
                  </div>
                  {item.type === 'image' ? (
                    <div className="relative w-full h-48">
                      <Image
                        src={item.url || item.secure_url}
                        alt={item.name || item.public_id}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          const img = e.currentTarget;
                          img.src = '/images/placeholder.png';
                          img.style.opacity = '0.5';
                        }}
                        priority={filteredMedia.indexOf(item) < 2}
                      />
                      <div className="absolute inset-0 bg-black/20 hover:bg-black/30 transition-opacity duration-200"></div>
                    </div>
                  ) : (
                    <div className="w-full h-48 bg-gray-200 flex items-center justify-center relative">
                      <Image
                        src={`https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/video/upload/f_jpg,w_300,h_200,c_fill/${item.public_id}.jpg`}
                        alt={item.name || item.public_id}
                        width={300}
                        height={200}
                        className="w-full h-full object-cover"
                        onError={(e: React.SyntheticEvent<HTMLImageElement, Event>) => {
                          // Fallback to generic video icon if thumbnail fails
                          const img = e.currentTarget;
                          img.style.display = 'none';
                          const parent = img.parentElement;
                          if (parent) {
                            parent.innerHTML = `
                              <svg class="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path>
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                              </svg>
                            `;
                          }
                        }}
                        priority={filteredMedia.indexOf(item) < 2}
                      />
                      {/* Video play icon overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-black bg-opacity-50 rounded-full p-3">
                          <svg
                            className="w-8 h-8 text-white"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity duration-200"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-75 p-2">
                    <div className="text-sm font-medium text-white truncate">{item.name || item.public_id}</div>
                    <div className="text-xs text-gray-300">
                      {item.type === 'image' ? `${item.width}x${item.height}px` : formatBytes(item.bytes)}
                    </div>
                  </div>
                </div>
              ))}
              {hasMore && (
                <button
                  className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200"
                  onClick={loadMore}
                >
                  Load More
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Upload Dialog */}
      <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Upload Media</DialogTitle>
          </DialogHeader>
          
          <Tabs value={uploadTab} onValueChange={(value) => setUploadTab(value as 'upload' | 'library')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload New</TabsTrigger>
              <TabsTrigger value="library">Media Library</TabsTrigger>
            </TabsList>
            
            <TabsContent value="upload" className="mt-4">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Button
                    variant={uploadType === 'image' ? 'default' : 'outline'}
                    onClick={() => setUploadType('image')}
                    size="sm"
                  >
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Image
                  </Button>
                  <Button
                    variant={uploadType === 'video' ? 'default' : 'outline'}
                    onClick={() => setUploadType('video')}
                    size="sm"
                  >
                    <VideoIcon className="h-4 w-4 mr-2" />
                    Video
                  </Button>
                </div>
                
                <FileUploader
                  onDrop={async (acceptedFiles: File[]) => {
                    if (acceptedFiles.length > 0) {
                      await handleUpload(acceptedFiles[0]);
                    }
                  }}
                  accept={uploadType === 'image' 
                    ? { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] }
                    : { 'video/*': ['.mp4', '.webm', '.mov'] }
                  }
                  className="min-h-[200px]"
                  disabled={isUploading}
                />
                
                {isUploading && (
                  <div className="flex items-center justify-center p-4">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    <span>Uploading...</span>
                  </div>
                )}
              </div>
            </TabsContent>
            
            <TabsContent value="library" className="mt-4">
              <div className="h-[400px] overflow-y-auto">
                <div className="text-center text-gray-500 p-8">
                  <p>Use the "Upload New" tab to add files to your media library.</p>
                  <p className="text-sm mt-2">Files uploaded here will appear in your main media library.</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>

      {!isDialog && selectedMediaItem && selectedMediaItem.type === 'video' && (
        <Dialog open={isVideoModalOpen} onOpenChange={setIsVideoModalOpen}>
          <DialogContent 
            className="max-w-4xl"
            aria-label="Video Preview"
            aria-describedby="video-preview-description"
          >
            <DialogHeader>
              <DialogTitle>Video Preview</DialogTitle>
              <p id="video-preview-description" className="text-sm text-gray-500">
                Preview and select video from your media library
              </p>
            </DialogHeader>
            <div className="relative aspect-video">
              {isVideoLoading ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                </div>
              ) : videoError ? (
                <div className="absolute inset-0 flex items-center justify-center text-red-500">
                  {videoError}
                </div>
              ) : (
                <video
                  src={selectedMediaItem.url}
                  controls
                  className="w-full h-full object-cover"
                />
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
