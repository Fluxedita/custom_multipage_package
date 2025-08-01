'use client';

import React, { useState, useEffect, useCallback, Suspense } from "react"
import Image from 'next/image';
import Link from 'next/link';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Plus, Edit, Trash2, Check, Loader2 } from "lucide-react"
import MediaGrid from "./MediaGrid"
import { toast } from "sonner"
import { deleteMediaAction } from "@/app/actions/media"
import type { MediaItem, GalleryData, SaveMediaData } from "@/lib/types"
import { useAuth } from "@/components/providers/AuthProvider"
import { getGalleryData, GallerySet } from "@/lib/gallery-service"
import MediaDialog from "./MediaDialog"
import supabase from '@/lib/supabase/client';
// Define the MediaUpdateData type that matches what's expected by MediaDialog
type MediaUpdateData = {
  id?: string;
  title: string;
  description?: string;
  isPremium: boolean;
  type: 'image' | 'video';
  coverImage: string;
  imageUrls: string[];
  videoUrl?: string;
  tags: string[];
  slug?: string;
};

interface ExclusiveGalleryProps {
  searchParams?: { [key: string]: string | string[] | undefined }
}

export default function ExclusiveGallery({ searchParams = {} }: ExclusiveGalleryProps) {
  const [gallerySets, setGallerySets] = useState<GallerySet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isAdmin, user, loading: authLoading } = useAuth();

  useEffect(() => {
    async function fetchSets() {
      setIsLoading(true);
      try {
        const allSets = await getGalleryData();
        const exclusiveSets = allSets.filter(set => set.category === 'exclusive' || set.tags?.includes('exclusive'));
        setGallerySets(exclusiveSets);
      } catch (error) {
        toast.error('Failed to load exclusive gallery sets');
      } finally {
        setIsLoading(false);
      }
    }
    fetchSets();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }
  if (!gallerySets.length) {
    return <div className="text-center text-gray-500 p-4">No exclusive gallery sets found.</div>;
  }
  return (
    <div className="container mx-auto px-4">
      {gallerySets.map(set => (
        <section key={set.id} className="mb-12">
          <h2 className="text-2xl font-bold mb-2">{set.title}</h2>
          {set.description && <p className="mb-4 text-muted-foreground">{set.description}</p>}
          <MediaGrid media={set.media} />
        </section>
      ))}
    </div>
  );
}
