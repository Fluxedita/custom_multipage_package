import { useState } from 'react';
import { MediaItem, MediaSettings } from '@/types/media';

interface MediaGalleryProps {
  items: MediaItem[];
  onInteraction?: (mediaId: string, interactionType: string) => Promise<void>;
  mediaSettings?: MediaSettings | null;
}

export function MediaGallery({ items, onInteraction, mediaSettings }: MediaGalleryProps) {
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const handleItemClick = async (item: MediaItem) => {
    setSelectedItem(item);
    if (onInteraction) {
      await onInteraction(item.id, 'click');
    }
  };

  const getOptimizedUrl = (item: MediaItem) => {
    if (!mediaSettings || !item.cloudinary_public_id) return item.coverImage || item.imageUrls?.[0] || item.videoUrl || '';

    const { transformation_settings } = mediaSettings;
    const baseUrl = `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`;
    const transformations = [
      `q_${transformation_settings.quality}`,
      `f_${transformation_settings.fetch_format}`,
      transformation_settings.responsive ? 'c_scale,w_auto,dpr_auto' : '',
    ].filter(Boolean).join(',');

    return `${baseUrl}/${transformations}/${item.cloudinary_public_id}`;
  };

  const getLoadingAttribute = () => {
    const loading = mediaSettings?.transformation_settings.loading;
    return loading === 'eager' ? 'eager' : 'lazy';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {items.map((item) => (
        <div
          key={item.id}
          className="relative aspect-square cursor-pointer group"
          onClick={() => handleItemClick(item)}
        >
          {item.type === 'image' ? (
            <img
              src={getOptimizedUrl(item)}
              alt={item.title || item.description || ''}
              className="w-full h-full object-cover rounded-lg transition-transform group-hover:scale-105"
              loading={getLoadingAttribute()}
            />
          ) : (
            <video
              src={item.videoUrl || ''}
              className="w-full h-full object-cover rounded-lg"
              controls
              preload="metadata"
            />
          )}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-opacity rounded-lg" />
        </div>
      ))}

      {/* Lightbox */}
      {selectedItem && (
        <div
          className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedItem(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh]">
            {selectedItem.type === 'image' ? (
              <img
                src={getOptimizedUrl(selectedItem)}
                alt={selectedItem.title || selectedItem.description || ''}
                className="max-w-full max-h-[90vh] object-contain"
              />
            ) : (
              <video
                src={selectedItem.videoUrl || ''}
                className="max-w-full max-h-[90vh]"
                controls
                autoPlay
              />
            )}
            <button
              className="absolute top-4 right-4 text-white hover:text-gray-300"
              onClick={() => setSelectedItem(null)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 