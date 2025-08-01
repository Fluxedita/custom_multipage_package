'use client'

import { useState, useEffect } from 'react'
import { Checkbox } from '@/components/ui/checkbox'
import { fetchMediaFromCloudinary, CloudinaryResource } from '@/lib/cloudinary'
import { toast } from 'sonner'
import { formatDistanceToNow } from 'date-fns'

interface MediaListProps {
  searchQuery: string
  type: 'all' | 'images' | 'videos'
  selectedItems: string[]
  onSelectionChange: (items: string[]) => void
}

export default function MediaList({
  searchQuery,
  type,
  selectedItems,
  onSelectionChange,
}: MediaListProps) {
  const [media, setMedia] = useState<CloudinaryResource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadMedia = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const result = await fetchMediaFromCloudinary(
          type === 'all' ? undefined : type === 'images' ? 'image' : 'video'
        )
        setMedia(result.resources)
      } catch (err) {
        setError('Failed to load media')
        toast.error('Failed to load media')
      } finally {
        setIsLoading(false)
      }
    }

    loadMedia()
  }, [type])

  const filteredMedia = media.filter(item => {
    const matchesSearch = item.public_id.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = type === 'all' || 
      (type === 'images' && item.resource_type === 'image') ||
      (type === 'videos' && item.resource_type === 'video')
    return matchesSearch && matchesType
  })

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className="h-20 bg-gray-100 rounded-lg animate-pulse"
          />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    )
  }

  if (filteredMedia.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">No media found</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {filteredMedia.map((item) => (
        <div
          key={item.public_id}
          className="flex items-center gap-4 p-4 bg-white rounded-lg border hover:border-pink-500 transition-colors"
        >
          <Checkbox
            checked={selectedItems.includes(item.public_id)}
            onCheckedChange={(checked) => {
              if (checked) {
                onSelectionChange([...selectedItems, item.public_id])
              } else {
                onSelectionChange(selectedItems.filter(id => id !== item.public_id))
              }
            }}
          />
          <div className="w-16 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
            {item.resource_type === 'image' ? (
              <img
                src={item.secure_url}
                alt={item.public_id}
                className="w-full h-full object-cover"
              />
            ) : (
              <video
                src={item.secure_url}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.public_id}
            </p>
            <p className="text-sm text-gray-500">
              {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
            </p>
          </div>
          <div className="text-sm text-gray-500">
            {(item.bytes / 1024 / 1024).toFixed(2)} MB
          </div>
        </div>
      ))}
    </div>
  )
} 