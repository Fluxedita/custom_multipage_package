"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import { useAuth } from "@/components/providers/AuthProvider"
import { useToast } from "@/components/ui/use-toast"

interface ProfileEditContextType {
  isEditMode: boolean
  toggleEditMode: () => void
  isDirty: boolean
  setIsDirty: (value: boolean) => void
  saveChanges: () => Promise<void>
  discardChanges: () => void
  isSaving: boolean
  saveProfileData: (key: string, data: any) => void
  getProfileData: (key: string) => any
}

const ProfileEditContext = createContext<ProfileEditContextType | undefined>(undefined)

// Define a storage key prefix to avoid conflicts
const STORAGE_KEY_PREFIX = "admin_profile_"

export function ProfileEditProvider({ children }: { children: ReactNode }) {
  const { isAdmin } = useAuth()
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const { toast } = useToast()
  
  // Function to compress data before saving to localStorage
  const compressData = (data: any): any => {
    // If the data contains large strings (like base64 images), handle them specially
    if (typeof data === 'string' && data.length > 1000 && data.startsWith('data:image')) {
      // For images, we'll store a reference instead of the full data URL
      const timestamp = new Date().getTime()
      const imageKey = `img_${timestamp}_${Math.random().toString(36).substring(2, 9)}`
      // Store the actual image data in sessionStorage temporarily
      try {
        sessionStorage.setItem(imageKey, data)
        return { __compressed: true, type: 'image', key: imageKey }
      } catch (e) {
        console.warn('Could not store large image in sessionStorage, falling back to original data')
        return data
      }
    } else if (Array.isArray(data)) {
      return data.map(item => compressData(item))
    } else if (typeof data === 'object' && data !== null) {
      const compressed: Record<string, any> = {}
      for (const [k, v] of Object.entries(data)) {
        compressed[k] = compressData(v)
      }
      return compressed
    }
    return data
  }

  // Function to decompress data after loading from localStorage
  const decompressData = (data: any): any => {
    if (data && typeof data === 'object' && data.__compressed) {
      if (data.type === 'image') {
        return sessionStorage.getItem(data.key) || ''
      }
    } else if (Array.isArray(data)) {
      return data.map(item => decompressData(item))
    } else if (data && typeof data === 'object') {
      const decompressed: Record<string, any> = {}
      for (const [k, v] of Object.entries(data)) {
        decompressed[k] = decompressData(v)
      }
      return decompressed
    }
    return data
  }

  const toggleEditMode = () => {
    if (!isAdmin) return

    if (isEditMode && isDirty) {
      if (confirm("You have unsaved changes. Are you sure you want to exit edit mode?")) {
        setIsEditMode(false)
        setIsDirty(false)
      }
    } else {
      setIsEditMode((prev) => !prev)
    }
  }

  // Function to save data to localStorage with compression
  const saveProfileData = useCallback((key: string, data: any) => {
    if (typeof window === "undefined") {
      return false
    }
    
    const storageKey = `${STORAGE_KEY_PREFIX}${key}`
    
    try {
      const compressedData = compressData(data)
      localStorage.setItem(storageKey, JSON.stringify(compressedData))
      console.log(`Saved compressed data for key: ${key}`)
      return true
    } catch (error) {
      console.error(`Error saving data for key: ${key}`, error)
      
      // If we hit the quota, clear old data and try again
      if (error instanceof DOMException && error.name === 'QuotaExceededError') {
        console.warn('LocalStorage quota exceeded, clearing old data...')
        
        // Clear only our app's data
        Object.keys(localStorage)
          .filter(k => k.startsWith(STORAGE_KEY_PREFIX))
          .forEach(k => localStorage.removeItem(k))
          
        try {
          localStorage.setItem(storageKey, JSON.stringify(compressData(data)))
          return true
        } catch (retryError) {
          console.error('Failed to save after clearing old data:', retryError)
          return false
        }
      }
      
      return false
    }
  }, [])

  // Function to get data from localStorage with decompression
  const getProfileData = useCallback((key: string) => {
    if (typeof window !== "undefined") {
      try {
        const storageKey = `${STORAGE_KEY_PREFIX}${key}`
        const data = localStorage.getItem(storageKey)
        if (data) {
          const parsedData = JSON.parse(data)
          const decompressedData = decompressData(parsedData)
          console.log(`Retrieved and decompressed data for key: ${key}`)
          return decompressedData
        }
        return null
      } catch (error) {
        console.error(`Error retrieving data for key: ${key}`, error)
        return null
      }
    }
    return null
  }, [])

  const saveChanges = async () => {
    // In a real application, this would save the changes to the backend
    setIsSaving(true)

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // In a real app, this would send all the data to a backend API
      // For now, we're just marking the data as "saved" in the UI
      // The actual data is already saved in localStorage on each change

      toast({
        title: "Changes saved",
        description: "Your profile has been updated successfully.",
      })

      setIsDirty(false)
      // Optionally exit edit mode after saving
      // setIsEditMode(false)
    } catch (error) {
      toast({
        title: "Error saving changes",
        description: "There was a problem saving your changes. Please try again.",
        variant: "destructive",
      })
      console.error(error)
    } finally {
      setIsSaving(false)
    }
  }

  const discardChanges = () => {
    if (isDirty) {
      if (confirm("Are you sure you want to discard all changes?")) {
        setIsDirty(false)
        setIsEditMode(false)

        toast({
          title: "Changes discarded",
          description: "Your changes have been discarded.",
        })
      }
    } else {
      setIsEditMode(false)
    }
  }

  return (
    <ProfileEditContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        isDirty,
        setIsDirty,
        saveChanges,
        discardChanges,
        isSaving,
        saveProfileData,
        getProfileData,
      }}
    >
      {children}
    </ProfileEditContext.Provider>
  )
}

export function useProfileEdit() {
  const context = useContext(ProfileEditContext)
  if (context === undefined) {
    throw new Error("useProfileEdit must be used within a ProfileEditProvider")
  }
  return context
}
