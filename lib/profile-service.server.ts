import { getSupabaseServerClient } from '@/lib/getSupabaseServerClient';
import { createClient } from '@supabase/supabase-js';
import type { Database } from '@/lib/supabase/database.types';

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  return createClient<Database>(supabaseUrl, supabaseServiceKey);
}

export interface ProfileData {
  user_id: string;
  profile_image?: string;
  background_image?: string;
  hero_image?: string;
  name?: string;
  title?: string;
  description?: string;
  bio?: {
    title: string;
    paragraphs: string[];
    interestsTitle: string;
  };
  interests?: Array<{
    icon: string;
    label: string;
  }>;
  bio_images?: string[];
  cta?: {
    backgroundImage: string;
    title: string;
    description: string;
  };
  benefits?: string[];
  testimonials?: Array<{
    id: string;
    name: string;
    avatar: string;
    initials: string;
    text: string;
    rating: number;
    membership: string;
  }>;
  social_links?: Array<{
    id: string;
    platform: string;
    username: string;
    icon: string;
    url: string;
    color: string;
  }>;
}

// Get profile data for the current user
export async function getProfileData(): Promise<ProfileData | null> {
  const supabase = getSupabaseServerClient();
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  if (userError || !user) {
    return null;
  }
  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', user.id)
    .single();
  if (profileError || !profile) {
    return null;
  }
  
  // Deserialize JSON strings back to objects
  const deserializedProfile = {
    ...profile,
    bio: profile.bio ? (typeof profile.bio === 'string' ? JSON.parse(profile.bio) : profile.bio) : undefined,
    interests: profile.interests ? (typeof profile.interests === 'string' ? JSON.parse(profile.interests) : profile.interests) : undefined,
    cta: profile.cta ? (typeof profile.cta === 'string' ? JSON.parse(profile.cta) : profile.cta) : undefined,
    benefits: profile.benefits ? (typeof profile.benefits === 'string' ? JSON.parse(profile.benefits) : profile.benefits) : undefined,
    testimonials: profile.testimonials ? (typeof profile.testimonials === 'string' ? JSON.parse(profile.testimonials) : profile.testimonials) : undefined,
    social_links: profile.social_links ? (typeof profile.social_links === 'string' ? JSON.parse(profile.social_links) : profile.social_links) : undefined,
    bio_images: profile.bio_images ? (typeof profile.bio_images === 'string' ? JSON.parse(profile.bio_images) : profile.bio_images) : undefined,
  };
  
  return deserializedProfile as ProfileData;
}

// Save profile data for the current user
export async function saveProfileData(data: ProfileData): Promise<void> {
  const supabase = getSupabaseAdminClient();
  
  // Prepare data for database by serializing object fields
  const dbData = {
    ...data,
    bio: data.bio ? JSON.stringify(data.bio) : null,
    interests: data.interests ? JSON.stringify(data.interests) : null,
    cta: data.cta ? JSON.stringify(data.cta) : null,
    benefits: data.benefits ? JSON.stringify(data.benefits) : null,
    testimonials: data.testimonials ? JSON.stringify(data.testimonials) : null,
    social_links: data.social_links ? JSON.stringify(data.social_links) : null,
    bio_images: data.bio_images ? JSON.stringify(data.bio_images) : null,
  };
  
  // Upsert the profile row for the user
  const { error } = await supabase
    .from('profiles')
    .upsert(dbData, { onConflict: 'user_id' });
  if (error) {
    console.error('Error saving profile data to Supabase:', error);
    throw error;
  }
} 