import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight } from "lucide-react";
import React, { useState } from "react";
import type { ProductPackageRightSection as ProductPackageRightSectionType } from "@/app/custom_pages/types/sections";
import MediaLibrary from "@/components/media/MediaLibrary";
import { MediaLightbox } from "@/app/custom_pages/components/sections/MediaLightbox";

interface Props {
  section: ProductPackageRightSectionType;
  isEditMode: boolean;
  onSectionChangeAction: (section: ProductPackageRightSectionType) => void;
}

export function ProductPackageRightSection({ section, isEditMode, onSectionChangeAction }: Props) {
  const [mediaDialogOpen, setMediaDialogOpen] = useState(false);
  const [mediaVideoDialogOpen, setMediaVideoDialogOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  if (section.visible === false) return null;

  // Helper for comma-separated lists
  const handleListChange = (field: 'features' | 'perfectFor', value: string) => {
    onSectionChangeAction({
      ...section,
      [field]: value.split(',').map(s => s.trim()).filter(Boolean)
    });
  };

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
                  onChange={e => onSectionChangeAction({ ...section, horizontalPadding: Number(e.target.value) })}
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
                  onChange={e => onSectionChangeAction({ ...section, verticalPadding: Number(e.target.value) })}
                />
              </div>
            </div>
            <label className="block text-sm font-medium mb-1">Name</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.name}
              onChange={e => onSectionChangeAction({ ...section, name: e.target.value })}
            />
            <label className="block text-sm font-medium mb-1">Subtitle</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.subtitle}
              onChange={e => onSectionChangeAction({ ...section, subtitle: e.target.value })}
            />
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.description}
              onChange={e => onSectionChangeAction({ ...section, description: e.target.value })}
              rows={3}
            />
            <label className="block text-sm font-medium mb-1">Badge</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.badge || ''}
              onChange={e => onSectionChangeAction({ ...section, badge: e.target.value })}
              placeholder="e.g. Most Popular"
            />
            <label className="block text-sm font-medium mb-1">Features (comma separated)</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.features?.join(', ') || ''}
              onChange={e => handleListChange('features', e.target.value)}
              placeholder="Feature 1, Feature 2, ..."
            />
            <label className="block text-sm font-medium mb-1">Perfect For (comma separated)</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.perfectFor?.join(', ') || ''}
              onChange={e => handleListChange('perfectFor', e.target.value)}
              placeholder="Use 1, Use 2, ..."
            />
            <label className="block text-sm font-medium mb-1">Color (Tailwind bg-gradient-to-r ...)</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.color}
              onChange={e => onSectionChangeAction({ ...section, color: e.target.value })}
              placeholder="from-blue-500 to-blue-700"
            />
            <label className="block text-sm font-medium mb-1">Image URL</label>
            <div className="flex gap-2 items-center mb-2">
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={section.imageSrc}
                onChange={e => onSectionChangeAction({ ...section, imageSrc: e.target.value })}
                placeholder="https://..."
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Select from Media Library"
                onClick={() => setMediaDialogOpen(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
              </Button>
            </div>
            {mediaDialogOpen && (
              <MediaLibrary
                isDialog
                type="image"
                onCloseAction={() => setMediaDialogOpen(false)}
                onSelectAction={(url) => {
                  onSectionChangeAction({ ...section, imageSrc: url });
                  setMediaDialogOpen(false);
                }}
              />
            )}
            {/* Video URL and MediaLibrary */}
            <label className="block text-sm font-medium mb-1">Video URL</label>
            <div className="flex gap-2 items-center mb-2">
              <input
                type="text"
                className="w-full border rounded px-2 py-1"
                value={section.videoUrl || ''}
                onChange={e => onSectionChangeAction({ ...section, videoUrl: e.target.value })}
                placeholder="https://..."
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Select from Media Library"
                onClick={() => setMediaVideoDialogOpen(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 4v16m8-8H4"/></svg>
              </Button>
            </div>
            {mediaVideoDialogOpen && (
              <MediaLibrary
                isDialog
                type="video"
                onCloseAction={() => setMediaVideoDialogOpen(false)}
                onSelectAction={(url) => {
                  onSectionChangeAction({ ...section, videoUrl: url });
                  setMediaVideoDialogOpen(false);
                }}
              />
            )}
            <label className="block text-sm font-medium mb-1">Video Alt</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.videoAlt || ''}
              onChange={e => onSectionChangeAction({ ...section, videoAlt: e.target.value })}
              placeholder="Video description"
            />
            <label className="block text-sm font-medium mb-1">Learn More Button Label</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.learnMoreText || ''}
              onChange={e => onSectionChangeAction({ ...section, learnMoreText: e.target.value })}
            />
            <label className="block text-sm font-medium mb-1">Learn More Button Link</label>
            <input
              type="url"
              className="w-full border rounded px-2 py-1 mb-2"
              value={section.learnMoreUrl || ''}
              onChange={e => onSectionChangeAction({ ...section, learnMoreUrl: e.target.value })}
            />
          </div>
        </div>
      </div>
    );
  }

  // View mode
  return (
    <div className="px-16">
      <div
        style={{
          paddingLeft: `${section.horizontalPadding ?? 0}rem`,
          paddingRight: `${section.horizontalPadding ?? 0}rem`,
          paddingTop: `${section.verticalPadding ?? 0}rem`,
          paddingBottom: `${section.verticalPadding ?? 0}rem`,
        }}
      >
        <div className="flex flex-col gap-12">
          <div className="flex flex-col lg:flex-row gap-12 items-center">
            {/* Content Side */}
            <div className="flex-1 space-y-6">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-r ${section.color} flex items-center justify-center`}>
                  {/* No icon in editable version */}
                </div>
                {section.badge && (
                  <Badge variant={section.badge === "Most Popular" ? "default" : "secondary"} className="text-xs">
                    {section.badge}
                  </Badge>
                )}
              </div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{section.name}</h2>
              <h3 className="text-xl text-blue-600 font-semibold mb-4">{section.subtitle}</h3>
              <p className="text-gray-600 mb-6">{section.description}</p>
              <div className="grid md:grid-cols-2 gap-8">
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Key Features:</h4>
                  <ul className="space-y-2">
                    {section.features?.map((feature, index) => (
                      <li key={index} className="flex items-start">
                        <Check className="h-5 w-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                        <span className="text-gray-700 text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 mb-3">Perfect For:</h4>
                  <ul className="space-y-2">
                    {section.perfectFor?.map((use, index) => (
                      <li key={index} className="flex items-center">
                        <span className="w-2 h-2 bg-blue-500 rounded-full mr-3 inline-block" />
                        <span className="text-gray-700">{use}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 pt-4">
                <a
                  href={section.learnMoreUrl || '#'}
                  className="inline-block"
                >
                  <Button size="lg" className={`bg-gradient-to-r ${section.color} hover:opacity-90 relative overflow-hidden group`}>
                    <span className="relative z-10 flex items-center">
                      {section.learnMoreText || 'Learn More'}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </span>
                  </Button>
                </a>
                <Button variant="outline" size="lg" className="hover:bg-gray-50 bg-transparent" onClick={() => setLightboxOpen(true)}>
                  View Demo
                </Button>
              </div>
            </div>
            {/* Media Side: Video first if present, then image */}
            <div className="flex-1 w-full h-full rounded-2xl overflow-hidden shadow-xl">
              {section.videoUrl ? (
                <div onClick={() => setLightboxOpen(true)} className="cursor-pointer">
                  <video
                    src={section.videoUrl}
                    controls
                    muted
                    loop
                    playsInline
                    poster={section.imageSrc || undefined}
                    className="w-full h-full object-cover mb-2"
                  />
                </div>
              ) : section.imageSrc ? (
                <img
                  src={section.imageSrc}
                  alt={section.imageAlt}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={() => setLightboxOpen(true)}
                />
              ) : null}
            </div>
            {lightboxOpen && (
              <MediaLightbox
                open={lightboxOpen}
                mediaUrl={section.videoUrl || section.imageSrc}
                mediaType={section.videoUrl ? 'video' : 'image'}
                onClose={() => setLightboxOpen(false)}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 