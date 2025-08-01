'use client'

import { useState, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Upload, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FileUploaderProps {
  onFileSelect: (file: File) => void
  accept?: string
  maxSize?: number
  aspectRatio?: string
  isLoading?: boolean
  className?: string
}

export function FileUploader({
  onFileSelect,
  accept = 'image/*',
  maxSize = 5 * 1024 * 1024, // 5MB
  aspectRatio,
  isLoading = false,
  className,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const validateFile = (file: File): boolean => {
    setError(null)

    // Check file type
    if (accept && !file.type.match(accept.replace('*', '.*'))) {
      setError(`File type not supported. Please upload a ${accept.replace('*', '')} file.`)
      return false
    }

    // Check file size
    if (maxSize && file.size > maxSize) {
      setError(`File size exceeds ${maxSize / 1024 / 1024}MB limit.`)
      return false
    }

    return true
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (!file) return

    if (validateFile(file)) {
      onFileSelect(file)
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (validateFile(file)) {
      onFileSelect(file)
    }
  }

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div
      className={cn(
        'relative border-2 border-dashed rounded-lg p-8 text-center',
        isDragging ? 'border-primary bg-primary/5' : 'border-gray-300',
        className
      )}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileInput}
        className="hidden"
      />

      <div className="space-y-4">
        <div className="flex justify-center">
          {isLoading ? (
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          ) : (
            <Upload className="h-8 w-8 text-gray-400" />
          )}
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium">
            {isLoading ? 'Uploading...' : 'Drag and drop your file here'}
          </p>
          <p className="text-xs text-gray-500">
            or{' '}
            <Button
              variant="link"
              className="p-0 h-auto text-xs"
              onClick={handleButtonClick}
              disabled={isLoading}
            >
              browse files
            </Button>
          </p>
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}

        {aspectRatio && (
          <p className="text-xs text-gray-500">
            Recommended aspect ratio: {aspectRatio}
          </p>
        )}
      </div>
    </div>
  )
} 