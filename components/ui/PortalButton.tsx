'use client';

import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Button } from './button';
import { Camera } from 'lucide-react';

interface PortalButtonProps {
  onClickAction: (e: React.MouseEvent) => void;
  isEditMode: boolean;
}

export function PortalButton({ onClickAction, isEditMode }: PortalButtonProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  if (!mounted) return null;

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClickAction(e);
  };

  return createPortal(
    <div 
      className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-[9999] transition-opacity duration-200" 
      style={{ 
        opacity: isEditMode ? 1 : 0, 
        pointerEvents: isEditMode ? 'auto' : 'none',
        zIndex: 9999 // Ensure highest z-index
      }}
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-full shadow-xl overflow-hidden">
        <Button
          variant="ghost"
          size="default"
          className="text-gray-900 px-6 py-2 h-auto flex items-center gap-2 hover:bg-white/80 transition-all duration-200"
          onClick={handleClick}
        >
          <Camera className="h-4 w-4" />
          <span>Change Background</span>
        </Button>
      </div>
    </div>,
    document.body
  );
}
