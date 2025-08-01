"use client"

import { useState, useEffect, useRef } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Star, Check, Plus, Trash2, ImageIcon } from "lucide-react"
import { useProfileEdit } from "./ProfileEditContext"
import EditableContent from "./EditableContent"
import EditableImage from "./EditableImage"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"

// Storage keys
const CTA_DATA_KEY = "cta_data"
const CTA_BENEFITS_KEY = "cta_benefits"

export default function ProfileCTA() {
  const { isEditMode, setIsDirty, saveProfileData, getProfileData } = useProfileEdit()
  const backgroundImageRef = useRef<{ openEditor: () => void }>(null);
  const [ctaData, setCtaData] = useState({
    backgroundImage: "/placeholder.svg?height=800&width=1600",
    title: "Join My Exclusive Membership",
    description:
      "Get access to premium content, personal interactions, and be part of my creative journey with exclusive benefits you won't find anywhere else.",
  })

  const [benefits, setBenefits] = useState([
    "Exclusive photoshoots not available anywhere else",
    "Behind-the-scenes content from my daily life",
    "Direct messaging and personal interactions",
    "Early access to new content before anyone else",
    "Input on future photoshoots and content ideas",
    "Monthly Q&A sessions and special events",
  ])

  const [isAddBenefitDialogOpen, setIsAddBenefitDialogOpen] = useState(false)
  const [newBenefit, setNewBenefit] = useState("")

  // Load saved data on component mount
  useEffect(() => {
    const savedCtaData = getProfileData(CTA_DATA_KEY)
    if (savedCtaData) {
      setCtaData(savedCtaData)
    }

    const savedBenefits = getProfileData(CTA_BENEFITS_KEY)
    if (savedBenefits) {
      setBenefits(savedBenefits)
    }
  }, [getProfileData])

  const updateCtaData = (key: string, value: string) => {
    setCtaData((prev) => ({
      ...prev,
      [key]: value,
    }))
    setIsDirty(true)
    saveProfileData(CTA_DATA_KEY, { ...ctaData, [key]: value })
  }

  const updateBenefit = (index: number, value: string) => {
    const newBenefits = [...benefits]
    newBenefits[index] = value
    setBenefits(newBenefits)
    setIsDirty(true)
    saveProfileData(CTA_BENEFITS_KEY, newBenefits)
  }

  const addBenefit = () => {
    if (newBenefit.trim()) {
      const updatedBenefits = [...benefits, newBenefit.trim()]
      setBenefits(updatedBenefits)
      setNewBenefit("")
      setIsAddBenefitDialogOpen(false)
      setIsDirty(true)
      saveProfileData(CTA_BENEFITS_KEY, updatedBenefits)
    }
  }

  const removeBenefit = (index: number) => {
    const newBenefits = [...benefits]
    newBenefits.splice(index, 1)
    setBenefits(newBenefits)
    setIsDirty(true)
    saveProfileData(CTA_BENEFITS_KEY, newBenefits)
  }

  return (
    <div className="relative rounded-xl overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <EditableImage
          ref={backgroundImageRef}
          src={ctaData.backgroundImage}
          alt="Membership Background"
          className="object-cover brightness-50 w-full h-full"
          onChange={(url) => updateCtaData("backgroundImage", url)}
          isEditMode={isEditMode}
          type="background"
          standalone={true}
          width={1600}
          height={800}
        />
      </div>

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>

      <div className="relative z-20 p-8 md:p-12 lg:p-16">
        <div className="max-w-xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              <EditableContent
                profile={{ id: "cta-title", full_name: ctaData.title }}
                onSave={async (data) => updateCtaData("title", data.full_name)}
                isEditing={isEditMode}
                onEditToggle={() => {}}
              />
            </h2>

            <div className="text-gray-200 text-lg mb-8">
              <EditableContent
                profile={{ id: "cta-description", bio: ctaData.description }}
                onSave={async (data) => updateCtaData("description", data.bio)}
                isEditing={isEditMode}
                onEditToggle={() => {}}
              />
            </div>

            <div className="space-y-3 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="flex items-start group"
                >
                  <Check className="h-5 w-5 text-rose-400 mr-2 mt-0.5 shrink-0" />
                  <span className="text-white">
                    {isEditMode ? (
                      <EditableContent
                        profile={{ id: `cta-benefit-${index}`, bio: benefit }}
                        onSave={async (data) => updateBenefit(index, data.bio)}
                        isEditing={isEditMode}
                        onEditToggle={() => {}}
                      />
                    ) : (
                      benefit
                    )}
                  </span>
                  {isEditMode && (
                    <button
                      className="ml-2 text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeBenefit(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </motion.div>
              ))}
              {isEditMode && (
                <Button
                  variant="outline"
                  size="sm"
                  className="text-white border-white hover:bg-white/20"
                  onClick={() => setIsAddBenefitDialogOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Add Benefit
                </Button>
              )}
            </div>

            {!isEditMode && (
              <div className="flex flex-col sm:flex-row gap-4">
                <Button asChild size="lg" className="bg-rose-500 hover:bg-rose-600 text-white">
                  <Link href="/members">
                    Become a Member <Star className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="text-gray-300 border-white hover:bg-white/10 hover:text-white">
                  <Link href="/members">Learn More</Link>
                </Button>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Add a special edit indicator for background image */}
      {isEditMode && (
        <div className="absolute top-4 right-4 z-30">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white shadow-lg"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              // Call the openEditor method on the EditableImage ref
              if (backgroundImageRef.current) {
                backgroundImageRef.current.openEditor();
              }
            }}
          >
            <ImageIcon className="h-4 w-4 mr-1" />
            Change Background
          </Button>
        </div>
      )}

      <Dialog open={isAddBenefitDialogOpen} onOpenChange={setIsAddBenefitDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Benefit</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add a new benefit or feature to showcase to your audience
            </p>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Enter benefit"
              value={newBenefit}
              onChange={(e) => setNewBenefit(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault()
                  addBenefit()
                }
              }}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddBenefitDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addBenefit}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
