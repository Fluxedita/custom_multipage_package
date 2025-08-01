"use client"

import { useProfileEdit } from "./ProfileEditContext"
import { AlertCircle } from "lucide-react"

export default function EditModeIndicator() {
  const { isEditMode, isDirty } = useProfileEdit()

  if (!isEditMode) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-rose-500 text-white py-2 px-4 z-50 flex items-center justify-center">
      <AlertCircle className="h-5 w-5 mr-2" />
      <span>Edit Mode Active {isDirty && "- Unsaved Changes"} - Changes are automatically saved to your browser</span>
    </div>
  )
}
