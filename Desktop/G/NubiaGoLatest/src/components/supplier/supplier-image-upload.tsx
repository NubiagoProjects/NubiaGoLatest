'use client';

import React, { useState, useRef, useCallback } from 'react';
import { Upload, X, CheckCircle, AlertCircle, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { 
  useSupplierImageUpload, 
  validateSupplierImage, 
  getImageOptimizationInfo,
  ImageUploadProgress 
} from '@/lib/supplier-image-utils';
import { ImageMetadata } from '@/lib/image-utils';

interface SupplierImageUploadProps {
  productId: string;
  userId: string;
  onUploadComplete?: (metadata: ImageMetadata) => void;
  onUploadError?: (error: string) => void;
  onReplaceComplete?: (metadata: ImageMetadata) => void;
  onReplaceError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
  showOptimizationInfo?: boolean;
}

export const SupplierImageUpload: React.FC<SupplierImageUploadProps> = ({
  productId,
  userId,
  onUploadComplete,
  onUploadError,
  onReplaceComplete,
  onReplaceError,
  className = '',
  disabled = false,
  showOptimizationInfo = true
}) => {
  const { uploadImage, uploading, progress } = useSupplierImageUpload();
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<ImageUploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [optimizationInfo, setOptimizationInfo] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file
    const validation = validateSupplierImage(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      onUploadError?.(validation.error || 'Invalid file');
      return;
    }

    setIsUploading(true);
    setError(null);
    setOptimizationInfo(null);

    try {
      const result = await uploadImage(file, productId);
      setUploadProgress({ file, progress: 100, status: 'completed' });
      setIsUploading(false);
      if (onUploadComplete) {
        const imageMetadata = {
          id: result.id,
          originalName: result.name,
          urls: {
            original: result.url,
            thumbnail: result.url
          },
          size: result.size,
          type: result.type,
          uploadedAt: result.uploadedAt,
          isActive: result.isActive
        };
        onUploadComplete(imageMetadata);
      }
    } catch (error) {
      setUploadProgress({ file, progress: 0, status: 'error', error: error instanceof Error ? error.message : 'Upload failed' });
      setIsUploading(false);
      setError(error instanceof Error ? error.message : 'Upload failed');
      onUploadError?.(error instanceof Error ? error.message : 'Upload failed');
    }
  }, [productId, userId, onUploadComplete, onUploadError, uploadImage]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  // Handle drag and drop
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  // Trigger file input
  const triggerFileInput = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileInputChange}
        className="hidden"
        disabled={disabled || isUploading}
      />

      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-all duration-200 cursor-pointer
          ${disabled || isUploading 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-300 hover:border-primary-500 hover:bg-primary-50'
          }
        `}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={triggerFileInput}
      >
        <div className="flex flex-col items-center space-y-4">
          <div className="flex items-center justify-center w-12 h-12 bg-gray-100 rounded-full">
            {isUploading ? (
              <RefreshCw className="w-6 h-6 text-primary-600 animate-spin" />
            ) : (
              <Upload className="w-6 h-6 text-gray-600" />
            )}
          </div>
          
          <div>
            <p className="text-lg font-medium text-gray-900">
              {isUploading ? 'Uploading...' : 'Upload Product Image'}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Drag and drop an image, or click to browse
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Max file size: 10MB • Supported: JPEG, PNG, WebP, GIF
            </p>
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
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
      )}

      {/* Upload Progress */}
      {uploadProgress && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-blue-700 truncate">
                  {uploadProgress.file.name}
                </span>
                <span className="text-xs text-blue-500">
                  {uploadProgress.progress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${uploadProgress.status === 'completed' ? 'bg-green-500' :
                      uploadProgress.status === 'error' ? 'bg-red-500' : 'bg-blue-500'}
                  `}
                  style={{ width: `${uploadProgress.progress}%` }}
                />
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {uploadProgress.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {uploadProgress.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              {uploadProgress.status === 'uploading' && (
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              )}
            </div>
          </div>
          
          {uploadProgress.error && (
            <p className="text-xs text-red-600 mt-2">{uploadProgress.error}</p>
          )}
        </div>
      )}

      {/* Optimization Info */}
      {optimizationInfo && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            Image Optimized Successfully
          </h4>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-green-600">Original Size:</span>
              <span className="ml-1 text-green-800">{optimizationInfo.originalSize}</span>
            </div>
            <div>
              <span className="text-green-600">Optimized Size:</span>
              <span className="ml-1 text-green-800">{optimizationInfo.optimizedSize}</span>
            </div>
            <div>
              <span className="text-green-600">Compression:</span>
              <span className="ml-1 text-green-800">
                {optimizationInfo.compressionRatio.toFixed(1)}% smaller
              </span>
            </div>
            <div>
              <span className="text-green-600">Dimensions:</span>
              <span className="ml-1 text-green-800">{optimizationInfo.dimensions}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 
