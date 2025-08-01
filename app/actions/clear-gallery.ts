'use server'

import { revalidatePath } from 'next/cache'
import { clearAllGalleryData } from './gallery'

export async function clearGalleryAction() {
  try {
    const result = await clearAllGalleryData()
    if (result.success) {
      revalidatePath('/gallery')
      return { success: true, message: 'Gallery data cleared successfully' }
    } else {
      return { success: false, message: result.error || 'Failed to clear gallery data' }
    }
  } catch (error) {
    console.error('Error clearing gallery:', error)
    return { 
      success: false, 
      message: error instanceof Error ? error.message : 'An unknown error occurred' 
    }
  }
}
