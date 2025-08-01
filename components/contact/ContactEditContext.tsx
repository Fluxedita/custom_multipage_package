"use client"

import { createContext, useContext, useState, useCallback, type ReactNode, useEffect } from "react"
import { toast } from "sonner"
import { useAuth } from "@/components/providers/AuthProvider"
import supabase from '@/lib/supabase/client'

interface ContactEditContextType {
  isEditMode: boolean
  toggleEditMode: () => void
  isDirty: boolean
  setIsDirty: (value: boolean) => void
  saveChanges: () => Promise<void>
  discardChanges: () => void
  isSaving: boolean
  saveContactData: (key: string, data: any) => void
  getContactData: (key: string) => any
  reloadFlag: number;
  triggerReload: () => void;
}

const ContactEditContext = createContext<ContactEditContextType | undefined>(undefined)

// Define a storage key prefix to avoid conflicts
const STORAGE_KEY_PREFIX = "admin_contact_"

export function ContactEditProvider({ children }: { children: ReactNode }) {
  const [isEditMode, setIsEditMode] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [reloadFlag, setReloadFlag] = useState(0);
  const { isAuthenticated, isAdmin } = useAuth()

  // Hydrate context/localStorage from Supabase on mount or reloadFlag change
  useEffect(() => {
    async function hydrateFromSupabase() {
      try {
        const { data, error } = await supabase
          .from('page_content')
          .select('content')
          .eq('page_slug', 'contact')
          .eq('section_type', 'contact')
          .single();
        if (error && error.code !== 'PGRST116') { // Not found is not an error
          throw error;
        }
        if (data && data.content) {
          // Write each key in content to localStorage
          Object.entries(data.content).forEach(([key, value]) => {
            const storageKey = `${STORAGE_KEY_PREFIX}${key}`;
            localStorage.setItem(storageKey, JSON.stringify(value));
          });
          setIsDirty(false);
        }
      } catch (err) {
        console.error('Failed to hydrate contact details from Supabase:', err);
        toast.error('Failed to load contact details from server');
      }
    }
    hydrateFromSupabase();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reloadFlag]);

  // Check if user is logged in on mount and enable edit mode if they are
  useEffect(() => {
    if (isAuthenticated && isAdmin && !isEditMode) {
      setIsEditMode(true)
    } else if ((!isAuthenticated || !isAdmin) && isEditMode) {
      setIsEditMode(false)
    }
  }, [isAuthenticated, isAdmin, isEditMode])
  
  // Function to save data to localStorage
  const saveContactData = useCallback((key: string, data: any) => {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${key}`
      localStorage.setItem(storageKey, JSON.stringify(data))
      setIsDirty(true)
    } catch (error) {
      console.error('Error saving contact data:', error)
      toast.error('Failed to save changes. Please try again.')
    }
  }, [])

  // Function to get data from localStorage
  const getContactData = useCallback((key: string) => {
    try {
      const storageKey = `${STORAGE_KEY_PREFIX}${key}`
      const data = localStorage.getItem(storageKey)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error('Error getting contact data:', error)
      return null
    }
  }, [])

  // Toggle edit mode
  const toggleEditMode = useCallback(() => {
    if (isAuthenticated && isAdmin) {
      setIsEditMode(prev => !prev)
    }
  }, [isAuthenticated, isAdmin])

  // Save changes to Supabase
  const saveChanges = useCallback(async () => {
    setIsSaving(true)
    try {
      // Get the contact page ID
      const { data: pageRow, error: pageError } = await supabase
        .from('custom_pages')
        .select('id')
        .eq('slug', 'contact')
        .single()

      if (pageError) throw new Error('Failed to find contact page')
      if (!pageRow) throw new Error('Contact page not found')

      // Collect all data from localStorage
      const sections: any = {}
      
      // Get all localStorage keys that start with our prefix
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          const dataKey = key.replace(STORAGE_KEY_PREFIX, '')
          const data = getContactData(dataKey)
          if (data !== null) {
            sections[dataKey] = data
          }
        }
      })

      // Check if we have any data to save
      if (Object.keys(sections).length === 0) {
        toast.info('No changes to save')
        setIsDirty(false)
        return
      }

      // Upsert page_content record for contact page
      const { error: saveError } = await supabase
        .from('page_content')
        .upsert([
          {
            page_slug: 'contact',
            section_type: 'contact',
            sort_order: 0,
            is_published: true,
            content: sections
          }
        ], { onConflict: 'page_slug,section_type' })

      if (saveError) throw saveError

      // Clear localStorage after successful save
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(STORAGE_KEY_PREFIX)) {
          localStorage.removeItem(key)
        }
      })

      setIsDirty(false)
      toast.success('Changes saved successfully')
      setReloadFlag(f => f + 1); // Trigger reload after save
    } catch (error) {
      console.error('Error saving changes:', error)
      toast.error('Failed to save changes. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }, [supabase, getContactData])

  // Discard changes
  const discardChanges = useCallback(() => {
    // Clear all saved changes from localStorage
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith(STORAGE_KEY_PREFIX)) {
        localStorage.removeItem(key)
      }
    })
    setIsDirty(false)
    setIsEditMode(false)
    toast('Changes discarded', { description: 'All unsaved changes have been discarded.' })
  }, [])

  return (
    <ContactEditContext.Provider
      value={{
        isEditMode,
        toggleEditMode,
        isDirty,
        setIsDirty,
        saveChanges,
        discardChanges,
        isSaving,
        saveContactData,
        getContactData,
        reloadFlag,
        triggerReload: () => setReloadFlag(f => f + 1),
      }}
    >
      {children}
    </ContactEditContext.Provider>
  )
}

export function useContactEdit() {
  const context = useContext(ContactEditContext)
  if (context === undefined) {
    throw new Error('useContactEdit must be used within a ContactEditProvider')
  }
  return context
}
