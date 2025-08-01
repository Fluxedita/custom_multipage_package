"use client"

import { useState } from "react";
import SimpleEditableMedia from "@/components/profile/SimpleEditableMedia";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEditMode } from "@/hooks/EditModeContext";
import supabase from '@/lib/supabase/client';
import { toast } from 'sonner';

interface StoryItem {
  image: string;
  imageType: 'image' | 'video';
  title: string;
  description: string;
}

interface AboutStoryProps {
  defaultStory: {
    title: string;
    description: string;
    items: StoryItem[];
  };
  onStoryChange?: (story: AboutStoryProps['defaultStory']) => void;
}

export default function AboutStory({ defaultStory, onStoryChange }: AboutStoryProps) {
  const { isAdmin } = useAuth();
  const { isEditMode } = useEditMode();
  const [story, setStory] = useState(defaultStory);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleStoryImageChange = (index: number, url: string) => {
    const mediaType: 'image' | 'video' = url.match(/\.(mp4|webm|mov|avi|mkv)$/i) ? 'video' : 'image';
    const updatedItems = [...story.items];
    updatedItems[index] = {
      ...updatedItems[index],
      image: url,
      imageType: mediaType
    };
    const updatedStory = {
      ...story,
      items: updatedItems
    };
    setStory(updatedStory);
    setIsDirty(true);
    if (onStoryChange) {
      onStoryChange(updatedStory);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      // Update the story section in the root_page_components table
      const { error } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: 'about',
          component_type: 'story',
          content: story as any,
          is_active: true,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'page_slug,component_type'
        });

      if (error) throw error;

      setIsDirty(false);
      toast.success('Story section saved successfully');
    } catch (err) {
      console.error('Error saving story section:', err);
      toast.error('Failed to save story section');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mb-16">
      <h2 className="text-3xl font-bold mb-4">{story.title}</h2>
      <p className="text-gray-600 mb-8">{story.description}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {story.items.map((item, index) => (
          <div key={index} className="space-y-4">
            <div className="relative h-[300px] rounded-lg overflow-hidden">
              <SimpleEditableMedia
                src={item.image}
                alt={item.title}
                width={800}
                height={600}
                type={item.imageType}
                isEditMode={isEditMode}
                onChange={(url) => handleStoryImageChange(index, url)}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="text-xl font-semibold">{item.title}</h3>
            <p className="text-gray-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
} 