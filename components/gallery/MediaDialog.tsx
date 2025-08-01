"use client"

import React, { useState, useEffect } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Trash2, ImageIcon, ExternalLink } from "lucide-react"
import { Form } from "@/components/ui/form"
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form"
import { MediaItem, GalleryType, MediaType } from '@/lib/types';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Icons } from '@/components/icons';
import MediaLibrary from "@/components/media/MediaLibrary"
import MediaGrid from './MediaGrid';
import { FileUploader } from '@/components/ui/file-upload';
import { mediaFormSchema, MediaFormValues } from '@/lib/validations/media';

type SaveMediaData = Omit<MediaItem, 'id' | 'createdAt' | 'updatedAt'> & {
  id?: string;
  slug?: string;
  galleryType: GalleryType;
  type: MediaType;
  title: string;
  description: string;
  coverImage: string;
  imageUrls: string[];
  videoUrl?: string;
  isPremium: boolean;
  tags: string[];
  featured?: boolean;
  order?: number;
};

interface MediaDialogProps {
  isOpen: boolean
  onCloseAction: () => void
  onSaveAction: (data: SaveMediaData) => Promise<{ success: boolean; data?: MediaItem; error?: string }>
  type: 'image' | 'video'
  galleryType: GalleryType
  initialData?: MediaItem & {
    imageUrls?: string[]
    videoUrl?: string
    backgroundImage?: string
    tags?: string[]
    createdAt?: string
  }
}

function MediaDialog({ isOpen, onCloseAction, onSaveAction, type, galleryType, initialData }: MediaDialogProps) {
  const [uploadTab, setUploadTab] = useState<"upload" | "url" | "library">("upload")
  const [isSaving, setIsSaving] = useState(false)
  const [coverImage, setCoverImage] = useState<string | File | null>(null)
  const [isUploadingToCloudinary, setIsUploadingToCloudinary] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<{ url: string; file?: File }[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [tags, setTags] = useState<string[]>([])
  const [selectedMediaType, setSelectedMediaType] = useState<'image' | 'video'>(type)
  const [showMediaLibrary, setShowMediaLibrary] = useState(false)
  const [mediaItems, setMediaItems] = useState<MediaItem[]>([])
  const [isLoadingMedia, setIsLoadingMedia] = useState(false)

  const form = useForm<MediaFormValues>({
    resolver: zodResolver(mediaFormSchema),
    defaultValues: {
      title: initialData?.title || '',
      description: initialData?.description || '',
      isPremium: typeof initialData?.isPremium !== 'undefined' ? initialData.isPremium : false,
      type: initialData?.type || type,
      imageUrls: initialData?.imageUrls || [],
      videoUrl: initialData?.videoUrl || '',
      tags: initialData?.tags || [],
      order: initialData?.order,
      coverImage: initialData?.coverImage || '',
      galleryType: initialData?.galleryType || galleryType,
      featured: initialData?.featured || false
    }
  })

  // Set initial form values when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        title: initialData.title,
        description: initialData.description || '',
        isPremium: typeof initialData.isPremium !== 'undefined' ? initialData.isPremium : false,
        type: initialData.type || type,
        imageUrls: initialData.imageUrls || [],
        videoUrl: initialData.videoUrl || '',
        tags: initialData.tags || [],
        order: initialData.order,
        coverImage: initialData.coverImage || '',
        galleryType: typeof initialData.galleryType !== 'undefined' ? initialData.galleryType : galleryType,
        featured: typeof initialData.featured !== 'undefined' ? initialData.featured : false
      })
      
      if (initialData.imageUrls && initialData.imageUrls.length > 0) {
        const urls = initialData.imageUrls;
        setCoverImage(urls[0])
        setUploadedImages(urls.slice(1).map(url => ({
          url,
          file: undefined
        })))
      }
    } else {
      form.reset({
        title: '',
        description: '',
        isPremium: false,
        type,
        imageUrls: [],
        videoUrl: '',
        tags: [],
        order: undefined,
        coverImage: '',
        galleryType: galleryType,
        featured: false
      })
      setCoverImage(null)
      setUploadedImages([])
    }
  }, [initialData, type, galleryType])

  // Fetch media items when the library tab is selected
  useEffect(() => {
    const fetchMediaItems = async () => {
      if (uploadTab === 'library') {
        setIsLoadingMedia(true)
        try {
          const response = await fetch(`/api/media/cloudinary?type=${selectedMediaType}&folder=portfolio`)
          if (!response.ok) {
            throw new Error('Failed to fetch media')
          }
          const data = await response.json()
          // Transform Cloudinary resources to MediaItem format
          const transformedItems = data.resources.map((resource: any) => ({
            id: resource.public_id,
            title: resource.public_id.split('/').pop() || '',
            type: resource.resource_type,
            coverImage: resource.secure_url,
            imageUrls: [resource.secure_url],
            videoUrl: resource.resource_type === 'video' ? resource.secure_url : undefined,
            description: '',
            isPremium: false,
            tags: resource.tags || []
          }))
          setMediaItems(transformedItems)
        } catch (error) {
          console.error('Error fetching media:', error)
          toast.error('Failed to load media library')
        } finally {
          setIsLoadingMedia(false)
        }
      }
    }

    fetchMediaItems()
  }, [uploadTab, selectedMediaType])

  interface CloudinaryUploadResponse {
    secure_url: string;
    // Add other Cloudinary response fields as needed
  }

  const uploadToCloudinary = async (file: File, resourceType: 'image' | 'video' = 'image'): Promise<CloudinaryUploadResponse> => {
    setIsUploadingToCloudinary(true);
    
    // Validate Cloudinary configuration
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    
    if (!cloudName || !uploadPreset) {
      const errorMsg = 'Cloudinary configuration is missing';
      console.error(errorMsg, { cloudName: !!cloudName, uploadPreset: !!uploadPreset });
      throw new Error('Media upload service is not properly configured');
    }
    
    console.log('Starting Cloudinary upload:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      resourceType,
      cloudName,
      hasUploadPreset: !!uploadPreset,
      folder: 'portfolio'
    });
    
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', uploadPreset);
      formData.append('folder', 'portfolio');
      
      const uploadUrl = `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`;
      console.log('Uploading to:', uploadUrl);
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData
      });
      
      const responseText = await response.text();
      let result;
      
      try {
        result = JSON.parse(responseText);
      } catch (parseError) {
        console.error('Failed to parse Cloudinary response:', {
          status: response.status,
          statusText: response.statusText,
          responseText
        });
        throw new Error('Invalid response from media upload service');
      }
      
      if (!response.ok) {
        console.error('Cloudinary upload failed:', {
          status: response.status,
          statusText: response.statusText,
          error: result.error || 'Unknown error',
          response: result
        });
        throw new Error(result.error?.message || 'Failed to upload file to media service');
      }
      
      if (!result.secure_url) {
        console.error('Invalid Cloudinary response - missing secure_url:', result);
        throw new Error('Media upload completed but no URL was returned');
      }
      
      console.log('Cloudinary upload successful:', {
        secureUrl: result.secure_url,
        resourceType: result.resource_type,
        format: result.format,
        bytes: result.bytes
      });
      
      return result as CloudinaryUploadResponse;
    } catch (error) {
      console.error('Upload failed:', error);
      throw new Error(
        error instanceof Error 
          ? `Upload failed: ${error.message}` 
          : 'An unknown error occurred during upload'
      );
    } finally {
      setIsUploadingToCloudinary(false);
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || !process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET) {
      console.error('Cloudinary configuration is missing')
      toast.error('Server configuration error. Please try again later.')
      return
    }
    
    try {
      setIsSaving(true)
      toast.loading('Saving media...')
      
      const formData = form.getValues()
      const isVideo = formData.type === 'video';
      let uploadedCoverImage: string | null = null;
      let uploadedImageUrls: string[] = []
      let videoUrl = formData.videoUrl || '';
      
      // Handle video URL if this is a video
      if (isVideo) {
        if (!formData.videoUrl) {
          throw new Error('Video URL is required for video content');
        }
        videoUrl = formData.videoUrl;
      }
      
      // Handle cover image (for both image and video types)
      if (coverImage) {
        if (typeof coverImage === 'string') {
          // If it's already a URL, use it directly
          uploadedCoverImage = coverImage
        } else if (coverImage instanceof File) {
          toast('Uploading cover image...');
          try {
            const result = await uploadToCloudinary(coverImage);
            uploadedCoverImage = result.secure_url;
            toast.success('Cover image uploaded');
          } catch (error) {
            console.error('Cover image upload failed:', error);
            throw new Error('Failed to upload cover image. Please try again.');
          }
        }
      } else if (!initialData?.coverImage) {
        // Only require cover image if not editing existing content
        throw new Error('A cover image is required');
      }
      
      // Only process additional images for image type
      if (!isVideo && uploadedImages.length > 0) {
        toast(`Uploading ${uploadedImages.length} additional images...`)
        
        const uploadPromises = uploadedImages.map(async (img) => {
          try {
            if (img.file) {
              const result = await uploadToCloudinary(img.file);
              return result.secure_url;
            } else if (img.url) {
              return img.url;
            }
            return null;
          } catch (error) {
            console.error('Error uploading image:', error);
            return null;
          }
        });
        
        try {
          const results = await Promise.all(uploadPromises);
          uploadedImageUrls = results.filter((url): url is string => !!url);
          
          if (uploadedImageUrls.length < uploadedImages.length) {
            toast.warning(`Uploaded ${uploadedImageUrls.length} of ${uploadedImages.length} images`);
          } else {
            toast.success('All images uploaded successfully');
          }
        } catch (error) {
          console.error('Error uploading images:', error);
          throw new Error('Failed to upload some images. Please try again.');
        }
      }

      // Prepare the save data
      const saveData: SaveMediaData = {
        title: formData.title,
        description: formData.description || "",
        isPremium: formData.isPremium,
        type: formData.type as 'image' | 'video',
        galleryType: formData.galleryType || 'public',
        coverImage: uploadedCoverImage || initialData?.coverImage || '',
        videoUrl: isVideo ? formData.videoUrl || '' : '',
        tags: formData.tags || [],
        imageUrls: isVideo 
          ? (uploadedCoverImage ? [uploadedCoverImage] : []) 
          : [
              ...(uploadedCoverImage ? [uploadedCoverImage] : []),
              ...uploadedImageUrls
            ].filter((url): url is string => !!url),
        slug: formData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      };

      console.log('Saving media with data:', {
        ...saveData,
        imageUrls: saveData.imageUrls?.length || 0,
        hasCoverImage: !!saveData.coverImage,
        galleryType: saveData.galleryType
      });

      // Call the save action
      const result = await onSaveAction(saveData);

      if (result.success) {
        toast.success('Media saved successfully');
        onCloseAction();
      } else {
        throw new Error(result.error || 'Failed to save media');
      }
    } catch (error) {
      console.error('Error saving media:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to save media');
    } finally {
      setIsSaving(false);
    }
  };

  // Handle dialog close
  const onCloseChange = (open: boolean) => {
    if (!open) {
      // Reset form when closing
      if (initialData) {
        form.reset({
          title: initialData.title,
          description: initialData.description || '',
          isPremium: typeof initialData.isPremium !== 'undefined' ? initialData.isPremium : false,
          type: initialData.type || type,
          imageUrls: initialData.imageUrls || [],
          videoUrl: initialData.videoUrl || '',
          tags: initialData.tags || [],
          order: initialData.order,
          coverImage: initialData.coverImage || '',
          galleryType: typeof initialData.galleryType !== 'undefined' ? initialData.galleryType : galleryType,
          featured: typeof initialData.featured !== 'undefined' ? initialData.featured : false
        });
      } else {
        form.reset({
          title: '',
          description: '',
          isPremium: false,
          type,
          imageUrls: [],
          videoUrl: '',
          tags: [],
          order: undefined,
          coverImage: '',
          galleryType: galleryType,
          featured: false
        });
      }
      onCloseAction();
    }
  };

  // Handle adding a new media file (image or video)
  const handleAddImage = async (url: string, file?: File) => {
    if (!url) {
      console.error('No URL provided to handleAddImage');
      return;
    }
    
    console.log('handleAddImage called with:', { url, hasFile: !!file, selectedMediaType });
    
    try {
      if (selectedMediaType === 'image') {
        let imageUrl = url;
        
        // If we have a file, upload it to Cloudinary
        if (file) {
          console.log('Uploading file to Cloudinary...');
          try {
            const result = await uploadToCloudinary(file);
            console.log('Cloudinary upload result:', { success: !!result?.secure_url });
            
            if (!result?.secure_url) {
              throw new Error('No secure URL returned from Cloudinary');
            }
            imageUrl = result.secure_url;
          } catch (uploadError) {
            console.error('Error uploading to Cloudinary:', uploadError);
            throw new Error(`Failed to upload image: ${uploadError instanceof Error ? uploadError.message : 'Unknown error'}`);
          }
        } else {
          console.log('Using existing URL:', url);
        }
        
        const newImage = { url: imageUrl, file };
        console.log('Created new image:', { url: imageUrl, hasFile: !!file });
        
        // Always set as cover image if none is set
        if (!coverImage) {
          setCoverImage(imageUrl);
          // Update form values
          form.setValue('coverImage', imageUrl, { shouldValidate: true });
          toast.success('Cover image set');
        } else {
          // Add to additional images
          setUploadedImages(prev => {
            // Check if this URL is already in the list
            if (prev.some(img => img.url === imageUrl)) {
              toast.info('This image has already been added');
              return prev;
            }
            return [...prev, newImage];
          });
        }
        
        // Update form values
        const currentImages = form.getValues('imageUrls') || [];
        if (!currentImages.includes(imageUrl)) {
          form.setValue('imageUrls', [...currentImages, imageUrl], { shouldValidate: true });
        }
      } else if (selectedMediaType === 'video') {
        // For videos, set the video URL directly in the form
        let videoUrl = url;
        
        // If we have a file, upload it to Cloudinary
        if (file) {
          const result = await uploadToCloudinary(file);
          if (!result || !result.secure_url) {
            throw new Error('Failed to get secure URL from Cloudinary');
          }
          videoUrl = result.secure_url;
        }
        
        form.setValue('videoUrl', videoUrl, { shouldValidate: true });
        
        // Clear any existing images when uploading a video
        setCoverImage(null);
        setUploadedImages([]);
        form.setValue('imageUrls', [], { shouldValidate: true });
        
        toast.success('Video uploaded successfully');
      }
    } catch (error) {
      console.error('Error adding media:', error);
      toast.error(`Failed to add media: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      // Reset the file input
      const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    }
  };

  // Handle removing an image or video
  const handleRemoveImage = (urlOrIndex: string | number) => {
    if (selectedMediaType === 'video' && form.getValues('videoUrl')) {
      // Handle video removal
      form.setValue('videoUrl', '')
      toast.info('Video removed')
    } else {
      // Handle image removal
      if (typeof urlOrIndex === 'number') {
        // Handle removal by index
        setUploadedImages(prev => {
          const newImages = [...prev]
          const removed = newImages.splice(urlOrIndex, 1)
          
          // If we removed the cover image, update it
          if (removed[0]?.url === coverImage) {
            setCoverImage(newImages[0]?.url || null)
          }
          
          // Update form values
          const currentImages = form.getValues('imageUrls') as string[] || []
          form.setValue('imageUrls', currentImages.filter((_, i) => i !== urlOrIndex + 1)) // +1 for cover image
          
          toast.info('Image removed')
          return newImages
        })
      } else {
        // Handle removal by URL
        const urlToRemove = urlOrIndex as string
        setUploadedImages(prev => prev.filter(img => img.url !== urlToRemove))
        
        if (coverImage === urlToRemove) {
          handleRemoveCoverImage()
        } else {
          // Update form values
          const currentImages = form.getValues('imageUrls') as string[] || []
          form.setValue('imageUrls', currentImages.filter((url: string) => url !== urlToRemove))
          
          toast.info('Image removed')
        }
      }
    }
  }

  // Handle removing the cover image
  const handleRemoveCoverImage = () => {
    const currentCover = coverImage
    setCoverImage(null)
    
    // Update form values
    const currentImages = form.getValues('imageUrls') as string[] || []
    form.setValue('imageUrls', currentImages.filter((url: string) => url !== currentCover))
    
    toast.info('Cover image removed')
  }

  // Handle drag and drop events
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (!isSaving) {
      setIsDragging(true)
    }
  }
  
  const handleDragLeave = () => {
    setIsDragging(false)
  }
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    
    if (isSaving) {
      return
    }
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      const file = files[0]
      const isVideo = file.type.startsWith('video/')
      const isImage = file.type.startsWith('image/')
      
      if ((selectedMediaType === 'video' && !isVideo) || 
          (selectedMediaType === 'image' && !isImage)) {
        toast.error(`Please drop a ${selectedMediaType} file`)
        return
      }
      
      // Directly handle the file upload
      const handleUpload = async () => {
        try {
          const formData = new FormData()
          formData.append('file', file)
          formData.append('isVideo', (selectedMediaType === 'video').toString())
          
          const response = await fetch('/api/upload', {
            method: 'POST',
            body: formData
          })
          
          if (!response.ok) {
            throw new Error('Upload failed')
          }
          
          const result = await response.json()
          if (result.success) {
            handleAddImage(result.url, file)
          } else {
            throw new Error(result.error || 'Upload failed')
          }
        } catch (error) {
          console.error('Upload error:', error)
          toast.error('Failed to upload file. Please try again.')
        }
      }
      
      handleUpload()
    }
    e.stopPropagation()
    setIsDragging(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0]
      const url = URL.createObjectURL(file)
      handleAddImage(url, file)
    }
  }

  // Handle media selection from the library
  const handleMediaSelect = (url: string) => {
    try {
      if (selectedMediaType === 'video') {
        // For videos, set the video URL directly
        form.setValue('videoUrl', url)
        
        // If we have a preview element, update its source
        const videoPreview = document.getElementById('video-preview') as HTMLVideoElement
        if (videoPreview) {
          videoPreview.src = url
          videoPreview.load()
        }
        
        // Switch to the URL tab to show the selected video
        setActiveTab('url')
        toast.success('Video selected')
      } else {
        // For images, use the existing image handling
        handleAddImage(url)
      }
      
      // Close the media library dialog
      setShowMediaLibrary(false)
    } catch (error) {
      console.error('Error handling media selection:', error)
      toast.error('Failed to select media. Please try again.')
    }
  }

  // Active tab state
  const [activeTab, setActiveTab] = useState<'upload' | 'url' | 'library'>('upload')

  // Update the upload tab when activeTab changes
  useEffect(() => {
    if (uploadTab !== activeTab) {
      setUploadTab(activeTab)
    }
  }, [activeTab])

  // Handle media type change
  const handleMediaTypeChange = (newType: 'image' | 'video') => {
    setSelectedMediaType(newType)
    form.setValue('type', newType)
  }

  const dialogTitle = initialData ? 'Edit Media' : 'Add New Media';
  const dialogDescription = initialData 
    ? 'Edit existing media item in the gallery' 
    : 'Add a new media item to the gallery';

  // Ensure the dialog title is always defined
  const dialogTitleText = dialogTitle || (initialData ? 'Edit Media' : 'Add New Media');
  const dialogDescriptionText = dialogDescription || 
    (initialData ? 'Edit existing media item' : 'Add a new media item to the gallery');

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={onCloseChange}>
        <DialogContent 
          className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto"
          aria-describedby="media-dialog-description"
          aria-labelledby="media-dialog-title"
          aria-label={dialogTitleText}
        >
          <DialogHeader>
            <DialogTitle id="media-dialog-title" className="text-xl font-semibold">
              {dialogTitleText}
            </DialogTitle>
            <p id="media-dialog-description" className="sr-only">
              {dialogDescriptionText}
            </p>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Left Panel - Main Feature Image */}
                <div className="space-y-4">
                  <div className="aspect-square bg-muted rounded-lg overflow-hidden border-2 border-dashed border-muted-foreground/25 flex items-center justify-center">
                    {coverImage ? (
                      <img 
                        src={typeof coverImage === 'string' ? coverImage : URL.createObjectURL(coverImage)} 
                        alt="Main feature" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <ImageIcon className="h-12 w-12 mb-2" />
                        <p className="text-sm">Main feature image</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="text-center">
                  <p className="text-sm text-muted-foreground">
                    This will be the main image displayed in the gallery
                  </p>
                </div>
              </div>
              
              {/* Right Panel - Form Fields */}
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input placeholder="Enter title" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Enter description" 
                          className="min-h-[100px]" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Media Type</FormLabel>
                      <FormControl>
                        <div className="flex space-x-2">
                          <Button
                            type="button"
                            variant={selectedMediaType === 'image' ? 'default' : 'outline'}
                            onClick={() => handleMediaTypeChange('image')}
                          >
                            Image
                          </Button>
                          <Button
                            type="button"
                            variant={selectedMediaType === 'video' ? 'default' : 'outline'}
                            onClick={() => handleMediaTypeChange('video')}
                          >
                            Video
                          </Button>
                        </div>
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <div className="space-y-4">
                  <Tabs 
                    value={uploadTab} 
                    onValueChange={(v) => setUploadTab(v as typeof uploadTab)}
                    className="space-y-4"
                  >
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="upload">Upload New</TabsTrigger>
                      <TabsTrigger value="url">From URL</TabsTrigger>
                      <TabsTrigger value="library">Media Library</TabsTrigger>
                    </TabsList>

                    {/* Upload Tab */}
                    <TabsContent value="upload" className="space-y-4">
                      <div 
                        className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
                          isDragging ? 'border-primary bg-primary/10' : 'border-muted-foreground/25'
                        }`}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                      >
                        <FileUploader
                          onDrop={async (acceptedFiles) => {
                            if (acceptedFiles.length > 0) {
                              const file = acceptedFiles[0];
                              try {
                                if (selectedMediaType === 'image') {
                                  const result = await uploadToCloudinary(file);
                                  if (result.secure_url) {
                                    handleAddImage(result.secure_url, file);
                                  } else {
                                    throw new Error('No URL returned from Cloudinary');
                                  }
                                } else {
                                  const result = await uploadToCloudinary(file, 'video');
                                  if (result.secure_url) {
                                    form.setValue('videoUrl', result.secure_url);
                                    toast.success('Video uploaded successfully');
                                  } else {
                                    throw new Error('No URL returned from Cloudinary');
                                  }
                                }
                              } catch (error) {
                                console.error('Upload failed:', error);
                                toast.error(`Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`);
                              }
                            }
                          }}
                          accept={selectedMediaType === 'image' 
                            ? { 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] }
                            : { 'video/*': ['.mp4', '.webm', '.mov'] }
                          }
                          className="min-h-[150px]"
                        />
                        <p className="text-sm text-muted-foreground mt-2">
                          {isDragging ? 'Drop files here' : 'Or drag and drop files here'}
                        </p>
                      </div>
                      
                      {/* Supporting media grid */}
                      {selectedMediaType === 'image' && uploadedImages.length > 0 && (
                        <div className="mt-4">
                          <h4 className="text-sm font-medium mb-2">Supporting Media</h4>
                          <div className="grid grid-cols-3 gap-4">
                            {uploadedImages.map((img, index) => (
                              <div key={index} className="relative group">
                                <div 
                                  className={`aspect-square rounded-md overflow-hidden border-2 ${
                                    img.url === coverImage ? 'border-primary' : 'border-transparent hover:border-primary'
                                  } cursor-pointer`}
                                  onClick={() => setCoverImage(img.url)}
                                >
                                  <img 
                                    src={img.url} 
                                    alt={`Supporting ${index + 1}`}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <button
                                  type="button"
                                  className="absolute top-1 right-1 bg-destructive text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    handleRemoveImage(index) // Pass index for proper removal
                                  }}
                                >
                                  <Trash2 className="h-3 w-3" />
                                </button>
                                <button
                                  type="button"
                                  className={`absolute bottom-1 left-1 right-1 text-white text-xs py-0.5 px-1 rounded opacity-0 group-hover:opacity-100 transition-opacity truncate text-center ${
                                    img.url === coverImage ? 'bg-green-600' : 'bg-primary/90'
                                  }`}
                                  onClick={() => setCoverImage(img.url)}
                                >
                                  {img.url === coverImage ? 'Main Image' : 'Set as Main'}
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* URL Tab */}
                    <TabsContent value="url" className="space-y-4">
                      {selectedMediaType === 'image' ? (
                        <div className="space-y-4">
                          <Input
                            type="url"
                            placeholder="Enter image URL"
                            value={coverImage && typeof coverImage === 'string' ? coverImage : ''}
                            onChange={(e) => setCoverImage(e.target.value)}
                          />
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="space-y-4">
                            <div className="flex gap-2">
                              <Input
                                type="url"
                                placeholder="Enter video URL (YouTube, Vimeo, or direct link)"
                                value={form.getValues('videoUrl') || ''}
                                onChange={(e) => {
                                  const url = e.target.value.trim()
                                  form.setValue('videoUrl', url)
                                }}
                                className="flex-1"
                              />
                            </div>
                            
                            {form.getValues('videoUrl') && (
                              <div className="mt-2">
                                <p className="text-sm font-medium mb-2">Preview</p>
                                <div className="aspect-video bg-muted rounded-md overflow-hidden">
                                  <video
                                    id="video-preview"
                                    className="w-full h-full object-contain bg-black"
                                    controls
                                    src={form.getValues('videoUrl')}
                                    onError={(e) => {
                                      console.error('Video preview error:', e)
                                    }}
                                  >
                                    Your browser does not support the video tag.
                                  </video>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    {/* Media Library Tab */}
                    <TabsContent value="library" className="space-y-4">
                      <div className="h-[400px] overflow-auto">
                        {isLoadingMedia ? (
                          <div className="flex items-center justify-center h-full">
                            <Icons.spinner className="h-8 w-8 animate-spin" />
                          </div>
                        ) : (
                          <MediaLibrary 
                            type={selectedMediaType}
                            onSelectAction={(url, type, dimensions) => {
                              if (type === 'image') {
                                // Set the cover image first
                                setCoverImage(url);
                                // Then add it to the form
                                handleAddImage(url);
                              } else {
                                form.setValue('videoUrl', url);
                              }
                              setUploadTab('upload');
                            }}
                            onCloseAction={() => {}}
                            isDialog={true}
                          />
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <FormField
                    control={form.control}
                    name="isPremium"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-md border p-4">
                        <FormControl>
                          <Checkbox
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                        <div className="space-y-1 leading-none">
                          <FormLabel>Premium Content</FormLabel>
                          <FormDescription>
                            This content will only be accessible to logged-in users
                          </FormDescription>
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="tags"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tags</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="tag1, tag2, tag3"
                            value={field.value?.join(', ') || ''}
                            onChange={(e) => {
                              const tags = e.target.value.split(',').map(tag => tag.trim()).filter(Boolean);
                              field.onChange(tags);
                              setTags(tags);
                            }}
                          />
                        </FormControl>
                        <FormDescription>Separate tags with commas</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <DialogFooter className="pt-4">
                    <Button type="button" variant="outline" onClick={onCloseAction}>
                      Cancel
                    </Button>
                    <Button 
                      type="submit" 
                      disabled={isSaving || isUploadingToCloudinary} 
                      className="w-full"
                    >
                      {isSaving || isUploadingToCloudinary ? 'Processing...' : initialData ? 'Update' : 'Create'}
                    </Button>
                  </DialogFooter>
                </div>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default MediaDialog
