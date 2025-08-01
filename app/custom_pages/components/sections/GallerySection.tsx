import { GallerySection as GallerySectionType } from '../../types/sections';
import { Volume2Icon } from 'lucide-react';
import Image from 'next/image';
import { TextStyleEditor, TextStyle } from './TextStyleEditor';

interface GallerySectionProps {
  section: GallerySectionType;
  isEditMode: boolean;
  onSectionChange: (section: GallerySectionType) => void;
  speakText: (text: string) => void;
}

export function GallerySection({ section, isEditMode, onSectionChange, speakText }: GallerySectionProps) {
  const handleTitleChange = (title: string) => {
    onSectionChange({ ...section, title });
  };

  const handleDescriptionChange = (description: string) => {
    onSectionChange({ ...section, description });
  };

  const handleImagesChange = (images: { url: string; alt: string }[]) => {
    onSectionChange({ ...section, images });
  };

  const handleLayoutChange = (layout: 'grid' | 'masonry' | 'carousel') => {
    onSectionChange({ ...section, layout });
  };

  const handleBackgroundSelect = (url: string, type: 'image' | 'video' = 'image') => {
    onSectionChange({ ...section, backgroundImage: url });
  };

  const handleAlignmentChange = (align: 'left' | 'center' | 'right') => {
    onSectionChange({ ...section, horizontalAlign: align });
  };

  const handleToggleTitleSpeech = (enableTitleSpeech: boolean) => {
    onSectionChange({ ...section, enableTitleSpeech });
  };

  const handleToggleDescriptionSpeech = (enableDescriptionSpeech: boolean) => {
    onSectionChange({ ...section, enableDescriptionSpeech });
  };

  const handleToggleImageSpeech = (enableImageSpeech: boolean) => {
    onSectionChange({ ...section, enableImageSpeech });
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
                placeholder="Gallery Title"
              />
              <TextStyleEditor
                value={section.titleTextStyle || {}}
                onChange={handleTitleTextStyleChange}
                label="Title Text Style"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={`gallery-title-speech-${section.id}`}
                  checked={section.enableTitleSpeech}
                  onChange={(e) => handleToggleTitleSpeech(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`gallery-title-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
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
                placeholder="Gallery Description"
              />
              <TextStyleEditor
                value={section.descriptionTextStyle || {}}
                onChange={handleDescriptionTextStyleChange}
                label="Description Text Style"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={`gallery-description-speech-${section.id}`}
                  checked={section.enableDescriptionSpeech}
                  onChange={(e) => handleToggleDescriptionSpeech(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`gallery-description-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
                  Enable TTS for description
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Layout</label>
              <select
                value={section.layout}
                onChange={(e) => handleLayoutChange(e.target.value as 'grid' | 'masonry' | 'carousel')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="grid">Grid</option>
                <option value="masonry">Masonry</option>
                <option value="carousel">Carousel</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Images</label>
              <div className="mt-2 space-y-4">
                {section.images.map((image, index) => (
                  <div key={index} className="flex items-center space-x-4">
                    <input
                      type="text"
                      value={image.url}
                      onChange={(e) => {
                        const newImages = [...section.images];
                        newImages[index] = { ...image, url: e.target.value };
                        handleImagesChange(newImages);
                      }}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Image URL"
                    />
                    <input
                      type="text"
                      value={image.alt}
                      onChange={(e) => {
                        const newImages = [...section.images];
                        newImages[index] = { ...image, alt: e.target.value };
                        handleImagesChange(newImages);
                      }}
                      className="flex-1 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Image Alt Text"
                    />
                    <button
                      onClick={() => {
                        const newImages = section.images.filter((_, i) => i !== index);
                        handleImagesChange(newImages);
                      }}
                      className="text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => {
                    handleImagesChange([...section.images, { url: '', alt: '' }]);
                  }}
                  className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Add Image
                </button>
              </div>
            </div>

            <div className="mt-2 flex items-center">
              <input
                type="checkbox"
                id={`gallery-image-speech-${section.id}`}
                checked={section.enableImageSpeech}
                onChange={(e) => handleToggleImageSpeech(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`gallery-image-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
                Enable TTS for image descriptions
              </label>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const renderGallery = () => {
    switch (section.layout) {
      case 'grid':
        return (
          <div className="w-full max-w-[2000px] mx-auto px-4 sm:px-6">
            <div 
              className={`grid gap-4 w-full ${
                section.images.length === 1 ? 'grid-cols-1' : 
                section.images.length === 2 ? 'grid-cols-1 md:grid-cols-2' : 
                'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'
              } ${
                section.horizontalAlign === 'center' ? 'justify-items-center' :
                section.horizontalAlign === 'right' ? 'justify-items-end' : 'justify-items-start'
              }`}
            >
              {section.images.map((image, index) => (
                <div 
                  key={index}
                  className={`relative aspect-square ${
                    section.horizontalAlign === 'center' ? 'mx-auto' : 
                    section.horizontalAlign === 'right' ? 'ml-auto' : 'mr-auto'
                  }`}
                  style={{
                    width: section.images.length === 1 ? '100%' : '100%',
                    maxWidth: section.images.length === 1 ? '800px' : '100%'
                  }}
                >
                  <Image
                    src={image.url}
                    alt={image.alt}
                    fill
                    className="object-cover rounded-lg"
                  />
                  {section.enableImageSpeech && (
                    <button
                      onMouseEnter={() => speakText(image.alt)}
                      className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75"
                    >
                      <Volume2Icon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );

      case 'carousel':
        return (
          <div className="relative">
            <div className="overflow-x-auto">
              <div className="flex space-x-4 pb-4">
                {section.images.map((image, index) => (
                  <div key={index} className="relative flex-none w-64 aspect-square">
                    <Image
                      src={image.url}
                      alt={image.alt}
                      fill
                      className="object-cover rounded-lg"
                    />
                    {section.enableImageSpeech && (
                      <button
                        onMouseEnter={() => speakText(image.alt)}
                        className="absolute top-2 right-2 text-white bg-black bg-opacity-50 rounded-full p-1 hover:bg-opacity-75"
                      >
                        <Volume2Icon className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="space-y-4">
      {section.title && (
        <div className="flex items-center justify-between">
          <div className="flex-1">
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
          {isEditMode && (
            <div className="flex items-center gap-2 bg-gray-100 p-1 rounded-md ml-4">
              <span className="text-xs text-gray-500 px-2">Align:</span>
              {(['left', 'center', 'right'] as const).map((align) => (
                <button
                  key={align}
                  className={`p-1 rounded ${section.horizontalAlign === align ? 'bg-white shadow' : 'hover:bg-gray-200'} w-8 h-8 flex items-center justify-center`}
                  onClick={() => handleAlignmentChange(align)}
                >
                  {align === 'left' && '◧'}
                  {align === 'center' && '◨'}
                  {align === 'right' && '◨'}
                </button>
              ))}
            </div>
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

      {renderGallery()}
    </div>
  );
} 