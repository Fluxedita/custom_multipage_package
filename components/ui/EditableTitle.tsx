"use client"

import { useState, useEffect, useRef } from 'react';

interface EditableTitleProps {
  value: string;
  onChangeAction: (value: string) => void;
  isEditMode: boolean;
  className?: string;
  placeholder?: string;
  style?: React.CSSProperties;
}

export function EditableTitle({ 
  value, 
  onChangeAction, 
  isEditMode, 
  className = '',
  placeholder = 'Enter title...'
}: EditableTitleProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [inputValue, setInputValue] = useState(value);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const handleBlur = () => {
    setIsEditing(false);
    if (inputValue !== value) {
      onChangeAction(inputValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      inputRef.current?.blur();
    } else if (e.key === 'Escape') {
      setInputValue(value);
      setIsEditing(false);
    }
  };

  if (!isEditMode) {
    return <h1 className={className}>{value}</h1>;
  }

  return (
    <div className="relative group">
      {isEditing ? (
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`bg-transparent border-b-2 border-white/50 focus:border-white focus:outline-none w-full ${className}`}
          autoFocus
        />
      ) : (
        <div 
          className="relative group cursor-pointer"
          onClick={() => setIsEditing(true)}
        >
          <h1 className={className}>
            {value || <span className="text-white/50">{placeholder}</span>}
          </h1>
          <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity rounded" />
        </div>
      )}
    </div>
  );
}
