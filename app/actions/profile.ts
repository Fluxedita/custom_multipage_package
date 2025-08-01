'use server'

import { revalidatePath } from "next/cache"
import { getProfileData, saveProfileData } from "@/lib/profile-service.server"
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

export async function updateProfileImage(imageUrl: string, type: "profile" | "background" | "hero") {
  try {
    const profileData = await getProfileData()
    
    if (!profileData) {
      return { success: false, error: 'Profile data not found' }
    }
    
    switch (type) {
      case "profile":
        profileData.profile_image = imageUrl
        break
      case "background":
        profileData.background_image = imageUrl
        break
      case "hero":
        profileData.hero_image = imageUrl
        break
    }
    
    await saveProfileData(profileData)
    revalidatePath('/members')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile image:', error)
    return { success: false, error: 'Failed to update image' }
  }
}

export async function updateProfileContent(key: string, value: any) {
  try {
    const profileData = await getProfileData()
    
    if (!profileData) {
      return { success: false, error: 'Profile data not found' }
    }
    
    // Handle nested updates
    const keys = key.split('.')
    let current: any = profileData
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    await saveProfileData(profileData)
    revalidatePath('/members')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile content:', error)
    return { success: false, error: 'Failed to update content' }
  }
}

export async function updateProfileArray(key: string, value: any[]) {
  try {
    const profileData = await getProfileData()
    
    if (!profileData) {
      return { success: false, error: 'Profile data not found' }
    }
    
    // Handle nested updates
    const keys = key.split('.')
    let current: any = profileData
    
    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {}
      }
      current = current[keys[i]]
    }
    
    current[keys[keys.length - 1]] = value
    await saveProfileData(profileData)
    revalidatePath('/members')
    return { success: true }
  } catch (error) {
    console.error('Error updating profile array:', error)
    return { success: false, error: 'Failed to update array' }
  }
}

// New server action for updating user profile with all fields including hobbies and character_traits
export async function updateUserProfile(profileData: any) {
  'use server';
  
  try {
    const supabase = getSupabaseAdminClient();
    
    // Get the current user from the profileData
    const userId = profileData.id;
    
    if (!userId) {
      return { success: false, error: 'User ID is missing from profile data' };
    }

    // Ensure arrays are properly handled
    const hobbies = Array.isArray(profileData.hobbies) ? profileData.hobbies : [];
    
    console.log('Server action - hobbies:', hobbies, 'type:', typeof hobbies);
    
    const dataToSave = {
      user_id: userId,
      full_name: profileData.full_name,
      username: profileData.username,
      avatar_url: profileData.avatar_url,
      banner_url: profileData.banner_url,
      bio_message: profileData.bio_message,
      video_intro_url: profileData.video_intro_url,
      age: profileData.age,
      occupation: profileData.occupation,
      hobbies: hobbies,
      profile_media: profileData.profile_media || [],
      updated_at: new Date().toISOString(),
    };
    
    console.log('Server action - saving data:', dataToSave);
    
    const { data, error } = await supabase
      .from('profiles')
      .upsert(dataToSave, { onConflict: 'user_id' })
      .select()
      .single();

    if (error) {
      console.error('Server action - profile update error:', error);
      return { success: false, error: error.message };
    }

    console.log('Server action - profile updated successfully:', data);
    
    // Revalidate the profile page
    revalidatePath('/profile');
    revalidatePath(`/profile/${userId}`);
    
    return { success: true, data };
  } catch (error) {
    console.error('Server action - unexpected error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
} 