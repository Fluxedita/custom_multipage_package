"use client"

import { DialogFooter } from "@/components/ui/dialog"
import { DialogTitle } from "@/components/ui/dialog"
import { DialogHeader } from "@/components/ui/dialog"
import { DialogContent } from "@/components/ui/dialog"
import { Dialog } from "@/components/ui/dialog"
import type { GalleryType } from '@/lib/types';

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import {
  Search,
  MoreVertical,
  Plus,
  Filter,
  Grid,
  List,
  ImageIcon,
  Video,
  FileText,
  Trash2,
  Edit,
  Tag,
  Calendar,
  Eye,
  Download,
  Star,
  StarOff,
  SlidersHorizontal,
  X,
  Check,
  ChevronDown,
} from "lucide-react"
import type { MediaItem } from "@/lib/types"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar as CalendarComponent } from "@/components/ui/calendar"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Label } from "@/components/ui/label"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

// Define media types
type MediaType = "image" | "video" | "document" | "audio" | "other"
type ViewMode = "grid" | "list"
type SortField = "date" | "name" | "type" | "size"
type SortDirection = "asc" | "desc"

interface MediaFile {
  id: string
  name: string
  url: string
  thumbnailUrl: string
  type: MediaType
  size: number
  dimensions?: string
  duration?: string
  createdAt: string
  updatedAt: string
  tags: string[]
  isFavorite: boolean
  isPublic: boolean
  isPremium: boolean
  category?: string
  description?: string
  usedIn?: string[]
  // MediaItem properties for compatibility
  imageUrls?: string[];
  title?: string;
  videoUrl?: string;
  coverImage?: string;
}

export function ContentManager() {
  // State for media items
  const [mediaItems, setMediaItems] = useState<MediaFile[]>([])
  const [filteredItems, setFilteredItems] = useState<MediaFile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedItems, setSelectedItems] = useState<string[]>([])
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeFilters, setActiveFilters] = useState<{
    types: MediaType[]
    tags: string[]
    dateRange: { from?: Date; to?: Date }
    favorites: boolean
    premium: boolean | null
    public: boolean | null
    categories: string[]
  }>({
    types: [],
    tags: [],
    dateRange: {},
    favorites: false,
    premium: null,
    public: null,
    categories: [],
  })
  const [sort, setSort] = useState<{ field: SortField; direction: SortDirection }>({
    field: "date",
    direction: "desc",
  })

  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editItem, setEditItem] = useState<MediaFile | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [itemToDelete, setItemToDelete] = useState<string | null>(null)
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
  const [detailItem, setDetailItem] = useState<MediaFile | null>(null)
  const [isTagModalOpen, setIsTagModalOpen] = useState(false)
  const [newTag, setNewTag] = useState("")

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(20)
  const [totalItems, setTotalItems] = useState(0)

  // Load media items
  useEffect(() => {
    const fetchMediaItems = async () => {
      setIsLoading(true)
      // In a real app, this would be an API call
      // For demo purposes, we'll generate mock data
      const mockData: MediaFile[] = generateMockMediaItems(50)
      setMediaItems(mockData)
      setTotalItems(mockData.length)
      setIsLoading(false)
    }

    fetchMediaItems()
  }, [])

  // Apply filters and search
  useEffect(() => {
    let results = [...mediaItems]

    // Apply search
    if (searchQuery) {
      const query = searchQuery.toLowerCase()
      results = results.filter(
        (item) =>
          item.name.toLowerCase().includes(query) ||
          item.description?.toLowerCase().includes(query) ||
          item.tags.some((tag) => tag.toLowerCase().includes(query)),
      )
    }

    // Apply type filters
    if (activeFilters.types.length > 0) {
      results = results.filter((item) => activeFilters.types.includes(item.type))
    }

    // Apply tag filters
    if (activeFilters.tags.length > 0) {
      results = results.filter((item) => activeFilters.tags.some((tag) => item.tags.includes(tag)))
    }

    // Apply date range filter
    if (activeFilters.dateRange.from || activeFilters.dateRange.to) {
      results = results.filter((item) => {
        const itemDate = new Date(item.createdAt)
        if (activeFilters.dateRange.from && activeFilters.dateRange.to) {
          return itemDate >= activeFilters.dateRange.from && itemDate <= activeFilters.dateRange.to
        } else if (activeFilters.dateRange.from) {
          return itemDate >= activeFilters.dateRange.from
        } else if (activeFilters.dateRange.to) {
          return itemDate <= activeFilters.dateRange.to
        }
        return true
      })
    }

    // Apply favorites filter
    if (activeFilters.favorites) {
      results = results.filter((item) => item.isFavorite)
    }

    // Apply premium filter
    if (activeFilters.premium !== null) {
      results = results.filter((item) => item.isPremium === activeFilters.premium)
    }

    // Apply public filter
    if (activeFilters.public !== null) {
      results = results.filter((item) => item.isPublic === activeFilters.public)
    }

    // Apply category filters
    if (activeFilters.categories.length > 0) {
      results = results.filter((item) => item.category && activeFilters.categories.includes(item.category))
    }

    // Apply sorting
    results.sort((a, b) => {
      let comparison = 0
      switch (sort.field) {
        case "name":
          comparison = a.name.localeCompare(b.name)
          break
        case "type":
          comparison = a.type.localeCompare(b.type)
          break
        case "size":
          comparison = a.size - b.size
          break
        case "date":
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
          break
      }
      return sort.direction === "asc" ? comparison : -comparison
    })

    setFilteredItems(results)
  }, [mediaItems, searchQuery, activeFilters, sort])

  // Get paginated items
  const getPaginatedItems = () => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredItems.slice(startIndex, endIndex)
  }

  // Handle item selection
  const toggleItemSelection = (id: string) => {
    setSelectedItems((prev) => {
      if (prev.includes(id)) {
        return prev.filter((itemId) => itemId !== id)
      } else {
        return [...prev, id]
      }
    })
  }

  // Handle select all
  const toggleSelectAll = () => {
    if (selectedItems.length === getPaginatedItems().length) {
      setSelectedItems([])
    } else {
      setSelectedItems(getPaginatedItems().map((item) => item.id))
    }
  }

  // Handle bulk actions
  const handleBulkDelete = () => {
    setMediaItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)))
    setSelectedItems([])
  }

  const handleBulkTag = () => {
    setIsTagModalOpen(true)
  }

  const applyBulkTag = () => {
    if (!newTag.trim()) return

    setMediaItems((prev) =>
      prev.map((item) => {
        if (selectedItems.includes(item.id)) {
          return {
            ...item,
            tags: [...new Set([...item.tags, newTag.trim()])],
          }
        }
        return item
      }),
    )

    setNewTag("")
    setIsTagModalOpen(false)
  }

  // Handle item actions
  const handleEdit = (item: MediaFile) => {
    // Convert to MediaItem format for the dialog
    const mediaItem: MediaItem = {
      id: item.id,
      slug: item.name.toLowerCase().replace(/\s+/g, "-"),
      title: item.name,
      description: item.description || "",
      coverImage: item.thumbnailUrl,
      isPremium: item.isPremium,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      tags: item.tags,
      type: item.type === "image" || item.type === "video" ? item.type : "image",
      imageUrls: item.type === "image" ? [item.url] : [],
      videoUrl: item.type === "video" ? item.url : undefined,
      galleryType: "public",
    }

    handleOpenEditDialog(mediaItem)
    // setIsDialogOpen(true) // already handled in handleOpenEditDialog
  }

  const handleDelete = (id: string) => {
    setItemToDelete(id)
    setIsDeleteDialogOpen(true)
  }

  const confirmDelete = () => {
    if (itemToDelete) {
      setMediaItems((prev) => prev.filter((item) => item.id !== itemToDelete))
      setIsDeleteDialogOpen(false)
      setItemToDelete(null)
    }
  }

  const handleViewDetails = (item: MediaFile) => {
    setDetailItem(item)
    setIsDetailModalOpen(true)
  }

  const handleToggleFavorite = (id: string) => {
    setMediaItems((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          return { ...item, isFavorite: !item.isFavorite }
        }
        return item
      }),
    )
  }

  const handleAddNew = () => {
    setEditItem(null)
    setIsDialogOpen(true)
  }

  const handleDialogClose = () => {
    setIsDialogOpen(false)
    setEditItem(null)
  }

  // Define SaveMediaData type with all required fields
type SaveMediaData = {
  id?: string;
  slug?: string;
  galleryType: GalleryType;
  type: 'image' | 'video';
  title: string;
  description: string;
  coverImage: string;
  imageUrls: string[];
  videoUrl?: string;
  isPremium: boolean;
  tags: string[];
  featured?: boolean;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

const handleSave = async (data: SaveMediaData): Promise<{ success: boolean; data?: MediaItem; error?: string }> => {
    // In a real app, you would save the item to your backend
    try {
      // Simulate save
      console.log("Save item:", data);
      setIsDialogOpen(false);
      setEditItem(null);
      // Ensure id is always a string for MediaItem compatibility
const mediaItem: MediaItem = {
  ...(data as any),
  id: data.id ?? Date.now().toString(),
  createdAt: (data as any).createdAt ?? new Date().toISOString(),
  updatedAt: (data as any).updatedAt ?? new Date().toISOString(),
};
return { success: true, data: mediaItem };
    } catch (error: any) {
      return { success: false, error: error?.message || 'Unknown error' };
    }
  }

  // Reset filters
  const resetFilters = () => {
    setActiveFilters({
      types: [],
      tags: [],
      dateRange: {},
      favorites: false,
      premium: null,
      public: null,
      categories: [],
    })
    setSearchQuery("")
  }

  // Get all available tags from media items
  const getAllTags = () => {
    const tags = new Set<string>()
    mediaItems.forEach((item) => {
      item.tags.forEach((tag) => tags.add(tag))
    })
    return Array.from(tags).sort()
  }

  // Get all available categories from media items
  const getAllCategories = () => {
    const categories = new Set<string>()
    mediaItems.forEach((item) => {
      if (item.category) categories.add(item.category)
    })
    return Array.from(categories).sort()
  }

  // Generate mock media items for demo
  const generateMockMediaItems = (count: number): MediaFile[] => {
    const types: MediaType[] = ["image", "video", "document", "audio", "other"]
    const categories = ["Photoshoots", "Behind the Scenes", "Travel", "Lifestyle", "Fashion", "Promotional"]
    const tags = [
      "summer",
      "beach",
      "fashion",
      "portrait",
      "lifestyle",
      "travel",
      "london",
      "nature",
      "urban",
      "premium",
      "exclusive",
      "bts",
      "photoshoot",
    ]

    return Array.from({ length: count }).map((_, index) => {
      const type = types[Math.floor(Math.random() * types.length)]
      const isImage = type === "image"
      const isVideo = type === "video"
      const randomTags = Array.from({ length: Math.floor(Math.random() * 5) + 1 }).map(
        () => tags[Math.floor(Math.random() * tags.length)],
      )
      const uniqueTags = [...new Set(randomTags)]
      const isPremium = Math.random() > 0.7
      const isFavorite = Math.random() > 0.8
      const isPublic = Math.random() > 0.3
      const category = Math.random() > 0.2 ? categories[Math.floor(Math.random() * categories.length)] : undefined

      // Generate a random date within the last year
      const randomDate = new Date()
      randomDate.setDate(randomDate.getDate() - Math.floor(Math.random() * 365))

      return {
        id: `media-${index + 1}`,
        name: `${type === "image" ? "Image" : type === "video" ? "Video" : "File"} ${index + 1}`,
        url: isImage
          ? `/placeholder.svg?height=800&width=1200`
          : isVideo
            ? "https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4"
            : `/placeholder.svg?height=800&width=1200`,
        thumbnailUrl: `/placeholder.svg?height=400&width=600`,
        type,
        size: Math.floor(Math.random() * 10000000), // Random size in bytes
        dimensions: isImage
          ? `${1200 + Math.floor(Math.random() * 800)}x${800 + Math.floor(Math.random() * 600)}`
          : undefined,
        duration: isVideo
          ? `${Math.floor(Math.random() * 10) + 1}:${Math.floor(Math.random() * 60)
              .toString()
              .padStart(2, "0")}`
          : undefined,
        createdAt: randomDate.toISOString(),
        updatedAt: new Date(randomDate.getTime() + Math.floor(Math.random() * 30) * 24 * 60 * 60 * 1000).toISOString(),
        tags: uniqueTags,
        isFavorite,
        isPublic,
        isPremium,
        category,
        description: Math.random() > 0.3 ? `Description for ${type} ${index + 1}` : undefined,
        usedIn: Math.random() > 0.7 ? ["Profile", "Gallery", "Home Page"] : undefined,
      }
    })
  }

  // Add a utility function to convert MediaItem to MediaFile
  function mediaItemToMediaFile(item: any): MediaFile {
    return {
      id: item.id,
      name: item.title || '',
      url: item.coverImage || item.url || '',
      thumbnailUrl: item.coverImage || item.thumbnailUrl || '',
      type: item.type || 'image',
      size: item.size || 0,
      dimensions: item.dimensions || '',
      duration: item.duration || '',
      createdAt: item.createdAt || '',
      updatedAt: item.updatedAt || '',
      tags: item.tags || [],
      isFavorite: item.isFavorite || false,
      isPublic: item.isPublic || false,
      isPremium: item.isPremium || false,
      category: item.category || '',
      description: item.description || '',
      usedIn: item.usedIn || [],
      imageUrls: item.imageUrls || [],
      title: item.title || '',
      videoUrl: item.videoUrl || '',
      coverImage: item.coverImage || '',
    };
  }

  // When setting editItem and detailItem, always convert to MediaFile
  const handleOpenEditDialog = (item: any) => {
    setEditItem(mediaItemToMediaFile(item));
    setIsDialogOpen(true);
  };
  const handleOpenDetailModal = (item: any) => {
    setDetailItem(mediaItemToMediaFile(item));
    setIsDetailModalOpen(true);
  };

  // Render media item based on view mode
  const renderMediaItem = (item: MediaFile) => {
    const isSelected = selectedItems.includes(item.id)

    if (viewMode === "grid") {
      return (
        <div
          key={item.id}
          className={cn(
            "group relative rounded-md overflow-hidden border bg-card transition-all",
            isSelected ? "ring-2 ring-primary" : "hover:shadow-md",
          )}
        >
          <div className="relative aspect-square bg-muted">
            {item.type === "image" && (
              <img
                src={item.thumbnailUrl || "/placeholder.svg"}
                alt={item.name}
                className="w-full h-full object-cover transition-opacity group-hover:opacity-90"
              />
            )}
            {item.type === "video" && (
              <div className="w-full h-full flex items-center justify-center bg-black">
                <Video className="h-12 w-12 text-muted-foreground opacity-50" />
              </div>
            )}
            {item.type === "document" && (
              <div className="w-full h-full flex items-center justify-center bg-blue-50">
                <FileText className="h-12 w-12 text-blue-500 opacity-70" />
              </div>
            )}
            {item.type === "audio" && (
              <div className="w-full h-full flex items-center justify-center bg-purple-50">
                <FileText className="h-12 w-12 text-purple-500 opacity-70" />
              </div>
            )}
            {item.type === "other" && (
              <div className="w-full h-full flex items-center justify-center bg-gray-50">
                <FileText className="h-12 w-12 text-gray-500 opacity-70" />
              </div>
            )}

            {/* Selection checkbox */}
            <div className="absolute top-2 left-2 z-10">
              <Checkbox
                checked={isSelected}
                onCheckedChange={() => toggleItemSelection(item.id)}
                className="h-5 w-5 bg-white/90 border-gray-300"
              />
            </div>

            {/* Favorite icon */}
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleToggleFavorite(item.id)
              }}
              className="absolute top-2 right-2 z-10 h-7 w-7 rounded-full bg-white/90 flex items-center justify-center shadow-sm hover:bg-white transition-colors"
            >
              {item.isFavorite ? (
                <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              ) : (
                <StarOff className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {/* Quick actions overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleViewDetails(item)
                }}
              >
                <Eye className="h-4 w-4 mr-1" />
                View
              </Button>
              <Button
                size="sm"
                variant="secondary"
                className="h-8 px-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEdit(item)
                }}
              >
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                className="h-8 px-2"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDelete(item.id)
                }}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="p-3">
            <div className="flex items-start justify-between">
              <div className="truncate">
                <h3 className="text-sm font-medium truncate" title={item.name}>
                  {item.name}
                </h3>
                <p className="text-xs text-muted-foreground">{format(new Date(item.createdAt), "MMM d, yyyy")}</p>
              </div>
              <div className="flex flex-col items-end">
                {item.isPremium && (
                  <Badge variant="secondary" className="ml-2 bg-rose-100 text-rose-800 hover:bg-rose-200">
                    Premium
                  </Badge>
                )}
                {!item.isPublic && (
                  <Badge variant="outline" className="ml-2 mt-1">
                    Private
                  </Badge>
                )}
              </div>
            </div>

            {item.tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {item.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {item.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{item.tags.length - 3}
                  </Badge>
                )}
              </div>
            )}
          </div>
        </div>
      )
    } else {
      // List view
      return (
        <TableRow key={item.id} className={isSelected ? "bg-muted/50" : ""}>
          <TableCell className="w-12">
            <Checkbox
              checked={isSelected}
              onCheckedChange={() => toggleItemSelection(item.id)}
              aria-label="Select row"
            />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded overflow-hidden bg-muted flex items-center justify-center">
                {item.type === "image" ? (
                  <img
                    src={item.thumbnailUrl || "/placeholder.svg"}
                    alt={item.name}
                    className="h-full w-full object-cover"
                  />
                ) : item.type === "video" ? (
                  <Video className="h-5 w-5 text-muted-foreground" />
                ) : (
                  <FileText className="h-5 w-5 text-muted-foreground" />
                )}
              </div>
              <div className="flex flex-col">
                <span className="font-medium">{item.name}</span>
                <span className="text-xs text-muted-foreground">
                  {item.type === "image"
                    ? item.dimensions
                    : item.type === "video"
                      ? item.duration
                      : formatFileSize(item.size)}
                </span>
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Badge
              variant={
                item.type === "image"
                  ? "default"
                  : item.type === "video"
                    ? "secondary"
                    : item.type === "document"
                      ? "outline"
                      : "outline"
              }
              className={
                item.type === "image"
                  ? "bg-blue-100 text-blue-800 hover:bg-blue-200"
                  : item.type === "video"
                    ? "bg-purple-100 text-purple-800 hover:bg-purple-200"
                    : ""
              }
            >
              {item.type.charAt(0).toUpperCase() + item.type.slice(1)}
            </Badge>
          </TableCell>
          <TableCell>{item.category || "-"}</TableCell>
          <TableCell>
            <div className="flex gap-1">
              {item.isPremium && (
                <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200">
                  Premium
                </Badge>
              )}
              {!item.isPublic && <Badge variant="outline">Private</Badge>}
            </div>
          </TableCell>
          <TableCell>
            <div className="flex flex-wrap gap-1 max-w-[200px]">
              {item.tags.slice(0, 3).map((tag) => (
                <Badge key={tag} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {item.tags.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{item.tags.length - 3}
                </Badge>
              )}
            </div>
          </TableCell>
          <TableCell>{format(new Date(item.createdAt), "MMM d, yyyy")}</TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Button
                size="icon"
                variant="ghost"
                className="h-8 w-8"
                onClick={() => handleToggleFavorite(item.id)}
                title={item.isFavorite ? "Remove from favorites" : "Add to favorites"}
              >
                {item.isFavorite ? (
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                ) : (
                  <Star className="h-4 w-4 text-muted-foreground" />
                )}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => handleViewDetails(item)}>
                    <Eye className="h-4 w-4 mr-2" />
                    View details
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleEdit(item)}>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-red-600">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </TableCell>
        </TableRow>
      )
    }
  }

  // Helper function to format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  // Render loading skeletons
  const renderSkeletons = () => {
    if (viewMode === "grid") {
      return Array.from({ length: 12 }).map((_, index) => (
        <div key={index} className="rounded-md overflow-hidden border bg-card">
          <Skeleton className="aspect-square" />
          <div className="p-3">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        </div>
      ))
    } else {
      return Array.from({ length: 5 }).map((_, index) => (
        <TableRow key={index}>
          <TableCell>
            <Skeleton className="h-5 w-5" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded" />
              <div className="space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-20" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-16" />
          </TableCell>
          <TableCell>
            <div className="flex gap-1">
              <Skeleton className="h-5 w-12" />
              <Skeleton className="h-5 w-12" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-5 w-24" />
          </TableCell>
          <TableCell>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-8 rounded-full" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </TableCell>
        </TableRow>
      ))
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <CardTitle>Media Library</CardTitle>
              <CardDescription>Manage your images, videos, and other media files</CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button onClick={handleAddNew}>
                <Plus className="mr-2 h-4 w-4" />
                Add Media
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Search and filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search media..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-2">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <Filter className="h-4 w-4 mr-1" />
                      Filters
                      {Object.values(activeFilters).some((filter) =>
                        Array.isArray(filter) ? filter.length > 0 : filter !== null && filter !== false,
                      ) && (
                        <Badge variant="secondary" className="ml-1 h-5 px-1">
                          {
                            // Count active filters
                            [
                              activeFilters.types.length,
                              activeFilters.tags.length,
                              activeFilters.categories.length,
                              activeFilters.dateRange.from || activeFilters.dateRange.to ? 1 : 0,
                              activeFilters.favorites ? 1 : 0,
                              activeFilters.premium !== null ? 1 : 0,
                              activeFilters.public !== null ? 1 : 0,
                            ].reduce((a, b) => a + b, 0)
                          }
                        </Badge>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80">
                    <div className="space-y-4">
                      <h4 className="font-medium">Filter Media</h4>
                      <Separator />

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Media Type</h5>
                        <div className="grid grid-cols-2 gap-2">
                          {(["image", "video", "document", "audio", "other"] as MediaType[]).map((type) => (
                            <div key={type} className="flex items-center space-x-2">
                              <Checkbox
                                id={`type-${type}`}
                                checked={activeFilters.types.includes(type)}
                                onCheckedChange={(checked) => {
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    types: checked ? [...prev.types, type] : prev.types.filter((t) => t !== type),
                                  }))
                                }}
                              />
                              <label
                                htmlFor={`type-${type}`}
                                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                {type.charAt(0).toUpperCase() + type.slice(1)}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Tags</h5>
                        <ScrollArea className="h-32 rounded-md border">
                          <div className="p-2 space-y-1">
                            {getAllTags().map((tag) => (
                              <div key={tag} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`tag-${tag}`}
                                  checked={activeFilters.tags.includes(tag)}
                                  onCheckedChange={(checked) => {
                                    setActiveFilters((prev) => ({
                                      ...prev,
                                      tags: checked ? [...prev.tags, tag] : prev.tags.filter((t) => t !== tag),
                                    }))
                                  }}
                                />
                                <label
                                  htmlFor={`tag-${tag}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {tag}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Categories</h5>
                        <ScrollArea className="h-32 rounded-md border">
                          <div className="p-2 space-y-1">
                            {getAllCategories().map((category) => (
                              <div key={category} className="flex items-center space-x-2">
                                <Checkbox
                                  id={`category-${category}`}
                                  checked={activeFilters.categories.includes(category)}
                                  onCheckedChange={(checked) => {
                                    setActiveFilters((prev) => ({
                                      ...prev,
                                      categories: checked
                                        ? [...prev.categories, category]
                                        : prev.categories.filter((c) => c !== category),
                                    }))
                                  }}
                                />
                                <label
                                  htmlFor={`category-${category}`}
                                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                >
                                  {category}
                                </label>
                              </div>
                            ))}
                          </div>
                        </ScrollArea>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Date Range</h5>
                        <div className="grid gap-2">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="date-from"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !activeFilters.dateRange.from && "text-muted-foreground",
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {activeFilters.dateRange.from ? (
                                  format(activeFilters.dateRange.from, "PPP")
                                ) : (
                                  <span>From date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={activeFilters.dateRange.from}
                                onSelect={(date) =>
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    dateRange: { ...prev.dateRange, from: date || undefined },
                                  }))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                id="date-to"
                                variant={"outline"}
                                className={cn(
                                  "w-full justify-start text-left font-normal",
                                  !activeFilters.dateRange.to && "text-muted-foreground",
                                )}
                              >
                                <Calendar className="mr-2 h-4 w-4" />
                                {activeFilters.dateRange.to ? (
                                  format(activeFilters.dateRange.to, "PPP")
                                ) : (
                                  <span>To date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                              <CalendarComponent
                                mode="single"
                                selected={activeFilters.dateRange.to}
                                onSelect={(date) =>
                                  setActiveFilters((prev) => ({
                                    ...prev,
                                    dateRange: { ...prev.dateRange, to: date || undefined },
                                  }))
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
                        </div>
                      </div>

                      <Separator />

                      <div className="space-y-2">
                        <h5 className="text-sm font-medium">Status</h5>
                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox
                              id="filter-favorites"
                              checked={activeFilters.favorites}
                              onCheckedChange={(checked) => {
                                setActiveFilters((prev) => ({
                                  ...prev,
                                  favorites: !!checked,
                                }))
                              }}
                            />
                            <label
                              htmlFor="filter-favorites"
                              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                            >
                              Favorites only
                            </label>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Select
                              value={activeFilters.premium === null ? "" : activeFilters.premium ? "premium" : "free"}
                              onValueChange={(value) => {
                                setActiveFilters((prev) => ({
                                  ...prev,
                                  premium: value === "" ? null : value === "premium",
                                }))
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Premium status" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All content</SelectItem>
                                <SelectItem value="premium">Premium only</SelectItem>
                                <SelectItem value="free">Free only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          <div className="flex items-center space-x-2">
                            <Select
                              value={activeFilters.public === null ? "" : activeFilters.public ? "public" : "private"}
                              onValueChange={(value) => {
                                setActiveFilters((prev) => ({
                                  ...prev,
                                  public: value === "" ? null : value === "public",
                                }))
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="Visibility" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="">All visibility</SelectItem>
                                <SelectItem value="public">Public only</SelectItem>
                                <SelectItem value="private">Private only</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </div>

                      <Separator />

                      <Button variant="outline" className="w-full" onClick={resetFilters}>
                        <X className="mr-2 h-4 w-4" />
                        Reset Filters
                      </Button>
                    </div>
                  </PopoverContent>
                </Popover>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="gap-1">
                      <SlidersHorizontal className="h-4 w-4 mr-1" />
                      Sort
                      <ChevronDown className="h-3 w-3 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => setSort({ field: "date", direction: "desc" })}
                      className={cn(
                        "flex items-center justify-between",
                        sort.field === "date" && sort.direction === "desc" && "font-medium",
                      )}
                    >
                      Newest first
                      {sort.field === "date" && sort.direction === "desc" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSort({ field: "date", direction: "asc" })}
                      className={cn(
                        "flex items-center justify-between",
                        sort.field === "date" && sort.direction === "asc" && "font-medium",
                      )}
                    >
                      Oldest first
                      {sort.field === "date" && sort.direction === "asc" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSort({ field: "name", direction: "asc" })}
                      className={cn(
                        "flex items-center justify-between",
                        sort.field === "name" && sort.direction === "asc" && "font-medium",
                      )}
                    >
                      Name (A-Z)
                      {sort.field === "name" && sort.direction === "asc" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSort({ field: "name", direction: "desc" })}
                      className={cn(
                        "flex items-center justify-between",
                        sort.field === "name" && sort.direction === "desc" && "font-medium",
                      )}
                    >
                      Name (Z-A)
                      {sort.field === "name" && sort.direction === "desc" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSort({ field: "size", direction: "desc" })}
                      className={cn(
                        "flex items-center justify-between",
                        sort.field === "size" && sort.direction === "desc" && "font-medium",
                      )}
                    >
                      Size (largest first)
                      {sort.field === "size" && sort.direction === "desc" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setSort({ field: "size", direction: "asc" })}
                      className={cn(
                        "flex items-center justify-between",
                        sort.field === "size" && sort.direction === "asc" && "font-medium",
                      )}
                    >
                      Size (smallest first)
                      {sort.field === "size" && sort.direction === "asc" && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <div className="flex border rounded-md">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("rounded-none rounded-l-md", viewMode === "grid" && "bg-muted hover:bg-muted")}
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Separator orientation="vertical" className="h-auto" />
                  <Button
                    variant="ghost"
                    size="icon"
                    className={cn("rounded-none rounded-r-md", viewMode === "list" && "bg-muted hover:bg-muted")}
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Selected items actions */}
            {selectedItems.length > 0 && (
              <div className="flex items-center justify-between bg-muted p-2 rounded-md">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={selectedItems.length === getPaginatedItems().length}
                    onCheckedChange={toggleSelectAll}
                    aria-label="Select all"
                  />
                  <span className="text-sm font-medium">
                    {selectedItems.length} item{selectedItems.length !== 1 ? "s" : ""} selected
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="outline" onClick={handleBulkTag}>
                    <Tag className="h-4 w-4 mr-1" />
                    Add Tag
                  </Button>
                  <Button size="sm" variant="destructive" onClick={handleBulkDelete}>
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </div>
              </div>
            )}

            {/* Media items */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {isLoading ? renderSkeletons() : getPaginatedItems().map(renderMediaItem)}
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">
                        <Checkbox
                          checked={
                            getPaginatedItems().length > 0 && selectedItems.length === getPaginatedItems().length
                          }
                          onCheckedChange={toggleSelectAll}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Tags</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>{isLoading ? renderSkeletons() : getPaginatedItems().map(renderMediaItem)}</TableBody>
                </Table>
              </div>
            )}

            {/* Empty state */}
            {!isLoading && filteredItems.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <ImageIcon className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium">No media found</h3>
                <p className="text-muted-foreground mt-1 mb-4 max-w-md">
                  {searchQuery ||
                  Object.values(activeFilters).some((filter) =>
                    Array.isArray(filter) ? filter.length > 0 : filter !== null && filter !== false,
                  )
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "Upload your first media file to get started."}
                </p>
                {searchQuery ||
                Object.values(activeFilters).some((filter) =>
                  Array.isArray(filter) ? filter.length > 0 : filter !== null && filter !== false,
                ) ? (
                  <Button variant="outline" onClick={resetFilters}>
                    <X className="h-4 w-4 mr-1" />
                    Clear Filters
                  </Button>
                ) : (
                  <Button onClick={handleAddNew}>
                    <Plus className="h-4 w-4 mr-1" />
                    Upload Media
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex flex-col sm:flex-row items-center justify-between border-t px-6 py-4">
          <div className="text-sm text-muted-foreground mb-4 sm:mb-0">
            Showing{" "}
            <strong>
              {filteredItems.length > 0
                ? `${(currentPage - 1) * itemsPerPage + 1}-${Math.min(
                    currentPage * itemsPerPage,
                    filteredItems.length,
                  )}`
                : "0"}
            </strong>{" "}
            of <strong>{filteredItems.length}</strong> items
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => (prev * itemsPerPage < filteredItems.length ? prev + 1 : prev))}
              disabled={currentPage * itemsPerPage >= filteredItems.length}
            >
              Next
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Media upload/edit dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          {editItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="aspect-square rounded-md overflow-hidden bg-muted">
                  {editItem.type === "image" ? (
                    <img
                      src={(editItem.imageUrls && editItem.imageUrls[0]) || "/placeholder.svg"}
                      alt={editItem.title}
                      className="w-full h-full object-cover"
                    />
                  ) : editItem.type === "video" ? (
                    <video
                      src={editItem.videoUrl || "/placeholder.svg"}
                      controls
                      className="w-full h-full object-cover"
                      poster={editItem.coverImage}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-16 w-16 text-muted-foreground opacity-50" />
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" className="w-full mr-2">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setIsDialogOpen(false)
                      handleEdit(mediaItemToMediaFile(editItem))
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">{editItem.title}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uploaded on {format(new Date(editItem.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                      <p className="text-sm mt-1">
                        {editItem.type.charAt(0).toUpperCase() + editItem.type.slice(1)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
                      <p className="text-sm mt-1">{formatFileSize(0)}</p> {/* Placeholder for size */}
                    </div>
                    {/* Removed: detailItem.dimensions && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Dimensions</h4>
                        <p className="text-sm mt-1">{detailItem.dimensions}</p>
                      </div>
                    ) */}
                    {/* Removed: detailItem.duration && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                        <p className="text-sm mt-1">{detailItem.duration}</p>
                      </div>
                    ) */}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                      <div className="flex gap-2 mt-1">
                        {editItem.isPremium && (
                          <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200">
                            Premium
                          </Badge>
                        )}
                        {!editItem.isPublic && <Badge variant="outline">Private</Badge>}
                        {!editItem.isPremium && editItem.isPublic && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                      <p className="text-sm mt-1">{editItem.category || "Uncategorized"}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="text-sm mt-1">{editItem.description || "No description provided."}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {editItem.tags.length > 0 ? (
                        editItem.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No tags</p>
                      )}
                    </div>
                  </div>

                  {editItem.usedIn && editItem.usedIn.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Used In</h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {editItem.usedIn.map((location: string) => (
                          <Badge key={location} variant="secondary">
                            {location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the selected media and remove it from anywhere
              it's being used on your site.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Media details modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        <DialogContent className="sm:max-w-3xl">
          {detailItem && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="aspect-square rounded-md overflow-hidden bg-muted">
                  {detailItem.type === "image" ? (
                    <img
                      src={detailItem.url || "/placeholder.svg"}
                      alt={detailItem.name}
                      className="w-full h-full object-cover"
                    />
                  ) : detailItem.type === "video" ? (
                    <video
                      src={detailItem.url}
                      controls
                      className="w-full h-full object-cover"
                      poster={detailItem.thumbnailUrl}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FileText className="h-16 w-16 text-muted-foreground opacity-50" />
                    </div>
                  )}
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" size="sm" className="w-full mr-2">
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={() => {
                      setIsDetailModalOpen(false)
                      handleEdit(detailItem)
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>
              </div>
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium">{detailItem.name}</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Uploaded on {format(new Date(detailItem.createdAt), "MMMM d, yyyy")}
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Type</h4>
                      <p className="text-sm mt-1">
                        {detailItem.type.charAt(0).toUpperCase() + detailItem.type.slice(1)}
                      </p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Size</h4>
                      <p className="text-sm mt-1">{formatFileSize(detailItem.size)}</p>
                    </div>
                    {detailItem.dimensions && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Dimensions</h4>
                        <p className="text-sm mt-1">{detailItem.dimensions}</p>
                      </div>
                    )}
                    {detailItem.duration && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground">Duration</h4>
                        <p className="text-sm mt-1">{detailItem.duration}</p>
                      </div>
                    )}
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Status</h4>
                      <div className="flex gap-2 mt-1">
                        {detailItem.isPremium && (
                          <Badge variant="secondary" className="bg-rose-100 text-rose-800 hover:bg-rose-200">
                            Premium
                          </Badge>
                        )}
                        {!detailItem.isPublic && <Badge variant="outline">Private</Badge>}
                        {!detailItem.isPremium && detailItem.isPublic && (
                          <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-200">
                            Public
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Category</h4>
                      <p className="text-sm mt-1">{detailItem.category || "Uncategorized"}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Description</h4>
                    <p className="text-sm mt-1">{detailItem.description || "No description provided."}</p>
                  </div>

                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground">Tags</h4>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {detailItem.tags.length > 0 ? (
                        detailItem.tags.map((tag) => (
                          <Badge key={tag} variant="outline">
                            {tag}
                          </Badge>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">No tags</p>
                      )}
                    </div>
                  </div>

                  {detailItem.usedIn && detailItem.usedIn.length > 0 && (
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground">Used In</h4>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {detailItem.usedIn.map((location: string) => (
                          <Badge key={location} variant="secondary">
                            {location}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk tag modal */}
      <Dialog open={isTagModalOpen} onOpenChange={setIsTagModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Tag to Selected Items</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="new-tag">Tag Name</Label>
              <Input
                id="new-tag"
                placeholder="Enter tag name"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Existing Tags</Label>
              <div className="flex flex-wrap gap-1 p-2 border rounded-md">
                {getAllTags().map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="cursor-pointer hover:bg-secondary"
                    onClick={() => setNewTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsTagModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={applyBulkTag} disabled={!newTag.trim()}>
              Add Tag
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
