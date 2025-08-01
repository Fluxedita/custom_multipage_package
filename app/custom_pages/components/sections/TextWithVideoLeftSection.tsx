import { Button } from "@/components/ui/button";
import { PlayCircle } from "lucide-react";
import React, { useState } from "react";
import type { TextWithVideoLeftSection as TextWithVideoLeftSectionType } from "@/app/custom_pages/types/sections";
import { MediaLightbox } from "@/app/custom_pages/components/sections/MediaLightbox";

interface Props {
  section: TextWithVideoLeftSectionType & { imageSrc?: string; imageAlt?: string };
  isEditMode: boolean;
  onSectionChange: (section: TextWithVideoLeftSectionType) => void;
}

export function TextWithVideoLeftSection({ section, isEditMode, onSectionChange }: Props) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  if (section.visible === false) return null;

  if (isEditMode) {
    return (
      <div className="border rounded-lg p-4 px-16 mb-4 bg-white">
        <div className="mb-2 p-2 bg-yellow-100 text-yellow-800 rounded text-xs">
          <strong>Section ID:</strong> {section.id}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            {/* Padding Controls */}
            <div className="flex gap-4 mb-4">
              <div>
                <label className="block text-xs font-medium mb-1">Horizontal Padding (rem)</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  className="w-20 border rounded px-2 py-1"
                  value={section.horizontalPadding ?? 0}
                  onChange={e => onSectionChange({ ...section, horizontalPadding: Number(e.target.value) })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Vertical Padding (rem)</label>
                <input
                  type="number"
                  min={0}
                  step={0.25}
                  className="w-20 border rounded px-2 py-1"
                  value={section.verticalPadding ?? 0}
                  onChange={e => onSectionChange({ ...section, verticalPadding: Number(e.target.value) })}
                />
              </div>
            </div>
            <label className="block text-sm font-medium mb-1">Tagline</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.tagline}
              onChange={e => onSectionChange({ ...section, tagline: e.target.value })}
            />
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.title}
              onChange={e => onSectionChange({ ...section, title: e.target.value })}
            />
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.description}
              onChange={e => onSectionChange({ ...section, description: e.target.value })}
              rows={3}
            />
            <label className="block text-sm font-medium mb-1">Button Text</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.buttonText || ''}
              onChange={e => onSectionChange({ ...section, buttonText: e.target.value })}
              placeholder="Watch Tutorial"
            />
            <label className="block text-sm font-medium mb-1">YouTube Video ID</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.videoId}
              onChange={e => onSectionChange({ ...section, videoId: e.target.value })}
              placeholder="e.g. dQw4w9WgXcQ"
            />
          </div>
          <div className="flex flex-col items-center justify-center">
            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-xl bg-gray-100">
              {section.videoId ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${section.videoId}?rel=0&showinfo=0`}
                  title={section.title}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">Video preview</div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div
      className="flex flex-col md:flex-row items-center gap-12 mb-4 last:mb-0 px-16"
      style={{
        paddingLeft: `${section.horizontalPadding ?? 0}rem`,
        paddingRight: `${section.horizontalPadding ?? 0}rem`,
        paddingTop: `${section.verticalPadding ?? 0}rem`,
        paddingBottom: `${section.verticalPadding ?? 0}rem`,
      }}
    >
      {/* Media Placeholder - clickable for lightbox */}
      <div className="md:w-1/2 w-full rounded-xl overflow-hidden shadow-xl">
        {section.videoId ? (
          <div onClick={() => setLightboxOpen(true)} className="cursor-pointer">
            <iframe
              className="w-full h-full aspect-video"
              src={`https://www.youtube.com/embed/${section.videoId}`}
              title={section.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : section.imageSrc ? (
          <img
            src={section.imageSrc}
            alt={section.imageAlt || section.title}
            className="w-full h-full object-cover cursor-pointer"
            onClick={() => setLightboxOpen(true)}
          />
        ) : null}
      </div>
      {/* Content */}
      <div className="md:w-1/2">
        <div className="flex items-center mb-4">
          <div className="p-2 rounded-lg bg-blue-50 mr-3">
            <PlayCircle className="w-6 h-6 text-blue-600" />
          </div>
          <span className="text-sm font-medium text-blue-600">{section.tagline}</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{section.title}</h2>
        <p className="text-gray-600 text-lg mb-6">{section.description}</p>
        {section.buttonText && (section.videoId || section.imageSrc) && (
          <Button variant="outline" className="group" onClick={() => setLightboxOpen(true)}>
            <PlayCircle className="w-5 h-5 mr-2 group-hover:text-blue-600 transition-colors" />
            {section.buttonText}
          </Button>
        )}
      </div>
      {lightboxOpen && (
        <MediaLightbox
          open={lightboxOpen}
          mediaUrl={section.videoId ? `https://www.youtube.com/embed/${section.videoId}` : section.imageSrc || ''}
          mediaType={section.videoId ? 'video' : 'image'}
          onClose={() => setLightboxOpen(false)}
        />
      )}
    </div>
  );
} 