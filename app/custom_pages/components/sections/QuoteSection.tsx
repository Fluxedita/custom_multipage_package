import { QuoteSection as QuoteSectionType } from '../../types/sections';
import { Volume2Icon } from 'lucide-react';
import { TextStyleEditor, TextStyle, textStyleToCSS } from './TextStyleEditor';
import { CSSProperties } from 'react';

interface QuoteSectionProps {
  section: QuoteSectionType;
  isEditMode: boolean;
  onSectionChange: (section: QuoteSectionType) => void;
  speakText: (text: string) => void;
}

export function QuoteSection({ section, isEditMode, onSectionChange, speakText }: QuoteSectionProps) {
  const handleTextChange = (text: string) => {
    onSectionChange({ ...section, text });
  };

  const handleAuthorChange = (author: string) => {
    onSectionChange({ ...section, author });
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    onSectionChange({ ...section, alignment });
  };

  const handleFontSizeChange = (fontSize: string) => {
    onSectionChange({ ...section, fontSize });
  };

  const handleFontColorChange = (fontColor: string) => {
    onSectionChange({ ...section, fontColor });
  };

  const handleTextStyleChange = (style: TextStyle) => {
    onSectionChange({ ...section, textStyle: { ...section.textStyle, ...style } });
  };

  const handleAuthorTextStyleChange = (style: TextStyle) => {
    onSectionChange({ ...section, authorTextStyle: { ...section.authorTextStyle, ...style } });
  };

  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Quote Text</label>
            <textarea
              value={section.text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              rows={3}
              placeholder="Enter quote text"
            />
            <TextStyleEditor
              value={section.textStyle || {}}
              onChange={handleTextStyleChange}
              label="Quote Text Style"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Author</label>
            <input
              type="text"
              value={section.author}
              onChange={(e) => handleAuthorChange(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Quote Author"
            />
            <TextStyleEditor
              value={section.authorTextStyle || {}}
              onChange={handleAuthorTextStyleChange}
              label="Author Text Style"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Alignment</label>
              <select
                value={section.alignment}
                onChange={(e) => handleAlignmentChange(e.target.value as 'left' | 'center' | 'right')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Font Size</label>
              <input
                type="text"
                value={section.fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., 18px"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Font Color</label>
            <input
              type="color"
              value={section.fontColor}
              onChange={(e) => handleFontColorChange(e.target.value)}
              className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {isEditMode && (
        <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
          <strong>Section ID:</strong> {section.id}
          <span className="ml-2 text-gray-500">(Use this for nav links)</span>
        </div>
      )}
      <div
        className="relative group"
        style={{
          textAlign: section.alignment,
        }}
      >
        <blockquote
          className="border-l-4 border-gray-300 pl-4 py-2"
          style={{
            ...textStyleToCSS(section.textStyle),
            textAlign: section.alignment,
          }}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="italic" style={textStyleToCSS(section.textStyle)}>{section.text}</p>
              {section.author && (
                <p className="mt-2 text-sm" style={textStyleToCSS(section.authorTextStyle)}>— {section.author}</p>
              )}
            </div>
            {section.enableSpeech && (
              <button
                onMouseEnter={() => speakText(`${section.text} by ${section.author}`)}
                className="text-gray-500 hover:text-gray-700 ml-2"
              >
                <Volume2Icon className="h-6 w-6" />
              </button>
            )}
          </div>
        </blockquote>
      </div>
    </div>
  );
} 