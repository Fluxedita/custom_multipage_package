"use client";

import { useRef } from 'react';
import type { HeroSectionResponsiveType } from '../../types/sections';
import { Button } from '@/components/ui/button';
import SimpleEditableMedia from '@/components/profile/SimpleEditableMedia';
import Image from 'next/image';
import { Volume2Icon } from 'lucide-react';
import { TextStyleEditor, TextStyle } from './TextStyleEditor';
import { Slider } from '@/components/ui/slider';

interface HeroSectionResponsiveProps {
  idx?: number;
  section: HeroSectionResponsiveType;
  isEditMode: boolean;
  onSectionChangeAction: (section: HeroSectionResponsiveType) => void;
  speakTextAction: (text: string) => void;
  onSaveAction?: () => void;
  onCancelAction?: () => void;
  renderSectionControlsAction?: () => React.ReactNode;
  onExitEditMode?: () => void;
  isDirty: boolean;
  isSaving?: boolean;
}

function textStyleToCSS(style?: TextStyle): React.CSSProperties {
  if (!style) return {};
  const css: React.CSSProperties = {};
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

export function HeroSectionResponsive({
  section,
  isEditMode,
  idx,
  onSectionChangeAction,
  speakTextAction,
  renderSectionControlsAction,
  onExitEditMode,
  onSaveAction,
  onCancelAction,
  isDirty,
  isSaving = false,
}: HeroSectionResponsiveProps) {
  const mediaRef = useRef<{ openEditor: () => void }>(null);

  const handleSave = onSaveAction ?? (() => {});
  const handleCancel = onCancelAction ?? (() => {});

  // Alignment classes
  const verticalAlignClass = {
    top: 'justify-start',
    middle: 'justify-center',
    bottom: 'justify-end',
  }[section.textVerticalAlign || 'middle'];

  const horizontalAlignClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right',
  }[section.textHorizontalAlign || 'center'];

  // Responsive view mode
  if (!isEditMode) {
    const isFullWidth = section.width === '100vw';
    return (
      <section
        className={
          isFullWidth
            ? 'relative min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden w-screen left-1/2 right-1/2 ml-[-50vw] mr-[-50vw]'
            : 'relative min-h-[40vh] sm:min-h-[50vh] md:min-h-[60vh] flex items-center justify-center overflow-hidden w-full'
        }
        style={{
          width: isFullWidth ? '100vw' : '100%',
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
            style={{ objectFit: section.objectFit || 'cover', objectPosition: section.objectPosition || 'center' }}
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
            style={{ objectFit: section.objectFit || 'cover', objectPosition: section.objectPosition || 'center' }}
          />
        )}
        {/* Overlay for readability */}
        <div className="absolute inset-0 z-0" style={{ background: section.overlayColor || 'rgba(0,0,0,0.4)' }} />
        <div className={`relative z-10 px-4 py-8 sm:px-8 md:px-16 w-full flex flex-col items-center ${verticalAlignClass} min-h-[40vh] ${horizontalAlignClass}`} style={{ height: section.height || undefined }}>
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-4 text-white drop-shadow-lg" style={textStyleToCSS(section.titleTextStyle)}>
            {section.title}
            {section.enableTitleSpeech && (
              <button
                onMouseEnter={() => speakTextAction(section.title)}
                className="text-white hover:text-gray-200 ml-2"
              >
                <Volume2Icon className="h-6 w-6" />
              </button>
            )}
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-white max-w-2xl mx-auto drop-shadow" style={textStyleToCSS(section.descriptionTextStyle)}>
            {section.description}
            {section.enableDescriptionSpeech && (
              <button
                onMouseEnter={() => speakTextAction(section.description)}
                className="text-white hover:text-gray-200 ml-2"
              >
                <Volume2Icon className="h-6 w-6" />
              </button>
            )}
          </p>
          {section.buttonText && section.buttonUrl && (
            <a
              href={section.buttonUrl}
              className="mt-6 inline-block bg-pink-500 hover:bg-pink-600 text-white px-8 py-3 rounded-full text-lg font-medium transition-colors"
              target="_blank"
              rel="noopener noreferrer"
            >
              {section.buttonText}
            </a>
          )}
        </div>
      </section>
    );
  }

  // Rich edit mode
  return (
    <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Hero Settings (Responsive & Rich)</h3>
        <div className="flex gap-2 items-center">
          {renderSectionControlsAction && renderSectionControlsAction()}
          <Button variant="outline" onClick={handleCancel}>Cancel</Button>
          <Button onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </div>
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
                onSectionChangeAction({ ...section, backgroundMedia: url, mediaType });
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
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Height</label>
            <select
              value={section.height || '50vh'}
              onChange={e => onSectionChangeAction({ ...section, height: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            >
              <option value="auto">Auto</option>
              <option value="25vh">25% of screen height</option>
              <option value="50vh">50% of screen height</option>
              <option value="75vh">75% of screen height</option>
              <option value="100vh">Full screen height</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Width</label>
            <select
              value={section.width === '100vw' ? '100vw' : '100%'}
              onChange={e => onSectionChangeAction({ ...section, width: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            >
              <option value="100%">Container Width</option>
              <option value="100vw">Full Viewport Width</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Overlay Color</label>
            <input
              type="color"
              value={section.overlayColor || '#00000066'}
              onChange={e => onSectionChangeAction({ ...section, overlayColor: e.target.value })}
              className="mt-1 block w-16 h-10 border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Horizontal Padding (rem)</label>
            <input
              type="number"
              min={0}
              step={0.25}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
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
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
              value={section.verticalPadding ?? 0}
              onChange={e => onSectionChangeAction({ ...section, verticalPadding: Number(e.target.value) })}
            />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Text Vertical Alignment</label>
            <select
              value={section.textVerticalAlign || 'middle'}
              onChange={e => onSectionChangeAction({ ...section, textVerticalAlign: e.target.value as any })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            >
              <option value="top">Top</option>
              <option value="middle">Middle</option>
              <option value="bottom">Bottom</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Text Horizontal Alignment</label>
            <select
              value={section.textHorizontalAlign || 'center'}
              onChange={e => onSectionChangeAction({ ...section, textHorizontalAlign: e.target.value as any })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 sm:text-sm"
            >
              <option value="left">Left</option>
              <option value="center">Center</option>
              <option value="right">Right</option>
            </select>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={section.title || ''}
            onChange={e => onSectionChangeAction({ ...section, title: e.target.value })}
          />
          <TextStyleEditor
            value={section.titleTextStyle || {}}
            onChange={style => onSectionChangeAction({ ...section, titleTextStyle: { ...section.titleTextStyle, ...style } })}
            label="Title Text Style"
          />
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              id={`hero-title-speech-${section.id}`}
              checked={section.enableTitleSpeech}
              onChange={e => onSectionChangeAction({ ...section, enableTitleSpeech: e.target.checked })}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor={`hero-title-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
              Enable TTS for title
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={section.description || ''}
            onChange={e => onSectionChangeAction({ ...section, description: e.target.value })}
            rows={3}
          />
          <TextStyleEditor
            value={section.descriptionTextStyle || {}}
            onChange={style => onSectionChangeAction({ ...section, descriptionTextStyle: { ...section.descriptionTextStyle, ...style } })}
            label="Description Text Style"
          />
          <div className="mt-2 flex items-center">
            <input
              type="checkbox"
              id={`hero-description-speech-${section.id}`}
              checked={section.enableDescriptionSpeech}
              onChange={e => onSectionChangeAction({ ...section, enableDescriptionSpeech: e.target.checked })}
              className="h-4 w-4 text-pink-600 focus:ring-pink-500 border-gray-300 rounded"
            />
            <label htmlFor={`hero-description-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
              Enable TTS for description
            </label>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Call-to-Action Button Text</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={section.buttonText || ''}
            onChange={e => onSectionChangeAction({ ...section, buttonText: e.target.value })}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">Call-to-Action Button URL</label>
          <input
            type="text"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            value={section.buttonUrl || ''}
            onChange={e => onSectionChangeAction({ ...section, buttonUrl: e.target.value })}
          />
        </div>
      </div>
    </div>
  );
}

export default HeroSectionResponsive; 