'use client'

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Upload, X, Image as ImageIcon, AlertCircle, CheckCircle } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

export interface ImageUploadProps {
  onImagesUploaded: (urls: string[]) => void;
  maxImages?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  storagePath: string;
  className?: string;
  disabled?: boolean;
  showPreview?: boolean;
  aspectRatio?: 'square' | '4/3' | '16/9' | 'free';
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: 'uploading' | 'success' | 'error';
  error?: string;
  url?: string;
}

// ============================================================================
// IMAGE UPLOAD COMPONENT
// ============================================================================

export default function ImageUpload({
  onImagesUploaded,
  maxImages = 5,
  maxFileSize = 10 * 1024 * 1024, // 10MB
  allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
  storagePath,
  className = '',
  disabled = false,
  showPreview = true,
  aspectRatio = 'free'
}: ImageUploadProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============================================================================
  // FILE VALIDATION
  // ============================================================================

  const validateFile = (file: File): { isValid: boolean; error?: string } => {
    // Check file size
    if (file.size > maxFileSize) {
      return {
        isValid: false,
        error: `File size exceeds ${Math.round(maxFileSize / 1024 / 1024)}MB limit`
      };
    }

    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        error: `Invalid file type. Allowed: ${allowedTypes.join(', ')}`
      };
    }

    // Check if we've reached max images
    if (uploadProgress.length >= maxImages) {
      return {
        isValid: false,
        error: `Maximum ${maxImages} images allowed`
      };
    }

    return { isValid: true };
  };

  // ============================================================================
  // UPLOAD FUNCTIONS
  // ============================================================================

  const uploadFile = async (file: File): Promise<string> => {
    // Mock implementation
    const fileName = `mock-${Date.now()}-${file.name}`;
    const path = `${storagePath}/${fileName}`;
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Return mock URL
    return URL.createObjectURL(file);
  };

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    const validFiles: File[] = [];
    const errors: string[] = [];

    // Validate files
    fileArray.forEach(file => {
      const validation = validateFile(file);
      if (validation.isValid) {
        validFiles.push(file);
      } else {
        errors.push(`${file.name}: ${validation.error}`);
      }
    });

    // Show errors if any
    if (errors.length > 0) {
      console.error('File validation errors:', errors);
      // You can add a toast notification here
    }

    if (validFiles.length === 0) return;

    // Add files to progress tracking
    const newProgress: UploadProgress[] = validFiles.map(file => ({
      file,
      progress: 0,
      status: 'uploading'
    }));

    setUploadProgress(prev => [...prev, ...newProgress]);

    // Upload files
    try {
      const uploadPromises = validFiles.map(async (file, index) => {
        const progressIndex = uploadProgress.length + index;
        
        try {
          const url = await uploadFile(file);
          
          setUploadProgress(prev => prev.map((item, i) => 
            i === progressIndex 
              ? { ...item, progress: 100, status: 'success' as const, url }
              : item
          ));

          return url;
        } catch (error) {
          setUploadProgress(prev => prev.map((item, i) => 
            i === progressIndex 
              ? { ...item, progress: 0, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
              : item
          ));
          throw error;
        }
      });

      const urls = await Promise.all(uploadPromises);
      const successfulUrls = urls.filter(url => url);
      
      if (successfulUrls.length > 0) {
        onImagesUploaded(successfulUrls);
      }

    } catch (error) {
      console.error('Upload failed:', error);
    }
  };

  // ============================================================================
  // EVENT HANDLERS
  // ============================================================================

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFileUpload(files);
    }
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(false);
    
    const files = event.dataTransfer.files;
    if (files) {
      handleFileUpload(files);
    }
  }, []);

  const handleRemoveFile = (index: number) => {
    setUploadProgress(prev => prev.filter((_, i) => i !== index));
  };

  const handleRetryUpload = async (index: number) => {
    const item = uploadProgress[index];
    if (!item) return;

    setUploadProgress(prev => prev.map((p, i) => 
      i === index ? { ...p, status: 'uploading' as const, progress: 0, error: undefined }
      : p
    ));

    try {
      const url = await uploadFile(item.file);
      setUploadProgress(prev => prev.map((p, i) => 
        i === index ? { ...p, progress: 100, status: 'success' as const, url }
        : p
      ));
    } catch (error) {
      setUploadProgress(prev => prev.map((p, i) => 
        i === index ? { ...p, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
        : p
      ));
    }
  };

  // ============================================================================
  // RENDER FUNCTIONS
  // ============================================================================

  const renderUploadArea = () => (
    <div
      className={`
        relative border-2 border-dashed rounded-lg p-6 text-center transition-all
        ${isDragging 
          ? 'border-primary-500 bg-primary-50' 
          : 'border-gray-300 hover:border-primary-400'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
        ${className}
      `}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && fileInputRef.current?.click()}
    >
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept={allowedTypes.join(',')}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />
      
      <div className="space-y-2">
        <div className="flex justify-center">
          <div className="p-3 bg-primary-100 rounded-full">
            <Upload className="h-6 w-6 text-primary-600" />
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-gray-900">
            {isDragging ? 'Drop images here' : 'Click to upload or drag and drop'}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {allowedTypes.join(', ')} up to {Math.round(maxFileSize / 1024 / 1024)}MB
          </p>
          <p className="text-xs text-gray-500">
            {uploadProgress.length}/{maxImages} images
          </p>
        </div>
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="space-y-3 mt-4">
      {uploadProgress.map((item, index) => (
        <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0">
            {item.status === 'success' ? (
              <CheckCircle className="h-5 w-5 text-green-500" />
            ) : item.status === 'error' ? (
              <AlertCircle className="h-5 w-5 text-red-500" />
            ) : (
              <ImageIcon className="h-5 w-5 text-gray-400" />
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {item.file.name}
            </p>
            
            {item.status === 'uploading' && (
              <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                <div 
                  className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${item.progress}%` }}
                />
              </div>
            )}
            
            {item.status === 'error' && item.error && (
              <p className="text-xs text-red-600 mt-1">{item.error}</p>
            )}
          </div>
          
          <div className="flex-shrink-0 flex space-x-1">
            {item.status === 'error' && (
              <button
                onClick={() => handleRetryUpload(index)}
                className="p-1 text-gray-400 hover:text-primary-600 transition-colors"
                title="Retry upload"
              >
                <Upload className="h-4 w-4" />
              </button>
            )}
            
            <button
              onClick={() => handleRemoveFile(index)}
              className="p-1 text-gray-400 hover:text-red-600 transition-colors"
              title="Remove file"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );

  const renderPreview = () => {
    if (!showPreview) return null;

    const successfulUploads = uploadProgress.filter(item => item.status === 'success' && item.url);
    
    if (successfulUploads.length === 0) return null;

    return (
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Uploaded Images</h4>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {successfulUploads.map((item, index) => (
            <div key={index} className="relative group aspect-square">
              <Image
                src={item.url || ''}
                alt={item.file.name}
                width={200}
                height={200}
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                onClick={() => handleRemoveFile(uploadProgress.findIndex(p => p.file === item.file))}
                className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ============================================================================
  // MAIN RENDER
  // ============================================================================

  return (
    <div className="space-y-4">
      {renderUploadArea()}
      {uploadProgress.length > 0 && renderProgress()}
      {renderPreview()}
    </div>
  );
} 
