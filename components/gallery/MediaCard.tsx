"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { Edit, Play, Trash2, Lock, Eye } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuth } from "@/components/providers/AuthProvider"
import type { MediaItem } from "@/lib/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface MediaCardProps {
  item: MediaItem
  type: "images" | "videos"
  onEdit?: (item: MediaItem) => void
  onDelete?: (item: MediaItem) => void
}

export default function MediaCard({ item, type, onEdit, onDelete }: MediaCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const { user } = useAuth()

  // Ensure we have a valid slug, fallback to ID if slug is empty
  const itemSlug = item.slug || item.id || '';
  const detailPath = type === "images" ? `/gallery/images/${itemSlug}` : `/gallery/videos/${itemSlug}`;
  
  // Debug log
  console.log('MediaCard - Item:', { id: item.id, slug: item.slug, detailPath });

  return (
    <>
      <div
        className={cn(
          "bg-white rounded-lg overflow-hidden shadow-md transition-all duration-300",
          isHovered && "shadow-xl transform scale-[1.02]",
        )}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className="relative h-64 overflow-hidden">
          <Link href={detailPath} className="block w-full h-full">
            <div className="relative w-full h-full">
              {item.coverImage ? (
                <Image
                  src={item.coverImage}
                  alt={item.title}
                  fill
                  priority={true}
                  onLoad={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.style.opacity = '1';
                  }}
                  onError={(e) => {
                    const img = e.target as HTMLImageElement;
                    img.src = "/placeholder.svg";
                    img.onerror = null;
                  }}
                  className={cn(
                    "object-cover transition-transform duration-500 opacity-0",
                    isHovered && "scale-105",
                    item.isPremium && !user && "blur-sm"
                  )}
                  style={{ transition: 'opacity 0.3s ease-in-out' }}
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  quality={85}
                />
              ) : item.type === 'video' ? (
                <div className="w-full h-full bg-gray-100 flex items-center justify-center relative">
                  {item.videoUrl ? (
                    <>
                      <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                        <div className="w-12 h-12 rounded-full bg-white/80 flex items-center justify-center">
                          <Play className="w-6 h-6 text-gray-800 ml-1" />
                        </div>
                      </div>
                      <span className="sr-only">Play video: {item.title}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">No preview available</span>
                  )}
                </div>
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
                  <span className="text-gray-400">No image</span>
                </div>
              )}
            </div>
          </Link>

          {item.isPremium && (
            <div className="absolute top-2 right-2 bg-rose-500 text-white px-2 py-1 rounded text-sm font-medium">
              Premium
            </div>
          )}

          {type === "videos" && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors" />
              <div className="relative z-10 bg-black/40 group-hover:bg-black/50 rounded-full p-3 transition-all group-hover:scale-110">
                <Play className="h-8 w-8 text-white" />
              </div>
            </div>
          )}

          {(onEdit || onDelete) && (
            <div className="absolute top-2 left-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="secondary" size="icon" className="h-8 w-8">
                    <Edit className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                  {onEdit && (
                    <DropdownMenuItem onClick={() => onEdit(item)}>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <DropdownMenuItem onClick={() => setShowDeleteDialog(true)} className="text-red-600">
                      <Trash2 className="h-4 w-4 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-bold text-lg mb-1">{item.title}</h3>
          <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>

          <Button
            asChild
            className={cn(
              "w-full",
              item.isPremium
                ? "bg-rose-500 hover:bg-rose-600"
                : "bg-gray-800 hover:bg-gray-900"
            )}
          >
            <Link href={detailPath}>
              {item.isPremium ? (
                <>
                  <Lock className="mr-2 h-4 w-4" /> View Content
                </>
              ) : (
                <>
                  <Eye className="mr-2 h-4 w-4" /> View Content
                </>
              )}
            </Link>
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogTrigger asChild>
          <Button variant="destructive">
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this media item.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete?.(item)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              aria-label="Confirm delete"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
