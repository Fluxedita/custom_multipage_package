import { HeadingSection as HeadingSectionType } from '../../types/sections';
import { Volume2Icon } from 'lucide-react';
import { TextStyleEditor, TextStyle, textStyleToCSS } from './TextStyleEditor';
import { CSSProperties } from 'react';

interface HeadingSectionProps {
  section: HeadingSectionType;
  isEditMode: boolean;
  onSectionChange: (section: HeadingSectionType) => void;
  speakText: (text: string) => void;
  idx: number;
  renderSectionControls: (section: HeadingSectionType, idx: number) => React.ReactNode;
}

export function HeadingSection({ section, isEditMode, onSectionChange, speakText, idx, renderSectionControls }: HeadingSectionProps) {
  const handleTextChange = (text: string) => {
    onSectionChange({ ...section, text });
  };

  const handleLevelChange = (level: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6') => {
    onSectionChange({ ...section, level });
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

  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Text</label>
            <input
              type="text"
              value={section.text}
              onChange={(e) => handleTextChange(e.target.value)}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="Heading Text"
            />
            <TextStyleEditor
              value={section.textStyle || {}}
              onChange={handleTextStyleChange}
              label="Heading Text Style"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Level</label>
              <select
                value={section.level}
                onChange={(e) => handleLevelChange(e.target.value as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
              </select>
            </div>

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
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Font Size</label>
              <input
                type="text"
                value={section.fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., 24px"
              />
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
      </div>
    );
  }

  const renderHeading = () => {
    const style = textStyleToCSS(section.textStyle);
    switch (section.level) {
      case 'h1':
        return <h1 style={style}>{section.text}</h1>;
      case 'h2':
        return <h2 style={style}>{section.text}</h2>;
      case 'h3':
        return <h3 style={style}>{section.text}</h3>;
      case 'h4':
        return <h4 style={style}>{section.text}</h4>;
      case 'h5':
        return <h5 style={style}>{section.text}</h5>;
      case 'h6':
        return <h6 style={style}>{section.text}</h6>;
      default:
        return <h2 style={style}>{section.text}</h2>;
    }
  };

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
        <div className="flex items-center justify-between">
          {renderHeading()}
          {section.enableSpeech && (
            <button
              onMouseEnter={() => speakText(section.text)}
              className="text-gray-500 hover:text-gray-700 ml-2"
            >
              <Volume2Icon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 