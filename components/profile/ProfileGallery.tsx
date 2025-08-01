"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import Image from "next/image"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Plus, ArrowRight, Edit, Trash2 } from "lucide-react"
import { useProfileEdit } from "./ProfileEditContext"
import EditableContent from "./EditableContent"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { toast } from "sonner"
import type { MediaItem } from "@/lib/types"
import { getFeaturedGalleries, getPremiumGalleries, getRecentVideos, addGalleryItem, updateGalleryItem, deleteGalleryItem } from "@/app/actions/gallery"

export default function ProfileGallery() {
  const { isEditMode, setIsDirty } = useProfileEdit()
  const [activeTab, setActiveTab] = useState("featured")
  const [galleryTitle, setGalleryTitle] = useState("My Galleries")
  const [galleryDescription, setGalleryDescription] = useState(
    "Explore my favorite photoshoots and videos. From casual moments to professional shoots, there's something for everyone.",
  )

  const [featuredGalleries, setFeaturedGalleries] = useState<MediaItem[]>([])
  const [premiumGalleries, setPremiumGalleries] = useState<MediaItem[]>([])
  const [recentVideos, setRecentVideos] = useState<MediaItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Load galleries on component mount
  useEffect(() => {
    const loadGalleries = async () => {
      try {
        const [featured, premium, videos] = await Promise.all([
          getFeaturedGalleries(),
          getPremiumGalleries(),
          getRecentVideos()
        ])
        setFeaturedGalleries(featured)
        setPremiumGalleries(premium)
        setRecentVideos(videos)
      } catch (error) {
        console.error('Error loading galleries:', error)
        toast.error('Failed to load galleries')
      } finally {
        setIsLoading(false)
      }
    }
    loadGalleries()
  }, [])

  const [isAddGalleryDialogOpen, setIsAddGalleryDialogOpen] = useState(false)
  const [isEditGalleryDialogOpen, setIsEditGalleryDialogOpen] = useState(false)
  const [isDeleteConfirmDialogOpen, setIsDeleteConfirmDialogOpen] = useState(false)
  const [currentGallery, setCurrentGallery] = useState<MediaItem | null>(null)
  const [newGallery, setNewGallery] = useState<Partial<MediaItem>>({
    title: "",
    coverImage: "/placeholder.svg?height=600&width=800",
    isPremium: false,
    slug: "",
    type: "image",
  })

  const handleAddGallery = async () => {
    try {
      const id = `new-${Date.now()}`
      const slug = newGallery.title?.toLowerCase().replace(/\s+/g, "-") || ""
      const galleryItem: MediaItem = {
        ...newGallery,
        id,
        slug,
        type: newGallery.type || "image",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        imageUrls: [newGallery.coverImage || "/placeholder.svg?height=600&width=800"],
        tags: [],
        description: "",
        galleryType: "public",
      } as MediaItem

      await addGalleryItem(galleryItem)
      
      if (activeTab === "featured") {
        setFeaturedGalleries([...featuredGalleries, galleryItem])
      } else if (activeTab === "premium") {
        setPremiumGalleries([...premiumGalleries, galleryItem])
      } else if (activeTab === "videos") {
        setRecentVideos([...recentVideos, galleryItem])
      }

      setNewGallery({
        title: "",
        coverImage: "/placeholder.svg?height=600&width=800",
        isPremium: false,
        slug: "",
        type: "image",
      })
      setIsAddGalleryDialogOpen(false)
      setIsDirty(true)
      toast.success('Gallery added successfully')
    } catch (error) {
      console.error('Error adding gallery:', error)
      toast.error('Failed to add gallery')
    }
  }

  const handleEditGallery = async () => {
    if (!currentGallery) return

    try {
      await updateGalleryItem(currentGallery.id, currentGallery)
      
      if (activeTab === "featured") {
        setFeaturedGalleries(featuredGalleries.map(g => 
          g.id === currentGallery.id ? currentGallery : g
        ))
      } else if (activeTab === "premium") {
        setPremiumGalleries(premiumGalleries.map(g => 
          g.id === currentGallery.id ? currentGallery : g
        ))
      } else if (activeTab === "videos") {
        setRecentVideos(recentVideos.map(g => 
          g.id === currentGallery.id ? currentGallery : g
        ))
      }

      setIsEditGalleryDialogOpen(false)
      setCurrentGallery(null)
      setIsDirty(true)
      toast.success('Gallery updated successfully')
    } catch (error) {
      console.error('Error updating gallery:', error)
      toast.error('Failed to update gallery')
    }
  }

  const handleDeleteGallery = async () => {
    if (!currentGallery) return

    try {
      await deleteGalleryItem(currentGallery.id, currentGallery.type as 'image' | 'video')
      
      if (activeTab === "featured") {
        setFeaturedGalleries(featuredGalleries.filter(g => g.id !== currentGallery.id))
      } else if (activeTab === "premium") {
        setPremiumGalleries(premiumGalleries.filter(g => g.id !== currentGallery.id))
      } else if (activeTab === "videos") {
        setRecentVideos(recentVideos.filter(g => g.id !== currentGallery.id))
      }

      setIsDeleteConfirmDialogOpen(false)
      setCurrentGallery(null)
      setIsDirty(true)
      toast.success('Gallery deleted successfully')
    } catch (error) {
      console.error('Error deleting gallery:', error)
      toast.error('Failed to delete gallery')
    }
  }

  const getActiveGalleries = () => {
    if (activeTab === "featured") return featuredGalleries
    if (activeTab === "premium") return premiumGalleries
    return recentVideos
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h2 className="text-3xl font-bold mb-2">
            <EditableContent
              profile={{ id: "gallery-title", full_name: galleryTitle }}
              onSave={async (data) => setGalleryTitle(data.full_name)}
              isEditing={isEditMode}
              onEditToggle={() => {}}
            />
          </h2>
          <div className="text-gray-600 max-w-2xl">
            <EditableContent
              profile={{ id: "gallery-description", bio: galleryDescription }}
              onSave={async (data) => setGalleryDescription(data.bio)}
              isEditing={isEditMode}
              onEditToggle={() => {}}
            />
          </div>
        </div>

        {!isEditMode && (
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link href="/gallery">
              View All Galleries <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>

      <Tabs defaultValue="featured" value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-8">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="featured">Featured</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="videos">Videos</TabsTrigger>
          </TabsList>

          {isEditMode && (
            <Button
              onClick={() => setIsAddGalleryDialogOpen(true)}
              className="ml-4 bg-rose-500 hover:bg-rose-600"
              size="sm"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Item
            </Button>
          )}
        </div>

        <TabsContent value="featured">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {featuredGalleries.map((gallery, index) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                index={index}
                isEditMode={isEditMode}
                onEdit={(gallery) => {
                  setCurrentGallery(gallery)
                  setIsEditGalleryDialogOpen(true)
                }}
                onDelete={(gallery) => {
                  setCurrentGallery(gallery)
                  setIsDeleteConfirmDialogOpen(true)
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="premium">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {premiumGalleries.map((gallery, index) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                index={index}
                isEditMode={isEditMode}
                onEdit={(gallery) => {
                  setCurrentGallery(gallery)
                  setIsEditGalleryDialogOpen(true)
                }}
                onDelete={(gallery) => {
                  setCurrentGallery(gallery)
                  setIsDeleteConfirmDialogOpen(true)
                }}
              />
            ))}
          </div>
        </TabsContent>

        <TabsContent value="videos">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {recentVideos.map((gallery, index) => (
              <GalleryCard
                key={gallery.id}
                gallery={gallery}
                index={index}
                isEditMode={isEditMode}
                onEdit={(gallery) => {
                  setCurrentGallery(gallery)
                  setIsEditGalleryDialogOpen(true)
                }}
                onDelete={(gallery) => {
                  setCurrentGallery(gallery)
                  setIsDeleteConfirmDialogOpen(true)
                }}
              />
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Gallery Dialog */}
      <Dialog open={isAddGalleryDialogOpen} onOpenChange={setIsAddGalleryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Gallery Item</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add a new item to your gallery
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={newGallery.title}
                onChange={(e) => setNewGallery({ ...newGallery, title: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="slug">Slug (optional)</Label>
              <Input
                id="slug"
                value={newGallery.slug}
                onChange={(e) => setNewGallery({ ...newGallery, slug: e.target.value })}
                placeholder="Will be generated from title if empty"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="premium"
                checked={newGallery.isPremium}
                onCheckedChange={(checked) => setNewGallery({ ...newGallery, isPremium: checked })}
              />
              <Label htmlFor="premium">Premium Content</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddGalleryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddGallery}>Add Gallery</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Gallery Dialog */}
      <Dialog open={isEditGalleryDialogOpen} onOpenChange={setIsEditGalleryDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Gallery Item</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Update the gallery item details
            </p>
          </DialogHeader>
          {currentGallery && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="edit-title">Title</Label>
                <Input
                  id="edit-title"
                  value={currentGallery.title}
                  onChange={(e) => setCurrentGallery({ ...currentGallery, title: e.target.value })}
                />
              </div>
              <div>
                <Label htmlFor="edit-slug">Slug</Label>
                <Input
                  id="edit-slug"
                  value={currentGallery.slug}
                  onChange={(e) => setCurrentGallery({ ...currentGallery, slug: e.target.value })}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Switch
                  id="edit-premium"
                  checked={currentGallery.isPremium}
                  onCheckedChange={(checked) => setCurrentGallery({ ...currentGallery, isPremium: checked })}
                />
                <Label htmlFor="edit-premium">Premium Content</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditGalleryDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditGallery}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmDialogOpen} onOpenChange={setIsDeleteConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Gallery Item</DialogTitle>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone
            </p>
          </DialogHeader>
          <p>Are you sure you want to delete this gallery item?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteConfirmDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteGallery}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function GalleryCard({
  gallery,
  index,
  isEditMode,
  onEdit,
  onDelete,
}: {
  gallery: MediaItem
  index: number
  isEditMode: boolean
  onEdit: (gallery: MediaItem) => void
  onDelete: (gallery: MediaItem) => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
      className="group relative"
    >
      {isEditMode && (
        <div className="absolute top-2 right-2 z-20 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={() => onEdit(gallery)}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="destructive"
            size="icon"
            className="h-8 w-8 bg-white/90 hover:bg-white"
            onClick={() => onDelete(gallery)}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      )}

      <div className="relative aspect-[4/3] overflow-hidden rounded-lg">
        <Image
          src={gallery.coverImage}
          alt={gallery.title}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {gallery.isPremium && (
          <div className="absolute top-2 right-2 bg-rose-500 text-white px-2 py-1 rounded text-sm font-medium">
            Premium
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end">
          <div className="p-4 text-white">
            <h3 className="font-bold text-lg">{gallery.title}</h3>
          </div>
        </div>
      </div>
    </motion.div>
  )
}
