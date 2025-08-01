"use client";

import { useState, useRef } from 'react';
import { Section, HeroSectionType } from '@/types/sections';
import { Volume2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import SimpleEditableMedia from "@/components/profile/SimpleEditableMedia";
import Image from 'next/image';
import { TextStyleEditor, TextStyle } from './TextStyleEditor';
import { CSSProperties } from 'react';
import { cn } from '@/lib/utils';
import { Slider } from "@/components/ui/slider";

interface HeroSectionProps {
  /**
   * Optional index of the section in the parent array. Used by parent components for keying or ordering.
   * Accept but ignore here to keep API compatibility.
   */
  idx?: number;
  section: HeroSectionType;
  isEditMode: boolean;
  onSectionChangeAction: (section: Section) => void;
  speakTextAction: (text: string) => void;
  /**
   * Callback to save section changes.
   * Renamed to comply with Next.js prop‐serialization rule.
   */
  onSaveAction?: () => void;
  /**
   * Callback to cancel editing.
   * Renamed to comply with Next.js prop‐serialization rule.
   */
  onCancelAction?: () => void;
  /** @deprecated Use onSaveAction instead */
  onSave?: () => void;
  /** @deprecated Use onCancelAction instead */
  onCancel?: () => void;
  /**
   * Optional render prop to show additional controls in edit mode.
   */
  renderSectionControlsAction?: () => React.ReactNode;
  /**
   * Optional callback when parent exits edit mode (e.g., toggling page edit UI)
   */
  onExitEditMode?: () => void;
  isDirty: boolean;
  isSaving?: boolean;
}

function textStyleToCSS(style?: TextStyle): CSSProperties {
  if (!style) return {};
  const css: CSSProperties = {};
  if (style.fontColor) css.color = style.fontColor;
  if (style.fontSize) css.fontSize = style.fontSize;
  if (style.fontStyle) css.fontStyle = style.fontStyle;
  if (style.fontStyle === 'bold') css.fontWeight = 'bold';
  if (style.margin) css.margin = style.margin;
  if (style.textShadow) {
    css.textShadow = `${style.textShadow.offsetX || '2px'} ${style.textShadow.offsetY || '2px'} ${style.textShadow.blur || '4px'} ${style.textShadow.color || '#000000'}`;
  }
  if (style.textOutline) {
    // @ts-ignore
    css.WebkitTextStroke = `${style.textOutline.width || '2px'} ${style.textOutline.color || '#ffffff'}`;
  }
  if (style.textBackground) {
    css.background = style.textBackground.color;
    css.opacity = style.textBackground.opacity;
    css.borderRadius = style.textBackground.borderRadius;
    css.padding = style.textBackground.padding;
    if (style.textBackground.blur) {
      css.backdropFilter = `blur(${style.textBackground.blur})`;
      // @ts-ignore
      css.WebkitBackdropFilter = `blur(${style.textBackground.blur})`;
    }
  }
  return css;
}

export function HeroSection({ 
  section, 
  isEditMode,
  idx,
  onSectionChangeAction, 
  speakTextAction,
  renderSectionControlsAction,
  onExitEditMode,
  onSaveAction,
  onCancelAction,
  onSave,
  onCancel,
  isDirty,
  isSaving = false
}: HeroSectionProps) {
  const mediaRef = useRef<{ openEditor: () => void }>(null);

  // Prefer the new prop names but fall back to deprecated ones for compatibility
  const handleSave = onSaveAction ?? onSave ?? (() => {});
  const handleCancel = onCancelAction ?? onCancel ?? (() => {});
  const handleExitEditMode = onExitEditMode ?? (() => {});
  const handleTitleChange = (title: string) => {
    onSectionChangeAction({ ...section, title });
  };

  const handleDescriptionChange = (description: string) => {
    onSectionChangeAction({ ...section, description });
  };

  const handleBackgroundMediaChange = (backgroundMedia: string, mediaType: 'image' | 'video') => {
    console.log('Media change for section:', { id: section.id, backgroundMedia, mediaType });
    // Create a new section object with all properties preserved
    const updatedSection = {
      ...section,
      backgroundMedia,
      mediaType,
      // Ensure these properties are set when media changes
      enableSpeech: section.enableSpeech || false,
      enableTitleSpeech: section.enableTitleSpeech || false,
      enableDescriptionSpeech: section.enableDescriptionSpeech || false,
      // Ensure width and height are preserved
      width: section.width || '100%',
      height: section.height || '50vh'
    };
    onSectionChangeAction(updatedSection);
  };

  const handleHeightChange = (height: string) => {
    onSectionChangeAction({ ...section, height });
  };

  const handleWidthChange = (width: string) => {
    onSectionChangeAction({ ...section, width });
  };

  const handleToggleTitleSpeech = (enableTitleSpeech: boolean) => {
    onSectionChangeAction({ ...section, enableTitleSpeech });
  };

  const handleToggleDescriptionSpeech = (enableDescriptionSpeech: boolean) => {
    onSectionChangeAction({ ...section, enableDescriptionSpeech });
  };

  const handleTitleTextStyleChange = (style: TextStyle) => {
    onSectionChangeAction({ ...section, titleTextStyle: { ...section.titleTextStyle, ...style } });
  };

  const handleDescriptionTextStyleChange = (style: TextStyle) => {
    onSectionChangeAction({ ...section, descriptionTextStyle: { ...section.descriptionTextStyle, ...style } });
  };

  const handlePaddingBottomChange = (value: number[]) => {
    onSectionChangeAction({ ...section, paddingBottom: value[0] });
  };

  const isFullViewportWidth = section.width === '100vw';

  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Hero Settings</h3>
          <div className="flex gap-2 items-center">
            {renderSectionControlsAction && renderSectionControlsAction()}
            <Button variant="outline" onClick={handleCancel}>Cancel</Button>
            <Button onClick={handleSave} disabled={!isDirty || isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
        <div className="relative">
          {isEditMode && (
            <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
              <strong>Section ID:</strong> {section.id}
              <span className="ml-2 text-gray-500">(Use this for nav links)</span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Background Media</label>
              <div className="mt-2 flex items-center gap-4">
                <SimpleEditableMedia
                  ref={mediaRef}
                  key={`hero-media-${section.id}`}
                  src={section.backgroundMedia || ''}
                  onChange={(url: string) => {
                    const mediaType = url.match(/\.(mp4|webm|mov|avi|mkv)$/i) ? 'video' : 'image';
                    handleBackgroundMediaChange(url, mediaType);
                  }}
                  isEditMode={true}
                  alt="Hero background"
                  type="all"
                  className="h-48"
                  priority={true}
                />
                <Button
                  variant="outline"
                  size="sm"
                  type="button"
                  onClick={() => mediaRef.current?.openEditor()}
                >
                  Change Media
                </Button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Hero Title"
              />
              <TextStyleEditor
                value={section.titleTextStyle || {}}
                onChange={handleTitleTextStyleChange}
                label="Title Text Style"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={`hero-title-speech-${section.id}`}
                  checked={section.enableTitleSpeech}
                  onChange={(e) => handleToggleTitleSpeech(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`hero-title-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
                  Enable TTS for title
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={section.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Hero Description"
                rows={3}
              />
              <TextStyleEditor
                value={section.descriptionTextStyle || {}}
                onChange={handleDescriptionTextStyleChange}
                label="Description Text Style"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={`hero-description-speech-${section.id}`}
                  checked={section.enableDescriptionSpeech}
                  onChange={(e) => handleToggleDescriptionSpeech(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`hero-description-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
                  Enable TTS for description
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Max Height (px)</label>
                <select
                  value={section.maxHeight || 300}
                  onChange={e => onSectionChangeAction({ ...section, maxHeight: parseInt(e.target.value, 10) })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value={200}>200px</option>
                  <option value={300}>300px</option>
                  <option value={400}>400px</option>
                  <option value={600}>600px</option>
                  <option value={1000}>1000px</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Height</label>
                <select
                  value={section.height || '50vh'}
                  onChange={(e) => handleHeightChange(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="auto">Auto</option>
                  <option value="25vh">25% of screen height</option>
                  <option value="50vh">50% of screen height</option>
                  <option value="75vh">75% of screen height</option>
                  <option value="100vh">Full screen height</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Width</label>
                <select
                  value={section.width || '100%'}
                  onChange={(e) => handleWidthChange(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                >
                  <option value="100%">Container Width</option>
                  <option value="100vw">Full Viewport Width</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Image Fit</label>
                <select
                  value={section.objectFit || 'cover'}
                  onChange={e => onSectionChangeAction({ ...section, objectFit: e.target.value as any })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="cover">Cover</option>
                  <option value="contain">Contain</option>
                  <option value="auto">Auto</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Image Alignment</label>
                <select
                  value={section.objectPosition || 'center'}
                  onChange={e => onSectionChangeAction({ ...section, objectPosition: e.target.value as any })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                >
                  <option value="top">Top</option>
                  <option value="center">Center</option>
                  <option value="bottom">Bottom</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Text Vertical Alignment</label>
              <select
                value={section.textVerticalAlign || 'top'}
                onChange={e => onSectionChangeAction({ ...section, textVerticalAlign: e.target.value as any })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="top">Top</option>
                <option value="middle">Middle</option>
                <option value="bottom">Bottom</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Text Horizontal Alignment</label>
              <select
                value={section.textHorizontalAlign || 'left'}
                onChange={e => onSectionChangeAction({ ...section, textHorizontalAlign: e.target.value as any })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Bottom Padding ({section.paddingBottom || 0}rem)
              </label>
              <Slider
                value={[section.paddingBottom || 0]}
                onValueChange={handlePaddingBottomChange}
                max={20}
                step={1}
                className="mt-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Horizontal Padding (rem)</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={section.horizontalPadding ?? 0}
                  onChange={e => onSectionChangeAction({ ...section, horizontalPadding: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vertical Padding (rem)</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-pink-500 sm:text-sm"
                  value={section.verticalPadding ?? 0}
                  onChange={e => onSectionChangeAction({ ...section, verticalPadding: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Responsive view mode (refactored)
  return (
    <section className="relative w-full min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden"
      style={{
        paddingLeft: `${section.horizontalPadding ?? 0}rem`,
        paddingRight: `${section.horizontalPadding ?? 0}rem`,
        paddingTop: `${section.verticalPadding ?? 0}rem`,
        paddingBottom: `${section.verticalPadding ?? 0}rem`,
      }}
    >
      {section.backgroundMedia && section.mediaType !== 'video' && (
        <Image
          src={section.backgroundMedia}
          alt="Hero background"
          fill
          className="object-cover"
          priority
        />
      )}
      {section.backgroundMedia && section.mediaType === 'video' && (
        <video
          src={section.backgroundMedia}
          autoPlay
          loop
          muted
          playsInline
          className="absolute inset-0 w-full h-full object-cover z-0"
        />
      )}
      {/* Optional overlay for readability */}
      <div className="absolute inset-0 bg-black/40 z-0" />
      <div className="relative z-10 px-4 py-8 sm:px-8 md:px-16 text-center w-full flex flex-col items-center justify-center">
        <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg">
          {section.title}
        </h1>
        <p className="text-base sm:text-lg md:text-xl text-white max-w-2xl mx-auto drop-shadow">
          {section.description}
        </p>
      </div>
    </section>
  );
} 