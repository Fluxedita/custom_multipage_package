import React, { useState, useCallback } from 'react';
import { Volume2Icon, ImageIcon, VideoIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from 'next/image';
import SimpleEditableMedia from '@/components/profile/SimpleEditableMedia';
import MediaLibrary from '@/components/media/MediaLibrary';
import { TextStyleEditor, TextStyle } from './TextStyleEditor';
import parse from 'html-react-parser';

interface FooterColumn {
  type: 'text' | 'media';
  content: string;
  title: string;
  enableSpeech: boolean;
  mediaType?: 'image' | 'video';
  titleTextStyle?: TextStyle;
  textStyle?: TextStyle;
}

interface FooterSection {
  id: string;
  type: 'footer';
  columns: FooterColumn[];
  numColumns: number;
  backgroundColor?: string;
  textColor?: string;
  padding?: string;
}

interface FooterSectionProps {
  section: FooterSection;
  isEditMode: boolean;
  onSectionChange: (section: FooterSection) => void;
  speakText: (text: string) => void;
}

function textStyleToCSS(style: TextStyle = {}): React.CSSProperties {
  return {
    color: style.fontColor,
    fontSize: style.fontSize,
    fontStyle: style.fontStyle,
    fontWeight: style.fontStyle === 'bold' ? 'bold' : undefined,
    textShadow: style.textShadow
      ? `${style.textShadow.offsetX || '2px'} ${style.textShadow.offsetY || '2px'} ${style.textShadow.blur || '4px'} ${style.textShadow.color || '#000000'}`
      : undefined,
    WebkitTextStroke: style.textOutline
      ? `${style.textOutline.width || '2px'} ${style.textOutline.color || '#ffffff'}`
      : undefined,
    background: style.textBackground ? style.textBackground.color : undefined,
    opacity: style.textBackground ? style.textBackground.opacity : undefined,
    borderRadius: style.textBackground ? style.textBackground.borderRadius : undefined,
    padding: style.textBackground ? style.textBackground.padding : undefined,
    backdropFilter:
      style.textBackground && style.textBackground.blur
        ? `blur(${style.textBackground.blur})`
        : undefined,
    WebkitBackdropFilter:
      style.textBackground && style.textBackground.blur
        ? `blur(${style.textBackground.blur})`
        : undefined,
  };
}

export const FooterSection: React.FC<FooterSectionProps> = ({
  section,
  isEditMode,
  onSectionChange,
  speakText,
}) => {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [activeColumnIndex, setActiveColumnIndex] = useState<number | null>(null);

  const handleNumColumnsChange = (numColumns: number) => {
    const currentColumns = [...section.columns];
    const newColumns = Array(numColumns).fill(null).map((_, index) => {
      if (index < currentColumns.length) {
        return currentColumns[index];
      }
      return {
        type: 'text' as const,
        content: '',
        title: '',
        enableSpeech: false,
      };
    });
    onSectionChange({ ...section, numColumns, columns: newColumns });
  };

  const handleColumnTypeChange = (index: number, type: 'text' | 'media') => {
    const newColumns = [...section.columns];
    newColumns[index] = {
      ...newColumns[index],
      type,
      content: '',
      mediaType: type === 'media' ? 'image' : undefined,
    };
    onSectionChange({ ...section, columns: newColumns });
  };

  const handleColumnContentChange = (index: number, content: string) => {
    const newColumns = [...section.columns];
    newColumns[index] = { ...newColumns[index], content };
    onSectionChange({ ...section, columns: newColumns });
  };

  // Handle link clicks
  const handleLinkClick = (e: React.MouseEvent<HTMLDivElement>) => {
    console.log('Footer link clicked', e);
    
    // Only handle if clicking on a link
    const target = e.target as HTMLElement;
    const link = target.closest('a');
    
    if (link) {
      console.log('Link found:', link.href);
      // Let the browser handle the link normally
      return;
    }
  };

  const handleColumnTitleChange = (index: number, title: string) => {
    const newColumns = [...section.columns];
    newColumns[index] = { ...newColumns[index], title };
    onSectionChange({ ...section, columns: newColumns });
  };

  const handleColumnSpeechToggle = (index: number, enableSpeech: boolean) => {
    const newColumns = [...section.columns];
    newColumns[index] = { ...newColumns[index], enableSpeech };
    onSectionChange({ ...section, columns: newColumns });
  };

  const handleMediaSelect = (url: string) => {
    if (activeColumnIndex !== null) {
      const newColumns = [...section.columns];
      newColumns[activeColumnIndex] = {
        ...newColumns[activeColumnIndex],
        content: url,
        mediaType: url.match(/\.(mp4|webm|mov|avi|mkv)$/i) ? 'video' : 'image',
      };
      onSectionChange({ ...section, columns: newColumns });
    }
    setMediaDialogOpen(false);
    setActiveColumnIndex(null);
  };

  const handleBackgroundColorChange = (backgroundColor: string) => {
    onSectionChange({ ...section, backgroundColor });
  };

  const handleTextColorChange = (textColor: string) => {
    onSectionChange({ ...section, textColor });
  };

  const handlePaddingChange = (padding: string) => {
    onSectionChange({ ...section, padding });
  };

  const handleColumnTitleTextStyleChange = (index: number, style: TextStyle) => {
    const newColumns = [...section.columns];
    newColumns[index] = { ...newColumns[index], titleTextStyle: { ...newColumns[index].titleTextStyle, ...style } };
    onSectionChange({ ...section, columns: newColumns });
  };

  const handleColumnTextStyleChange = (index: number, style: TextStyle) => {
    const newColumns = [...section.columns];
    newColumns[index] = { ...newColumns[index], textStyle: { ...newColumns[index].textStyle, ...style } };
    onSectionChange({ ...section, columns: newColumns });
  };

  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Columns</label>
            <select
              value={section.numColumns}
              onChange={(e) => handleNumColumnsChange(Number(e.target.value))}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value={1}>1 Column</option>
              <option value={2}>2 Columns</option>
              <option value={3}>3 Columns</option>
              <option value={4}>4 Columns</option>
            </select>
          </div>

          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${section.numColumns}, 1fr)` }}>
            {section.columns.map((column, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Column Type</label>
                  <select
                    value={column.type}
                    onChange={(e) => handleColumnTypeChange(index, e.target.value as 'text' | 'media')}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="text">Text</option>
                    <option value="media">Media</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Title</label>
                  <input
                    type="text"
                    value={column.title}
                    onChange={(e) => handleColumnTitleChange(index, e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Column Title"
                  />
                  <TextStyleEditor
                    value={column.titleTextStyle || {}}
                    onChange={style => handleColumnTitleTextStyleChange(index, style)}
                    label="Title Text Style"
                  />
                </div>

                {column.type === 'text' ? (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Content</label>
                    <textarea
                      value={column.content}
                      onChange={(e) => handleColumnContentChange(index, e.target.value)}
                      className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      rows={4}
                      placeholder="Enter text content"
                    />
                    <TextStyleEditor
                      value={column.textStyle || {}}
                      onChange={style => handleColumnTextStyleChange(index, style)}
                      label="Content Text Style"
                    />
                  </div>
                ) : (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Media</label>
                    <div className="mt-1">
                      {column.content ? (
                        <div className="relative">
                          {column.mediaType === 'video' ? (
                            <video
                              src={column.content}
                              className="w-full h-32 object-cover rounded"
                              controls
                              muted
                            />
                          ) : (
                            <img
                              src={column.content}
                              alt="Column media"
                              className="w-full h-32 object-cover rounded"
                            />
                          )}
                          <button
                            onClick={() => {
                              setActiveColumnIndex(index);
                              setMediaDialogOpen(true);
                            }}
                            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white opacity-0 hover:opacity-100 transition-opacity"
                          >
                            Change Media
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            setActiveColumnIndex(index);
                            setMediaDialogOpen(true);
                          }}
                          className="w-full h-32 border-2 border-dashed border-gray-300 rounded flex items-center justify-center text-gray-500 hover:text-gray-700 hover:border-gray-400"
                        >
                          Add Media
                        </button>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id={`column-speech-${index}`}
                    checked={column.enableSpeech}
                    onChange={(e) => handleColumnSpeechToggle(index, e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor={`column-speech-${index}`} className="ml-2 block text-sm text-gray-900">
                    Enable TTS for this column
                  </label>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Background Color</label>
              <input
                type="color"
                value={section.backgroundColor || '#ffffff'}
                onChange={(e) => handleBackgroundColorChange(e.target.value)}
                className="mt-1 block w-full h-10 p-1 border border-gray-300 rounded-md"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Text Color</label>
              <input
                type="color"
                value={section.textColor || '#000000'}
                onChange={(e) => handleTextColorChange(e.target.value)}
                className="mt-1 block w-full h-10 p-1 border border-gray-300 rounded-md"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Padding</label>
            <select
              value={section.padding || '2rem'}
              onChange={(e) => handlePaddingChange(e.target.value)}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            >
              <option value="1rem">Small</option>
              <option value="2rem">Medium</option>
              <option value="3rem">Large</option>
              <option value="4rem">Extra Large</option>
            </select>
          </div>
        </div>

        {mediaDialogOpen && (
          <MediaLibrary
            isDialog
            type={section.columns[activeColumnIndex!]?.mediaType || 'image'}
            onCloseAction={() => {
              setMediaDialogOpen(false);
              setActiveColumnIndex(null);
            }}
            onSelectAction={handleMediaSelect}
          />
        )}
      </div>
    );
  }

  return (
    <div
      className="relative"
      style={{
        backgroundColor: section.backgroundColor,
        color: section.textColor,
        padding: section.padding,
        width: !isEditMode ? '100vw' : '100%',
        marginLeft: !isEditMode ? 'calc(-50vw + 50%)' : 'auto',
        marginRight: !isEditMode ? 'calc(-50vw + 50%)' : 'auto',
      }}
    >
      {isEditMode ? (
        <div className="max-w-7xl mx-auto">
          <div className="grid gap-8" style={{ gridTemplateColumns: `repeat(${section.numColumns}, 1fr)` }}>
            {section.columns.map((column, index) => (
              <div key={index} className="space-y-4">
                {column.title && (
                  <h3 className="text-lg font-semibold" style={textStyleToCSS(column.titleTextStyle)}>{column.title}</h3>
                )}
                {column.type === 'text' ? (
                  <div className="relative group">
                    <div 
                      className="prose max-w-none relative z-10" 
                      style={{
                        ...textStyleToCSS(column.textStyle),
                        pointerEvents: 'auto' // Ensure this element can receive pointer events
                      }}
                      onClick={handleLinkClick}
                    >
                      {parse(column.content
                        .replace(/\n/g, '<br />')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => 
                          `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline cursor-pointer relative z-20">${text}</a>`
                      ))}
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-500 mt-2">
                          Has links: {column.content.includes('[') ? 'Yes' : 'No'}
                        </div>
                      )}
                    </div>
                    {column.enableSpeech && (
                      <button
                        onMouseEnter={() => speakText(column.content)}
                        className="absolute top-2 right-2 p-2 text-gray-600 hover:text-blue-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                      >
                        <Volume2Icon className="h-6 w-6" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative aspect-video">
                    {column.mediaType === 'video' ? (
                      <video
                        src={column.content}
                        className="w-full h-full object-cover rounded-lg"
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      <Image
                        src={column.content}
                        alt={column.title || 'Column media'}
                        fill
                        className="object-cover rounded-lg"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {section.columns.map((column, index) => (
              <div key={index} className="space-y-4">
                {column.title && (
                  <h3 className="text-lg font-semibold" style={textStyleToCSS(column.titleTextStyle)}>{column.title}</h3>
                )}
                {column.type === 'text' ? (
                  <div className="relative group">
                    <div 
                      className="prose max-w-none relative z-10" 
                      style={{
                        ...textStyleToCSS(column.textStyle),
                        pointerEvents: 'auto' // Ensure this element can receive pointer events
                      }}
                      onClick={handleLinkClick}
                    >
                      {parse(column.content
                        .replace(/\n/g, '<br />')
                        .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (match, text, url) => 
                          `<a href="${url}" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:underline cursor-pointer relative z-20">${text}</a>`
                      ))}
                      {/* Debug info */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="text-xs text-gray-500 mt-2">
                          Has links: {column.content.includes('[') ? 'Yes' : 'No'}
                        </div>
                      )}
                    </div>
                    {column.enableSpeech && (
                      <button
                        onMouseEnter={() => speakText(column.content)}
                        className="absolute top-2 right-2 p-3 text-gray-600 hover:text-blue-600 transition-colors duration-200 opacity-0 group-hover:opacity-100"
                        title="Hover to read text aloud"
                      >
                        <Volume2Icon className="h-8 w-8" />
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="relative">
                    {column.mediaType === 'video' ? (
                      <video
                        src={column.content}
                        className="w-full h-48 object-cover rounded"
                        controls
                        muted
                        playsInline
                      />
                    ) : (
                      <img
                        src={column.content}
                        alt={column.title}
                        className="w-full h-48 object-cover rounded"
                      />
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {mediaDialogOpen && (
        <MediaLibrary
          isDialog
          type={section.columns[activeColumnIndex!]?.mediaType || 'image'}
          onCloseAction={() => {
            setMediaDialogOpen(false);
            setActiveColumnIndex(null);
          }}
          onSelectAction={handleMediaSelect}
        />
      )}
    </div>
  );
}; 