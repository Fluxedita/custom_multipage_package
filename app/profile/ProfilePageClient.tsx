'use client'

import { DynamicPage } from '@/app/utils/dynamic-page'
import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import supabase from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { toast } from 'sonner'
import { 
  User, 
  Bell, 
  Lock, 
  Globe, 
  Mail, 
  Instagram, 
  Twitter, 
  Youtube,
  Camera,
  LogOut,
  Video,
  Plus
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import Image from 'next/image';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { updateUserProfile } from '@/app/actions/profile'

interface ProfileData {
  full_name: string;
  username: string;
  avatar_url?: string;
  banner_url?: string;
  bio_message?: string;
  video_intro_url?: string;
  
  age?: number;
  occupation?: string;
  hobbies?: string[];
  profile_media?: ProfileMediaItem[];
}

interface ProfileMediaItem {
  type: 'image' | 'video';
  url: string;
}

const TagInput = ({ value, onChange }: { value: string[], onChange: (value: string[]) => void }) => {
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === ',' || e.key === 'Enter') {
      e.preventDefault();
      const newTag = e.currentTarget.value.trim();
      if (newTag && !value.includes(newTag)) {
        onChange([...value, newTag]);
      }
      e.currentTarget.value = '';
    }
  };

  const removeTag = (tagToRemove: string) => {
    onChange(value.filter(tag => tag !== tagToRemove));
  };

  return (
    <div>
      <Input onKeyDown={handleKeyDown} placeholder="Type a tag and press Enter or Comma" />
      <div className="flex flex-wrap gap-2 mt-2">
        {(value || []).map(tag => (
          <div key={tag} className="flex items-center gap-1 bg-muted px-2 py-1 rounded-full text-sm">
            {tag}
            <button type="button" onClick={() => removeTag(tag)} className="text-muted-foreground hover:text-primary">&times;</button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Add a type guard for ProfileMediaItem
function isProfileMediaItem(item: any): item is ProfileMediaItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    (item.type === 'image' || item.type === 'video') &&
    typeof item.url === 'string'
  );
}

export default function ProfilePageClient() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [user, setUser] = useState<any>(null)
  const [profileData, setProfileData] = useState<Partial<ProfileData>>({})
  const [profileMedia, setProfileMedia] = useState<ProfileMediaItem[]>([])
  const router = useRouter()
  const videoInputRef = useRef<HTMLInputElement>(null);

  const fetchProfile = useCallback(async (userId: string) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    if (error && error.code !== 'PGRST116') {
      toast.error('Failed to load profile.')
      console.error(error)
      return
    }
    
    console.log('Raw profile data from DB:', profile);
    
    if (profile) {
      const filteredProfileMedia = Array.isArray(profile.profile_media)
        ? (profile.profile_media.filter(isProfileMediaItem) as unknown as ProfileMediaItem[])
        : [];
      const processedProfile = {
        ...profile,
        full_name: profile.full_name ?? undefined,
        username: profile.username ?? undefined,
        email: profile.email ?? undefined,
        bio: profile.bio ?? undefined,
        age: profile.age ?? undefined,
        city: profile.city ?? undefined,
        country: profile.country ?? undefined,
        occupation: profile.occupation ?? undefined,
        hobbies: profile.hobbies ? profile.hobbies.split(',').map((h: string) => h.trim()) : [],
        profile_media: filteredProfileMedia,
      };
      
      console.log('Processed profile data:', processedProfile);
      console.log('Hobbies after processing:', processedProfile.hobbies, 'type:', typeof processedProfile.hobbies);
      
      setProfileData(processedProfile as unknown as Partial<ProfileData>);
      
      // Load profile media from database
      setProfileMedia(filteredProfileMedia);
    }
  }, [])

  // Dedicated handler for Avatar upload
  const handleAvatarUpload = async (file: File) => {
    if (!user || !file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-avatar-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(`profiles/${fileName}`, file);
    if (uploadError) {
      toast.error('Failed to upload avatar.');
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`profiles/${fileName}`);
    setProfileData(prev => ({ ...prev, avatar_url: publicUrl }));
    toast.success('Avatar updated! Remember to save.');
  };

  // Dedicated handler for Banner upload
  const handleBannerUpload = async (file: File) => {
    if (!user || !file) return;
    const fileExt = file.name.split('.').pop();
    const fileName = `${user.id}-banner-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage.from('media').upload(`profiles/${fileName}`, file);
    if (uploadError) {
      toast.error('Failed to upload banner.');
      return;
    }
    const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(`profiles/${fileName}`);
    setProfileData(prev => ({ ...prev, banner_url: publicUrl }));
    toast.success('Banner updated! Remember to save.');
  };

  useEffect(() => {
    const initializeUser = async () => {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        await fetchProfile(user.id)
      } else {
        router.push('/auth/login')
      }
      setLoading(false)
    }
    initializeUser()
  }, [router, fetchProfile])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/auth/login')
  }

  const handleProfileMediaUpload = async (file: File, slot: number) => {
    if (!user || !file) return;
    const fileExt = file.name.split('.').pop();
    const isVideo = file.type.startsWith('video/');
    const isImage = file.type.startsWith('image/');
    if (!isVideo && !isImage) {
      toast.error('Only image or video files are allowed.');
      return;
    }
    const maxSizeMB = isVideo ? 50 : 5;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File is too large. Max size is ${maxSizeMB}MB.`);
      return;
    }
    const fileName = `${user.id}-profilemedia${slot + 1}-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(`profiles/${fileName}`, file);
    if (uploadError) {
      toast.error('Failed to upload file.');
      console.error(uploadError);
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(`profiles/${fileName}`);
    const newMedia: ProfileMediaItem = {
      type: isVideo ? 'video' : 'image',
      url: publicUrl,
    };
    setProfileMedia(prev => {
      const updated = [...prev];
      updated[slot] = newMedia;
      return updated.slice(0, 3);
    });
    
    // Also update profileData so it gets saved when profile is saved
    setProfileData(prev => ({
      ...prev,
      profile_media: [...(prev.profile_media || []).slice(0, slot), newMedia, ...(prev.profile_media || []).slice(slot + 1)].slice(0, 3)
    }));
    
    toast.success('Media uploaded! Remember to save your profile.');
  };

  // Dedicated handler for Video Introduction upload
  const handleVideoIntroUpload = async (file: File) => {
    if (!user || !file) return;
    const fileExt = file.name.split('.').pop();
    if (!file.type.startsWith('video/')) {
      toast.error('Only video files are allowed.');
      return;
    }
    const maxSizeMB = 50;
    if (file.size > maxSizeMB * 1024 * 1024) {
      toast.error(`File is too large. Max size is ${maxSizeMB}MB.`);
      return;
    }
    const fileName = `${user.id}-videointro-${Date.now()}.${fileExt}`;
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(`profiles/${fileName}`, file);
    if (uploadError) {
      toast.error('Failed to upload video.');
      console.error(uploadError);
      return;
    }
    const { data: { publicUrl } } = supabase.storage
      .from('media')
      .getPublicUrl(`profiles/${fileName}`);
    setProfileData(prev => ({ ...prev, video_intro_url: publicUrl }));
    toast.success('Video uploaded! Remember to save your profile.');
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    // Ensure hobbies is saved as a comma-separated string
    const hobbies = Array.isArray(profileData.hobbies) ? profileData.hobbies.join(',') : '';
    const dataToSave = {
      ...profileData,
      id: user.id, // Add the user ID for the server action
      hobbies,
    };
    // Use the server action instead of direct Supabase call
    const result = await updateUserProfile(dataToSave);
    if (!result.success) {
      toast.error(result.error || 'Failed to update profile.');
      console.error('Profile update error:', result.error);
    } else {
      toast.success('Profile saved successfully!');
      await fetchProfile(user.id);
    }
  };

  const createChangeHandler = (field: keyof ProfileData) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'number' ? parseInt(e.target.value, 10) || 0 : e.target.value
    setProfileData(prev => ({ ...prev, [field]: value }))
  }
  const createSwitchHandler = (field: keyof ProfileData) => (checked: boolean) => {
    setProfileData(prev => ({ ...prev, [field]: checked }))
  }
  const createTagChangeHandler = (field: keyof ProfileData) => (value: string[]) => {
    console.log(`Tag change for ${field}:`, value, 'type:', typeof value);
    setProfileData(prev => {
      const updated = { ...prev, [field]: value };
      console.log(`Updated profile data for ${field}:`, updated[field]);
      return updated;
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <DynamicPage>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Profile Header */}
          <div className="relative mb-12">
            <div className="relative h-48 w-full rounded-lg bg-gray-200">
              {profileData.banner_url && (
                <Image
                  src={profileData.banner_url}
                  alt="Profile banner"
                  layout="fill"
                  className="rounded-lg object-cover"
                />
              )}
              <div className="absolute -bottom-10 right-4">
                <label
                  htmlFor="banner-upload"
                  className="cursor-pointer bg-white/80 text-black py-1 px-3 rounded-full text-sm font-medium hover:bg-white transition"
                >
                  Change Banner
                </label>
                <Input id="banner-upload" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleBannerUpload(e.target.files[0])} />
              </div>
            </div>
            <div className="absolute -bottom-12 left-6">
              <div className="relative h-28 w-28 border-4 border-white rounded-full bg-gray-300">
                 {profileData.avatar_url && (
                  <Avatar className="h-full w-full">
                    <AvatarImage 
                      src={profileData.avatar_url} 
                      alt={profileData.full_name || 'Your Name'}
                      onError={(e) => {
                        // Hide the image if it fails to load
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <AvatarFallback>{profileData.full_name?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                )}
                 <label
                  htmlFor="avatar-upload"
                  className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 hover:opacity-100 rounded-full cursor-pointer transition-opacity"
                >
                  <Camera className="h-6 w-6 text-white" />
                </label>
                <Input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={(e) => e.target.files && handleAvatarUpload(e.target.files[0])} />
              </div>
            </div>
             <div className="absolute top-4 right-4">
              <Button variant="secondary" onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          </div>
          
          <div className="pt-10">
            <h1 className="text-3xl font-bold">{profileData.full_name || 'Your Name'}</h1>
          </div>

          {/* New: Media Row */}
          <div className="flex gap-4 mt-8 mb-8">
            {[0, 1, 2].map((slot) => {
              const media = profileMedia[slot];
              return (
                <div key={slot} className="w-40 h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center bg-muted relative group overflow-hidden">
                  {media ? (
                    media.type === 'image' ? (
                      <img src={media.url} alt="Profile media" className="object-cover w-full h-full" />
                    ) : (
                      <video src={media.url} controls className="object-cover w-full h-full" />
                    )
                  ) : (
                    <Plus className="h-12 w-12 text-muted-foreground" />
                  )}
                  <input
                    type="file"
                    accept="image/*,video/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    title="Upload image or video"
                    onChange={e => e.target.files && handleProfileMediaUpload(e.target.files[0], slot)}
                  />
                </div>
              );
            })}
          </div>

          {error && (
            <div className="bg-destructive/15 text-destructive p-4 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleProfileUpdate} className="mt-8">
            <Accordion type="multiple" className="w-full" defaultValue={['basic', 'item-1']}>
              <AccordionItem value="basic">
                <AccordionTrigger>Basic Information</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div><Label htmlFor="full_name">Full Name</Label><Input id="full_name" name="full_name" value={profileData.full_name || ''} onChange={createChangeHandler('full_name')} /></div>
                  <div><Label htmlFor="username">Username</Label><Input id="username" name="username" value={profileData.username || ''} onChange={createChangeHandler('username')} /></div>
                  <div><Label htmlFor="age">Age</Label><Input id="age" name="age" type="number" value={profileData.age || ''} onChange={createChangeHandler('age')} /></div>
                  <div><Label htmlFor="occupation">Occupation</Label><Input id="occupation" name="occupation" value={profileData.occupation || ''} onChange={createChangeHandler('occupation')} /></div>
                  <div><Label htmlFor="bio_message">Bio / Message</Label><Textarea id="bio_message" name="bio_message" value={profileData.bio_message || ''} onChange={createChangeHandler('bio_message')} /></div>
                </AccordionContent>
              </AccordionItem>
              <AccordionItem value="item-1">
                <AccordionTrigger>About Me & Media</AccordionTrigger>
                <AccordionContent className="space-y-4">
                  <div>
                    <Label htmlFor="video_intro_url">Video Introduction</Label>
                    <div className="mt-2 flex items-center gap-4">
                      <video src={profileData.video_intro_url} controls className="w-full max-w-sm rounded-lg" />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => videoInputRef.current?.click()}
                      >
                        Upload Video
                      </Button>
                      <Input
                        ref={videoInputRef}
                        id="video-intro-upload"
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={e => e.target.files && handleVideoIntroUpload(e.target.files[0])}
                      />
                    </div>
                  </div>
                  <div><Label htmlFor="hobbies">Hobbies</Label><TagInput value={profileData.hobbies || []} onChange={createTagChangeHandler('hobbies')} /></div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
            <div className="mt-8 flex justify-end">
              <Button type="submit">Save All Changes</Button>
            </div>
          </form>
        </div>
      </div>
    </DynamicPage>
  )
} 