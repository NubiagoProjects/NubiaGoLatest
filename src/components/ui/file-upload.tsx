'use client'

import React, { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, File, Image as ImageIcon, FileText, Music, Video, Archive, FileIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface FileUploadProps {
  onFilesSelected: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxSize?: number // in MB
  maxFiles?: number
  className?: string
  disabled?: boolean
  showPreview?: boolean
}

interface FileWithPreview extends File {
  preview?: string
  id: string
}

export default function FileUpload({
  onFilesSelected,
  multiple = false,
  accept,
  maxSize = 10, // 10MB default
  maxFiles = 5,
  className = '',
  disabled = false,
  showPreview = true
}: FileUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([])
  const [error, setError] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    const type = file.type.split('/')[0]
    switch (type) {
      case 'image':
        return <ImageIcon className="h-6 w-6 text-blue-500" />
      case 'video':
        return <Video className="h-6 w-6 text-purple-500" />
      case 'audio':
        return <Music className="h-6 w-6 text-green-500" />
      case 'application':
        if (file.type.includes('pdf')) {
          return <FileText className="h-6 w-6 text-red-500" />
        }
        if (file.type.includes('zip') || file.type.includes('rar')) {
          return <Archive className="h-6 w-6 text-orange-500" />
        }
        return <FileIcon className="h-6 w-6 text-gray-500" />
      default:
        return <File className="h-6 w-6 text-gray-500" />
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxSize * 1024 * 1024) {
      return `File size must be less than ${maxSize}MB`
    }

    // Check file type if accept is specified
    if (accept) {
      const acceptedTypes = accept.split(',').map(type => type.trim())
      const fileType = file.type
      const fileName = file.name.toLowerCase()
      
      const isAccepted = acceptedTypes.some(type => {
        if (type.startsWith('.')) {
          return fileName.endsWith(type)
        }
        return fileType === type || fileType.startsWith(type.replace('*', ''))
      })

      if (!isAccepted) {
        return `File type not allowed. Accepted types: ${accept}`
      }
    }

    return null
  }

  const processFiles = useCallback((files: FileList) => {
    const fileArray = Array.from(files)
    const errors: string[] = []
    const validFiles: FileWithPreview[] = []

    // Check max files
    if (!multiple && fileArray.length > 1) {
      setError('Only one file can be selected')
      return
    }

    if (multiple && selectedFiles.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    fileArray.forEach((file) => {
      const error = validateFile(file)
      if (error) {
        errors.push(`${file.name}: ${error}`)
      } else {
        const fileWithPreview: FileWithPreview = {
          ...file,
          id: Math.random().toString(36).substr(2, 9)
        }

        // Create preview for images
        if (showPreview && file.type.startsWith('image/')) {
          const reader = new FileReader()
          reader.onload = (e) => {
            fileWithPreview.preview = e.target?.result as string
            setSelectedFiles(prev => [...prev, fileWithPreview])
          }
          reader.readAsDataURL(file)
        } else {
          validFiles.push(fileWithPreview)
        }
      }
    })

    if (errors.length > 0) {
      setError(errors.join('\n'))
    } else {
      setError('')
      const newFiles = [...selectedFiles, ...validFiles]
      setSelectedFiles(newFiles)
      onFilesSelected(newFiles)
    }
  }, [selectedFiles, multiple, maxFiles, maxSize, accept, showPreview, onFilesSelected])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    
    if (disabled) return
    
    const files = e.dataTransfer.files
    if (files.length > 0) {
      processFiles(files)
    }
  }, [processFiles, disabled])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    if (!disabled) {
      setIsDragOver(true)
    }
  }, [disabled])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      processFiles(files)
    }
    // Reset input value to allow selecting the same file again
    e.target.value = ''
  }, [processFiles])

  const removeFile = (fileId: string) => {
    const newFiles = selectedFiles.filter(file => file.id !== fileId)
    setSelectedFiles(newFiles)
    onFilesSelected(newFiles)
  }

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click()
    }
  }

  return (
    <div className={className}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled}
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        
        <div className="space-y-2">
          <p className="text-lg font-medium text-gray-900">
            Drop files here or click to browse
          </p>
          <p className="text-sm text-gray-500">
            {accept ? `Accepted formats: ${accept}` : 'All file types accepted'}
          </p>
          <p className="text-sm text-gray-500">
            Max size: {maxSize}MB {multiple && `• Max files: ${maxFiles}`}
          </p>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 whitespace-pre-line">{error}</p>
        </div>
      )}

      {/* Selected Files Preview */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">
            Selected Files ({selectedFiles.length})
          </h4>
          <div className="space-y-2">
            {selectedFiles.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {file.preview ? (
                    <Image
                      src={file.preview}
                      alt={file.name}
                      width={40}
                      height={40}
                      className="w-10 h-10 object-cover rounded"
                    />
                  ) : (
                    <div className="w-10 h-10 flex items-center justify-center">
                      {getFileIcon(file)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeFile(file.id)}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Clear All Button */}
      {selectedFiles.length > 0 && (
        <div className="mt-4">
          <Button
            variant="outline"
            onClick={() => {
              setSelectedFiles([])
              onFilesSelected([])
            }}
            className="text-red-600 hover:text-red-700"
          >
            Clear All Files
          </Button>
        </div>
      )}
    </div>
  )
} 
