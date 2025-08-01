import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import MediaLibrary from '@/components/media/MediaLibrary';
import { TextStyleEditor, TextStyle } from './TextStyleEditor';
import { textStyleToCSS } from './TextStyleEditor';
import type { InfoCardSection as InfoCardSectionType } from '@/app/custom_pages/types/sections';
import { CSSProperties } from 'react';
import { motion } from 'framer-motion';

type LayoutType = 'full-height' | 'centered' | 'tight-wrap';

interface SectionLayout {
  type: LayoutType;
  minHeight?: string;
  contentAlignment: string;
  sectionPadding: string;
}

const LAYOUTS: Record<LayoutType, SectionLayout> = {
  'full-height': {
    type: 'full-height',
    minHeight: '100vh',
    contentAlignment: 'items-end',
    sectionPadding: 'p-8'
  },
  'centered': {
    type: 'centered',
    minHeight: '50vh',
    contentAlignment: 'items-center',
    sectionPadding: 'p-8'
  },
  'tight-wrap': {
    type: 'tight-wrap',
    minHeight: 'auto',
    contentAlignment: 'items-center',
    sectionPadding: 'p-24'
  }
};

interface Props {
  section: InfoCardSectionType;
  isEditMode: boolean;
  onSectionChange: (updated: Partial<InfoCardSectionType>) => void;
  speakText?: (text: string) => void;
}

export const InfoCardSection: React.FC<Props> = ({ section, isEditMode, onSectionChange }) => {
  const [editingMediaIdx, setEditingMediaIdx] = useState<number | null>(null);
  const [showMediaLibrary, setShowMediaLibrary] = useState(false);

  const updateCard = (idx: number, update: Partial<InfoCardSectionType['cards'][number]>) => {
    const updatedCards = [...section.cards];
    updatedCards[idx] = { ...updatedCards[idx], ...update };
    onSectionChange({ ...section, cards: updatedCards });
  };

  const addCard = () => {
    const newCard: InfoCardSectionType['cards'][number] = {
      id: crypto.randomUUID(),
      mediaUrl: '',
      mediaType: 'image',
      title: '',
      description: '',
      textStyle: {},
      ctaText: 'Learn More',
      ctaUrl: '',
      ctaOpenInNewTab: false
    };
    onSectionChange({ ...section, cards: [...section.cards, newCard] });
  };

  const removeCard = (idx: number) => {
    const updated = section.cards.filter((_, i) => i !== idx);
    onSectionChange({ ...section, cards: updated });
  };

  const handleMediaSelect = (url: string, type: 'image' | 'video') => {
    if (editingMediaIdx !== null) {
      updateCard(editingMediaIdx, { mediaUrl: url, mediaType: type });
      setEditingMediaIdx(null);
    }
  };

  const handleBackgroundSelect = (url: string, type: 'image' | 'video' = 'image') => {
    onSectionChange({ backgroundUrl: url });
    setShowMediaLibrary(false);
  };

  const currentLayout = LAYOUTS[section.layout || 'full-height'];
  const sectionWidth = section.width || '100%';
  const horizontalAlign = section.horizontalAlign || 'center';
  
  const sectionClasses = [
    'relative w-full flex',
    currentLayout.contentAlignment,
    currentLayout.sectionPadding,
    {
      'justify-start': horizontalAlign === 'left',
      'justify-center': horizontalAlign === 'center',
      'justify-end': horizontalAlign === 'right'
    }
  ].join(' ');
  
  const gridJustifyClass = {
    'left': 'justify-start',
    'center': 'justify-center',
    'right': 'justify-end'
  }[horizontalAlign] || 'justify-center';
  
  const gridItemsAlignClass = {
    'left': 'items-start',
    'center': 'items-center',
    'right': 'items-end'
  }[horizontalAlign] || 'items-center';

  // Helper to detect if backgroundUrl is a video
  const isVideoBackground = section.backgroundUrl && /\.(mp4|webm|ogg)$/i.test(section.backgroundUrl);

  const sectionStyle = {
    minHeight: currentLayout.minHeight,
    backgroundImage: !isVideoBackground && section.backgroundUrl ? `url(${section.backgroundUrl})` : 'none',
    backgroundSize: section.backgroundSize || 'cover',
    backgroundPosition: section.backgroundPosition || 'center',
    backgroundRepeat: 'no-repeat'
  };

  // Default padding for main title overlay
  const mainTitlePaddingTop = section.mainTitlePaddingTop || '3rem';

  return (
    <section
      className={sectionClasses}
      style={{
        ...sectionStyle,
        paddingLeft: `${section.horizontalPadding ?? 0}rem`,
        paddingRight: `${section.horizontalPadding ?? 0}rem`,
        paddingTop: `${section.verticalPadding ?? 0}rem`,
        paddingBottom: `${section.verticalPadding ?? 0}rem`,
      }}
    >
      {isEditMode && (
        <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
          <strong>Section ID:</strong> {section.id}
          <span className="ml-2 text-gray-500">(Use this for nav links)</span>
        </div>
      )}
      {/* Render video background if needed */}
      {isVideoBackground && (
        <video
          className="absolute inset-0 w-full h-full object-cover z-0"
          src={section.backgroundUrl}
          autoPlay
          loop
          muted
          playsInline
        />
      )}
      <div
        className="absolute inset-0 bg-black/40 z-0"
        style={{
          backdropFilter: `blur(${section.backgroundBlur || '8px'})`,
          WebkitBackdropFilter: `blur(${section.backgroundBlur || '8px'})`,
        }}
      />
      <div className={`relative z-10 w-full ${sectionWidth === '100vw' ? 'w-screen max-w-none' : ''} ${currentLayout.type === 'tight-wrap' ? 'py-6 md:py-12' : ''}`}>
        <div className={`${sectionWidth === '100vw' ? 'max-w-[2000px]' : 'max-w-screen-xl'} mx-auto px-4 sm:px-6`}>
          {/* Move title/description inside the main content area for better mobile flow */}
          {section.showMainTitleDescription && (section.mainTitle || section.mainDescription) && (
            <div className="w-full mb-6 sm:mb-8 md:mb-12 px-4 sm:px-6">
              <div className="max-w-4xl mx-auto">
                {section.mainTitle && (
                  <h2
                    className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 sm:mb-4 leading-tight sm:leading-snug"
                    style={textStyleToCSS(section.mainTitleTextStyle)}
                  >
                    {section.mainTitle}
                  </h2>
                )}
                {section.mainDescription && (
                  <p
                    className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed"
                    style={textStyleToCSS(section.mainDescriptionTextStyle)}
                  >
                    {section.mainDescription}
                  </p>
                )}
              </div>
            </div>
          )}
          <div 
            className={`grid gap-4 md:gap-6 w-full ${
              section.numCards === 1 ? 'grid-cols-1' : 
              section.numCards === 2 ? 'grid-cols-1 md:grid-cols-2' : 
              'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
            } ${
              section.horizontalAlign === 'center' ? 'justify-items-center' :
              section.horizontalAlign === 'right' ? 'justify-items-end' : 'justify-items-start'
            }`}
          >
            {section.cards.map((card, idx) => (
              <motion.div
                key={card.id}
                className={`bg-white/10 backdrop-blur-xl p-4 rounded-xl shadow-lg text-white flex flex-col transition-all duration-200 h-full ${
                  section.horizontalAlign === 'center' ? 'mx-auto' : 
                  section.horizontalAlign === 'right' ? 'ml-auto' : 'mr-auto'
                }`}
                whileHover={{ y: -4, scale: 1.02 }}
                style={{
                  width: section.numCards === 1 ? '100%' : '100%',
                  maxWidth: section.numCards === 1 ? '800px' : '100%'
                }}
              >
            {isEditMode && (
              <Button 
                size="sm" 
                variant="destructive" 
                className="mb-2 self-end z-10" 
                onClick={(e) => {
                  e.stopPropagation();
                  removeCard(idx);
                }}
              >
                Remove Card
              </Button>
            )}

            {card.mediaUrl ? (
              card.mediaType === 'video' ? (
                <video src={card.mediaUrl} className="w-full h-40 object-cover rounded mb-3" controls />
              ) : (
                <img src={card.mediaUrl} alt={card.title} className="w-full h-40 object-cover rounded mb-3" />
              )
            ) : isEditMode ? (
              <Button variant="outline" onClick={() => setEditingMediaIdx(idx)}>Add Media</Button>
            ) : null}

            {editingMediaIdx === idx && isEditMode && (
              <MediaLibrary
                isDialog
                type="all"
                onCloseAction={() => setEditingMediaIdx(null)}
                onSelectAction={(url, type) => handleMediaSelect(url, type as 'image' | 'video')}
              />
            )}

            {isEditMode ? (
              <>
                <input
                  value={card.title}
                  onChange={e => updateCard(idx, { title: e.target.value })}
                  className="mb-2 px-2 py-1 rounded text-black"
                  placeholder="Card Title"
                />
                <textarea
                  value={card.description}
                  onChange={e => updateCard(idx, { description: e.target.value })}
                  rows={2}
                  className="mb-2 px-2 py-1 rounded text-black"
                  placeholder="Description"
                />
                <TextStyleEditor
                  value={card.textStyle || {}}
                  onChange={style => updateCard(idx, { textStyle: style })}
                  label="Text Style"
                />
                <input
                  value={card.ctaText}
                  onChange={e => updateCard(idx, { ctaText: e.target.value })}
                  className="mb-2 px-2 py-1 rounded text-black"
                  placeholder="CTA Text"
                />
                <input
                  value={card.ctaUrl}
                  onChange={e => updateCard(idx, { ctaUrl: e.target.value })}
                  className="mb-2 px-2 py-1 rounded text-black"
                  placeholder="CTA Link"
                />
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={!!card.ctaOpenInNewTab}
                    onChange={e => updateCard(idx, { ctaOpenInNewTab: e.target.checked })}
                  />
                  Open in new tab
                </label>
              </>
            ) : (
              <>
                <h3 className="text-lg font-bold mb-2" style={card.textStyle as CSSProperties}>{card.title}</h3>
                <p className="text-sm mb-2" style={card.textStyle as CSSProperties}>{card.description}</p>
                {card.ctaUrl && (
                  <Button asChild>
                    <a href={card.ctaUrl} target={card.ctaOpenInNewTab ? '_blank' : undefined} rel={card.ctaOpenInNewTab ? 'noopener noreferrer' : undefined}>
                      {card.ctaText}
                    </a>
                  </Button>
                )}
              </>
            )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>
      
      {isEditMode && (
        <>
          {/* Add Card/Background Buttons remain top left */}
          <div className="absolute top-4 left-4 z-30 flex flex-wrap gap-2">
            <div className="flex gap-2">
              <Button onClick={addCard} size="sm">Add Card</Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setShowMediaLibrary(true)}
              >
                Background
              </Button>
            </div>
            <div className="flex items-center gap-2 bg-white/10 p-1 rounded-md">
              <span className="text-xs text-white/80 px-2">Align:</span>
              {(['left', 'center', 'right'] as const).map((align) => (
                <Button
                  key={align}
                  variant={section.horizontalAlign === align ? 'default' : 'ghost'}
                  size="sm"
                  className="h-8 w-8 p-0 flex items-center justify-center"
                  onClick={() => onSectionChange({ ...section, horizontalAlign: align })}
                >
                  <span className={`icon-${align}`}>
                    {align === 'left' && '◧'}
                    {align === 'center' && '◨'}
                    {align === 'right' && '◨'}
                  </span>
                </Button>
              ))}
            </div>
            {showMediaLibrary && (
              <MediaLibrary
                isDialog
                type="image"
                onCloseAction={() => setShowMediaLibrary(false)}
                onSelectAction={handleBackgroundSelect}
              />
            )}
          </div>
          {/* Main edit controls, vertically centered left */}
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-20 space-y-2 flex flex-col items-start">
            <div className="bg-white/90 p-2 rounded-md shadow-md w-48">
              <label className="text-xs font-medium text-gray-700 block mb-1">Layout</label>
              <select
                value={section.layout || 'full-height'}
                onChange={(e) => onSectionChange({ layout: e.target.value as LayoutType })}
                className="text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 w-full"
              >
                <option value="full-height">Full Height</option>
                <option value="centered">Centered (50% Height)</option>
                <option value="tight-wrap">Tight Wrap</option>
              </select>
            </div>
            <div className="bg-white/90 p-2 rounded-md shadow-md w-48">
              <label className="text-xs font-medium text-gray-700 block mb-1">Width</label>
              <select
                value={section.width || '100%'}
                onChange={e => onSectionChange({ width: e.target.value as '100vw' | '100%' })}
                className="text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 w-full"
              >
                <option value="100%">Container Width</option>
                <option value="100vw">Full Viewport Width</option>
              </select>
            </div>
            {section.backgroundUrl && (
              <div className="bg-white/90 p-2 rounded-md shadow-md w-48">
                <label className="text-xs font-medium text-gray-700 block mb-1">Background Position</label>
                <select
                  value={section.backgroundPosition || 'center'}
                  onChange={(e) => onSectionChange({ backgroundPosition: e.target.value })}
                  className="text-sm rounded border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 w-full"
                >
                  <option value="center">Center</option>
                  <option value="top">Top</option>
                  <option value="bottom">Bottom</option>
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>
            )}
            <div className="bg-white/80 p-2 rounded shadow flex items-center gap-2 w-48">
              <label className="text-xs font-medium text-gray-700">Background Blur</label>
              <input
                type="text"
                value={section.backgroundBlur || '8px'}
                onChange={e => onSectionChange({ backgroundBlur: e.target.value })}
                className="w-20 border rounded px-2 py-1 text-xs"
                placeholder="e.g. 8px"
              />
            </div>
            {/* Main Title/Description Toggle and Inputs */}
            <div className="bg-white/90 p-2 rounded-md shadow-md w-48 mt-4">
              <label className="flex items-center gap-2 text-xs font-medium text-gray-700 mb-2">
                <input
                  type="checkbox"
                  checked={!!section.showMainTitleDescription}
                  onChange={e => onSectionChange({ showMainTitleDescription: e.target.checked })}
                />
                Show Main Title/Description (Full Height only)
              </label>
              {section.showMainTitleDescription && (
                <>
                  <input
                    type="text"
                    value={section.mainTitle || ''}
                    onChange={e => onSectionChange({ mainTitle: e.target.value })}
                    className="mb-2 px-2 py-1 rounded text-black w-full"
                    placeholder="Main Title (optional)"
                  />
                  <TextStyleEditor
                    value={section.mainTitleTextStyle || {}}
                    onChange={style => onSectionChange({ mainTitleTextStyle: style })}
                    label="Main Title Style"
                  />
                  <textarea
                    value={section.mainDescription || ''}
                    onChange={e => onSectionChange({ mainDescription: e.target.value })}
                    rows={2}
                    className="mb-2 px-2 py-1 rounded text-black w-full"
                    placeholder="Main Description (optional)"
                  />
                  <TextStyleEditor
                    value={section.mainDescriptionTextStyle || {}}
                    onChange={style => onSectionChange({ mainDescriptionTextStyle: style })}
                    label="Main Description Style"
                  />
                  <label className="block text-xs font-medium text-gray-700 mb-1 mt-2">Title Padding Top</label>
                  <input
                    type="text"
                    value={section.mainTitlePaddingTop || '3rem'}
                    onChange={e => onSectionChange({ mainTitlePaddingTop: e.target.value })}
                    className="mb-2 px-2 py-1 rounded text-black w-full"
                    placeholder="e.g. 3rem or 48px"
                  />
                </>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Horizontal Padding (rem)</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={section.horizontalPadding ?? 0}
                  onChange={e => onSectionChange({ ...section, horizontalPadding: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Vertical Padding (rem)</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  value={section.verticalPadding ?? 0}
                  onChange={e => onSectionChange({ ...section, verticalPadding: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
};
