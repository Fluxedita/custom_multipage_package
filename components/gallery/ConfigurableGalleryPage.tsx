'use client';

import { unstable_noStore as noStore } from 'next/cache';
import { useAuth } from '@/components/providers/AuthProvider';
import { useEditMode } from '@/hooks/EditModeContext';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import type { GalleryData, HeroSectionData } from '@/lib/types';
import { getGalleryData, GallerySet } from '@/lib/gallery-service';
import supabase from '@/lib/supabase/client';
import { HeroSection } from '@/app/custom_pages/components/sections/HeroSection';
import GalleryPage from '@/components/gallery/GalleryPage';
import CommentsSection from '@/components/CommentsSection';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import MediaGrid from '@/components/gallery/MediaGrid';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import MediaDialog from '@/components/gallery/MediaDialog';
import PageEditFab from '@/components/admin/PageEditFab';

type GalleryType = 'public' | 'exclusive' | 'behind-scenes' | 'gallery';

interface ConfigurableGalleryPageProps {
  galleryType: GalleryType;
  isPremium: boolean;
}

export default function ConfigurableGalleryPage({ galleryType, isPremium }: ConfigurableGalleryPageProps) {
  noStore();
  
  const { isAdmin } = useAuth();
  const { isEditMode, toggleEditMode } = useEditMode();
  
  const [heroSection, setHeroSection] = useState<HeroSectionData | null>(null);
  const [initialData, setInitialData] = useState<GalleryData | null>(null);
  const [gallerySets, setGallerySets] = useState<GallerySet[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newSetTitle, setNewSetTitle] = useState('');
  const [newSetDescription, setNewSetDescription] = useState('');
  const [newSetCoverImage, setNewSetCoverImage] = useState<string>('');
  const [newSetMedia, setNewSetMedia] = useState<any[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [showMediaDialog, setShowMediaDialog] = useState(false);

  // Provide a default hero section if none is loaded
  const defaultHeroSection = {
    id: 'default-hero',
    type: 'hero' as 'hero',
    title: '',
    description: '',
    backgroundMedia: '',
    mediaType: 'image' as 'image',
    width: '100%',
    height: '50vh',
    enableSpeech: false,
    enableTitleSpeech: false,
    enableDescriptionSpeech: false,
  };

  useEffect(() => {
    async function initData() {
      try {
        setIsLoading(true);
        setError(null);
        const allSets = await getGalleryData();
        // Filter sets by galleryType if needed (e.g., category or tag)
        const filteredSets = allSets.filter(set => {
          // If you use a category or tag to distinguish types, update this logic
          return set.category === galleryType || set.tags?.includes(galleryType);
        });
        setGallerySets(filteredSets);

        // --- Load hero section from DB ---
        const { data: heroRow, error: heroError } = await supabase
          .from('root_page_components')
          .select('content')
          .eq('page_slug', galleryType)
          .eq('component_type', 'hero')
          .single();
        if (heroRow && heroRow.content) {
          setHeroSection(heroRow.content);
        } else {
          setHeroSection(null);
        }
        if (heroError && heroError.code !== 'PGRST116') {
          console.error('Error loading hero section:', heroError);
        }
        // ---
      } catch (error) {
        setError('Failed to load gallery sets');
      } finally {
        setIsLoading(false);
      }
    }
    initData();
  }, [galleryType]);
  
  const handleHeroUpdate = (updatedSection: any) => {
    setHeroSection(prev => {
      if (!prev) return null;
      const newState = { ...prev, ...updatedSection };
      return newState;
    });
    setIsDirty(true);
  };

  const handleSave = async () => {
    if (!heroSection) return;
    setIsSaving(true);
    try {
      // Save hero section to root_page_components table
      const { error: saveError } = await supabase
        .from('root_page_components')
        .upsert({
          page_slug: galleryType,
          component_type: 'hero',
          content: heroSection as any,
          is_active: true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'page_slug,component_type'
        });

      if (saveError) throw saveError;

      toast.success('Hero section saved successfully!');
      setIsDirty(false);
    } catch (e: any) {
      toast.error(e.message || 'Failed to save hero section.');
      console.error("Error in handleSave:", e);
    } finally {
      setIsSaving(false);
    }
  };

  // Handler to add media to the new set
  const handleAddMedia = (media: any) => {
    setNewSetMedia(prev => [...prev, media]);
  };
  const handleRemoveMedia = (index: number) => {
    setNewSetMedia(prev => prev.filter((_, i) => i !== index));
  };

  // Handler to create a new gallery set with media
  const handleCreateGallerySet = async () => {
    if (!newSetTitle.trim()) {
      toast.error('Title is required');
      return;
    }
    if (!newSetCoverImage) {
      toast.error('Cover image is required');
      return;
    }
    setIsCreating(true);
    try {
      // Get current user ID
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;
      if (!userId) {
        toast.error('User not authenticated');
        setIsCreating(false);
        return;
      }
      // 1. Insert all new media items
      const insertedMediaIds: string[] = [];
      for (const media of newSetMedia) {
        const { data: inserted, error: mediaError } = await supabase
          .from('media_items')
          .insert({
            title: media.title || newSetTitle,
            description: media.description || '',
            cover_image: media.coverImage || '',
            image_urls: media.imageUrls || [],
            video_url: media.videoUrl || '',
            is_premium: isPremium,
            type: media.type || 'image',
            tags: media.tags || [galleryType],
            featured: media.featured || false,
            order: media.order,
            slug: media.slug || '',
            gallery_type: galleryType,
            background_image: media.backgroundImage || '',
            created_by: userId, // Set created_by to current user's ID
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .select()
          .single();
        if (mediaError) {
          console.error('Error inserting media item:', mediaError, media);
          toast.error(mediaError.message || 'Failed to insert media item.');
          throw mediaError;
        }
        insertedMediaIds.push(inserted.id);
      }
      // 2. Insert the new gallery set into gallery_data
      const gallerySetPayload = {
        title: newSetTitle,
        description: newSetDescription,
        slug: newSetTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        is_published: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        category: galleryType,
        tags: [galleryType],
        media_items: insertedMediaIds,
        featured_image: newSetCoverImage,
      };
      console.log('About to insert gallery set');
      console.log('Gallery set payload:', gallerySetPayload);
      const { data, error } = await supabase
        .from('gallery_data')
        .insert(gallerySetPayload)
        .select()
        .single();
      console.log('Insert result:', { data, error });
      if (error) {
        console.error('Error inserting gallery set:', error, gallerySetPayload);
        toast.error(error.message || 'Failed to create gallery set.');
        throw error;
      }
      toast.success('Gallery set created successfully!');
      setIsCreateDialogOpen(false);
      setNewSetTitle('');
      setNewSetDescription('');
      setNewSetCoverImage('');
      setNewSetMedia([]);
      // Refresh sets
      const allSets = await getGalleryData();
      const filteredSets = allSets.filter(set => set.category === galleryType || set.tags?.includes(galleryType));
      setGallerySets(filteredSets);
    } catch (e: any) {
      toast.error(e.message || 'Failed to create gallery set.');
      console.error('Error in handleCreateGallerySet:', e);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center text-center">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Error Loading Content</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      {/* Admin floating action button for edit mode and save/cancel */}
      {isAdmin && <PageEditFab />}
      {/* Always show editable hero section for admin at the top */}
      {isAdmin && (
        <section className="mb-8">
          <HeroSection
            section={{
              ...(heroSection || defaultHeroSection),
              enableSpeech: (heroSection?.enableSpeech ?? false),
              enableTitleSpeech: (heroSection?.enableTitleSpeech ?? false),
              enableDescriptionSpeech: (heroSection?.enableDescriptionSpeech ?? false),
            }}
            isEditMode={isEditMode}
            onSectionChangeAction={handleHeroUpdate}
            speakTextAction={() => {}}
            onSaveAction={handleSave}
            onCancelAction={toggleEditMode}
            isDirty={isDirty}
            isSaving={isSaving}
          />
        </section>
      )}
      {isAdmin && (
        <div className="flex justify-end mb-6 gap-4">
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            + Create New Gallery Set
          </Button>
          <Button onClick={toggleEditMode} size="icon" className="rounded-full shadow-lg">
            <Pencil className="h-5 w-5" />
          </Button>
        </div>
      )}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Gallery Set</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input
              placeholder="Title"
              value={newSetTitle}
              onChange={e => setNewSetTitle(e.target.value)}
              disabled={isCreating}
            />
            <Textarea
              placeholder="Description"
              value={newSetDescription}
              onChange={e => setNewSetDescription(e.target.value)}
              disabled={isCreating}
            />
            {/* Cover image selection */}
            <div>
              <label className="block font-medium mb-1">Cover Image</label>
              {newSetCoverImage ? (
                <div className="mb-2">
                  <img src={newSetCoverImage} alt="Cover" className="h-32 rounded object-cover" />
                  <Button variant="outline" size="sm" onClick={() => setNewSetCoverImage('')}>Remove</Button>
                </div>
              ) : (
                <Button variant="outline" size="sm" onClick={() => setShowMediaDialog(true)}>
                  Select Cover Image
                </Button>
              )}
            </div>
            {/* Media items selection */}
            <div>
              <label className="block font-medium mb-1">Media Items</label>
              <div className="flex flex-wrap gap-2 mb-2">
                {newSetMedia.map((media, idx) => (
                  <div key={idx} className="relative border rounded p-2 flex flex-col items-center">
                    {media.type === 'image' ? (
                      <img src={media.coverImage || media.imageUrls?.[0]} alt={media.title} className="h-20 w-20 object-cover rounded" />
                    ) : (
                      <video src={media.videoUrl} className="h-20 w-20 object-cover rounded" />
                    )}
                    <div className="text-xs mt-1">{media.title}</div>
                    <Button variant="destructive" size="sm" className="mt-1" onClick={() => handleRemoveMedia(idx)}>Remove</Button>
                  </div>
                ))}
                <Button variant="outline" size="sm" onClick={() => setShowMediaDialog(true)}>
                  + Add Media
                </Button>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleCreateGallerySet} disabled={isCreating}>
              {isCreating ? 'Creating...' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      {/* MediaDialog for selecting/adding media */}
      <MediaDialog
        isOpen={showMediaDialog}
        onCloseAction={() => setShowMediaDialog(false)}
        onSaveAction={async (media) => {
          setShowMediaDialog(false);
          // If cover image not set, use this as cover
          if (!newSetCoverImage && media.type === 'image') {
            setNewSetCoverImage(media.coverImage || media.imageUrls?.[0] || '');
          }
          handleAddMedia(media);
          return { success: true, data: media as any };
        }}
        type={'image'}
        galleryType={galleryType}
      />
      {/* Main content area: gallery sets or empty message */}
      {gallerySets.length === 0 ? (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold mb-2">No Gallery Sets Available</h2>
          <p className="text-gray-600">Please check back later.</p>
        </div>
      ) : (
        gallerySets.map(set => (
          <section key={set.id} className="mb-12">
            <h2 className="text-2xl font-bold mb-2">{set.title}</h2>
            {set.description && <p className="mb-4 text-muted-foreground">{set.description}</p>}
            {/* Render media for this set using MediaGrid or NewMediaGrid */}
            <MediaGrid media={set.media} />
          </section>
        ))
      )}
      {/* Comments Section */}
      <div className="mt-16 mb-8">
        <CommentsSection 
          title="Gallery Feedback"
          description="Share your thoughts about the gallery content or request specific types of images/videos."
          pageSlug={`/gallery/${galleryType}`}
        />
      </div>
    </div>
  );
} 