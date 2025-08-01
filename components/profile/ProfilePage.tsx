"use client"

import { motion } from "framer-motion"
import { useAuth } from "@/components/providers/AuthProvider"
import { Button } from "@/components/ui/button"
import { Edit, Save, X, Loader2 } from "lucide-react"
import { ProfileEditProvider, useProfileEdit } from "./ProfileEditContext"
import ProfileHero from "./ProfileHero"
import ProfileBio from "./ProfileBio"
import ProfileGallery from "./ProfileGallery"
import ProfileStats from "./ProfileStats"
import ProfileTestimonials from "./ProfileTestimonials"
import ProfileCTA from "./ProfileCTA"
import ProfileSocial from "./ProfileSocial"
import EditModeIndicator from "./EditModeIndicator"

function EditModeControls() {
  const { isEditMode, toggleEditMode, isDirty, saveChanges, discardChanges, isSaving } = useProfileEdit()
  const { isAdmin } = useAuth()

  if (!isAdmin) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex gap-2">
      {isEditMode ? (
        <>
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
        <Button onClick={toggleEditMode} className="rounded-full h-12 w-12 bg-rose-500 hover:bg-rose-600 shadow-lg">
          <Edit className="h-5 w-5" />
          <span className="sr-only">Edit Profile</span>
        </Button>
      )}
    </div>
  )
}

function ProfilePageContent() {
  return (
    <div className="min-h-screen">
      <EditModeIndicator />
      <ProfileHero />

      <div className="container mx-auto px-4 py-12 space-y-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <ProfileBio />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <ProfileGallery />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <ProfileStats />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <ProfileCTA />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <ProfileTestimonials />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <ProfileSocial />
        </motion.div>
      </div>

      <EditModeControls />
    </div>
  )
}

export default function ProfilePage() {
  return (
    <ProfileEditProvider>
      <ProfilePageContent />
    </ProfileEditProvider>
  )
}
