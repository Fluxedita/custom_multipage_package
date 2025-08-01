"use client"

import React, { useState, useEffect, useCallback, Suspense } from "react"
import supabase from "@/lib/supabase/client"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2 } from "lucide-react"
import MediaGrid from "./NewMediaGrid"
import MediaDialog from "@/components/gallery/MediaDialog"
import { toast } from "sonner"
import { deleteMediaAction } from "@/app/actions/media"
import type { MediaItem, GalleryData, SaveMediaData, MediaUpdateData } from "@/lib/types"
import { useAuth } from "@/components/providers/AuthProvider"
import { getGalleryData } from "@/app/actions/gallery"

interface GalleryPageProps {
  initialData: GalleryData | null
  type?: 'public' | 'exclusive' | 'behind-scenes'
  searchParams?: { [key: string]: string | string[] | undefined }
  isPremium?: boolean
}

export default function GalleryPage({ 
  initialData, 
  type = 'public',
  searchParams = {},
  isPremium = false 
}: GalleryPageProps) {
  const [uiMediaType, setUiMediaType] = useState<'images' | 'videos'>('images')
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null)
  const [galleryData, setGalleryData] = useState<GalleryData>({ images: [], videos: [] })
  const { user, isAdmin, loading: authLoading } = useAuth()
  // Debug logging
  useEffect(() => {
    console.log('Auth state in GalleryPage:', {
      user,
      isAdmin,
      userMetadata: user?.user_metadata,
      type,
      authLoading
    });
  }, [user, isAdmin, type, authLoading])
  
  // Check if user is admin based on various possible indicators
  const isUserAdmin = React.useMemo(() => {
    if (authLoading) return false;
    
    const adminCheck = {
      isAdminFlag: isAdmin,
      userMetadataRole: user?.user_metadata?.role === 'admin',
      email: user?.email?.toLowerCase() === 'jamescroanin@gmail.com',
      appMetadataRole: (user as any)?.app_metadata?.role === 'admin'
    };
    
    console.log('Admin check:', adminCheck);
    
    return adminCheck.isAdminFlag || 
           adminCheck.userMetadataRole || 
           adminCheck.email || 
           adminCheck.appMetadataRole;
  }, [isAdmin, user, authLoading])

  // Initialize with empty data if null
  useEffect(() => {
    if (initialData) {
      setGalleryData(initialData)
    }
  }, [initialData])
  
  // Fetch gallery data
  const fetchGalleryData = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await getGalleryData(type as 'public' | 'exclusive' | 'behind-scenes')
      setGalleryData(data)
    } catch (error) {
      console.error('Error fetching gallery data:', error)
      const errorMessage = error instanceof Error ? error.message : 'Failed to load gallery data'
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [type])

  // Set initial tab from URL params
  useEffect(() => {
    const tab = searchParams?.tab
    if (tab === 'videos' || (Array.isArray(tab) && tab.includes('videos'))) {
      setUiMediaType('videos')
    }
  }, [searchParams])

  // Handle edit item
  const handleEditItem = useCallback((item: MediaItem) => {
    setEditingItem(item);
    setIsDialogOpen(true);
  }, []);

  // Handle media save
  const handleSaveMedia = useCallback(async (data: MediaUpdateData): Promise<{ success: boolean; data?: MediaItem; error?: string }> => {
    setIsLoading(true)
    try {
      // Convert MediaUpdateData to SaveMediaData by adding missing fields
      const saveData: SaveMediaData = {
        ...data,
        galleryType: type, // Add the missing galleryType from the component prop
        type: uiMediaType === 'images' ? 'image' : 'video',
        isPremium: type !== 'public',
        slug: data.slug || data.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        coverImage: data.coverImage,
        imageUrls: data.imageUrls || [],
        videoUrl: data.videoUrl,
        backgroundImage: data.backgroundImage,
        tags: data.tags || [],
        featured: data.featured || false,
        order: data.order,
        title: data.title,
        description: data.description || ''
      };

      // Map to DB columns
      const dbPayload = {
        title: saveData.title,
        description: saveData.description ?? '',
        cover_image: saveData.coverImage,
        image_urls: saveData.imageUrls ?? [],
        video_url: saveData.videoUrl,
        is_premium: saveData.isPremium,
        type: saveData.type,
        tags: saveData.tags ?? [],
        featured: saveData.featured,
        order: saveData.order,
        slug: saveData.slug,
        gallery_type: saveData.galleryType ?? 'public',
        background_image: saveData.backgroundImage,
        updated_at: new Date().toISOString(),
        url: saveData.imageUrls?.[0] || saveData.videoUrl || saveData.coverImage || '',
      };

      let result;
      if (data.id) {
        // Update existing media item
        const { data: updated, error } = await supabase
          .from('media_items')
          .update(dbPayload)
          .eq('id', data.id)
          .select()
          .single();
        if (error) throw error;
        result = updated;
      } else {
        // Insert new media item
        const { data: inserted, error } = await supabase
          .from('media_items')
          .insert(dbPayload)
          .select()
          .single();
        if (error) throw error;
        result = inserted;
      }

      toast.success('Media saved successfully');
      await fetchGalleryData();
      setIsDialogOpen(false);
      return { success: true, data: result };
    } catch (error) {
      console.error('Error saving media:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save media';
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [uiMediaType, type, fetchGalleryData]);

  // Handle selection change
  const handleSelectionChange = useCallback((items: string[]) => {
    setSelectedItems(items)
  }, [])

  // Handle delete items (single or multiple)
  const handleDeleteItems = useCallback(async (ids: string[]) => {
    if (ids.length === 0) {
      toast.warning('No items to delete')
      return
    }

    const itemType = uiMediaType === 'images' ? 'image' : 'video';
    const message = ids.length === 1 
      ? `Are you sure you want to delete this item from the ${type} gallery?` 
      : `Are you sure you want to delete ${ids.length} selected items from the ${type} gallery?`;

    if (!confirm(message)) {
      return;
    }

    try {
      setIsLoading(true);
      // Delete all specified items with the current gallery type
      await Promise.all(ids.map(id => 
        deleteMediaAction(id, itemType, type as 'public' | 'exclusive' | 'behind-scenes')
      ));
      
      toast.success(`Successfully deleted ${ids.length} item${ids.length > 1 ? 's' : ''} from the ${type} gallery`);
      setSelectedItems(prev => prev.filter(id => !ids.includes(id)));
      await fetchGalleryData();
    } catch (error) {
      console.error('Error deleting items:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to delete items';
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [uiMediaType, fetchGalleryData, type]);

  // Handle bulk delete (for backward compatibility)
  const handleBulkDelete = useCallback(async () => {
    if (selectedItems.length === 0) {
      toast.warning('No items selected');
      return;
    }
    await handleDeleteItems(selectedItems);
  }, [selectedItems, handleDeleteItems]);

  // Handle bulk edit
  const handleBulkEdit = useCallback(() => {
    if (selectedItems.length === 0) {
      toast.warning('No items selected')
      return
    }
    
    // For now, just open the dialog with the first selected item for editing
    const firstItem = uiMediaType === 'images' 
      ? galleryData.images.find(img => img.id === selectedItems[0])
      : galleryData.videos.find(vid => vid.id === selectedItems[0])
      
    if (firstItem) {
      handleEditItem(firstItem);
    }
  }, [selectedItems, uiMediaType, galleryData, handleEditItem])

  // Handle tab change
  const handleTabChange = (value: string) => {
    setUiMediaType(value as 'images' | 'videos')
  }

  // Handle search
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  // Get filtered items based on search query
  const getFilteredItems = useCallback((items: MediaItem[]) => {
    if (!searchQuery) return items
    const query = searchQuery.toLowerCase()
    return items.filter(item => 
      item.title?.toLowerCase().includes(query) || 
      item.description?.toLowerCase().includes(query) ||
      item.tags?.some(tag => tag.toLowerCase().includes(query))
    )
  }, [searchQuery])

  // Get current items based on tab
  const currentItems = uiMediaType === 'images' 
    ? getFilteredItems(galleryData.images) 
    : getFilteredItems(galleryData.videos)

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <div className="container mx-auto py-8 space-y-6">
        <div className="space-y-8">
          {/* Header Section */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">
              {type === 'public' ? 'Public Gallery' : type === 'exclusive' ? 'Exclusive Content' : 'Behind the Scenes'}
            </h1>
            <p className="text-muted-foreground">
              {type === 'public' 
                ? 'Browse our collection of public images and videos' 
                : type === 'exclusive'
                  ? 'Exclusive content for members only'
                  : 'Behind the scenes content and more'}
            </p>
          </div>

          {/* Search and Add New Set */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            <div className="w-full sm:w-auto">
              <Input
                type="search"
                placeholder={`Search ${uiMediaType}...`}
                className="w-full sm:w-[300px]"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            
            {isUserAdmin && (
              <Button 
                onClick={() => {
                  setEditingItem(null);
                  setIsDialogOpen(true);
                }}
                className="whitespace-nowrap"
                disabled={isLoading}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Set
              </Button>
            )}
          </div>

          {/* Media Library Section */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-semibold">Media Library</h2>
                <p className="text-muted-foreground">
                  Manage your {type} {uiMediaType}
                </p>
              </div>
              
              <div className="flex items-center gap-4">
                <Tabs 
                  value={uiMediaType} 
                  onValueChange={handleTabChange}
                  className="w-full sm:w-auto"
                >
                  <TabsList>
                    <TabsTrigger value="images">Images</TabsTrigger>
                    <TabsTrigger value="videos">Videos</TabsTrigger>
                  </TabsList>
                </Tabs>
                
                {isUserAdmin && (
                  <Button 
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setEditingItem(null);
                      setIsDialogOpen(true);
                    }}
                    className="flex items-center gap-2"
                    disabled={isLoading}
                  >
                    <Plus className="w-4 h-4" />
                    Add Media
                  </Button>
                )}
              </div>
            </div>

            <div className="grid gap-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : currentItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">
                    No {uiMediaType} found. {isUserAdmin && 'Try adding some media!'}
                  </p>
                </div>
              ) : (
                <MediaGrid
                  media={currentItems}
                />
              )}
            </div>
          </div>
        </div>

        <MediaDialog
          isOpen={isDialogOpen}
          onCloseAction={() => {
            setIsDialogOpen(false)
            setEditingItem(null)
          }}
          onSaveAction={async (data: SaveMediaData) => {
            // Convert SaveMediaData to MediaUpdateData
            const updateData: MediaUpdateData = {
              ...data,
              id: editingItem?.id, // Include ID for updates
              coverImage: typeof data.coverImage === 'string' ? data.coverImage : '',
              imageUrls: data.imageUrls || [],
              tags: data.tags || []
            }
            const result = await handleSaveMedia(updateData);
            if (result.success) {
              setEditingItem(null);
            }
            return result;
          }}
          type={uiMediaType === 'images' ? 'image' : 'video'}
          galleryType={type}
          initialData={editingItem || undefined}
        />
      </div>
    </Suspense>
  )
}
