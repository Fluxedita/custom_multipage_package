import { CTASection as CTASectionType } from '../../types/sections';
import { Volume2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { TextStyleEditor, TextStyle, textStyleToCSS } from './TextStyleEditor';
import { Slider } from '@/components/ui/slider';

interface CTASectionProps {
  section: CTASectionType;
  isEditMode: boolean;
  onSectionChange: (section: CTASectionType) => void;
  speakText: (text: string) => void;
}

export function CTASection({ section, isEditMode, onSectionChange, speakText }: CTASectionProps) {
  const handleTitleChange = (title: string) => {
    onSectionChange({ ...section, title });
  };

  const handleDescriptionChange = (description: string) => {
    onSectionChange({ ...section, description });
  };

  const handleButtonTextChange = (buttonText: string) => {
    onSectionChange({ ...section, buttonText });
  };

  const handleButtonUrlChange = (buttonUrl: string) => {
    onSectionChange({ ...section, buttonUrl });
  };

  const handleBackgroundColorChange = (backgroundColor: string) => {
    onSectionChange({ ...section, backgroundColor });
  };

  const handleTextColorChange = (textColor: string) => {
    onSectionChange({ ...section, textColor });
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

  const handlePaddingTopChange = (value: number[]) => {
    onSectionChange({ ...section, paddingTop: value[0] });
  };

  const handlePaddingBottomChange = (value: number[]) => {
    onSectionChange({ ...section, paddingBottom: value[0] });
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
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                placeholder="CTA Title"
              />
              <TextStyleEditor
                value={section.titleTextStyle || {}}
                onChange={handleTitleTextStyleChange}
                label="Title Text Style"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={`cta-title-speech-${section.id}`}
                  checked={section.enableTitleSpeech}
                  onChange={(e) => handleToggleTitleSpeech(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`cta-title-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
                  Enable TTS for title
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea
                value={section.description}
                onChange={(e) => handleDescriptionChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-black"
                rows={3}
                placeholder="CTA Description"
              />
              <TextStyleEditor
                value={section.descriptionTextStyle || {}}
                onChange={handleDescriptionTextStyleChange}
                label="Description Text Style"
              />
              <div className="mt-2 flex items-center">
                <input
                  type="checkbox"
                  id={`cta-description-speech-${section.id}`}
                  checked={section.enableDescriptionSpeech}
                  onChange={(e) => handleToggleDescriptionSpeech(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={`cta-description-speech-${section.id}`} className="ml-2 block text-sm text-gray-900">
                  Enable TTS for description
                </label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Button Text</label>
                <input
                  type="text"
                  value={section.buttonText}
                  onChange={(e) => handleButtonTextChange(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Button Text"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Button URL</label>
                <input
                  type="text"
                  value={section.buttonUrl}
                  onChange={(e) => handleButtonUrlChange(e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Button URL"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Background Color</label>
                <input
                  type="color"
                  value={section.backgroundColor}
                  onChange={(e) => handleBackgroundColorChange(e.target.value)}
                  className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Text Color</label>
                <input
                  type="color"
                  value={section.textColor}
                  onChange={(e) => handleTextColorChange(e.target.value)}
                  className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Top Padding ({section.paddingTop || 0}rem)
                </label>
                <Slider
                  value={[section.paddingTop || 0]}
                  onValueChange={handlePaddingTopChange}
                  max={20}
                  step={1}
                  className="mt-2"
                />
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
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative group p-8 rounded-lg"
      style={{
        backgroundColor: section.backgroundColor,
        color: section.textColor,
        paddingTop: section.paddingTop ? `${section.paddingTop}rem` : undefined,
        paddingBottom: section.paddingBottom ? `${section.paddingBottom}rem` : undefined,
        paddingLeft: `${section.horizontalPadding ?? 0}rem`,
        paddingRight: `${section.horizontalPadding ?? 0}rem`,
        marginTop: section.verticalPadding ? `${section.verticalPadding}rem` : undefined,
        marginBottom: section.verticalPadding ? `${section.verticalPadding}rem` : undefined,
      }}
    >
      <div className="max-w-3xl mx-auto text-center">
        {section.title && (
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-3xl font-bold" style={textStyleToCSS(section.titleTextStyle)}>{section.title}</h2>
            {section.enableTitleSpeech && (
              <button
                onMouseEnter={() => speakText(section.title)}
                className="text-current hover:opacity-80"
              >
                <Volume2Icon className="h-6 w-6" />
              </button>
            )}
          </div>
        )}
        {section.description && (
          <div className="flex items-center justify-between mb-8">
            <p className="text-lg" style={textStyleToCSS(section.descriptionTextStyle)}>{section.description}</p>
            {section.enableDescriptionSpeech && (
              <button
                onMouseEnter={() => speakText(section.description)}
                className="text-current hover:opacity-80"
              >
                <Volume2Icon className="h-6 w-6" />
              </button>
            )}
          </div>
        )}
        {section.buttonText && section.buttonUrl && (
          <Button
            asChild
            className="bg-white text-gray-900 hover:bg-gray-100"
          >
            <a
              href={section.buttonUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              {section.buttonText} <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
        )}
      </div>
    </div>
  );
} 