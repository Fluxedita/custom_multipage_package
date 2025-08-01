"use client"

import { motion } from "framer-motion"
import { useRef } from "react"
import { Button } from "@/components/ui/button"
import { ArrowRight, UserIcon, Edit, PlusCircle } from "lucide-react"
import EditableImage from "@/components/profile/EditableImage"
import SimpleEditableMedia from "@/components/profile/SimpleEditableMedia"
import { useAuth } from "@/components/providers/AuthProvider"
import { EditableTitle } from "./EditableTitle"
import { EditableSubtitle } from "./EditableSubtitle"
import { CreatePageDialog } from "@/components/admin/CreatePageDialog"
import { useState } from "react"

interface HeroSectionProps {
  /** Optional index in parent sections list */
  idx?: number;
  title: string
  subtitle: string
  primaryButtonText: string
  primaryButtonHref: string
  secondaryButtonText?: string
  secondaryButtonHref?: string
  backgroundImage: string
  onBackgroundImageChangeAction: (url: string) => void
  onTitleChangeAction: (title: string) => void
  onSubtitleChangeAction: (subtitle: string) => void
  isEditMode: boolean
  onEditModeChangeAction: (isEditMode: boolean) => void
  onSaveChangesAction: () => void
  isDirty: boolean
}

export default function HeroSection({
  idx,
  title,
  subtitle,
  primaryButtonText,
  primaryButtonHref,
  secondaryButtonText,
  secondaryButtonHref,
  backgroundImage,
  onBackgroundImageChangeAction,
  onTitleChangeAction,
  onSubtitleChangeAction,
  isEditMode,
  onEditModeChangeAction,
  onSaveChangesAction,
  isDirty
}: HeroSectionProps) {
  const { isAdmin } = useAuth()
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false)
  const heroImageRef = useRef<{ openEditor: () => void }>(null)
  
  return (
    <section className="relative w-full h-screen flex items-center">
  <div className="absolute inset-0 z-0">
    <div className="relative w-full h-full">
      {/* Editable hero image with overlay edit button for admin in edit mode */}
      <div className="relative w-full h-full group">
        <SimpleEditableMedia
          ref={heroImageRef}
          src={backgroundImage}
          alt="Hero background"
          width={1280}
          height={1280}
          className="absolute inset-0 w-full h-full object-cover"
          type="image"
          isEditMode={isEditMode}
          onChange={onBackgroundImageChangeAction}
        />
      </div>
    </div>
  </div>

      {/* Hero Content - Lower z-index */}
      <div className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-4 md:px-6">
        <div className="max-w-3xl w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="mb-6"
          >
            <EditableTitle
              value={title}
              onChangeAction={onTitleChangeAction}
              isEditMode={isEditMode}
              className="text-4xl md:text-6xl font-bold text-white"
              placeholder="Enter page title..."
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-8"
          >
            <EditableSubtitle
              value={subtitle}
              onChangeAction={onSubtitleChangeAction}
              isEditMode={isEditMode}
              className="text-xl md:text-2xl text-gray-200"
              placeholder="Enter page subtitle..."
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4"
          >
            <Button asChild size="lg" className="bg-rose-500 hover:bg-rose-600 text-white">
              <a href={primaryButtonHref}>
                {primaryButtonText} <ArrowRight className="ml-2 h-5 w-5" />
              </a>
            </Button>
            {secondaryButtonText && secondaryButtonHref && (
              <Button asChild size="lg" variant="secondary">
                <a href={secondaryButtonHref}>
                  {secondaryButtonText} <UserIcon className="ml-2 h-5 w-5" />
                </a>
              </Button>
            )}
          </motion.div>
        </div>
      </div>

      {/* Admin Edit Controls - Highest z-index */}
      {isAdmin && (
        <div className="fixed bottom-4 right-4 z-[200] flex gap-2">
          {isEditMode ? (
            <>
              <Button variant="default" onClick={onSaveChangesAction} disabled={!isDirty}>
                Save Changes
              </Button>
              <Button variant="outline" onClick={() => onEditModeChangeAction(false)}>
                Cancel
              </Button>
            </>
          ) : (
            <>
              <Button variant="secondary" onClick={() => setIsCreatePageOpen(true)}>
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Page
              </Button>
              <Button variant="default" onClick={() => onEditModeChangeAction(true)}>
                <Edit className="mr-2 h-4 w-4" /> Edit Page
              </Button>
            </>
          )}
          <CreatePageDialog open={isCreatePageOpen} onOpenChangeAction={setIsCreatePageOpen} />
        </div>
      )}
    </section>
  )
}
