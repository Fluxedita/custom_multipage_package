import { MediaTextSection as MediaTextSectionType } from '../../types/sections';
import { Volume2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { TextStyleEditor, TextStyle, textStyleToCSS } from './TextStyleEditor';

interface MediaTextSectionProps {
  section: MediaTextSectionType;
  isEditMode: boolean;
  onSectionChange: (section: MediaTextSectionType) => void;
  speakText: (text: string) => void;
  onMediaSelect: () => void;
}

export function MediaTextSection({ 
  section, 
  isEditMode, 
  onSectionChange, 
  speakText,
  onMediaSelect 
}: MediaTextSectionProps) {
  const handleTitleChange = (title: string) => {
    onSectionChange({ ...section, title });
  };

  const handleDescriptionChange = (description: string) => {
    onSectionChange({ ...section, description });
  };

  const handleMediaChange = (mediaUrl: string, mediaType: 'image' | 'video') => {
    onSectionChange({ ...section, mediaUrl, mediaType });
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
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className={section.type === 'media-text-right' ? 'order-2 md:w-1/2' : 'order-1 md:w-1/2'}>
        {section.mediaUrl && (
          <div className="relative aspect-video">
            {section.mediaType === 'video' ? (
              <video
                src={section.mediaUrl}
                className="w-full h-full object-cover rounded-lg"
                controls
              />
            ) : (
              <img
                src={section.mediaUrl}
                alt="Media"
                className="w-full h-full object-cover rounded-lg"
              />
            )}
          </div>
        )}
      </div>
      <div className={section.type === 'media-text-right' ? 'order-1 md:w-1/2' : 'order-2 md:w-1/2'}>
        {section.title && (
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold" style={textStyleToCSS(section.titleTextStyle)}>{section.title}</h2>
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
            <p className="text-gray-600" style={textStyleToCSS(section.descriptionTextStyle)}>{section.description}</p>
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
    </div>
  );
} 