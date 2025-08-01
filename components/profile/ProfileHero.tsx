"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Camera, Star, Edit, Sun, ArrowRight, Mail } from "lucide-react"
import { createPortal } from "react-dom"
import { useProfileEdit } from "./ProfileEditContext"
import EditableContent from "./EditableContent"
import EditableImage from "./EditableImage"

// Storage key for hero data
const HERO_STORAGE_KEY = "hero_data"

export default function ProfileHero() {
  const { isEditMode, setIsDirty, saveProfileData, getProfileData } = useProfileEdit()
  type HeroData = {
    backgroundImage: string;
    profileImage: string;
    name: string;
    title: string;
    description: string;
    backgroundBrightness: number;
  }

  const [heroData, setHeroData] = useState<HeroData>({
    backgroundImage: "/placeholder.svg?height=1080&width=1920",
    profileImage: "/uploads/images/happ-hotel-room-b16c56db.jpeg",
    name: "admin",
    title: "Content Creator & Photographer",
    description:
      "Based in London, sharing my creative journey through photography and exclusive content with my amazing community.",
    backgroundBrightness: 50,
  })

  // Load saved data on component mount
  useEffect(() => {
    const savedData = getProfileData(HERO_STORAGE_KEY)
    if (savedData) {
      console.log("Loading saved hero data:", savedData)
      setHeroData(savedData)
    } else {
      // If no saved data, ensure we're using the correct image path
      setHeroData(prev => ({
        ...prev,
        profileImage: "http://localhost:3002/uploads/images/happ-hotel-room-b16c56db.jpeg"
      }))
    }
  }, [getProfileData])

  const updateHeroData = (key: keyof HeroData, value: string | number) => {
    console.log(`Updating hero ${key} with value:`, typeof value === 'string' ? value.substring(0, 50) + (value.length > 50 ? "..." : "") : value)

    const updatedData = { ...heroData, [key]: value }
    setHeroData(updatedData as HeroData)
    setIsDirty(true)

    // Save to localStorage immediately
    saveProfileData(HERO_STORAGE_KEY, updatedData)
  }

  const [isEditing, setIsEditing] = useState(false)

  return (
    <div className="relative min-h-[600px] w-full overflow-hidden">
      {/* Background Image with Edit Overlay */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <EditableImage
          src={heroData.backgroundImage}
          alt="Hero Background"
          onChange={(url) => updateHeroData("backgroundImage", url)}
          type="background"
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
          isEditing={isEditing}
          isEditMode={isEditMode}
        />
      </div>

      {/* Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/50"
        style={{ 
          opacity: heroData.backgroundBrightness / 100,
          zIndex: 2,
          pointerEvents: isEditing ? 'none' : 'auto'
        }}
      />

      {/* Content Container */}
      <div 
        className={`absolute inset-0 flex items-end pb-16 transition-opacity duration-200 ${isEditing ? 'opacity-0' : 'opacity-100'}`}
        style={{ zIndex: 3, pointerEvents: isEditing ? 'none' : 'auto' }}
      >
        <div className="container relative px-4 md:px-6 mx-auto">
          <div className="w-full text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="max-w-3xl mx-auto"
            >
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                <EditableContent
                  profile={{ id: "hero-name", full_name: heroData.name }}
                  onSave={async (data) => updateHeroData("name", data.full_name)}
                  isEditing={isEditMode}
                  onEditToggle={() => {}}
                />
              </h1>
              <p className="text-xl text-white/90 mb-8">
                <EditableContent
                  profile={{ id: "hero-title", full_name: heroData.title }}
                  onSave={async (data) => updateHeroData("title", data.full_name)}
                  isEditing={isEditMode}
                  onEditToggle={() => {}}
                />
              </p>
              <div className="flex flex-wrap gap-4 justify-center">
                <Button asChild size="lg" className="bg-rose-500 hover:bg-rose-600">
                  <Link href="/gallery">
                    View Gallery <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="bg-white text-gray-900 border-white hover:bg-white/90">
                  <Link href="/contact">
                    Contact Me <Mail className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Brightness Control - Rendered in a portal to ensure it's always on top */}
      {isEditMode && createPortal(
        <div 
          className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[9999] flex items-center gap-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg"
          onClick={(e) => e.stopPropagation()}
        >
          <Sun className="h-4 w-4 text-gray-700 flex-shrink-0" />
          <Slider
            value={[heroData.backgroundBrightness]}
            onValueChange={([value]) => updateHeroData("backgroundBrightness", value.toString())}
            min={10}
            max={100}
            step={5}
            className="w-32 md:w-48"
          />
          <span className="text-sm text-gray-700 w-8 text-center flex-shrink-0">
            {heroData.backgroundBrightness}%
          </span>
        </div>,
        document.body
      )}

      {/* Add a special edit indicator for background image */}
      {isEditMode && (
        <div className="absolute top-4 left-4 z-30">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white shadow-lg"
            onClick={() => {
              setIsEditing(!isEditing);
            }}
          >
            <Edit className="h-4 w-4 mr-1" />
            {isEditing ? "Done Editing" : "Edit Background"}
          </Button>
        </div>
      )}
    </div>
  )
}
