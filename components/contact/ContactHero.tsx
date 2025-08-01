'use client'

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Edit } from "lucide-react"
import { useContactEdit } from "./ContactEditContext"
import ContactEditableImage from "./ContactEditableImage"
import { useAuth } from "@/components/providers/AuthProvider"
import supabase from '@/lib/supabase/client'
import { toast } from 'sonner'

// Storage key for hero data
const HERO_STORAGE_KEY = "contact_hero_data"

interface HeroData {
  backgroundImage: string;
  title: string;
  description: string;
  backgroundBrightness: number;
}

export default function ContactHero() {
  const { isAdmin } = useAuth()
  const { isEditMode, setIsDirty, saveContactData, getContactData } = useContactEdit()
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [heroData, setHeroData] = useState<HeroData>({
    backgroundImage: "/placeholder.svg?height=1080&width=1920",
    title: "Connect with the Fluxedita Team",
    description: "We would love to hear from you! Whether you have questions, want to collaborate, or just want to say hi, feel free to reach out using any of the methods below.",
    backgroundBrightness: 50,
  })

  // Load hero data from Supabase
  useEffect(() => {
    const loadHeroData = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Get contact page components
        const { data: components, error: componentsError } = await supabase
          .from('root_page_components')
          .select('component_type, content')
          .eq('page_slug', 'contact')
          .eq('is_active', true)

        if (componentsError) throw new Error('Failed to fetch contact page data')

        if (components && components.length > 0) {
          // Find the hero component
          const heroComponent = components.find(c => c.component_type === 'hero')
          if (heroComponent?.content) {
            setHeroData(heroComponent.content as any)
          }
        }
      } catch (err) {
        console.error('Error loading hero data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load hero data')
        toast.error('Failed to load hero data')
      } finally {
        setIsLoading(false)
      }
    }

    loadHeroData()
  }, [])

  const updateHeroData = (key: keyof HeroData, value: string | number) => {
    const updatedData = { ...heroData, [key]: value }
    setHeroData(updatedData)
    
    // Save to context (localStorage) instead of directly to Supabase
    saveContactData('hero', updatedData)
    setIsDirty(true)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] p-4">
        <div className="text-red-500 mb-4">{error}</div>
        <button
          onClick={() => window.location.reload()}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="relative min-h-[500px] w-full overflow-hidden">
      {/* Background Image with Edit Overlay */}
      <div className="absolute inset-0" style={{ zIndex: 1 }}>
        <ContactEditableImage
          src={heroData.backgroundImage}
          alt="Contact Hero Background"
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
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-200 ${isEditing ? 'opacity-0' : 'opacity-100'}`}
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
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
                {heroData.title}
              </h1>
              <p className="text-xl md:text-2xl text-white/90 mb-8">
                {heroData.description}
              </p>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="inline-block"
              >
                <a 
                  href="#contact-form" 
                  className="bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors inline-flex items-center gap-2"
                >
                  Send Me a Message
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </a>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>

      {/* Add a special edit indicator for background image */}
      {isEditMode && (
        <div className="absolute top-4 left-4 z-30">
          <Button
            variant="secondary"
            size="sm"
            className="bg-white shadow-lg"
            onClick={() => {
              setIsEditing(!isEditing)
            }}
          >
            <Edit className="h-4 w-4 mr-2" />
            {isEditing ? 'Done' : 'Edit Background'}
          </Button>
        </div>
      )}

      {/* Editable title and description */}
      {isEditMode && (
        <div className="absolute top-4 right-4 z-30 space-y-2">
          <div className="bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={heroData.title}
                onChange={(e) => updateHeroData("title", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm"
                placeholder="Enter title"
              />
            </div>
            <div className="space-y-2 mt-3">
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={heroData.description}
                onChange={(e) => updateHeroData("description", e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500 text-sm"
                placeholder="Enter description"
                rows={3}
              />
            </div>
            {/* Save Button */}
            <Button
              variant="default"
              className="mt-4 w-full"
              onClick={async () => {
                try {
                  const { error } = await supabase
                    .from('root_page_components')
                    .update({ content: heroData })
                    .eq('page_slug', 'contact')
                    .eq('component_type', 'hero');
                  if (error) throw error;
                  toast.success('Hero section saved!');
                  setIsDirty(false);
                } catch (err) {
                  toast.error('Failed to save hero section');
                }
              }}
            >
              Save Hero Section
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
