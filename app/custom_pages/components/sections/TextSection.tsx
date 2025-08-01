import { TextSection as TextSectionType } from '../../types/sections';
import { Volume2Icon } from 'lucide-react';
import { TextStyleEditor, TextStyle, textStyleToCSS } from './TextStyleEditor';
import { SectionWrapper } from './SectionWrapper';

interface TextSectionProps {
  section: TextSectionType;
  isEditMode: boolean;
  onSectionChange: (section: TextSectionType) => void;
  speakText: (text: string) => void;
  onMediaSelect?: () => void;
  onDuplicate?: (duplicatedSection: TextSectionType) => void;
}

export function TextSection({ section, isEditMode, onSectionChange, speakText, onMediaSelect, onDuplicate }: TextSectionProps) {
  // Defaults for new/old sections - all spacing set to 0 by default
  const fullWidth = section.fullWidth ?? false;
  const maxWidth = section.maxWidth ?? '1024px';
  const padding = section.padding ?? '0';
  const margin = section.margin ?? '0';
  const backgroundColor = section.backgroundColor ?? 'transparent';
  const backgroundOpacity = section.backgroundOpacity ?? 0;
  const textBackgroundOpacity = section.textBackgroundOpacity ?? 0;

  // Add sectionBackgroundColor to state, default to white if not present
  const sectionBackgroundColor = section.sectionBackgroundColor ?? '#ffffff';
  const sectionBackgroundOpacity = section.sectionBackgroundOpacity ?? 100;

  const handleContentChange = (content: string) => {
    onSectionChange({ ...section, content });
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    onSectionChange({ ...section, alignment });
  };

  const handleTextStyleChange = (style: TextStyle) => {
    onSectionChange({ ...section, textStyle: { ...section.textStyle, ...style } });
  };

  const handleMediaChange = (mediaUrl: string, mediaType: 'image' | 'video') => {
    onSectionChange({ ...section, mediaUrl, mediaType });
  };

  const handleMediaPositionChange = (mediaPosition: 'top' | 'bottom' | 'left' | 'right') => {
    onSectionChange({ ...section, mediaPosition });
  };

  const handleMediaSizeChange = (mediaWidth: string, mediaHeight: string) => {
    onSectionChange({ ...section, mediaWidth, mediaHeight });
  };

  const handleDuplicate = () => {
    const duplicatedSection: TextSectionType = {
      ...section,
      id: `${section.type}-${Date.now()}`,
      content: section.content ? `${section.content} (Copy)` : 'Content (Copy)',
    };
    
    if (onDuplicate) {
      onDuplicate(duplicatedSection);
    }
  };

  // Background style with opacity (for outermost container) - same as MediaPlaceholderSection
  const getBackgroundStyle = () => {
    if (!backgroundColor || backgroundOpacity === 0) return {};
    
    // Convert hex to rgba if needed
    let bgColor = backgroundColor;
    if (backgroundColor.startsWith('#')) {
      const hex = backgroundColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      bgColor = `rgba(${r}, ${g}, ${b}, ${backgroundOpacity / 100})`;
    } else if (backgroundColor.startsWith('rgb(')) {
      // Convert rgb to rgba
      bgColor = backgroundColor.replace('rgb(', 'rgba(').replace(')', `, ${backgroundOpacity / 100})`);
    } else if (backgroundColor.startsWith('rgba(')) {
      // Update existing rgba opacity
      bgColor = backgroundColor.replace(/[\d.]+\)$/, `${backgroundOpacity / 100})`);
    }
    
    return { backgroundColor: bgColor };
  };

  // Section background style (for SectionWrapper) - now like MediaPlaceholderSection
  const getSectionBackgroundStyle = () => {
    if (!sectionBackgroundColor || sectionBackgroundOpacity === 0) return { backgroundColor: 'transparent' };
    let bgColor = sectionBackgroundColor;
    if (sectionBackgroundColor.startsWith('#')) {
      const hex = sectionBackgroundColor.replace('#', '');
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      bgColor = `rgba(${r}, ${g}, ${b}, ${sectionBackgroundOpacity / 100})`;
    } else if (sectionBackgroundColor.startsWith('rgb(')) {
      bgColor = sectionBackgroundColor.replace('rgb(', 'rgba(').replace(')', `, ${sectionBackgroundOpacity / 100})`);
    } else if (sectionBackgroundColor.startsWith('rgba(')) {
      bgColor = sectionBackgroundColor.replace(/,[\d.]+\)$/, `${sectionBackgroundOpacity / 100})`);
    }
    return { backgroundColor: bgColor };
  };

  // Text background style (equivalent to card opacity in MediaPlaceholderSection)
  const getTextBackgroundStyle = () => {
    const baseStyle = {
      backgroundColor: textBackgroundOpacity === 100 
        ? 'transparent' 
        : `rgba(255, 255, 255, ${textBackgroundOpacity / 100})`
    };
    
    // Add border when opacity is low to make text boundaries visible
    if (textBackgroundOpacity < 50 && textBackgroundOpacity > 0) {
      return {
        ...baseStyle,
        border: '1px solid rgba(0, 0, 0, 0.1)'
      };
    }
    
    return baseStyle;
  };

  // Max width style
  const maxWidthStyle = maxWidth === 'none' ? {} : { maxWidth };

  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          {/* Transparency Controls */}
          <div className="flex flex-wrap gap-4 items-center bg-gray-50 border rounded p-2">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={fullWidth}
                onChange={e => onSectionChange({ ...section, fullWidth: e.target.checked })}
              />
              Full viewport width
            </label>
            <label className="flex items-center gap-2">
              Max width:
              <select
                value={maxWidth}
                onChange={e => onSectionChange({ ...section, maxWidth: e.target.value })}
                disabled={!fullWidth}
                className="border rounded px-2 py-1"
              >
                <option value="640px">640px (sm)</option>
                <option value="768px">768px (md)</option>
                <option value="1024px">1024px (lg)</option>
                <option value="1280px">1280px (xl)</option>
                <option value="none">None (100%)</option>
              </select>
            </label>
            <label className="flex items-center gap-2">
              Background:
              <input
                type="color"
                value={backgroundColor}
                onChange={e => onSectionChange({ ...section, backgroundColor: e.target.value })}
                className="w-10 h-8 border rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center gap-2">
              Background Opacity:
              <input
                type="range"
                min="0"
                max="100"
                value={backgroundOpacity}
                onChange={e => onSectionChange({ ...section, backgroundOpacity: parseInt(e.target.value) })}
                className="w-20"
              />
              <span className="text-sm w-8">{backgroundOpacity}%</span>
            </label>
            {/* Section background color and opacity controls */}
            <label className="flex items-center gap-2">
              Section Background:
              <input
                type="color"
                value={sectionBackgroundColor}
                onChange={e => onSectionChange({ ...section, sectionBackgroundColor: e.target.value })}
                className="w-10 h-8 border rounded cursor-pointer"
              />
            </label>
            <label className="flex items-center gap-2">
              Section Background Opacity:
              <input
                type="range"
                min="0"
                max="100"
                value={sectionBackgroundOpacity}
                onChange={e => onSectionChange({ ...section, sectionBackgroundOpacity: parseInt(e.target.value) })}
                className="w-20"
              />
              <span className="text-sm w-8">{sectionBackgroundOpacity}%</span>
            </label>
            <label className="flex items-center gap-2">
              Text Background Opacity:
              <input
                type="range"
                min="0"
                max="100"
                value={textBackgroundOpacity}
                onChange={e => onSectionChange({ ...section, textBackgroundOpacity: parseInt(e.target.value) })}
                className="w-20"
              />
              <span className="text-sm w-8">{textBackgroundOpacity}%</span>
            </label>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              value={section.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={4}
              placeholder="Enter your text content"
            />
          </div>

          {/* Content Alignment Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Content Alignment</label>
            <div className="flex gap-2">
              <button
                onClick={() => handleAlignmentChange('left')}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  section.alignment === 'left'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Left
              </button>
              <button
                onClick={() => handleAlignmentChange('center')}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  section.alignment === 'center'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Center
              </button>
              <button
                onClick={() => handleAlignmentChange('right')}
                className={`px-4 py-2 border rounded-md text-sm font-medium transition-colors ${
                  section.alignment === 'right'
                    ? 'bg-blue-500 text-white border-blue-500'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                Right
              </button>
            </div>
          </div>
          <TextStyleEditor
            value={section.textStyle || {}}
            onChange={handleTextStyleChange}
            label="Text Style"
          />

          {/* Media Controls */}
          <div>
            <label className="block text-sm font-medium text-gray-700">Media</label>
            <div className="mt-1 flex items-center space-x-4">
              {section.mediaUrl ? (
                <div className="relative w-24 h-24">
                  {section.mediaType === 'video' ? (
                    <video
                      src={section.mediaUrl}
                      className="w-full h-full object-cover rounded"
                      controls
                    />
                  ) : (
                    <img
                      src={section.mediaUrl}
                      alt="Media"
                      className="w-full h-full object-cover rounded"
                    />
                  )}
                  <button
                    onClick={() => handleMediaChange('', 'image')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <button
                  onClick={onMediaSelect}
                  className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Media
                </button>
              )}
            </div>

            {/* Media Position and Size Controls */}
            {section.mediaUrl && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Media Position</label>
                  <select
                    value={section.mediaPosition || 'top'}
                    onChange={(e) => handleMediaPositionChange(e.target.value as 'top' | 'bottom' | 'left' | 'right')}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="top">Top</option>
                    <option value="bottom">Bottom</option>
                    <option value="left">Left</option>
                    <option value="right">Right</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Width</label>
                    <input
                      type="text"
                      value={section.mediaWidth || '100%'}
                      onChange={(e) => handleMediaSizeChange(e.target.value, section.mediaHeight || 'auto')}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., 300px, 50%"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Height</label>
                    <input
                      type="text"
                      value={section.mediaHeight || 'auto'}
                      onChange={(e) => handleMediaSizeChange(section.mediaWidth || '100%', e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="e.g., 200px, auto"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {/* Horizontal and Vertical Padding Controls */}
          <div className="grid grid-cols-2 gap-4">
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
      </div>
    );
  }

  // Render media content
  const renderMedia = () => {
    if (!section.mediaUrl) return null;

    const mediaStyle = {
      width: section.mediaWidth || '100%',
      height: section.mediaHeight || 'auto',
      display: section.alignment === 'center' ? 'block' : undefined,
      marginLeft: section.alignment === 'center' ? 'auto' : undefined,
      marginRight: section.alignment === 'center' ? 'auto' : undefined,
    };

    return (
      <div className="media-container" style={mediaStyle}>
        {section.mediaType === 'video' ? (
          <video
            src={section.mediaUrl}
            className="w-full h-full object-cover rounded-lg"
            controls
          />
        ) : (
          <img
            src={section.mediaUrl}
            alt="Section media"
            className="w-full h-full object-cover rounded-lg"
          />
        )}
      </div>
    );
  };

  // Determine layout based on media position
  const getLayout = () => {
    const mediaPosition = section.mediaPosition || 'top';
    const isCenter = section.alignment === 'center';
    
    if (mediaPosition === 'left' || mediaPosition === 'right') {
      return (
        <div
          className={`flex items-start gap-6${isCenter ? ' justify-center' : ''}`}
        >
          {mediaPosition === 'left' && renderMedia()}
          <div className="flex-1">
            <div
              className="prose max-w-none p-4 rounded"
              style={{
                textAlign: section.alignment,
                ...textStyleToCSS(section.textStyle),
                ...getTextBackgroundStyle(),
              }}
              dangerouslySetInnerHTML={{ __html: section.content }}
            />
            {section.enableSpeech && (
              <button
                onMouseEnter={() => speakText(section.content)}
                className="text-gray-500 hover:text-gray-700 ml-2"
              >
                <Volume2Icon className="h-6 w-6" />
              </button>
            )}
          </div>
          {mediaPosition === 'right' && renderMedia()}
        </div>
      );
    }

    // Top or bottom positioning
    return (
      <div className={`space-y-4${isCenter ? ' flex flex-col items-center' : ''}`}>
        {mediaPosition === 'top' && renderMedia()}
        <div
          className="prose max-w-none p-4 rounded"
          style={{
            textAlign: section.alignment,
            ...textStyleToCSS(section.textStyle),
            ...getTextBackgroundStyle(),
          }}
          dangerouslySetInnerHTML={{ __html: section.content }}
        />
        {section.enableSpeech && (
          <button
            onMouseEnter={() => speakText(section.content)}
            className="text-gray-500 hover:text-gray-700 ml-2"
          >
            <Volume2Icon className="h-6 w-6" />
          </button>
        )}
        {mediaPosition === 'bottom' && renderMedia()}
      </div>
    );
  };

  return (
    <div
      className={
        fullWidth
          ? `w-screen relative left-1/2 right-1/2 ml-[-50vw] mr-[-50vw]`
          : ''
      }
      style={fullWidth ? { width: '100vw', ...getBackgroundStyle(),
        paddingLeft: `${section.horizontalPadding ?? 0}rem`,
        paddingRight: `${section.horizontalPadding ?? 0}rem`,
        paddingTop: `${section.verticalPadding ?? 0}rem`,
        paddingBottom: `${section.verticalPadding ?? 0}rem`,
      } : {
        ...getBackgroundStyle(),
        paddingLeft: `${section.horizontalPadding ?? 0}rem`,
        paddingRight: `${section.horizontalPadding ?? 0}rem`,
        paddingTop: `${section.verticalPadding ?? 0}rem`,
        paddingBottom: `${section.verticalPadding ?? 0}rem`,
      }}
    >
      <div
        className="mx-auto"
        style={fullWidth ? maxWidthStyle : {}}
      >
        <SectionWrapper
          sectionId={section.id}
          isEditMode={isEditMode}
          onDuplicate={onDuplicate ? handleDuplicate : undefined}
          style={getSectionBackgroundStyle()}
          transparentBackground={true}
        >
          {isEditMode && (
            <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
              <strong>Section ID:</strong> {section.id}
              <span className="ml-2 text-gray-500">(Use this for nav links)</span>
            </div>
          )}
          {getLayout()}
        </SectionWrapper>
      </div>
    </div>
  );
} 