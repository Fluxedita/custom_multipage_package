import { useState, ChangeEvent } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '@/components/ui/dialog';
import type { PrivacySectionType } from '@/app/custom_pages/types/sections';
import { TextStyleEditor, textStyleToCSS } from './TextStyleEditor';

interface PrivacySectionProps {
  section: PrivacySectionType;
  isEditMode: boolean;
  onSectionChange: (section: PrivacySectionType) => void;
}

export default function PrivacySection({ section, isEditMode, onSectionChange }: PrivacySectionProps) {
  const [showLightbox, setShowLightbox] = useState(false);

  const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
    onSectionChange({ ...section, content: e.target.value });
  };

  const handleTitleChange = (e: ChangeEvent<HTMLInputElement>) => {
    onSectionChange({ ...section, title: e.target.value });
  };

  return (
    <div className="my-8">
      {isEditMode ? (
        <>
          <TextStyleEditor
            value={section.titleTextStyle || {}}
            onChange={style => onSectionChange({ ...section, titleTextStyle: style })}
            label="Title Text Style"
          />
          <input
            className="w-full text-xl font-bold mb-2 border rounded p-2"
            type="text"
            value={section.title ?? 'Privacy Policy (Summary)'}
            onChange={handleTitleChange}
            placeholder="Section Title"
            style={textStyleToCSS(section.titleTextStyle)}
          />
          <TextStyleEditor
            value={section.textStyle || {}}
            onChange={style => onSectionChange({ ...section, textStyle: style })}
            label="Privacy Text Style"
          />
          <textarea
            className="w-full min-h-[120px] border rounded p-2 mt-2"
            value={section.content}
            onChange={handleChange}
            style={textStyleToCSS(section.textStyle)}
          />
        </>
      ) : (
        <>
          <h2 className="text-xl font-bold mb-2" style={textStyleToCSS(section.titleTextStyle)}>{section.title ?? 'Privacy Policy (Summary)'}</h2>
          <div
            className="prose max-w-none mb-4 line-clamp-3"
            style={textStyleToCSS(section.textStyle)}
            dangerouslySetInnerHTML={{ __html: section.content }}
          />
          <div className="flex justify-center">
            <button
              className="inline-block px-6 py-2 bg-blue-600 text-white font-semibold rounded-full shadow hover:bg-blue-700 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 mt-2"
              onClick={() => setShowLightbox(true)}
            >
              Read More
            </button>
          </div>
          {showLightbox && (
            <Dialog open={showLightbox} onOpenChange={setShowLightbox}>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle style={textStyleToCSS(section.titleTextStyle)}>{section.title ?? 'Privacy Policy'}</DialogTitle>
                </DialogHeader>
                <div
                  className="prose max-w-none max-h-[60vh] overflow-y-auto"
                  style={textStyleToCSS(section.textStyle)}
                  dangerouslySetInnerHTML={{ __html: section.content }}
                />
                <DialogClose asChild>
                  <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Close</button>
                </DialogClose>
              </DialogContent>
            </Dialog>
          )}
        </>
      )}
    </div>
  );
} 