import { MediaTextColumnsSection as MediaTextColumnsSectionType } from '../../types/sections';
import { Volume2Icon } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { TextStyleEditor, TextStyle } from './TextStyleEditor';

interface MediaTextColumnsSectionProps {
  section: MediaTextColumnsSectionType;
  isEditMode: boolean;
  onSectionChange: (section: MediaTextColumnsSectionType) => void;
  speakText: (text: string) => void;
}

export function MediaTextColumnsSection({ section, isEditMode, onSectionChange, speakText }: MediaTextColumnsSectionProps) {
  const [isMediaLibraryOpen, setIsMediaLibraryOpen] = useState(false);

  const handleTitleChange = (title: string) => {
    onSectionChange({ ...section, title });
  };

  const handleDescriptionChange = (description: string) => {
    onSectionChange({ ...section, description });
  };

  const handleMediaUrlChange = (mediaUrl: string) => {
    onSectionChange({ ...section, mediaUrl });
  };

  const handleMediaTypeChange = (mediaType: 'image' | 'video') => {
    onSectionChange({ ...section, mediaType });
  };

  const handleMediaPositionChange = (mediaPosition: 'left' | 'right') => {
    onSectionChange({ ...section, mediaPosition });
  };

  const handleToggleTitleSpeech = (enableTitleSpeech: boolean) => {
    onSectionChange({ ...section, enableTitleSpeech });
  };

  const handleToggleDescriptionSpeech = (enableDescriptionSpeech: boolean) => {
    onSectionChange({ ...section, enableDescriptionSpeech });
  };

  const handleTitleTextStyleChange = (style: TextStyle) => {
    onSectionChange({ ...section, titleTextStyle: { ...section.titleTextStyle, ...style } });
  };

  const handleDescriptionTextStyleChange = (style: TextStyle) => {
    onSectionChange({ ...section, descriptionTextStyle: { ...section.descriptionTextStyle, ...style } });
  };

  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="relative">
          {isEditMode && (
            <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
              <strong>Section ID:</strong> {section.id}
              <span className="ml-2 text-gray-500">(Use this for nav links)</span>
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Title</label>
              <input
                type="text"
                value={section.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="Section Title"
              />
              <TextStyleEditor
                value={section.titleTextStyle || {}}
                onChange={handleTitleTextStyleChange}
                label="Title Text Style"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={`media-text-title-speech-${section.id}`}
                  checked={section.enableTitleSpeech}
                  onChange={(e) => handleToggleTitleSpeech(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`media-text-title-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
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
                rows={3}
                placeholder="Section Description"
              />
              <TextStyleEditor
                value={section.descriptionTextStyle || {}}
                onChange={handleDescriptionTextStyleChange}
                label="Description Text Style"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={`media-text-description-speech-${section.id}`}
                  checked={section.enableDescriptionSpeech}
                  onChange={(e) => handleToggleDescriptionSpeech(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`media-text-description-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
                  Enable TTS for description
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Media Type</label>
              <select
                value={section.mediaType}
                onChange={(e) => handleMediaTypeChange(e.target.value as 'image' | 'video')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="image">Image</option>
                <option value="video">Video</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Media URL</label>
              <div className="mt-1 flex rounded-md shadow-sm">
                <input
                  type="text"
                  value={section.mediaUrl}
                  onChange={(e) => handleMediaUrlChange(e.target.value)}
                  className="flex-1 min-w-0 block w-full px-3 py-2 rounded-md border border-gray-300 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Media URL"
                />
                <button
                  onClick={() => setIsMediaLibraryOpen(true)}
                  className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Browse
                </button>
              </div>
              {/* Removed: <MediaLibrary
                mediaItems={[]}
                onSelectAction={(media) => handleMediaUrlChange(media.coverImage || media.imageUrls?.[0] || '')}
                onCloseAction={() => setIsMediaLibraryOpen(false)}
              /> */}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Media Position</label>
              <select
                value={section.mediaPosition}
                onChange={(e) => handleMediaPositionChange(e.target.value as 'left' | 'right')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="left">Left</option>
                <option value="right">Right</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const mediaContent = section.mediaType === 'image' ? (
    <div className="relative aspect-video">
      <Image
        src={section.mediaUrl}
        alt={section.title}
        fill
        className="object-cover rounded-lg"
      />
    </div>
  ) : (
    <div className="relative aspect-video">
      <video
        src={section.mediaUrl}
        controls
        className="w-full h-full rounded-lg"
      />
    </div>
  );

  const textContent = (
    <div className="space-y-4">
      {section.title && (
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold" style={section.titleTextStyle as React.CSSProperties || {}}>{section.title}</h2>
          {section.enableTitleSpeech && (
            <button
              onMouseEnter={() => speakText(section.title)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Volume2Icon className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
      {section.description && (
        <div className="flex items-center justify-between">
          <p className="text-gray-600" style={section.descriptionTextStyle as React.CSSProperties || {}}>{section.description}</p>
          {section.enableDescriptionSpeech && (
            <button
              onMouseEnter={() => speakText(section.description)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Volume2Icon className="h-6 w-6" />
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="w-full px-4 sm:px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {section.mediaPosition === 'left' ? (
            <>
              <div className="w-full">{mediaContent}</div>
              <div className="w-full">{textContent}</div>
            </>
          ) : (
            <>
              <div className="w-full">{textContent}</div>
              <div className="w-full">{mediaContent}</div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}