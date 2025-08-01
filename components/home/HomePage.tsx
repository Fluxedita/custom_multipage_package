"use client"

import { useState, useRef } from "react"
import { motion } from "framer-motion"
import Image from "next/image"
import Link from "next/link"
import { ArrowRight, Edit, PlusCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import EditableImage from "@/components/profile/EditableImage"
import { useAuth } from "@/components/providers/AuthProvider"
import { CreatePageDialog } from "@/components/admin/CreatePageDialog"
import { usePageData } from "@/hooks/usePageData"

export default function HomePage() {
  const heroImageRef = useRef<{ openEditor: () => void }>(null);
  // Debug: log isAdmin value
  // Remove this after troubleshooting
  const { isAdmin } = useAuth();
  const { heroImage, handleHeroImageChange, isDirty, saveChanges } = usePageData();
  const [isEditMode, setIsEditMode] = useState(false);
  const [isCreatePageOpen, setIsCreatePageOpen] = useState(false);

  const toggleEditMode = () => {
    setIsEditMode(!isEditMode);
  }

  const saveAndExitEditMode = () => {
    saveChanges();
    setIsEditMode(false);
  }

  return (
    <div className="relative min-h-[90vh] flex items-center">
      {/* Hero Background */}
      <div className="absolute inset-0 z-0">
        <div className="relative w-full h-full group min-h-[90vh]">
          {/* Editable hero image for admin in edit mode */}
          {isAdmin && isEditMode ? (
            <>
              {/* EditableImage with ref for programmatic openEditor */}
              <EditableImage
                ref={heroImageRef}
                src={heroImage}
                alt="Hero Background"
                onChange={handleHeroImageChange}
                type="background"
                standalone={true}
                isEditMode={true}
                className="w-full h-full object-cover min-h-[90vh]"
              />
              {/* Overlay edit button, visible on hover and always in edit mode */}
              <button
                className="absolute inset-0 bg-black/50 flex items-center justify-center transition-opacity cursor-pointer opacity-0 group-hover:opacity-100"
                aria-label="Edit image"
                type="button"
                style={{ zIndex: 50 }}
                onClick={() => heroImageRef.current?.openEditor()}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen h-8 w-8 text-white"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
              </button>
            </>
          ) : (
            <Image
              src={heroImage || "/placeholder.svg"}
              alt="Hero Background"
              fill
              className="object-cover"
              priority
              unoptimized={heroImage.startsWith("data:")}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
        </div>
      </div>

      {/* Admin Edit Controls */}
      {isAdmin && (
        <>
          {/* Edit Hero Button (top-right over hero image) */}
          {!isEditMode && (
            <button
              className="absolute top-6 right-6 z-50 inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 bg-primary text-primary-foreground hover:bg-primary/90 h-9 rounded-md px-3 shadow-lg"
              onClick={toggleEditMode}
              type="button"
            >
              {/* SquarePen icon from lucide-react */}
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-square-pen mr-2 h-4 w-4"><path d="M12 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.375 2.625a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4Z"></path></svg>
              Edit Hero
            </button>
          )}

          {/* Existing bottom-right controls */}
          <div className="absolute bottom-4 right-4 z-50 flex gap-2">
            {!isEditMode && (
              <Button variant="secondary" onClick={() => setIsCreatePageOpen(true)} size="sm">
                <PlusCircle className="mr-2 h-4 w-4" /> Create New Page
              </Button>
            )}
            {isEditMode ? (
              <>
                <Button variant="default" onClick={saveAndExitEditMode} disabled={!isDirty} size="sm">
                  Save Changes
                </Button>
                <Button variant="outline" onClick={toggleEditMode} size="sm">
                  Cancel
                </Button>
              </>
            ) : (
              <Button variant="default" onClick={toggleEditMode} size="sm">
                <Edit className="mr-2 h-4 w-4" /> Edit Page
              </Button>
            )}
            <CreatePageDialog open={isCreatePageOpen} onOpenChangeAction={setIsCreatePageOpen} />
          </div>
        </>
      )}

      {/* Hero Content */}
      <div className="container mx-auto px-4 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl"
        >
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Welcome to admin's World</h1>
          <p className="text-xl text-gray-200 mb-8">
            Exclusive content, personal stories, and intimate moments. Join me on this journey and get to know the real
            me.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button asChild size="lg" className="bg-rose-500 hover:bg-rose-600">
              <Link href="/profile">
                Become a Member <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
              <Link href="/profile">
                Visit My Profile <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
