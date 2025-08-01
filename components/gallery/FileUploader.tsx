"use client"

import { useState, useCallback } from 'react'
import { useDropzone, type Accept } from 'react-dropzone'
import { Upload, File, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { toast } from 'sonner'

// Helper type to make the Accept type more specific
type FileAccept = {
  [key: string]: string[]
}

interface AcceptedType {
  type: string
  extensions: string[]
}

// Use a more specific type for the upload complete callback
// TODO: Confirm if UploadCompleteHandler expects a File or a string as its parameter
type UploadCompleteHandler = (file: File) => Promise<void> | void

export interface FileUploaderProps {
  /**
   * Server Action that will be called when a file is successfully uploaded
   * @param file - The uploaded file
   * @remarks This should be a Server Action when used in a Server Component
   */
  uploadCompleteAction: UploadCompleteHandler
  /**
   * Object mapping MIME types to arrays of file extensions
   * Example: { 'image/*': ['.jpg', '.png'], 'application/pdf': ['.pdf'] }
   */
  accept?: FileAccept
  multiple?: boolean
  maxSize?: number
  className?: string
  disabled?: boolean
  label?: string
  description?: string
  error?: string
  id?: string
  name?: string
  type?: string
}

const DEFAULT_ACCEPT: FileAccept = {
  'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
  'video/*': ['.mp4', '.webm', '.mov']
}

export default function FileUploader({
  uploadCompleteAction,
  accept = DEFAULT_ACCEPT,
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB
  className = '',
  disabled = false,
  label = 'Upload files',
  description = 'Drag and drop files here or click to browse',
  error = '',
  id = 'file-upload',
  name = 'file-upload',
}: FileUploaderProps) {
  const [isUploading, setIsUploading] = useState(false)
  const [currentFile, setCurrentFile] = useState<string | null>(null)

  // Memoize the onDrop handler to prevent unnecessary re-renders
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (disabled || !uploadCompleteAction) return
    
    const processFile = async (file: File) => {
      setCurrentFile(file.name)
      
      try {
        // Validate file type using the accept prop
        if (accept) {
          const fileExtension = file.name.split('.').pop()?.toLowerCase() || ''
          const mimeType = file.type
          
          // Convert accept object to a format we can work with
          const acceptTypes = Object.entries(accept).flatMap(([mime, exts]) => {
            if (mime.endsWith('/*')) {
              const baseType = mime.replace('/*', '')
              return [{ type: baseType, extensions: exts || [] }]
            }
            return [{ type: mime, extensions: exts || [] }]
          })
          
          // Check if file matches any of the accepted types
          const isAccepted = acceptTypes.some(({ type, extensions }) => {
            // Check MIME type
            const mimeMatch = mimeType.startsWith(`${type}/`) || mimeType === type
            
            // Check extensions if provided
            const extMatch = extensions.length > 0 
              ? extensions.some(ext => 
                  fileExtension === ext.replace(/\./g, '').toLowerCase()
                )
              : true // If no extensions specified, only check MIME type
            
            return mimeMatch && extMatch
          })
          
          if (!isAccepted) {
            const acceptedTypes = acceptTypes
              .map(({ type, extensions }) => 
                extensions.length > 0 
                  ? `${type} (${extensions.join(', ')})` 
                  : type
              )
              .join(', ')
              
            throw new Error(`Invalid file type. Accepted types: ${acceptedTypes}`)
          }
        }

        // Validate file size
        if (maxSize && file.size > maxSize) {
          throw new Error(`File size (${(file.size / (1024 * 1024)).toFixed(2)}MB) exceeds the maximum allowed size of ${maxSize / (1024 * 1024)}MB`)
        }
        
        toast.info(`Uploading ${file.name}...`)
        
        // Upload to Cloudinary
        const result = await uploadToCloudinary(file)
        
        if (!result.secure_url) {
          throw new Error('No URL returned from Cloudinary')
        }
        
        // Call the upload complete handler
        await Promise.resolve(uploadCompleteAction(file))
        toast.success(`${file.name} uploaded successfully`)
        
      } catch (error) {
        console.error('Upload failed:', error)
        toast.error(`Failed to upload ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`)
        throw error // Re-throw to allow the parent component to handle the error if needed
      }
    }
    
    try {
      setIsUploading(true)
      // Process files sequentially to avoid overwhelming the server
      for (const file of acceptedFiles) {
        await processFile(file)
      }
    } finally {
      setIsUploading(false)
      setCurrentFile(null)
    }
  }, [uploadCompleteAction, accept, maxSize, disabled])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
    maxSize,
    disabled: isUploading || disabled,
    onDropRejected: (rejectedFiles) => {
      rejectedFiles.forEach(({ file, errors }) => {
        errors.forEach((err) => {
          if (err.code === 'file-too-large') {
            toast.error(`File is too large. Max size is ${maxSize / (1024 * 1024)}MB`)
          } else if (err.code === 'file-invalid-type') {
            toast.error('Invalid file type')
          } else {
            toast.error(err.message)
          }
        })
      })
    },
  })

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (disabled || !event.target.files) return
    onDrop(Array.from(event.target.files))
  }

  return (
    <div
      {...getRootProps()}
      className={cn(
        'relative border-2 border-dashed rounded-lg p-8 text-center transition-colors',
        isDragActive && !disabled ? 'border-primary bg-primary/10' : 'border-muted-foreground/25',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary/50',
        className
      )}
    >
      <Input
        id={id}
        name={name}
        type="file"
        className="sr-only"
        accept={Object.entries(accept)
          .flatMap(([mimeType, exts]) => 
            exts && exts.length > 0 
              ? exts.map(ext => `${mimeType}${ext}`) 
              : [mimeType]
          )
          .join(',')}
        multiple={multiple}
        onChange={handleFileChange}
        disabled={disabled}
      />
      
      <div className="space-y-4">
        <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center">
          {isUploading ? (
            <Loader2 className="h-5 w-5 text-muted-foreground animate-spin" />
          ) : (
            <Upload className="h-5 w-5 text-muted-foreground" />
          )}
        </div>
        
        <div>
          <p className="text-sm font-medium">
            {isUploading 
              ? `Uploading ${currentFile || 'file'}...`
              : isDragActive 
                ? 'Drop the files here'
                : 'Drag & drop files here, or click to select'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
          {JSON.stringify(accept) === JSON.stringify({ 'image/*': ['.jpg', '.jpeg', '.png', '.gif', '.webp'] })
            ? 'JPG, PNG, GIF, WebP (max 10MB)'
            : JSON.stringify(accept) === JSON.stringify({ 'video/*': ['.mp4', '.webm', '.mov'] })
            ? 'MP4, WebM, MOV (max 100MB)'
            : 'Images & videos (max 100MB)'}
        </p>
        </div>
        
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          disabled={isUploading || disabled}
          className="pointer-events-none"
        >
          Select Files
        </Button>
      </div>
    </div>
  )
}
