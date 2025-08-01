"use client"

import { useState, useEffect, useRef } from 'react';

interface EditableSubtitleProps {
  value: string;
  onChangeAction: (value: string) => void;
  isEditMode: boolean;
  className?: string;
  placeholder?: string;
}

export function EditableSubtitle({ 
  value, 
  onChangeAction, 
  isEditMode, 
  className = '',
  placeholder = 'Enter subtitle...'
}: EditableSubtitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      // Auto-resize textarea to fit content
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [isEditing, inputValue]);

  const handleBlur = () => {
    setIsEditing(false);
    if (inputValue !== value) {
      onChangeAction(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      textareaRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value);
      setIsEditing(false);
    }
  };

  if (!isEditMode) {
    return <p className={className}>{value}</p>;
  }

  return (
    <div className="relative group">
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`bg-transparent border-b border-white/30 focus:border-white/50 focus:outline-none w-full resize-none overflow-hidden ${className}`}
          rows={1}
          autoFocus
        />
      ) : (
        <div 
          className="relative group cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          <p className={className}>
            {value || <span className="text-white/50">{placeholder}</span>}
          </p>
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
        </div>
      )}
    </div>
  );
}
