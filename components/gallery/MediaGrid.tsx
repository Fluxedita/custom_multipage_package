'use client';

import { useState } from 'react';
import Image from 'next/image';
import { SearchIcon, Loader2 } from 'lucide-react';
import type { MediaItem } from '@/lib/types';

interface MediaGridProps {
  media: MediaItem[];
}

export default function MediaGrid({ media }: MediaGridProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<string[]>([]);

  const handleSelect = (id: string) => {
    setSelectedItems((prevSelected) =>
      prevSelected.includes(id)
        ? prevSelected.filter((item) => item !== id)
        : [...prevSelected, id]
    );
  };

  const filteredMedia = media.filter((item) =>
    (item.title || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    (item.tags || []).some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="space-y-4">
      <div className="relative">
        <input
          type="text"
          placeholder="Search media..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-md border px-4 py-2 pl-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          aria-label="Search media"
        />
        <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-500" />
      </div>

      {filteredMedia.length === 0 ? (
        <div className="col-span-full text-center py-12">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <SearchIcon className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No media found
          </h3>
          <p className="text-gray-500">
            {searchQuery 
              ? 'Try adjusting your search or filter to find what you\'re looking for.'
              : 'Upload some media to get started.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {filteredMedia.map((item) => (
            <div
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                selectedItems.includes(item.id)
                  ? 'border-blue-500 ring-2 ring-blue-200'
                  : 'border-transparent hover:border-gray-200'
              }`}
              aria-label={`Select ${item.title || 'media item'}`}
            >
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={item.coverImage || item.imageUrls?.[0] || item.videoUrl || ''}
                  alt={item.title || 'Media item'}
                  width={300}
                  height={300}
                  className="object-cover w-full h-full"
                  priority={false}
                />
                {item.type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="w-10 h-10 rounded-full bg-white bg-opacity-80 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-800 ml-0.5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                )}
              </div>
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                <p className="text-white text-xs font-medium truncate">
                  {item.title || item.id}
                </p>
                <p className="text-white/70 text-[10px] truncate">
                  {item.type?.toUpperCase()}
                  {item.bytes ? ` • ${Math.round(item.bytes / 1024)} KB` : ''}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
