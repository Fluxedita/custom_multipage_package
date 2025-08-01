import { TwoColumnTextSection as TwoColumnTextSectionType } from '../../types/sections';
import { Volume2Icon } from 'lucide-react';

interface TwoColumnTextSectionProps {
  section: TwoColumnTextSectionType;
  isEditMode: boolean;
  onSectionChange: (section: TwoColumnTextSectionType) => void;
  speakText: (text: string) => void;
}

export function TwoColumnTextSection({ section, isEditMode, onSectionChange, speakText }: TwoColumnTextSectionProps) {
  const handleLeftColumnChange = (leftColumn: string) => {
    onSectionChange({ ...section, leftColumn });
  };

  const handleRightColumnChange = (rightColumn: string) => {
    onSectionChange({ ...section, rightColumn });
  };

  const handleToggleLeftColumnSpeech = (enableLeftColumnSpeech: boolean) => {
    onSectionChange({ ...section, enableLeftColumnSpeech });
  };

  const handleToggleRightColumnSpeech = (enableRightColumnSpeech: boolean) => {
    onSectionChange({ ...section, enableRightColumnSpeech });
  };

  const handleCenterColumnsChange = (center: boolean) => {
    onSectionChange({ ...section, centerColumns: center });
  };

  const handleVerticalAlignChange = (align: 'start' | 'center' | 'end') => {
    onSectionChange({ ...section, verticalAlignColumns: align });
  };

  const handleHorizontalAlignChange = (align: 'start' | 'center' | 'end') => {
    onSectionChange({ ...section, horizontalAlignColumns: align });
  };

  const handleLeftStyleChange = (field: string, value: any) => {
    onSectionChange({ ...section, [field]: value });
  };
  const handleLeftNestedStyleChange = (parent: string, field: string, value: any) => {
    onSectionChange({ ...section, [parent]: { ...(section as any)[parent], [field]: value } });
  };
  const handleRightStyleChange = (field: string, value: any) => {
    onSectionChange({ ...section, [field]: value });
  };
  const handleRightNestedStyleChange = (parent: string, field: string, value: any) => {
    onSectionChange({ ...section, [parent]: { ...(section as any)[parent], [field]: value } });
  };

  const handleContainerPaddingChange = (padding: string) => {
    onSectionChange({ ...section, containerPadding: padding });
  };
  const handleContainerMarginChange = (margin: string) => {
    onSectionChange({ ...section, containerMargin: margin });
  };

  if (isEditMode) {
    return (
      <div className="relative">
        {isEditMode && (
          <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
            <strong>Section ID:</strong> {section.id}
            <span className="ml-2 text-gray-500">(Use this for nav links)</span>
          </div>
        )}
        <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="space-y-4">
            {/* Container controls */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700">Horizontal Padding (rem)</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={section.horizontalPadding ?? 0}
                  onChange={e => onSectionChange({ ...section, horizontalPadding: Number(e.target.value) })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                  placeholder="e.g. 2"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Vertical Padding (rem)</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  value={section.verticalPadding ?? 0}
                  onChange={e => onSectionChange({ ...section, verticalPadding: Number(e.target.value) })}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                  placeholder="e.g. 1.5"
                />
              </div>
            </div>
            <div className="col-span-2 flex items-center mt-2 gap-4">
              <input
                type="checkbox"
                id={`center-columns-${section.id}`}
                checked={!!section.centerColumns}
                onChange={e => handleCenterColumnsChange(e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor={`center-columns-${section.id}`} className="ml-2 block text-xs text-gray-700">
                Center Columns Horizontally
              </label>
              <label className="ml-6 block text-xs text-gray-700">Vertical Align Columns</label>
              <select
                value={section.verticalAlignColumns || 'start'}
                onChange={e => handleVerticalAlignChange(e.target.value as 'start' | 'center' | 'end')}
                className="ml-2 block border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
              >
                <option value="start">Top</option>
                <option value="center">Center</option>
                <option value="end">Bottom</option>
              </select>
              <label className="block text-xs font-medium text-gray-700">Horizontal Align Columns</label>
              <select
                value={section.horizontalAlignColumns || 'start'}
                onChange={e => handleHorizontalAlignChange(e.target.value as 'start' | 'center' | 'end')}
                className="ml-2 block border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
              >
                <option value="start">Left</option>
                <option value="center">Center</option>
                <option value="end">Right</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View mode
  const justifyClass = section.horizontalAlignColumns === 'center'
    ? 'justify-center'
    : section.horizontalAlignColumns === 'end'
    ? 'justify-end'
    : 'justify-start';
  const itemsClass = section.verticalAlignColumns === 'center'
    ? 'items-center'
    : section.verticalAlignColumns === 'end'
    ? 'items-end'
    : 'items-start';

  return (
    <div
      className="relative"
      style={{
        paddingLeft: `${section.horizontalPadding ?? 0}rem`,
        paddingRight: `${section.horizontalPadding ?? 0}rem`,
        paddingTop: `${section.verticalPadding ?? 0}rem`,
        paddingBottom: `${section.verticalPadding ?? 0}rem`,
      }}
    >
      <div
        className={`grid grid-cols-1 md:grid-cols-2 gap-8 ${itemsClass} ${justifyClass}`}
      >
        <div className="flex items-start justify-between">
          <div className="prose max-w-none">
            <div
              style={section.leftTextBackground ? {
                display: 'inline-block',
                background: section.leftTextBackground.color || '#000000',
                opacity: section.leftTextBackground.opacity ?? 0.5,
                borderRadius: section.leftTextBackground.borderRadius || '8px',
                padding: section.leftTextBackground.padding || '8px 16px',
                backdropFilter: section.leftTextBackground.blur ? `blur(${section.leftTextBackground.blur})` : undefined,
                WebkitBackdropFilter: section.leftTextBackground.blur ? `blur(${section.leftTextBackground.blur})` : undefined,
              } : {}}
              className="inline-block"
            >
              <span
                style={{
                  color: section.leftFontColor || '#000000',
                  fontSize: section.leftFontSize || '1.25rem',
                  fontStyle: section.leftFontStyle === 'italic' ? 'italic' : 'normal',
                  fontWeight: section.leftFontStyle === 'bold' ? 'bold' : 'normal',
                  textShadow: section.leftTextShadow
                    ? `${section.leftTextShadow.offsetX || '2px'} ${section.leftTextShadow.offsetY || '2px'} ${section.leftTextShadow.blur || '4px'} ${section.leftTextShadow.color || '#000000'}`
                    : undefined,
                  WebkitTextStroke: section.leftTextOutline
                    ? `${section.leftTextOutline.width || '2px'} ${section.leftTextOutline.color || '#ffffff'}`
                    : undefined,
                }}
              >
                {section.leftColumn}
              </span>
            </div>
          </div>
          {section.enableLeftColumnSpeech && (
            <button
              onMouseEnter={() => speakText(section.leftColumn)}
              className="text-gray-500 hover:text-gray-700 ml-4"
            >
              <Volume2Icon className="h-6 w-6" />
            </button>
          )}
        </div>

        <div className="flex items-start justify-between">
          <div className="prose max-w-none">
            <div
              style={section.rightTextBackground ? {
                display: 'inline-block',
                background: section.rightTextBackground.color || '#000000',
                opacity: section.rightTextBackground.opacity ?? 0.5,
                borderRadius: section.rightTextBackground.borderRadius || '8px',
                padding: section.rightTextBackground.padding || '8px 16px',
                backdropFilter: section.rightTextBackground.blur ? `blur(${section.rightTextBackground.blur})` : undefined,
                WebkitBackdropFilter: section.rightTextBackground.blur ? `blur(${section.rightTextBackground.blur})` : undefined,
              } : {}}
              className="inline-block"
            >
              <span
                style={{
                  color: section.rightFontColor || '#000000',
                  fontSize: section.rightFontSize || '1.25rem',
                  fontStyle: section.rightFontStyle === 'italic' ? 'italic' : 'normal',
                  fontWeight: section.rightFontStyle === 'bold' ? 'bold' : 'normal',
                  textShadow: section.rightTextShadow
                    ? `${section.rightTextShadow.offsetX || '2px'} ${section.rightTextShadow.offsetY || '2px'} ${section.rightTextShadow.blur || '4px'} ${section.rightTextShadow.color || '#000000'}`
                    : undefined,
                  WebkitTextStroke: section.rightTextOutline
                    ? `${section.rightTextOutline.width || '2px'} ${section.rightTextOutline.color || '#ffffff'}`
                    : undefined,
                }}
              >
                {section.rightColumn}
              </span>
            </div>
          </div>
          {section.enableRightColumnSpeech && (
            <button
              onMouseEnter={() => speakText(section.rightColumn)}
              className="text-gray-500 hover:text-gray-700 ml-4"
            >
              <Volume2Icon className="h-6 w-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
} 