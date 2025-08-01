import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Button } from './button';
import { Upload, File, X } from 'lucide-react';

interface FileUploaderProps {
  onDrop: (acceptedFiles: File[]) => void;
  onRemove?: () => void;
  file?: File | null;
  accept?: {
    [key: string]: string[];
  };
  maxSize?: number;
  disabled?: boolean;
  className?: string;
}

export function FileUploader({
  onDrop,
  onRemove,
  file,
  accept = {
    'image/*': ['.png', '.jpg', '.jpeg', '.gif'],
    'video/*': ['.mp4', '.webm', '.mov'],
  },
  maxSize = 10 * 1024 * 1024, // 10MB
  disabled = false,
  className = '',
}: FileUploaderProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    disabled,
    multiple: false,
  });

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onRemove?.();
    },
    [onRemove]
  );

  return (
    <div
      {...getRootProps()}
      className={`border-2 border-dashed rounded-lg p-6 transition-colors ${
        isDragActive ? 'border-primary bg-primary/10' : 'border-border'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
    >
      <input {...getInputProps()} />
      
      {file ? (
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <File className="h-5 w-5 text-muted-foreground" />
            <span className="text-sm font-medium truncate max-w-xs">
              {file.name}
            </span>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRemove}
            disabled={disabled}
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Remove file</span>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <div className="rounded-full bg-muted p-3">
            <Upload className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              {isDragActive ? 'Drop the file here' : 'Drag and drop or click to upload'}
            </p>
            <p className="text-xs text-muted-foreground">
              {Object.values(accept)
                .flat()
                .map((ext) => ext.toUpperCase())
                .join(', ')}{' '}
              (max {maxSize / (1024 * 1024)}MB)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
