import React from 'react';
import { Button } from '@/components/ui/button';

interface SectionWrapperProps {
  sectionId: string;
  isEditMode: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onDelete?: () => void;
  onDuplicate?: () => void;
  children: React.ReactNode;
  style?: React.CSSProperties;
  transparentBackground?: boolean;
}

export const SectionWrapper: React.FC<SectionWrapperProps> = ({
  sectionId,
  isEditMode,
  onMoveUp,
  onMoveDown,
  onDelete,
  onDuplicate,
  children,
  style,
  transparentBackground = false,
}) => {
  const containerClasses = transparentBackground 
    ? "p-4" // No border, shadow, or background
    : "border border-gray-200 rounded-lg p-4 shadow-sm";

  return (
    <div className="relative my-8">
      {isEditMode && (
        <div className="absolute top-2 right-0 flex gap-2 z-30">
          <Button variant="ghost" size="sm" onClick={onMoveUp}>
            ↑
          </Button>
          <Button variant="ghost" size="sm" onClick={onMoveDown}>
            ↓
          </Button>
          {onDuplicate && (
            <Button variant="ghost" size="sm" onClick={onDuplicate} title="Duplicate Section">
              📋
            </Button>
          )}
          <Button variant="destructive" size="sm" onClick={onDelete}>
            Delete
          </Button>
        </div>
      )}
      <div className={containerClasses} style={style}>
        {children}
      </div>
      {isEditMode && (
        <div className="text-xs text-gray-400 mt-2 text-right">Section ID: {sectionId}</div>
      )}
    </div>
  );
};
