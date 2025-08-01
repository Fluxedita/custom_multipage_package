import { DividerSection as DividerSectionType } from '../../types/sections';

interface DividerSectionProps {
  section: DividerSectionType;
  isEditMode: boolean;
  onSectionChange: (section: DividerSectionType) => void;
  idx: number;
  renderSectionControls: (idx: number) => React.ReactNode;
  onDuplicate?: (duplicatedSection: DividerSectionType) => void;
}

export function DividerSection({ section, isEditMode, onSectionChange, idx, renderSectionControls, onDuplicate }: DividerSectionProps) {
  const handleStyleChange = (style: 'solid' | 'dashed' | 'dotted') => {
    onSectionChange({ ...section, style });
  };

  const handleColorChange = (color: string) => {
    onSectionChange({ ...section, color });
  };

  const handleThicknessChange = (thickness: string) => {
    onSectionChange({ ...section, thickness });
  };

  const handleWidthChange = (width: string) => {
    onSectionChange({ ...section, width });
  };

  const handleMarginChange = (margin: string) => {
    onSectionChange({ ...section, margin });
  };

  const handleAlignmentChange = (alignment: 'left' | 'center' | 'right') => {
    onSectionChange({ ...section, alignment });
  };

  const handleDuplicate = () => {
    if (onDuplicate) {
      const newSection = { ...section, id: (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)) };
      onDuplicate(newSection);
    }
  };

  if (isEditMode) {
    return (
      <div className="p-4 bg-white rounded-lg shadow-sm border border-gray-200">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Style</label>
              <select
                value={section.style}
                onChange={(e) => handleStyleChange(e.target.value as 'solid' | 'dashed' | 'dotted')}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
              >
                <option value="solid">Solid</option>
                <option value="dashed">Dashed</option>
                <option value="dotted">Dotted</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Color</label>
              <input
                type="color"
                value={section.color}
                onChange={(e) => handleColorChange(e.target.value)}
                className="mt-1 block w-full h-10 border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Thickness</label>
              <input
                type="text"
                value={section.thickness}
                onChange={(e) => handleThicknessChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., 1px"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Width</label>
              <input
                type="text"
                value={section.width}
                onChange={(e) => handleWidthChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., 100%"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Margin</label>
              <input
                type="text"
                value={section.margin}
                onChange={(e) => handleMarginChange(e.target.value)}
                className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                placeholder="e.g., 2rem"
              />
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
          <div className="flex justify-end mt-4">
            <button
              type="button"
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-xs font-medium"
              onClick={handleDuplicate}
            >
              Duplicate
            </button>
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
        className="my-8"
        style={{
          paddingLeft: `${section.horizontalPadding ?? 0}rem`,
          paddingRight: `${section.horizontalPadding ?? 0}rem`,
          paddingTop: `${section.verticalPadding ?? 0}rem`,
          paddingBottom: `${section.verticalPadding ?? 0}rem`,
          margin: section.margin,
        }}
      >
        <hr
          style={{
            borderStyle: section.style,
            borderColor: section.color,
            borderWidth: section.thickness,
            width: section.width,
            margin: '0 auto',
          }}
        />
      </div>
    </div>
  );
} 