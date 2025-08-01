'use client';

import { useEffect } from 'react';
import Image from 'next/image';

type LightboxProps = {
  isOpen: boolean;
  onCloseAction: () => void;
  images: { src: string; alt: string }[];
  initialIndex?: number;
};

export function Lightbox({ isOpen, onCloseAction, images, initialIndex = 0 }: LightboxProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onCloseAction();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onCloseAction]);

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
      onClick={onCloseAction}
    >
      <button 
        className="absolute top-4 right-4 text-white text-4xl z-10 hover:text-gray-300 transition-colors"
        onClick={(e) => {
          e.stopPropagation();
          onCloseAction();
        }}
        aria-label="Close lightbox"
      >
        &times;
      </button>
      
      <div className="relative w-full h-full max-w-6xl max-h-[90vh]" onClick={e => e.stopPropagation()}>
        {images.map((image, index) => (
          <div 
            key={image.src} 
            className={`absolute inset-0 transition-opacity duration-300 flex items-center justify-center ${
              index === initialIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              className="object-contain"
              priority
            />
            <div className="absolute bottom-4 left-0 right-0 text-center text-white text-sm opacity-75">
              {image.alt} • {index + 1} of {images.length}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
