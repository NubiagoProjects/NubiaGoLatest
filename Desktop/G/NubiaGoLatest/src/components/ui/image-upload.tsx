'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { useImageUpload } from '@/hooks/useImageUpload';
import { ImageCategory, IMAGE_CONFIG, formatFileSize } from '@/lib/image-utils';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  category: ImageCategory;
  userId: string;
  onUploadComplete?: (metadata: any) => void;
  onUploadError?: (error: string) => void;
  multiple?: boolean;
  maxFiles?: number;
  className?: string;
  disabled?: boolean;
  generateThumbnails?: boolean;
  showPreview?: boolean;
  accept?: string;
}

interface FileWithPreview extends File {
  preview?: string;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  category,
  userId,
  onUploadComplete,
  onUploadError,
  multiple = false,
  maxFiles = 5,
  className,
  disabled = false,
  generateThumbnails = true,
  showPreview = true,
  accept = 'image/*'
}) => {
  const {
    uploadImage,
    validateImage,
    isUploading,
    uploadProgress,
    error
  } = useImageUpload();

  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (selectedFiles: FileList | null) => {
    if (!selectedFiles) return;

    const fileArray = Array.from(selectedFiles);
    const validFiles: FileWithPreview[] = [];

    for (const file of fileArray) {
      const isValid = await validateImage(file);
      if (isValid) {
        const fileWithPreview = file as FileWithPreview;
        if (showPreview) {
          fileWithPreview.preview = URL.createObjectURL(file);
        }
        validFiles.push(fileWithPreview);
      } else {
        onUploadError?.(error || 'Invalid file');
      }
    }

    if (multiple) {
      setFiles(prev => {
        const newFiles = [...prev, ...validFiles];
        return newFiles.slice(0, maxFiles);
      });
    } else {
      setFiles(validFiles.slice(0, 1));
    }
  }, [multiple, maxFiles, validateImage, showPreview, onUploadError, error]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  // Upload files
  const handleUpload = useCallback(async () => {
    if (files.length === 0) return;

    try {
      if (multiple) {
        const results = await Promise.all(files.map(file => uploadImage(file)));
        
        if (results.length > 0) {
          onUploadComplete?.(results);
        }
      } else {
        const result = await uploadImage(files[0]);
        onUploadComplete?.(result);
      }

      // Clear files after successful upload
      setFiles([]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      onUploadError?.(errorMessage);
    }
  }, [files, multiple, uploadImage, onUploadComplete, onUploadError]);

  // Remove file
  const removeFile = useCallback((index: number) => {
    setFiles(prev => {
      const newFiles = prev.filter((_, i) => i !== index);
      return newFiles;
    });
  }, []);

  // Clear all files
  const clearFiles = useCallback(() => {
    setFiles([]);
  }, []);

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return (
    <div className={cn('w-full', className)}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple={multiple}
        accept={accept}
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Area */}
      <div
        className={cn(
          'border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200',
          isDragOver
            ? 'border-primary-500 bg-primary-50'
            : 'border-gray-300 hover:border-gray-400',
          disabled && 'opacity-50 cursor-not-allowed',
          isUploading && 'pointer-events-none'
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
            <Upload className="w-6 h-6 text-gray-600" />
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? 'Uploading...' : 'Upload Images'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              {multiple 
                ? `Drag and drop up to ${maxFiles} images, or click to browse`
                : 'Drag and drop an image, or click to browse'
              }
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Max file size: {formatFileSize(IMAGE_CONFIG.maxFileSize)} • 
              Supported: {IMAGE_CONFIG.allowedTypes.join(', ')}
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {/* The error state and clearing logic are now managed by the component's own state */}
      {/* This section is no longer needed as per the edit hint */}
      {/* {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500" />
            <span className="text-sm text-red-700">{error}</span>
            <button
              onClick={clearError}
              className="ml-auto text-red-500 hover:text-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )} */}

      {/* File Preview */}
      {files.length > 0 && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium text-gray-900">
              Selected Files ({files.length})
            </h4>
            <button
              onClick={clearFiles}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Clear All
            </button>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {files.map((file, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  {file.preview ? (
                    <Image
                      src={file.preview}
                      alt={file.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <ImageIcon className="w-8 h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="absolute top-2 right-2">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(index);
                    }}
                    className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
                
                <div className="mt-2">
                  <p className="text-xs text-gray-600 truncate">{file.name}</p>
                  <p className="text-xs text-gray-400">{formatFileSize(file.size)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <div className="mt-4 space-y-2">
          <h4 className="text-sm font-medium text-gray-900">Upload Progress</h4>
          <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-gray-700">Uploading...</span>
                <span className="text-xs text-gray-500">{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="h-2 rounded-full transition-all duration-300 bg-blue-500"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
            
            <div className="flex-shrink-0">
              <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
          {error && (
            <div className="p-3 bg-red-50 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      )}

      {/* Upload Button */}
      {files.length > 0 && !isUploading && (
        <div className="mt-4">
          <button
            onClick={handleUpload}
            disabled={disabled || isUploading}
            className={cn(
              'w-full px-4 py-2 bg-primary-600 text-white rounded-lg font-medium transition-colors',
              'hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
              'disabled:opacity-50 disabled:cursor-not-allowed'
            )}
          >
            {isUploading ? 'Uploading...' : `Upload ${files.length} file${files.length > 1 ? 's' : ''}`}
          </button>
        </div>
      )}
    </div>
  );
};
