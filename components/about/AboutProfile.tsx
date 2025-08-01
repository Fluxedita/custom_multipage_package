"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Instagram, Twitter, Mail } from "lucide-react";
import SimpleEditableMedia from "@/components/profile/SimpleEditableMedia";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEditMode } from "@/hooks/EditModeContext";
import supabase from '@/lib/supabase/client';
import { toast } from 'sonner';

interface AboutProfileProps {
  defaultProfile: {
    image: string;
    imageType: 'image' | 'video';
    title: string;
    description: string;
    socialLinks: {
      instagram: string;
      twitter: string;
      email: string;
    };
  };
  onProfileChange?: (profile: AboutProfileProps['defaultProfile']) => void;
  previewMode?: boolean;
}

export default function AboutProfile({ defaultProfile, onProfileChange, previewMode }: AboutProfileProps) {
  const { isAdmin } = useAuth();
  const { isEditMode } = useEditMode();
  const [profile, setProfile] = useState(defaultProfile);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  
  // Sync local profile state with defaultProfile only when it changes
  useEffect(() => {
    setProfile(defaultProfile);
  }, [defaultProfile]);

  const handleProfileMediaChange = (url: string) => {
    const mediaType: 'image' | 'video' = url.match(/\.(mp4|webm|mov|avi|mkv)$/i) ? 'video' : 'image';
    const updatedProfile = {
      ...profile,
      image: url,
      imageType: mediaType
    };
    setProfile(updatedProfile);
    setIsDirty(true);
    if (onProfileChange) {
      onProfileChange(updatedProfile);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Update the profile section in the root_page_components table
      const { error } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'about',
          component_type: 'profile',
          content: profile as any,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,component_type'
        });

      if (error) throw error;

      setIsDirty(false);
      toast.success('Profile section saved successfully');
    } catch (err) {
      console.error('Error saving profile section:', err);
      toast.error('Failed to save profile section');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
      <div className="relative h-[500px] rounded-lg overflow-hidden">
        <SimpleEditableMedia
          src={profile.image}
          alt="Fluxedita"
          width={800}
          height={1000}
          type={profile.imageType}
          isEditMode={isEdit && isAdmin && !previewMode}
          onChange={handleProfileMediaChange}
          className="w-full h-full object-cover"
        />
      </div>
      <div>
        {isEdit && isAdmin && !previewMode ? (
          <>
            <input
              type="text"
              value={profile.title}
              onChange={e => {
                setProfile({ ...profile, title: e.target.value });
                setIsDirty(true);
              }}
              className="block w-full mb-2 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-3xl font-bold"
            />
            <textarea
              value={profile.description}
              onChange={e => {
                setProfile({ ...profile, description: e.target.value });
                setIsDirty(true);
              }}
              className="block w-full mb-4 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              rows={3}
            />
            <div className="flex space-x-4 mt-6 mb-4">
              <input
                type="text"
                value={profile.socialLinks.instagram}
                onChange={e => {
                  setProfile({ ...profile, socialLinks: { ...profile.socialLinks, instagram: e.target.value } });
                  setIsDirty(true);
                }}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Instagram URL"
              />
              <input
                type="text"
                value={profile.socialLinks.twitter}
                onChange={e => {
                  setProfile({ ...profile, socialLinks: { ...profile.socialLinks, twitter: e.target.value } });
                  setIsDirty(true);
                }}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Twitter URL"
              />
              <input
                type="email"
                value={profile.socialLinks.email}
                onChange={e => {
                  setProfile({ ...profile, socialLinks: { ...profile.socialLinks, email: e.target.value } });
                  setIsDirty(true);
                }}
                className="block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                placeholder="Email"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                onClick={() => {
                  setIsEdit(false);
                  setIsDirty(false);
                  setProfile(defaultProfile);
                }}
                disabled={isSaving}
              >
                Cancel
              </Button>
              <Button
                onClick={async () => {
                  await handleSave();
                  setIsEdit(false);
                }}
                disabled={!isDirty || isSaving}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </>
        ) : (
          <>
            <h2 className="text-3xl font-bold mb-4">{profile.title}</h2>
            <p className="text-gray-600 mb-4">{profile.description}</p>
            <div className="flex space-x-4 mt-6">
              <Button variant="outline" size="icon" asChild>
                <Link href={profile.socialLinks.instagram} target="_blank" rel="noopener noreferrer">
                  <Instagram className="h-5 w-5" />
                  <span className="sr-only">Instagram</span>
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href={profile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                  <Twitter className="h-5 w-5" />
                  <span className="sr-only">Twitter</span>
                </Link>
              </Button>
              <Button variant="outline" size="icon" asChild>
                <Link href={`mailto:${profile.socialLinks.email}`}>
                  <Mail className="h-5 w-5" />
                  <span className="sr-only">Email</span>
                </Link>
              </Button>
            </div>
            {isAdmin && !previewMode && (
              <Button className="mt-6" onClick={() => setIsEdit(true)}>
                Edit Profile
              </Button>
            )}
          </>
        )}
      </div>
    </div>
  );
} 