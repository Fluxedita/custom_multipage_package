import { EditableTitle } from '@/components/ui/EditableTitle';
import { TextStyleEditor, textStyleToCSS, TextStyle } from '@/app/custom_pages/components/sections/TextStyleEditor';

const ALIGNMENT_CLASSES = {
  left: 'text-left',
  center: 'text-center',
  right: 'text-right',
};

export default function EditableTitleSection({
  section,
  isEditMode,
  onChange,
}: {
  section: { id: string; title: string; slug: string; titleTextStyle?: TextStyle; alignment?: 'left' | 'center' | 'right' };
  isEditMode: boolean;
  onChange: (update: Partial<typeof section>) => void;
}) {
  const alignment = section.alignment || 'left';
  return (
    <section id={section.slug} className="py-8">
      {isEditMode && (
        <div className="mb-4 max-w-md space-y-2">
          <TextStyleEditor
            value={section.titleTextStyle || {}}
            onChange={style => onChange({ titleTextStyle: style })}
            label="Section Title Style"
          />
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Alignment</label>
            <div className="flex gap-2">
              {(['left', 'center', 'right'] as const).map(opt => (
                <button
                  key={opt}
                  type="button"
                  className={`px-3 py-1 rounded border text-xs font-medium ${alignment === opt ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 border-gray-300'}`}
                  onClick={() => onChange({ alignment: opt })}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
      <EditableTitle
        value={section.title}
        onChangeAction={newTitle => {
          // Generate slug from newTitle
          const slug = newTitle
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '');
          onChange({ title: newTitle, slug });
        }}
        isEditMode={isEditMode}
        className={`text-2xl font-bold ${ALIGNMENT_CLASSES[alignment]}`}
        placeholder="Section Title"
        style={textStyleToCSS(section.titleTextStyle)}
      />
    </section>
  );
}
