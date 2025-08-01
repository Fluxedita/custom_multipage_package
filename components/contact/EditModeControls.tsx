"use client"

import { Button } from "@/components/ui/button"
import { SquarePen, Save, X, Loader2, Image } from "lucide-react"
import { useContactEdit } from "./ContactEditContext"
import { useAuth } from "@/components/providers/AuthProvider"
import { useEffect } from "react"
import Link from "next/link"

export default function EditModeControls() {
  const { isEditMode, toggleEditMode, isDirty, saveChanges, discardChanges, isSaving } = useContactEdit()
  const { isAdmin, isAuthenticated } = useAuth()

  // Check if user is logged in on mount and enable edit mode if they are admin
  useEffect(() => {
    if (isAuthenticated && isAdmin && !isEditMode) {
      toggleEditMode()
    }
  }, [isAuthenticated, isAdmin, isEditMode, toggleEditMode])

  // Only show edit controls if user is admin
  if (!isAuthenticated || !isAdmin) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-2">
      {isEditMode ? (
        <>
          <Link href="/media">
            <Button
              variant="outline"
              className="rounded-full h-12 w-12 bg-white shadow-lg border-gray-200"
            >
              <Image className="h-5 w-5" />
              <span className="sr-only">Media Library</span>
            </Button>
          </Link>
          <Button
            onClick={discardChanges}
            variant="outline"
            className="rounded-full h-12 w-12 bg-white shadow-lg border-gray-200"
            disabled={isSaving}
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Discard Changes</span>
          </Button>
          <Button
            onClick={saveChanges}
            disabled={!isDirty || isSaving}
            className="rounded-full h-12 w-12 bg-green-500 hover:bg-green-600 shadow-lg"
          >
            {isSaving ? <Loader2 className="h-5 w-5 animate-spin" /> : <Save className="h-5 w-5" />}
            <span className="sr-only">Save Changes</span>
          </Button>
        </>
      ) : (
        <Button 
          onClick={toggleEditMode} 
          className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0 text-primary-foreground px-4 py-2 rounded-full h-12 w-12 bg-rose-500 hover:bg-rose-600 shadow-lg"
        >
          <SquarePen className="h-5 w-5" />
          <span className="sr-only">Edit Contact</span>
        </Button>
      )}
    </div>
  )
}
