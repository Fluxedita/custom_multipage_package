import React, { useState } from 'react';
import ReactDOM from 'react-dom';
import Image from 'next/image';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface MediaLightboxProps {
  open: boolean;
  mediaUrl: string;
  mediaType: 'image' | 'video';
  onClose: () => void;
}

export const MediaLightbox: React.FC<MediaLightboxProps> = ({ open, mediaUrl, mediaType, onClose }) => {
  const [imgError, setImgError] = useState(false);
  if (!open) return null;

  const overlay = (
    <div className="fixed inset-0 z-[2147483647] flex items-center justify-center bg-black/90 p-4">
      {/* Close button */}
      <Button
        variant="ghost"
        size="icon"
        onClick={onClose}
        className="fixed top-4 right-4 z-[2147483647] h-10 w-10 rounded-full bg-black/50 text-white hover:bg-black/70"
        aria-label="Close lightbox"
      >
        <X className="h-6 w-6" />
      </Button>
      <div className="fixed inset-0 flex items-center justify-center w-full h-full">
        {mediaType === 'video' && mediaUrl.includes('youtube.com/embed') ? (
          <div className="w-full h-full flex items-center justify-center aspect-video">
            <iframe
              src={mediaUrl}
              allow="autoplay; encrypted-media"
              allowFullScreen
              className="w-full h-full object-contain rounded-lg bg-black"
              style={{ background: 'black' }}
              title="YouTube Video"
            />
          </div>
        ) : mediaType === 'video' ? (
          <div className="w-full h-full flex items-center justify-center aspect-video">
            <video
              src={mediaUrl}
              controls
              autoPlay
              className="w-full h-full object-contain rounded-lg bg-black"
              style={{ background: 'black' }}
            />
          </div>
        ) : !imgError ? (
          <div className="w-full h-full flex items-center justify-center aspect-video">
            <Image
              src={mediaUrl}
              alt="Media preview"
              fill
              className="object-contain rounded-lg bg-black"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 70vw"
              priority
              onError={() => setImgError(true)}
            />
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center aspect-video">
            <img
              src={mediaUrl}
              alt="Media preview"
              className="object-contain rounded-lg bg-black max-h-full w-auto mx-auto"
              style={{ maxWidth: '100%' }}
            />
          </div>
        )}
      </div>
    </div>
  );

  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return ReactDOM.createPortal(overlay, document.body);
  }
  return overlay;
}; 