"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, Coffee, Music, Plane, Book, Plus, X } from "lucide-react"
import { useProfileEdit } from "./ProfileEditContext"
import EditableContent from "./EditableContent"
import SimpleEditableImage from "./SimpleEditableImage"

// Storage keys
const BIO_CONTENT_KEY = "bio_content"
const BIO_INTERESTS_KEY = "bio_interests"
const BIO_IMAGES_KEY = "bio_images"

export default function ProfileBio() {
  const { isEditMode, setIsDirty, saveProfileData, getProfileData } = useProfileEdit()
  const [bioContent, setBioContent] = useState({
    title: "About Me",
    paragraphs: [
      "luxedita is a live-editable web platform. It brings the entire site-building and management experience into one seamless, in-browser interface. There is no separate builder. No bloated dashboards. No tech headaches. With Fluxedita, what you see is literally what your visitors get. You edit your actual site, in real time, with instant results.",
    ],
    interestsTitle: "My Interests",
  })

  const [interests, setInterests] = useState([
    { icon: "Camera", label: "Photography" },
    { icon: "Heart", label: "Fashion" },
    { icon: "Coffee", label: "Coffee" },
    { icon: "Music", label: "Music" },
    { icon: "Plane", label: "Travel" },
    { icon: "Book", label: "Reading" },
  ])

  const [images, setImages] = useState([
    "/uploads/images/happ-hotel-room-b16c56db.jpeg",
    "/uploads/images/happ-hotel-room-b16c56db.jpeg",
    "/uploads/images/happ-hotel-room-b16c56db.jpeg"
  ])

  const [isAddInterestDialogOpen, setIsAddInterestDialogOpen] = useState(false)
  const [newInterest, setNewInterest] = useState("")

  // Load saved data on component mount
  useEffect(() => {
    const savedBioContent = getProfileData(BIO_CONTENT_KEY)
    if (savedBioContent) {
      setBioContent(savedBioContent)
    }

    const savedInterests = getProfileData(BIO_INTERESTS_KEY)
    if (savedInterests) {
      setInterests(savedInterests)
    }

    const savedImages = getProfileData(BIO_IMAGES_KEY)
    if (savedImages) {
      setImages(savedImages)
    }
  }, [getProfileData])

  const updateBioContent = (key: keyof typeof bioContent, value: any) => {
    const updatedContent = { ...bioContent, [key]: value }
    setBioContent(updatedContent)
    setIsDirty(true)
    saveProfileData(BIO_CONTENT_KEY, updatedContent)
  }

  const updateParagraph = (index: number, value: string) => {
    const newParagraphs = [...bioContent.paragraphs]
    newParagraphs[index] = value
    updateBioContent("paragraphs", newParagraphs)
  }

  const updateImage = (index: number, url: string) => {
    const newImages = [...images]
    newImages[index] = url
    setImages(newImages)
    setIsDirty(true)
    saveProfileData(BIO_IMAGES_KEY, newImages)
  }

  const addInterest = () => {
    if (newInterest.trim()) {
      // For simplicity, we'll use the Book icon for all new interests
      const updatedInterests = [...interests, { icon: "Book", label: newInterest.trim() }]
      setInterests(updatedInterests)
      setNewInterest("")
      setIsAddInterestDialogOpen(false)
      setIsDirty(true)
      saveProfileData(BIO_INTERESTS_KEY, updatedInterests)
    }
  }

  const removeInterest = (index: number) => {
    const newInterests = [...interests]
    newInterests.splice(index, 1)
    setInterests(newInterests)
    setIsDirty(true)
    saveProfileData(BIO_INTERESTS_KEY, newInterests)
  }

  // Map string icon names to actual icon components
  const getIconComponent = (iconName: string) => {
    const iconMap: Record<string, React.ElementType> = {
      Heart,
      Coffee,
      Music,
      Plane,
      Book,
    }
    return iconMap[iconName] || Book
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      <div>
        <h2 className="text-3xl font-bold mb-6">
          <EditableContent
            profile={{ id: "bio-title", full_name: bioContent.title }}
            onSave={async (data) => updateBioContent("title", data.full_name)}
            isEditing={isEditMode}
            onEditToggle={() => {}}
          />
        </h2>

        <div className="space-y-4 text-gray-700">
          {bioContent.paragraphs.map((paragraph, index) => (
            <div key={index} className="mb-4">
              <EditableContent
                profile={{ id: `bio-paragraph-${index}`, bio: paragraph }}
                onSave={async (data) => updateParagraph(index, data.bio)}
                isEditing={isEditMode}
                onEditToggle={() => {}}
              />
            </div>
          ))}
        </div>

        <div className="mt-8">
          <h3 className="text-xl font-semibold mb-4">
            <EditableContent
              profile={{ id: "bio-interests-title", full_name: bioContent.interestsTitle }}
              onSave={async (data) => updateBioContent("interestsTitle", data.full_name)}
              isEditing={isEditMode}
              onEditToggle={() => {}}
            />
          </h3>
          <div className="flex flex-wrap gap-3">
            {interests.map((interest, index) => {
              const IconComponent = getIconComponent(interest.icon)
              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="relative group"
                >
                  <Badge variant="secondary" className="px-4 py-2 text-sm">
                    <IconComponent className="h-4 w-4 mr-2" />
                    {interest.label}
                  </Badge>
                  {isEditMode && (
                    <button
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => removeInterest(index)}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </motion.div>
              )
            })}
            {isEditMode && (
              <Button
                variant="outline"
                size="sm"
                className="rounded-full"
                onClick={() => setIsAddInterestDialogOpen(true)}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Interest
              </Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <Card className="overflow-hidden relative col-span-1">
          <CardContent className="p-0">
            <div className="relative aspect-square">
              <SimpleEditableImage
                src={images[0]}
                alt="admin Portrait 1"
                isEditMode={isEditMode}
                onChange={(url) => updateImage(0, url)}
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative col-span-1">
          <CardContent className="p-0">
            <div className="relative aspect-square">
              <SimpleEditableImage
                src={images[1]}
                alt="admin Portrait 2"
                isEditMode={isEditMode}
                onChange={(url: string) => updateImage(1, url)}
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden relative col-span-1">
          <CardContent className="p-0">
            <div className="relative aspect-square">
              <SimpleEditableImage
                src={images[2]}
                alt="admin Portrait 3"
                isEditMode={isEditMode}
                onChange={(url: string) => updateImage(2, url)}
                className="w-full h-full"
              />
            </div>
          </CardContent>
        </Card>
      </div>

      {isAddInterestDialogOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-lg font-medium mb-4">Add New Interest</h3>
            <div className="space-y-4">
              <div>
                <input
                  type="text"
                  placeholder="Enter interest name"
                  value={newInterest}
                  onChange={(e) => setNewInterest(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addInterest()
                    }
                  }}
                  className="w-full p-2 border rounded"
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddInterestDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addInterest}>
                  Add Interest
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
