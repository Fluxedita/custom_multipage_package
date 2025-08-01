"use client";

import React, { useState, useEffect } from "react";
import { Settings, Save, Eye, Plus, X, ChevronUp, ChevronDown, Image, Video, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/components/providers/AuthProvider";
import { useEditMode } from "@/hooks/EditModeContext";
import { toast } from "sonner";
import MediaLibrary from "@/components/media/MediaLibrary";
import { CreatePageDialog } from "./CreatePageDialog";

interface PageProperties {
  backgroundColor: string;
  backgroundOpacity: number;
  backgroundImage: string;
  backgroundVideo: string;
  fontFamily: string;
  textColor: string;
  linkColor: string;
  textShadow: string;
  lineHeight: number;
  letterSpacing: number;
  maxWidth: string;
  isFullWidth: boolean;
  sectionSpacing: number;
  pageTitle: string;
  metaDescription: string;
  language: string;
}

interface PageControlsFabProps {
  pageSlug?: string;
  pageTitle?: string;
  onSave?: () => void;
  onPreview?: () => void;
  onAddSection?: (type: string) => void;
  onPagePropertiesChange?: (properties: Partial<PageProperties>) => void;
  isDirty?: boolean;
  isSaving?: boolean;
}

export default function PageControlsFab({
  pageSlug,
  pageTitle,
  onSave,
  onPreview,
  onAddSection,
  onPagePropertiesChange,
  isDirty = false,
  isSaving = false
}: PageControlsFabProps) {
  const { isAdmin } = useAuth();
  const { isEditMode } = useEditMode();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [pagePropertiesOpen, setPagePropertiesOpen] = useState(false);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  const [localIsDirty, setLocalIsDirty] = useState(false);
  const [createPageDialogOpen, setCreatePageDialogOpen] = useState(false);
  
  // Page properties state
  const [pageProperties, setPageProperties] = useState<PageProperties>({
    backgroundColor: '#ffffff',
    backgroundOpacity: 1,
    backgroundImage: '',
    backgroundVideo: '',
    fontFamily: 'sans-serif',
    textColor: '#000000',
    linkColor: '#2563eb',
    textShadow: '0 0 0 transparent',
    lineHeight: 1.5,
    letterSpacing: 0,
    maxWidth: '1200px',
    isFullWidth: false,
    sectionSpacing: 2,
    pageTitle: pageTitle || '',
    metaDescription: '',
    language: 'en',
  });

  if (!isAdmin) return null;

  // Only show when in edit mode
  if (!isEditMode) return null;

  const handleSave = () => {
    if (onSave) {
      onSave();
      setLocalIsDirty(false);
      toast.success("Page saved successfully!");
    } else {
      toast.info("Save functionality not available on this page");
    }
  };

  const handlePreview = () => {
    if (onPreview) {
      onPreview();
    } else {
      toast.info("Preview functionality not available on this page");
    }
  };

  const handleAddSection = (type: string) => {
    if (onAddSection) {
      onAddSection(type);
      toast.success(`${type} section added!`);
    } else {
      toast.info("Section adding not available on this page");
    }
  };

  // Page properties handlers
  const handlePagePropertyChange = (updates: Partial<PageProperties>) => {
    const newProperties = { ...pageProperties, ...updates };
    setPageProperties(newProperties);
    setLocalIsDirty(true);
    onPagePropertiesChange?.(newProperties);
  };

  const handleMediaSelect = (url: string, type?: 'image' | 'video') => {
    if (type === 'video') {
      handlePagePropertyChange({
        backgroundVideo: url,
        backgroundImage: ''
      });
    } else {
      handlePagePropertyChange({
        backgroundImage: url,
        backgroundVideo: ''
      });
    }
    setMediaLibraryOpen(false);
  };

  const openMediaLibrary = (type: 'image' | 'video') => {
    setMediaType(type);
    setMediaLibraryOpen(true);
  };

  // Combined dirty state
  const combinedIsDirty = isDirty || localIsDirty;

  const sectionTypes = [
    { type: 'hero', label: 'Hero Section' },
    { type: 'hero-responsive', label: 'Hero Section (Responsive)' },
    { type: 'text', label: 'Text Section' },
    { type: 'content', label: 'Content Section' },
    { type: 'feature', label: 'Feature Section' },
    { type: 'cta', label: 'Call-to-Action' },
    { type: 'gallery', label: 'Image Gallery' },
    { type: 'slider', label: 'Slider Section' },
    { type: 'advanced-slider', label: 'Advanced Slider' },
    { type: 'feature-card-grid', label: 'Feature Card Grid' },
    { type: 'info-card', label: 'Info Card Grid' },
    { type: 'media-text-left', label: 'Media/Text (Left)' },
    { type: 'media-text-right', label: 'Media/Text (Right)' },
    { type: 'mediaTextColumns', label: 'Media/Text Columns' },
    { type: 'twoColumnText', label: 'Two Column Text' },
    { type: 'divider', label: 'Divider' },
    { type: 'heading', label: 'Heading' },
    { type: 'quote', label: 'Quote' },
    { type: 'media-placeholder', label: 'Media Placeholder' },
    { type: 'footer', label: 'Footer Section' },
    { type: 'contact-form', label: 'Contact Form' },
    { type: 'fluxedita_advanced_form', label: 'Fluxedita Adv Form' },
    { type: 'privacy', label: 'Privacy Section' },
    { type: 'custom-code', label: 'Custom Code' },
  ];

  return (
    <>
      {/* Floating Action Button */}
      <div className="fixed left-4 bottom-4 z-50 flex flex-col gap-2">
        {/* Main FAB */}
        <Button
          onClick={() => setIsOpen(true)}
          size="icon"
          className="w-12 h-12 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700"
          aria-label="Page Controls"
        >
          <Settings className="w-5 h-5" />
        </Button>

        {/* Quick Actions (when expanded) */}
        {isExpanded && (
          <div className="flex flex-col gap-2">
            <Button
              onClick={handleSave}
              size="icon"
              className="w-10 h-10 rounded-full shadow-lg bg-green-600 hover:bg-green-700"
              disabled={isSaving || !combinedIsDirty}
              title={isSaving ? 'Saving...' : 'Save Changes'}
            >
              <Save className="w-4 h-4" />
            </Button>
            
            <Button
              onClick={handlePreview}
              size="icon"
              className="w-10 h-10 rounded-full shadow-lg bg-purple-600 hover:bg-purple-700"
              title="Preview Page"
            >
              <Eye className="w-4 h-4" />
            </Button>

            <Button
              onClick={() => setIsExpanded(false)}
              size="icon"
              className="w-10 h-10 rounded-full shadow-lg bg-gray-600 hover:bg-gray-700"
              title="Collapse"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        )}

        {/* Expand/Collapse Toggle */}
        {!isExpanded && (
          <Button
            onClick={() => setIsExpanded(true)}
            size="icon"
            className="w-10 h-10 rounded-full shadow-lg bg-gray-600 hover:bg-gray-700"
            title="Quick Actions"
          >
            <ChevronUp className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Page Controls Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Page Controls</DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Page Info */}
            <div className="space-y-2">
              <Label>Page Slug</Label>
              <Input 
                value={pageSlug || 'Current Page'} 
                readOnly 
                className="bg-gray-50"
              />
            </div>

            <div className="space-y-2">
              <Label>Page Title</Label>
              <Input 
                value={pageTitle || 'Untitled Page'} 
                readOnly 
                className="bg-gray-50"
              />
            </div>

            <Separator />

            {/* Quick Actions */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Quick Actions</h3>
              
              <div className="grid grid-cols-2 gap-2">
                <Button
                  onClick={handleSave}
                  disabled={isSaving || !combinedIsDirty}
                  className="w-full"
                  variant="outline"
                >
                  <Save className="w-4 h-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
                
                <Button
                  onClick={handlePreview}
                  className="w-full"
                  variant="outline"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Preview
                </Button>
              </div>
              
              <Button
                onClick={() => setCreatePageDialogOpen(true)}
                className="w-full"
                variant="outline"
              >
                <FileText className="w-4 h-4 mr-2" />
                Add Custom Page
              </Button>
            </div>

            <Separator />

            {/* Add Sections */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Add Section</h3>
              <div className="grid grid-cols-1 gap-2">
                {sectionTypes.map(({ type, label }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => handleAddSection(type)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Page Properties */}
            <div className="space-y-3">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setPagePropertiesOpen(!pagePropertiesOpen)}
              >
                <h3 className="text-sm font-medium">Page Properties</h3>
                {pagePropertiesOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              
              {pagePropertiesOpen && (
                <div className="space-y-4 p-2 bg-gray-50 rounded-md">
                  <Tabs defaultValue="appearance" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="appearance">Appearance</TabsTrigger>
                      <TabsTrigger value="layout">Layout</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="appearance" className="space-y-4 mt-4">
                      {/* Background Type Toggle */}
                      <div className="space-y-2">
                        <Label>Background Type</Label>
                        <div className="flex rounded-md border overflow-hidden">
                          <button
                            type="button"
                            className={`flex-1 py-2 px-3 text-sm font-medium ${
                              !pageProperties.backgroundImage && !pageProperties.backgroundVideo
                                ? 'bg-blue-600 text-white'
                                : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => handlePagePropertyChange({
                              backgroundImage: '',
                              backgroundVideo: ''
                            })}
                          >
                            Color
                          </button>
                          <button
                            type="button"
                            className={`flex-1 py-2 px-3 text-sm font-medium ${
                              pageProperties.backgroundImage
                                ? 'bg-blue-600 text-white'
                                : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => handlePagePropertyChange({
                              backgroundImage: pageProperties.backgroundImage || 'https://via.placeholder.com/1920x1080',
                              backgroundVideo: ''
                            })}
                          >
                            Image
                          </button>
                          <button
                            type="button"
                            className={`flex-1 py-2 px-3 text-sm font-medium ${
                              pageProperties.backgroundVideo
                                ? 'bg-blue-600 text-white'
                                : 'bg-white hover:bg-gray-50'
                            }`}
                            onClick={() => handlePagePropertyChange({
                              backgroundImage: '',
                              backgroundVideo: pageProperties.backgroundVideo || 'https://example.com/sample-video.mp4'
                            })}
                          >
                            Video
                          </button>
                        </div>
                      </div>

                      {/* Background Color Picker */}
                      {!pageProperties.backgroundImage && !pageProperties.backgroundVideo && (
                        <div className="space-y-2">
                          <Label>Background Color</Label>
                          <div className="flex gap-2">
                            <input
                              type="color"
                              value={pageProperties.backgroundColor}
                              onChange={(e) => handlePagePropertyChange({ backgroundColor: e.target.value })}
                              className="w-10 h-10 p-0 border rounded-md cursor-pointer"
                            />
                            <Input 
                              value={pageProperties.backgroundColor} 
                              onChange={(e) => handlePagePropertyChange({ backgroundColor: e.target.value })}
                              className="flex-1"
                            />
                          </div>
                        </div>
                      )}

                      {/* Background Image/Video URL */}
                      {(pageProperties.backgroundImage || pageProperties.backgroundVideo) && (
                        <div className="space-y-2">
                          <Label>Background {pageProperties.backgroundImage ? 'Image' : 'Video'} URL</Label>
                          <div className="flex gap-2">
                            <Input
                              value={pageProperties.backgroundImage || pageProperties.backgroundVideo}
                              onChange={(e) => {
                                if (pageProperties.backgroundImage) {
                                  handlePagePropertyChange({ backgroundImage: e.target.value });
                                } else {
                                  handlePagePropertyChange({ backgroundVideo: e.target.value });
                                }
                              }}
                              placeholder={`Enter ${pageProperties.backgroundImage ? 'image' : 'video'} URL`}
                              className="flex-1"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              title="Select from Media Library"
                              onClick={() => openMediaLibrary(pageProperties.backgroundImage ? 'image' : 'video')}
                            >
                              {pageProperties.backgroundImage ? <Image className="w-4 h-4" /> : <Video className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Text Color */}
                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex gap-2">
                          <input
                            type="color"
                            value={pageProperties.textColor}
                            onChange={(e) => handlePagePropertyChange({ textColor: e.target.value })}
                            className="w-10 h-10 p-0 border rounded-md cursor-pointer"
                          />
                          <Input 
                            value={pageProperties.textColor} 
                            onChange={(e) => handlePagePropertyChange({ textColor: e.target.value })}
                            className="flex-1"
                          />
                        </div>
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="layout" className="space-y-4 mt-4">
                      {/* Max Width */}
                      <div className="space-y-2">
                        <Label>Max Width</Label>
                        <Select
                          value={pageProperties.maxWidth}
                          onValueChange={(value) => handlePagePropertyChange({ maxWidth: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="800px">800px</SelectItem>
                            <SelectItem value="1000px">1000px</SelectItem>
                            <SelectItem value="1200px">1200px</SelectItem>
                            <SelectItem value="1400px">1400px</SelectItem>
                            <SelectItem value="100%">100%</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Full Width Toggle */}
                      <div className="flex items-center justify-between">
                        <Label className="text-sm">Full Width</Label>
                        <Switch 
                          checked={pageProperties.isFullWidth} 
                          onCheckedChange={(checked) => handlePagePropertyChange({ isFullWidth: checked })}
                        />
                      </div>

                      {/* Section Spacing */}
                      <div className="space-y-2">
                        <Label>Section Spacing: {pageProperties.sectionSpacing}rem</Label>
                        <input
                          type="range"
                          min="0"
                          max="4"
                          step="0.5"
                          value={pageProperties.sectionSpacing}
                          onChange={(e) => handlePagePropertyChange({ sectionSpacing: parseFloat(e.target.value) })}
                          className="w-full"
                        />
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>

            <Separator />

            {/* Page Settings */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium">Page Settings</h3>
              
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Edit Mode</Label>
                  <Switch checked={isEditMode} disabled />
                </div>
                
                <div className="flex items-center justify-between">
                  <Label className="text-sm">Has Unsaved Changes</Label>
                  <div className={`w-3 h-3 rounded-full ${combinedIsDirty ? 'bg-yellow-500' : 'bg-green-500'}`} />
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* MediaLibrary Dialog */}
      <Dialog open={mediaLibraryOpen} onOpenChange={setMediaLibraryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <MediaLibrary
          isDialog
          type={mediaType}
          onCloseAction={() => setMediaLibraryOpen(false)}
          onSelectAction={handleMediaSelect}
        />
        </DialogContent>
      </Dialog>

      {/* Create Page Dialog */}
      <CreatePageDialog
        open={createPageDialogOpen}
        onOpenChangeAction={setCreatePageDialogOpen}
      />
    </>
  );
} 