import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import MediaLibrary from "@/components/media/MediaLibrary";
import React from "react";
import { Code } from 'lucide-react';
import { Shield } from 'lucide-react';
import supabase from '@/lib/supabase/client';
import { useAuth } from '@/components/providers/AuthProvider';
import { toast } from 'sonner';

// Simple color picker component
const ColorPicker = ({ 
  color, 
  onChange 
}: { 
  color: string; 
  onChange: (color: string) => void 
}) => (
  <div className="relative">
    <input
      type="color"
      value={color}
      onChange={(e) => onChange(e.target.value)}
      className="w-10 h-10 p-0 border rounded-md cursor-pointer"
    />
  </div>
);

import { 
  LayoutGrid, 
  Type, 
  Image, 
  Quote, 
  Phone, 
  GalleryHorizontal,
  Heading1,
  Minus,
  Plus,
  Save,
  Trash2,
  Volume2,
  VolumeX,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Settings2,
  Eye,
  Video,
  Mail
} from "lucide-react";
import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

export interface PageProperties {
  // Appearance
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
  
  // Layout
  maxWidth: string;
  isFullWidth: boolean;
  sectionSpacing: number;
  
  // Metadata
  pageTitle: string;
  metaDescription: string;
  language: string;
  showMoreEnabled: boolean;
}

interface PageControlsProps {
  isSaving: boolean;
  isDirty: boolean;
  isTTSEnabled: boolean;
  isCollapsed: boolean;
  onSave: () => void;
  onDelete: () => void;
  onAddSection: (type: string) => void;
  onToggleTTS: () => void;
  onPreview: () => void;
  onToggleCollapse: () => void;
  onPagePropertiesChange?: (properties: Partial<PageProperties>) => void;
}

export function PageControls({
  isSaving,
  isDirty,
  isTTSEnabled,
  isCollapsed,
  onSave,
  onDelete,
  onAddSection,
  onToggleTTS,
  onPreview,
  onToggleCollapse,
  onPagePropertiesChange
}: PageControlsProps) {
  const { user } = useAuth?.() || {};
  // Define section types first
  const sectionTypes = [
    { type: 'editable-title', label: 'Editable Page Title', icon: Heading1 },
    { type: 'hero', label: 'Hero Section', icon: LayoutGrid },
    { type: 'hero-responsive', label: 'Hero Section (Responsive)', icon: LayoutGrid },
    { type: 'slider', label: 'Slider Section', icon: GalleryHorizontal },
    { type: 'advanced-slider', label: 'Advanced Slider Section', icon: GalleryHorizontal },
    { type: 'feature-card-grid', label: 'Feature Card Grid', icon: LayoutGrid },
    { type: 'info-card', label: 'Info Card Grid', icon: LayoutGrid },
    { type: 'feature', label: 'Feature Section', icon: LayoutGrid },
    { type: 'text', label: 'Text Section', icon: Type },
    { type: 'text-with-video-left', label: 'Text with Video (Left)', icon: Video },
    { type: 'text-with-video-right', label: 'Text with Video (Right)', icon: Video },
    { type: 'media-text-left', label: 'Media/Text (Left)', icon: Image },
    { type: 'media-text-right', label: 'Media/Text (Right)', icon: Image },
    { type: 'mediaTextColumns', label: 'Media/Text Columns', icon: LayoutGrid },
    { type: 'divider', label: 'Divider', icon: Minus },
    { type: 'heading', label: 'Heading', icon: Heading1 },
    { type: 'quote', label: 'Quote', icon: Quote },
    { type: 'cta', label: 'Call-to-Action', icon: Phone },
    { type: 'media-placeholder', label: 'Media Placeholder', icon: Image },
    { type: 'fluxedita_advanced_form', label: 'Fluxedita Adv Form', icon: Mail },
    { type: 'privacy', label: 'Privacy Section', icon: Shield },
    { type: 'custom-code', label: 'Custom Code', icon: Code },
    { type: 'product-package-left', label: 'Product Package (Left)', icon: LayoutGrid },
    { type: 'product-package-right', label: 'Product Package (Right)', icon: LayoutGrid },
    { type: 'media-story-cards', label: 'Media Story Cards', icon: Image },
  ];

  // Sidebar customization state
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [pagePropertiesOpen, setPagePropertiesOpen] = useState(true);
  const [mediaLibraryOpen, setMediaLibraryOpen] = useState(false);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');
  
  // Default sections that are enabled by default (most commonly used)
  const defaultEnabledSections = [
    'hero', 'hero-responsive', 'text', 'feature', 'cta', 'gallery', 'slider', 'divider', 'info-card', 'media-story-cards'
  ];

  const [enabledSections, setEnabledSections] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('enabledSectionTypes');
      if (stored) return JSON.parse(stored);
    }
    return defaultEnabledSections;
  });

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
    pageTitle: '',
    metaDescription: '',
    language: 'en',
    showMoreEnabled: true,
  });

  const [showMoreEnabled, setShowMoreEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('showMoreEnabled');
      if (stored !== null) return JSON.parse(stored);
    }
    return true;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('showMoreEnabled', JSON.stringify(showMoreEnabled));
    }
    onPagePropertiesChange?.({ showMoreEnabled });
    // eslint-disable-next-line
  }, [showMoreEnabled]);

  // Load enabledSections from Supabase for logged-in user
  useEffect(() => {
    const loadSidebarSettings = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('user_sidebar_settings')
          .select('enabled_sections')
          .eq('user_id', user.id)
          .single();
        if (data?.enabled_sections) {
          setEnabledSections(data.enabled_sections);
        } else if (typeof window !== 'undefined') {
          // fallback to localStorage
          const stored = localStorage.getItem('enabledSectionTypes');
          if (stored) setEnabledSections(JSON.parse(stored));
        }
      }
    };
    loadSidebarSettings();
    // eslint-disable-next-line
  }, [user?.id]);

  const handleSaveSidebarSettings = async () => {
    if (user?.id) {
      const { error } = await supabase
        .from('user_sidebar_settings')
        .upsert({ user_id: user.id, enabled_sections: enabledSections }, { onConflict: 'user_id' });
      if (error) {
        toast.error('Failed to save sidebar settings');
      } else {
        toast.success('Sidebar settings saved!');
      }
    } else if (typeof window !== 'undefined') {
      localStorage.setItem('enabledSectionTypes', JSON.stringify(enabledSections));
      toast.success('Sidebar settings saved locally!');
    }
  };

  const toggleSectionType = (type: string) => {
    setEnabledSections(prev =>
      prev.includes(type)
        ? prev.filter(t => t !== type)
        : [...prev, type]
    );
  };

  const handlePagePropertyChange = (updates: Partial<PageProperties>) => {
    const newProperties = { ...pageProperties, ...updates };
    setPageProperties(newProperties);
    onPagePropertiesChange?.(newProperties);
  };

  const handleMediaSelect = (url: string, type?: 'image' | 'video', dimensions?: { width: number; height: number }) => {
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

  return (
    <div 
      className="fixed left-0 top-0 h-full flex flex-col bg-background border-r transition-all duration-200 pt-16"
      data-collapsed={isCollapsed}
      style={{
        '--sidebar-collapsed-width': '3rem',
        '--sidebar-expanded-width': '20rem',
        width: isCollapsed ? 'var(--sidebar-collapsed-width)' : 'var(--sidebar-expanded-width)'
      } as React.CSSProperties}
    >
      <div className="p-2 border-b flex items-center justify-between h-14">
        <div className="flex-1 flex items-center">
          {!isCollapsed && <h2 className="text-lg font-semibold">Page Controls</h2>}
        </div>
        <div className="flex items-center gap-1">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setCustomizeOpen(o => !o)} 
            aria-label="Customize Sidebar"
            className={cn(isCollapsed && 'w-8 h-8')}
          >
            <Settings2 className="w-4 h-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={onToggleCollapse} 
            aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="w-8 h-8"
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </Button>
        </div>
      </div>
      {customizeOpen && (
        <div className="p-4 border-b bg-muted">
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-sm">Customize Sidebar</span>
            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setEnabledSections(defaultEnabledSections)}
                className="text-xs"
              >
                Reset to Defaults
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEnabledSections(sectionTypes.map(s => s.type))}
                className="text-xs"
              >
                Select All
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setCustomizeOpen(false)} aria-label="Close">
                {customizeOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </Button>
            </div>
          </div>
          
          <div className="space-y-1 max-h-64 overflow-y-auto">
            {sectionTypes.map(({ type, label, icon: Icon }) => (
              <div key={type} className="flex items-center justify-between py-1">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                  {defaultEnabledSections.includes(type) && (
                    <span className="text-xs text-muted-foreground bg-muted px-1 rounded">Default</span>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={enabledSections.includes(type)}
                  onChange={() => toggleSectionType(type)}
                  className="ml-2"
                  aria-label={`Show ${label}`}
                />
              </div>
            ))}
          </div>
          
          <div className="mt-3 pt-2 border-t text-xs text-muted-foreground">
            {enabledSections.length} of {sectionTypes.length} sections enabled
          </div>
        </div>
      )}
      
      <ScrollArea className="flex-1">
        {isCollapsed ? (
          <div className="flex flex-col items-center space-y-2 p-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10"
              onClick={async () => {
                await handleSaveSidebarSettings();
                onSave();
              }}
              disabled={isSaving || !isDirty}
              title={isSaving ? 'Saving...' : 'Save Changes'}
            >
              <Save className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10"
              onClick={onToggleTTS}
              title={isTTSEnabled ? 'Disable TTS' : 'Enable TTS'}
            >
              {isTTSEnabled ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </Button>
            <Button 
              variant="ghost" 
              size="icon" 
              className="w-10 h-10"
              onClick={onPreview}
              title="Preview as Member"
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <div className="p-4 space-y-6">
            {/* Quick Actions */}
            <div className="space-y-2">
              <Button 
                className="w-full" 
                onClick={async () => {
                  await handleSaveSidebarSettings();
                  onSave();
                }}
                disabled={isSaving || !isDirty}
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="destructive" 
                className="w-full"
                onClick={onDelete}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete Page
              </Button>
            </div>

            <Separator />

            {/* Section Types */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Add Section</h3>
              <div className="grid grid-cols-1 gap-2">
                {sectionTypes.filter(({ type }) => enabledSections.includes(type)).map(({ type, label, icon: Icon }) => (
                  <Button
                    key={type}
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => {
                      console.log('PageControls button clicked:', type);
                      onAddSection(type);
                    }}
                  >
                    <Icon className="w-4 h-4 mr-2" />
                    {label}
                  </Button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Page Properties */}
            <div className="space-y-2">
              <div 
                className="flex items-center justify-between cursor-pointer"
                onClick={() => setPagePropertiesOpen(!pagePropertiesOpen)}
              >
                <h3 className="text-sm font-medium text-muted-foreground">Page Properties</h3>
                {pagePropertiesOpen ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </div>
              
              {pagePropertiesOpen && (
                <div className="space-y-4 p-2 bg-muted/50 rounded-md">
                  <Tabs defaultValue="appearance" className="w-full">
                    <TabsList className="grid w-full grid-cols-3">
                      <TabsTrigger value="appearance">Appearance</TabsTrigger>
                      <TabsTrigger value="layout">Layout</TabsTrigger>
                      <TabsTrigger value="metadata">Metadata</TabsTrigger>
                    </TabsList>
                    
                    <TabsContent value="appearance" className="space-y-4 mt-4">
                      <div className="space-y-4">
                        {/* Background Type Toggle */}
                        <div className="space-y-2">
                          <Label>Background Type</Label>
                          <div className="flex rounded-md border overflow-hidden">
                            <button
                              type="button"
                              className={`flex-1 py-2 px-3 text-sm font-medium ${
                                !pageProperties.backgroundImage && !pageProperties.backgroundVideo
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background hover:bg-muted'
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
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background hover:bg-muted'
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
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-background hover:bg-muted'
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

                        {/* Background Color Picker (shown when no media is selected) */}
                        {!pageProperties.backgroundImage && !pageProperties.backgroundVideo && (
                          <div className="space-y-2">
                            <Label>Background Color</Label>
                            <div className="flex gap-2">
                              <ColorPicker
                                color={pageProperties.backgroundColor}
                                onChange={(color) => {
                                  handlePagePropertyChange({ backgroundColor: color });
                                }}
                              />
                              <Input 
                                value={pageProperties.backgroundColor} 
                                onChange={(e) => {
                                  handlePagePropertyChange({ backgroundColor: e.target.value });
                                }}
                                className="w-24"
                              />
                            </div>
                          </div>
                        )}

                        {/* Background Image Upload/URL (shown when image is selected) */}
                        {pageProperties.backgroundImage && (
                          <div className="space-y-2">
                            <Label>Background Image URL</Label>
                            <div className="flex gap-2">
                              <Input
                                value={pageProperties.backgroundImage}
                                onChange={(e) => {
                                  handlePagePropertyChange({ backgroundImage: e.target.value });
                                }}
                                placeholder="Enter image URL or select from media library"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                title="Select from Media Library"
                                onClick={() => openMediaLibrary('image')}
                              >
                                <Image className="w-4 h-4" />
                              </Button>
                            </div>
                            {pageProperties.backgroundImage && (
                              <div className="mt-2 rounded-md overflow-hidden border">
                                <img
                                  src={pageProperties.backgroundImage}
                                  alt="Background preview"
                                  className="w-full h-24 object-cover"
                                  onError={(e) => {
                                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/1920x1080';
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Background Video URL (shown when video is selected) */}
                        {pageProperties.backgroundVideo && (
                          <div className="space-y-2">
                            <Label>Background Video URL</Label>
                            <div className="flex gap-2">
                              <Input
                                value={pageProperties.backgroundVideo}
                                onChange={(e) => {
                                  handlePagePropertyChange({ backgroundVideo: e.target.value });
                                }}
                                placeholder="Enter video URL or select from media library"
                                className="flex-1"
                              />
                              <Button
                                type="button"
                                variant="outline"
                                size="icon"
                                title="Select from Media Library"
                                onClick={() => openMediaLibrary('video')}
                              >
                                <Video className="w-4 h-4" />
                              </Button>
                            </div>
                            {pageProperties.backgroundVideo && (
                              <div className="mt-2 rounded-md overflow-hidden border">
                                <video
                                  src={pageProperties.backgroundVideo}
                                  className="w-full h-24 object-cover"
                                  controls
                                  muted
                                />
                              </div>
                            )}
                          </div>
                        )}

                        {/* Background Overlay and Opacity */}
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <Label>Background Overlay</Label>
                            <span className="text-sm text-muted-foreground">
                              {Math.round(pageProperties.backgroundOpacity * 100)}%
                            </span>
                          </div>
                          <Slider
                            value={[pageProperties.backgroundOpacity * 100]}
                            onValueChange={([value]) => {
                              handlePagePropertyChange({ 
                                backgroundOpacity: value / 100 
                              });
                            }}
                            min={0}
                            max={100}
                            step={1}
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Font Family</Label>
                        <Select
                          value={pageProperties.fontFamily}
                          onValueChange={(value) => {
                            handlePagePropertyChange({ fontFamily: value });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select font" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="sans-serif">Sans-serif</SelectItem>
                            <SelectItem value="serif">Serif</SelectItem>
                            <SelectItem value="monospace">Monospace</SelectItem>
                            <SelectItem value="cursive">Cursive</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Text Color</Label>
                        <div className="flex gap-2">
                          <ColorPicker
                            color={pageProperties.textColor}
                            onChange={(color) => {
                              handlePagePropertyChange({ textColor: color });
                            }}
                          />
                          <Input 
                            value={pageProperties.textColor} 
                            onChange={(e) => {
                              handlePagePropertyChange({ textColor: e.target.value });
                            }}
                            className="w-24"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Link Color</Label>
                        <div className="flex gap-2">
                          <ColorPicker
                            color={pageProperties.linkColor}
                            onChange={(color) => {
                              handlePagePropertyChange({ linkColor: color });
                            }}
                          />
                          <Input 
                            value={pageProperties.linkColor} 
                            onChange={(e) => {
                              handlePagePropertyChange({ linkColor: e.target.value });
                            }}
                            className="w-24"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Line Height</Label>
                          <span className="text-sm text-muted-foreground">
                            {pageProperties.lineHeight}
                          </span>
                        </div>
                        <Slider
                          value={[pageProperties.lineHeight]}
                          onValueChange={([value]) => {
                            handlePagePropertyChange({ lineHeight: value });
                          }}
                          min={1}
                          max={3}
                          step={0.1}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="layout" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label>Full Width</Label>
                          <Switch
                            checked={pageProperties.isFullWidth}
                            onCheckedChange={(checked) => {
                              handlePagePropertyChange({ isFullWidth: checked });
                            }}
                          />
                        </div>
                        {!pageProperties.isFullWidth && (
                          <div className="space-y-2">
                            <Label>Max Width</Label>
                            <Select
                              value={pageProperties.maxWidth}
                              onValueChange={(value) => {
                                handlePagePropertyChange({ maxWidth: value });
                              }}
                            >
                              <SelectTrigger>
                                <SelectValue placeholder="Select max width" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="640px">Small (640px)</SelectItem>
                                <SelectItem value="768px">Medium (768px)</SelectItem>
                                <SelectItem value="1024px">Large (1024px)</SelectItem>
                                <SelectItem value="1200px">X-Large (1200px)</SelectItem>
                                <SelectItem value="1400px">2X-Large (1400px)</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <Label>Section Spacing</Label>
                          <span className="text-sm text-muted-foreground">
                            {pageProperties.sectionSpacing}rem
                          </span>
                        </div>
                        <Slider
                          value={[pageProperties.sectionSpacing]}
                          onValueChange={([value]) => {
                            handlePagePropertyChange({ sectionSpacing: value });
                          }}
                          min={0}
                          max={8}
                          step={0.5}
                        />
                      </div>
                    </TabsContent>
                    
                    <TabsContent value="metadata" className="space-y-4 mt-4">
                      <div className="space-y-2">
                        <Label htmlFor="pageTitle">Page Title</Label>
                        <Input
                          id="pageTitle"
                          value={pageProperties.pageTitle}
                          onChange={(e) => {
                            handlePagePropertyChange({ pageTitle: e.target.value });
                          }}
                          placeholder="Enter page title"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="metaDescription">Meta Description</Label>
                        <Textarea
                          id="metaDescription"
                          value={pageProperties.metaDescription}
                          onChange={(e) => {
                            handlePagePropertyChange({ metaDescription: e.target.value });
                          }}
                          placeholder="Enter meta description (150-160 characters)"
                          rows={3}
                        />
                        <p className="text-xs text-muted-foreground">
                          {pageProperties.metaDescription.length}/160 characters
                        </p>
                      </div>
                      
                      <div className="space-y-2">
                        <Label>Language</Label>
                        <Select
                          value={pageProperties.language}
                          onValueChange={(value) => {
                            handlePagePropertyChange({ language: value });
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select language" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="en">English (en)</SelectItem>
                            <SelectItem value="es">Spanish (es)</SelectItem>
                            <SelectItem value="fr">French (fr)</SelectItem>
                            <SelectItem value="de">German (de)</SelectItem>
                            <SelectItem value="it">Italian (it)</SelectItem>
                            <SelectItem value="pt">Portuguese (pt)</SelectItem>
                            <SelectItem value="ru">Russian (ru)</SelectItem>
                            <SelectItem value="zh">Chinese (zh)</SelectItem>
                            <SelectItem value="ja">Japanese (ja)</SelectItem>
                            <SelectItem value="ko">Korean (ko)</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <Label htmlFor="show-more-toggle">Enable Show More Button</Label>
                          <Switch
                            id="show-more-toggle"
                            checked={showMoreEnabled}
                            onCheckedChange={setShowMoreEnabled}
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}
            </div>

            <Separator />

            {/* TTS Controls */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Text-to-Speech</h3>
              <Button
                variant={isTTSEnabled ? "default" : "outline"}
                className="w-full"
                onClick={onToggleTTS}
              >
                {isTTSEnabled ? (
                  <>
                    <VolumeX className="w-4 h-4 mr-2" />
                    Disable TTS
                  </>
                ) : (
                  <>
                    <Volume2 className="w-4 h-4 mr-2" />
                    Enable TTS
                  </>
                )}
              </Button>
            </div>

            <Separator />

            {/* Preview */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Preview</h3>
              <Button
                variant="outline"
                className="w-full"
                onClick={onPreview}
              >
                Preview as Member
              </Button>
            </div>
          </div>
        )}
      </ScrollArea>
      
      {/* Media Library Dialog */}
      <Dialog open={mediaLibraryOpen} onOpenChange={setMediaLibraryOpen}>
        <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
          <MediaLibrary
            onSelectAction={handleMediaSelect}
            type={mediaType}
            isDialog={true}
            onCloseAction={() => setMediaLibraryOpen(false)}
          />
        </DialogContent>
      </Dialog>
      
      {!isCollapsed && (
        <div className="p-4 border-t">
          <Button 
            className="w-full" 
            onClick={async () => {
              await handleSaveSidebarSettings();
              onSave();
            }}
            disabled={isSaving || !isDirty}
          >
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      )}
    </div>
  );
}
