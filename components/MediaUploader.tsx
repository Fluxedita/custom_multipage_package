import { useState } from 'react';
import { MediaSettings } from '@/types/media';

interface MediaUploaderProps {
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
  mediaSettings?: MediaSettings | null;
}

export function MediaUploader({ onUpload, isUploading, mediaSettings }: MediaUploaderProps) {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (mediaSettings?.allowed_formats.includes(file.type.split('/')[1])) {
        await onUpload(file);
      }
    }
  };

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (mediaSettings?.allowed_formats.includes(file.type.split('/')[1])) {
        await onUpload(file);
      }
    }
  };

  return (
    <div
      className={`relative p-4 border-2 border-dashed rounded-lg ${
        dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
      }`}
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
    >
      <input
        type="file"
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        onChange={handleChange}
        accept={mediaSettings?.allowed_formats.map(format => `image/${format}`).join(',')}
        disabled={isUploading}
      />
      <div className="text-center">
        {isUploading ? (
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2">Uploading...</span>
          </div>
        ) : (
          <>
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              stroke="currentColor"
              fill="none"
              viewBox="0 0 48 48"
              aria-hidden="true"
            >
              <path
                d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <p className="mt-1 text-sm text-gray-600">
              Drag and drop your image here, or click to select
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Supported formats: {mediaSettings?.allowed_formats.join(', ')}
            </p>
          </>
        )}
      </div>
    </div>
  );
} 