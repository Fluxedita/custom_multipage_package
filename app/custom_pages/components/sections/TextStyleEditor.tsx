import React, { useState } from 'react';

export const defaultTextStyle = {
  fontColor: '#FFFFFF',
  fontStyle: 'normal' as 'normal',
  fontSize: '1.25rem',
  fontFamily: 'sans-serif',
  textShadow: {
    color: 'rgba(0,0,0,0.4)',
    offsetX: '1px',
    offsetY: '1px',
    blur: '2px',
  },
  textOutline: {
    color: '#000000',
    width: '0.5px',
  },
  textBackground: {
    color: 'transparent',
    opacity: 0,
    blur: '0px',
    borderRadius: '0px',
    padding: '0px',
  },
};

export interface TextStyle {
  fontStyle?: 'normal' | 'italic' | 'bold';
  fontColor?: string;
  fontSize?: string;
  fontFamily?: string;
  textShadow?: {
    color: string;
    offsetX: string;
    offsetY: string;
    blur: string;
  };
  textOutline?: {
    color: string;
    width: string;
  };
  textBackground?: {
    color: string;
    opacity: number;
    blur: string;
    borderRadius: string;
    padding: string;
  };
  margin?: string;
}

interface TextStyleEditorProps {
  value: TextStyle;
  onChange: (value: TextStyle) => void;
  label?: string;
  showFontControls?: boolean;
  showShadowControls?: boolean;
  showOutlineControls?: boolean;
  showBackgroundControls?: boolean;
}

const fontOptions = [
  { name: 'Sans Serif', value: 'sans-serif' },
  { name: 'Serif', value: 'serif' },
  { name: 'Roboto', value: 'Roboto, sans-serif' },
  { name: 'Merriweather', value: 'Merriweather, serif' },
  { name: 'Courier New', value: 'Courier New, monospace' },
  { name: 'Monospace', value: 'monospace' },
];

export const TextStyleEditor: React.FC<TextStyleEditorProps> = ({
  value,
  onChange,
  label = 'Text Style',
  showFontControls = true,
  showShadowControls = true,
  showOutlineControls = true,
  showBackgroundControls = true,
}) => {
  const [open, setOpen] = useState(false);
  const mergedValue = { ...defaultTextStyle, ...value };
  if (defaultTextStyle.textShadow || value.textShadow) {
    mergedValue.textShadow = { ...defaultTextStyle.textShadow, ...value.textShadow };
  }
  if (defaultTextStyle.textOutline || value.textOutline) {
    mergedValue.textOutline = { ...defaultTextStyle.textOutline, ...value.textOutline };
  }
  if (defaultTextStyle.textBackground || value.textBackground) {
    mergedValue.textBackground = { ...defaultTextStyle.textBackground, ...value.textBackground };
  }

  const handleChange = (field: keyof TextStyle, val: any) => {
    onChange({ ...mergedValue, [field]: val });
  };

  const handleNestedChange = (parent: keyof TextStyle, field: string, val: any) => {
    onChange({ ...mergedValue, [parent]: { ...(mergedValue[parent] as any), [field]: val } });
  };

  const handleReset = () => {
    onChange(defaultTextStyle);
  };

  return (
    <div className="space-y-2">
      <button
        type="button"
        className="w-full flex items-center justify-between px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded text-sm font-medium border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span>{label}</span>
        <span className={`transition-transform ${open ? 'rotate-90' : ''}`}>▶</span>
      </button>
      {open && (
        <div className="pt-2 space-y-2 border-t border-gray-200">
          <button
            type="button"
            className="mb-2 px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-medium border border-blue-200"
            onClick={handleReset}
          >
            Reset to Default
          </button>

          {showFontControls && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">Font Family</label>
                <select
                  value={mergedValue.fontFamily || 'sans-serif'}
                  onChange={(e) => handleChange('fontFamily', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                >
                  {fontOptions.map((font) => (
                    <option
                      key={font.value}
                      value={font.value}
                      style={{ fontFamily: font.value }}
                    >
                      {font.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Font Style</label>
                <select
                  value={mergedValue.fontStyle || 'normal'}
                  onChange={(e) => handleChange('fontStyle', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                >
                  <option value="normal">Normal</option>
                  <option value="italic">Italic</option>
                  <option value="bold">Bold</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Font Color</label>
                <input
                  type="color"
                  value={mergedValue.fontColor || '#000000'}
                  onChange={(e) => handleChange('fontColor', e.target.value)}
                  className="mt-1 block w-full h-8 border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Font Size</label>
                <input
                  type="text"
                  value={mergedValue.fontSize || '1.25rem'}
                  onChange={(e) => handleChange('fontSize', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                  placeholder="e.g. 1.25rem, 20px"
                />
              </div>
            </div>
          )}
          {showShadowControls && (
            <div className="grid grid-cols-4 gap-2 mt-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">Shadow Color</label>
                <input
                  type="color"
                  value={mergedValue.textShadow?.color || '#000000'}
                  onChange={e => handleNestedChange('textShadow', 'color', e.target.value)}
                  className="mt-1 block w-full h-8 border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Offset X</label>
                <input
                  type="text"
                  value={mergedValue.textShadow?.offsetX || '2px'}
                  onChange={e => handleNestedChange('textShadow', 'offsetX', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                  placeholder="e.g. 2px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Offset Y</label>
                <input
                  type="text"
                  value={mergedValue.textShadow?.offsetY || '2px'}
                  onChange={e => handleNestedChange('textShadow', 'offsetY', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                  placeholder="e.g. 2px"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Blur</label>
                <input
                  type="text"
                  value={mergedValue.textShadow?.blur || '4px'}
                  onChange={e => handleNestedChange('textShadow', 'blur', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                  placeholder="e.g. 4px"
                />
              </div>
            </div>
          )}
          {showOutlineControls && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">Outline Color</label>
                <input
                  type="color"
                  value={mergedValue.textOutline?.color || '#ffffff'}
                  onChange={e => handleNestedChange('textOutline', 'color', e.target.value)}
                  className="mt-1 block w-full h-8 border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">Outline Width</label>
                <input
                  type="text"
                  value={mergedValue.textOutline?.width || '2px'}
                  onChange={e => handleNestedChange('textOutline', 'width', e.target.value)}
                  className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-xs"
                  placeholder="e.g. 2px"
                />
              </div>
            </div>
          )}
          {showBackgroundControls && (
            <div className="grid grid-cols-2 gap-2 mt-2">
              <div>
                <label className="block text-xs font-medium text-gray-700">BG Color</label>
                <input
                  type="color"
                  value={mergedValue.textBackground?.color || 'transparent'}
                  onChange={e => handleNestedChange('textBackground', 'color', e.target.value)}
                  className="mt-1 block w-full h-8 border-gray-300 rounded"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700">BG Opacity</label>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={mergedValue.textBackground?.opacity || 0}
                  onChange={e => handleNestedChange('textBackground', 'opacity', parseFloat(e.target.value))}
                  className="mt-1 block w-full"
                />
              </div>
              <div className="col-span-2 grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-xs font-medium text-gray-700">BG Blur</label>
                  <input
                    type="text"
                    value={mergedValue.textBackground?.blur || '0px'}
                    onChange={e => handleNestedChange('textBackground', 'blur', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs"
                    placeholder="e.g. 4px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">BG Radius</label>
                  <input
                    type="text"
                    value={mergedValue.textBackground?.borderRadius || '0px'}
                    onChange={e => handleNestedChange('textBackground', 'borderRadius', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs"
                    placeholder="e.g. 8px"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700">BG Padding</label>
                  <input
                    type="text"
                    value={mergedValue.textBackground?.padding || '0px'}
                    onChange={e => handleNestedChange('textBackground', 'padding', e.target.value)}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm sm:text-xs"
                    placeholder="e.g. 1rem"
                  />
                </div>
              </div>
            </div>
          )}
          {/* Margin control */}
          <div className="mb-2">
            <label className="block text-xs font-medium text-gray-700">Margin (CSS)</label>
            <input
              type="text"
              value={value.margin || ''}
              onChange={e => onChange({ ...value, margin: e.target.value })}
              className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
              placeholder="e.g., 2rem 0"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export function textStyleToCSS(style?: TextStyle): React.CSSProperties {
  if (!style) return {};
  const css: React.CSSProperties = {};
  if (style.fontColor) css.color = style.fontColor;
  if (style.fontSize) css.fontSize = style.fontSize;
  if (style.fontStyle === 'bold') {
    css.fontWeight = 'bold';
    css.fontStyle = 'normal';
  } else {
    css.fontWeight = 'normal';
    if (style.fontStyle) css.fontStyle = style.fontStyle;
  }
  if (style.fontFamily) css.fontFamily = style.fontFamily;
  if (style.margin) css.margin = style.margin;
  if (style.textShadow) {
    css.textShadow = `${style.textShadow.offsetX || '2px'} ${style.textShadow.offsetY || '2px'} ${style.textShadow.blur || '4px'} ${style.textShadow.color || '#000000'}`;
  }
  if (style.textOutline) {
    // @ts-ignore
    css.WebkitTextStroke = `${style.textOutline.width || '2px'} ${style.textOutline.color || '#ffffff'}`;
  }
  if (style.textBackground) {
    css.background = style.textBackground.color;
    css.opacity = style.textBackground.opacity;
    css.borderRadius = style.textBackground.borderRadius;
    css.padding = style.textBackground.padding;
    if (style.textBackground.blur) {
      css.backdropFilter = `blur(${style.textBackground.blur})`;
      // @ts-ignore
      css.WebkitBackdropFilter = `blur(${style.textBackground.blur})`;
    }
  }
  return css;
} 