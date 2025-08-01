'use client'

import { useState, useEffect } from "react"
import Image from "next/image"
import { Edit, Pencil, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/providers/AuthProvider"
import ImageUploadDialog from "./ImageUploadDialog"
import { updateHeroImage } from '../../app/actions/members'
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { useProfileEdit } from "@/components/profile/ProfileEditContext"

interface EditableHeroProps {
  initialImage: string
}

export default function EditableHero({ initialImage }: EditableHeroProps) {
  const { isAdmin, user } = useAuth()
  const router = useRouter()
  const { isEditMode } = useProfileEdit()
  const [image, setImage] = useState(initialImage)
  const [isEditing, setIsEditing] = useState(false)
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false)

  useEffect(() => {
    setImage(initialImage)
  }, [initialImage])

  const handleImageUpdate = async (newImage: string) => {
    setImage(newImage)
    localStorage.setItem('heroImage', newImage)
    if (user) {
      await updateHeroImage(user.id, newImage)
    }
    router.refresh()
  }

  return (
    <div className="relative w-full h-[60vh] min-h-[400px] overflow-hidden">
      {/* Background Image */}
      <div
        className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-all duration-500"
        style={{ backgroundImage: `url(${image})` }}
      />

      {/* Content Layer */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 to-black/30 z-10">
        <div className="container mx-auto px-4 h-full flex flex-col justify-center">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
                Join My Exclusive Community
              </h1>
              <p className="text-xl text-white/90 max-w-2xl">
                Get access to exclusive content, behind-the-scenes moments, and connect with me on a more personal level.
              </p>
            </div>

            {/* Edit Controls - Contained within a specific area */}
            {isEditMode && (
              <div className="flex gap-2 ml-4 bg-black/30 p-2 rounded-lg">
                {isEditing ? (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => setIsUploadDialogOpen(true)}
                    >
                      <Pencil className="h-4 w-4 mr-2" />
                      Change Image
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => setIsEditing(false)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-white/90 hover:bg-white"
                    onClick={() => setIsEditing(true)}
                  >
                    <Pencil className="h-4 w-4 mr-2" />
                    Edit Hero
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Image Upload Dialog */}
      <ImageUploadDialog
        isOpen={isUploadDialogOpen}
        onClose={() => setIsUploadDialogOpen(false)}
        onImageUploaded={handleImageUpdate}
        aspectRatio="16/9"
        title="Update Hero Image"
        description="Choose a new image for your hero section. Recommended size: 1920x1080px"
      />
    </div>
  )
} 