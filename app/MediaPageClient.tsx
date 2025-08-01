'use client'

import { useState, useEffect } from 'react'
import { DynamicPage } from '@/app/utils/dynamic-page'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { toast } from 'sonner'
import { 
  Upload, 
  Image as ImageIcon, 
  Video, 
  Search, 
  Filter, 
  Grid, 
  List, 
  Trash2, 
  Edit, 
  Tag,
  Folder,
  MoreVertical,
  Loader2
} from 'lucide-react'
import supabase from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import MediaLibrary from '@/components/media/MediaLibrary'
import { FileUploader } from '@/components/ui/file-uploader'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

// Cloudinary Media Item interface (matching MediaLibrary)
interface CloudinaryMediaItem {
  id: string
  public_id: string
  secure_url: string
  url: string
  name: string
  type: 'image' | 'video'
  resource_type: 'image' | 'video'
  bytes: number
  created_at: string
  format: string
  width?: number
  height?: number
  tags: string[]
  context: Record<string, any>
  asset_id?: string
}

export default function MediaPageClient() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mediaItems, setMediaItems] = useState<CloudinaryMediaItem[]>([])
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState<'all' | 'images' | 'videos'>('all')
  const [showUploadDialog, setShowUploadDialog] = useState(false)
  const [uploadType, setUploadType] = useState<'image' | 'video'>('image')
  const router = useRouter()

  useEffect(() => {
    const fetchMedia = async () => {
      try {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError) throw userError
        if (!user) {
          router.push('/auth/login')
          return
        }

        // Check if user is admin by checking their email against the admin email setting
        const { data: settings, error: settingsError } = await supabase
          .from('app_settings')
          .select('key, value')
          .eq('key', 'admin_email')
          .single()

        if (settingsError) {
          console.error('Error fetching admin settings:', settingsError)
          toast.error('Access denied. Admin privileges required.')
          router.push('/dashboard')
          return
        }

        if (user.email !== settings.value) {
          toast.error('Access denied. Admin privileges required.')
          router.push('/dashboard')
          return
        }

        // Use the same API route that MediaLibrary uses successfully
        const response = await fetch('/api/media/cloudinary?type=all&max_results=100')
        if (!response.ok) {
          throw new Error('Failed to fetch media from Cloudinary')
        }
        
        const data = await response.json()
        if (data.resources) {
          setMediaItems(data.resources)
        } else {
          setMediaItems([])
        }
      } catch (err) {
        setError('Failed to load media')
        toast.error('Failed to load media')
        console.error('Error fetching media:', err)
      } finally {
        setLoading(false)
      }
    }

    fetchMedia()
  }, [router, supabase])

  const handleUpload = async (file: File) => {
    try {
      setLoading(true)
      
      // Upload to Cloudinary using the same approach as other components
      const formData = new FormData()
      formData.append('file', file)
      formData.append('upload_preset', process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || '')
      
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${uploadType}/upload`
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      })
      
      if (!response.ok) {
        throw new Error('Failed to upload to Cloudinary')
      }
      
      const result = await response.json()
      
      // Refresh the media list
      const mediaResponse = await fetch('/api/media/cloudinary?type=all&max_results=100')
      if (mediaResponse.ok) {
        const mediaData = await mediaResponse.json()
        if (mediaData.resources) {
          setMediaItems(mediaData.resources)
        }
      }
      
      toast.success('Media uploaded successfully')
      setShowUploadDialog(false)
    } catch (err) {
      toast.error('Failed to upload media')
      console.error('Upload error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (ids: string[]) => {
    try {
      setLoading(true)
      
      // Delete from Cloudinary using the same approach as MediaLibrary
      for (const id of ids) {
        const item = mediaItems.find(item => item.id === id)
        if (item) {
          const response = await fetch(`/api/media/cloudinary/${item.public_id}`, {
            method: 'DELETE'
          })
          
          if (!response.ok) {
            throw new Error(`Failed to delete ${item.name}`)
          }
        }
      }

      // Remove from local state
      setMediaItems(prev => prev.filter(item => !ids.includes(item.id)))
      setSelectedItems([])
      toast.success('Media deleted successfully')
    } catch (err) {
      toast.error('Failed to delete media')
      console.error('Delete error:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredMedia = mediaItems.filter(item => {
    const matchesType = activeTab === 'all' || 
      (activeTab === 'images' && item.type === 'image') ||
      (activeTab === 'videos' && item.type === 'video')
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.public_id?.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesType && matchesSearch
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <DynamicPage>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Media Library</h1>
            <p className="text-muted-foreground">Manage your Cloudinary media files</p>
          </div>
          <div className="flex items-center space-x-4">
            <Button onClick={() => setShowUploadDialog(true)}>
              <Upload className="h-4 w-4 mr-2" />
              Upload Media
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => setViewMode('grid')}>
                  <Grid className="h-4 w-4 mr-2" />
                  Grid View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setViewMode('list')}>
                  <List className="h-4 w-4 mr-2" />
                  List View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {error && (
          <div className="bg-destructive/15 text-destructive p-4 rounded-lg mb-6">
            {error}
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
                  <TabsList>
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="images">
                      <ImageIcon className="h-4 w-4 mr-2" />
                      Images
                    </TabsTrigger>
                    <TabsTrigger value="videos">
                      <Video className="h-4 w-4 mr-2" />
                      Videos
                    </TabsTrigger>
                  </TabsList>
                </Tabs>
                <Badge variant="secondary">
                  {filteredMedia.length} items
                </Badge>
              </div>
              <div className="flex items-center space-x-2">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search media..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-64"
                  />
                </div>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {selectedItems.length > 0 && (
              <div className="mb-4 p-4 bg-muted rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    {selectedItems.length} item(s) selected
                  </span>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedItems([])}
                    >
                      Clear Selection
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(selectedItems)}
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete Selected
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                      selectedItems.includes(item.id) ? 'border-primary' : 'border-transparent'
                    }`}
                    onClick={() => {
                      if (selectedItems.includes(item.id)) {
                        setSelectedItems(prev => prev.filter(id => id !== item.id))
                      } else {
                        setSelectedItems(prev => [...prev, item.id])
                      }
                    }}
                  >
                    <div className="aspect-square bg-muted">
                      {item.type === 'image' ? (
                        <img
                          src={item.secure_url}
                          alt={item.name || 'Media item'}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Video className="h-8 w-8 text-muted-foreground" />
                        </div>
                      )}
                    </div>
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="sm" variant="secondary">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="p-2">
                      <p className="text-sm font-medium truncate">{item.name || 'Untitled'}</p>
                      <p className="text-xs text-muted-foreground">
                        {item.format?.toUpperCase()} • {Math.round((item.bytes || 0) / 1024)}KB
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {filteredMedia.map((item) => (
                  <div
                    key={item.id}
                    className={`flex items-center space-x-4 p-4 rounded-lg border-2 transition-all ${
                      selectedItems.includes(item.id) ? 'border-primary bg-primary/5' : 'border-transparent'
                    }`}
                    onClick={() => {
                      if (selectedItems.includes(item.id)) {
                        setSelectedItems(prev => prev.filter(id => id !== item.id))
                      } else {
                        setSelectedItems(prev => [...prev, item.id])
                      }
                    }}
                  >
                    <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                      {item.type === 'image' ? (
                        <img
                          src={item.secure_url}
                          alt={item.name || 'Media item'}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Video className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{item.name || 'Untitled'}</p>
                      <p className="text-sm text-muted-foreground">
                        {item.format?.toUpperCase()} • {Math.round((item.bytes || 0) / 1024)}KB
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete([item.id])
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {filteredMedia.length === 0 && (
              <div className="text-center py-12">
                <Folder className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No media found</h3>
                <p className="text-muted-foreground mb-4">
                  {searchQuery ? 'Try adjusting your search terms' : 'Upload your first media file to get started'}
                </p>
                {!searchQuery && (
                  <Button onClick={() => setShowUploadDialog(true)}>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Media
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upload Dialog */}
        {showUploadDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h2 className="text-xl font-bold mb-4">Upload Media</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Media Type</label>
                  <Tabs value={uploadType} onValueChange={(value) => setUploadType(value as typeof uploadType)}>
                    <TabsList className="w-full">
                      <TabsTrigger value="image" className="flex-1">
                        <ImageIcon className="h-4 w-4 mr-2" />
                        Image
                      </TabsTrigger>
                      <TabsTrigger value="video" className="flex-1">
                        <Video className="h-4 w-4 mr-2" />
                        Video
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
                <FileUploader
                  onFileSelect={handleUpload}
                  accept={uploadType === 'image' ? 'image/*' : 'video/*'}
                  maxSize={50 * 1024 * 1024} // 50MB
                />
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DynamicPage>
  )
} 