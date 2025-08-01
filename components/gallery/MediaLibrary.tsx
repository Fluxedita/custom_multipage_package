"use client"

import React from "react"
import type { MediaItem } from "@/lib/types" 
import { Button } from "@/components/ui/button"
import { X, Image as ImageIcon, Play } from "lucide-react"

interface MediaLibraryProps {
  mediaItems: MediaItem[]
  onSelectAction: (media: MediaItem) => void
  onCloseAction: () => void
}

export function MediaLibrary({ 
  mediaItems = [], 
  onSelectAction, 
  onCloseAction 
}: MediaLibraryProps) {
  return (
    <div className="space-y-4 p-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Media Library</h3>
        <Button variant="ghost" size="sm" onClick={onCloseAction}>
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </Button>
      </div>
      
      {mediaItems.length === 0 ? (
        <div className="text-center py-8">
          <ImageIcon className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-2 text-sm font-medium">No media found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Upload some media to get started
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {mediaItems.map((item, idx) => (
            <button
              key={`${item.id}-${idx}`}
              onClick={() => onSelectAction(item)}
              className="group relative aspect-square overflow-hidden rounded-md"
            >
              {item.type === 'image' ? (
                <img
                  src={item.coverImage || item.imageUrls?.[0]}
                  alt={item.title}
                  className="h-full w-full object-cover transition-opacity group-hover:opacity-75"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-muted">
                  <Play className="h-8 w-8 text-muted-foreground" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <span className="text-white text-sm font-medium">Select</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export default MediaLibrary
