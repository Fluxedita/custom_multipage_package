'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { Check, Play, MoreVertical } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { MediaItem } from '@/lib/types/media'

interface MediaListProps {
  type?: 'image' | 'video'
  searchQuery?: string
  onSelect?: (selectedItems: string[]) => void
  selectedItems?: string[]
}

export default function MediaList({
  type,
  searchQuery = '',
  onSelect,
  selectedItems = [],
}: MediaListProps) {
  const [media, setMedia] = useState<MediaItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // TODO: Fetch media from Cloudinary
    // For now, using mock data
    const mockMedia: MediaItem[] = [
      {
        id: '1',
        public_id: 'mock/profile-1',
        url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        secure_url: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80',
        type: 'image',
        name: 'profile.jpg',
        format: 'jpg',
        bytes: 1024 * 1024, // 1MB
        created_at: new Date().toISOString(),
        width: 800,
        height: 600,
      },
      // Add more mock items as needed
    ]

    setMedia(mockMedia)
    setLoading(false)
  }, [])

  const filteredMedia = media.filter(item => {
    if (type && item.type !== type) return false
    if (searchQuery) {
      return item.name.toLowerCase().includes(searchQuery.toLowerCase())
    }
    return true
  })

  const handleSelect = (itemId: string) => {
    if (!onSelect) return

    const newSelected = selectedItems.includes(itemId)
      ? selectedItems.filter(id => id !== itemId)
      : [...selectedItems, itemId]

    onSelect(newSelected)
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 animate-pulse rounded-lg"
          />
        ))}
      </div>
    )
  }

  if (filteredMedia.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No media found</p>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      {filteredMedia.map(item => (
        <div
          key={item.id}
          className={cn(
            "flex items-center gap-4 p-4 rounded-lg hover:bg-gray-50 cursor-pointer",
            selectedItems.includes(item.id) && "bg-pink-50"
          )}
          onClick={() => handleSelect(item.id)}
        >
          {/* Selection Checkbox */}
          <div className="w-5 h-5 flex items-center justify-center">
            {selectedItems.includes(item.id) && (
              <Check className="h-4 w-4 text-pink-500" />
            )}
          </div>

          {/* Thumbnail */}
          <div className="relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0">
            {item.type === 'image' ? (
              <Image
                src={item.url}
                alt={item.name}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <Play className="h-8 w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* File Info */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.name}
            </p>
            <p className="text-sm text-gray-500">
              {formatFileSize(item.bytes)} • {formatDate(item.created_at)}
            </p>
          </div>

          {/* Actions */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                Download
              </DropdownMenuItem>
              <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={(e) => e.stopPropagation()}
                className="text-red-600"
              >
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ))}
    </div>
  )
} 