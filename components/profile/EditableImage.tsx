"use client";

import { FC, forwardRef, useImperativeHandle, useRef } from 'react';
import SimpleEditableImage from "./SimpleEditableImage";
import { useProfileEdit } from "./ProfileEditContext";

interface EditableImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  className?: string;
  priority?: boolean;
  isEditMode?: boolean;
  isEditing?: boolean;
  onChange?: (url: string) => void;
  onDirtyChange?: (dirty: boolean) => void;
  type?: 'profile' | 'background' | 'gallery' | 'video';
  standalone?: boolean;
  aspectRatio?: 'square' | 'portrait' | 'landscape';
}

const EditableImage = forwardRef<{ openEditor: () => void }, EditableImageProps>(({
  src,
  alt,
  width,
  height,
  className = "",
  priority = false,
  isEditMode = false,
  isEditing = false,
  onChange,
  onDirtyChange,
  type = 'gallery',
  standalone = false,
  aspectRatio = 'square',
}, ref) => {
  const editorRef = useRef<{ openEditor: () => void }>(null);
  const { isEditMode: contextEditMode, setIsDirty } = useProfileEdit();

  // Expose the openEditor method to parent components
  useImperativeHandle(ref, () => ({
    openEditor: () => {
      if (editorRef.current) {
        editorRef.current.openEditor();
      }
    }
  }));

  // Map the aspect ratio to a Tailwind class if needed
  const getAspectRatioClass = () => {
    switch (aspectRatio) {
      case 'portrait':
        return 'aspect-[3/4]';
      case 'landscape':
        return 'aspect-[4/3]';
      case 'square':
      default:
        return 'aspect-square';
    }
  };

  return (
    <div className={`relative${aspectRatio ? ` ${getAspectRatioClass()}` : ''} ${className}`}>
      <SimpleEditableImage
        ref={editorRef}
        src={src}
        alt={alt}
        width={width}
        height={height}
        className="w-full h-full object-cover"
        priority={priority}
        isEditMode={isEditMode || contextEditMode}
        isEditing={isEditing}
        onChange={onChange}
        type={type}
        setIsDirty={setIsDirty}
      />
    </div>
  );
});

EditableImage.displayName = 'EditableImage';

export default EditableImage;
