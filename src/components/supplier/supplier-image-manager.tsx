'use client';

import React, { useState, useRef, useCallback } from 'react';
import Image from 'next/image';
import { Edit, Trash2, RefreshCw, CheckCircle, AlertCircle, X, Image as ImageIcon } from 'lucide-react';
import { 
  useSupplierImageUpload, 
  validateSupplierImage, 
  getImageOptimizationInfo,
  ImageUploadProgress 
} from '@/lib/supplier-image-utils';
import { ImageMetadata } from '@/lib/image-utils';

interface SupplierImageManagerProps {
  productId: string;
  userId: string;
  currentImages: string[];
  onImageReplaced?: (oldImageUrl: string, newMetadata: ImageMetadata) => void;
  onImageDeleted?: (imageUrl: string) => void;
  onError?: (error: string) => void;
  className?: string;
  disabled?: boolean;
}

export const SupplierImageManager: React.FC<SupplierImageManagerProps> = ({
  productId,
  userId,
  currentImages,
  onImageReplaced,
  onImageDeleted,
  onError,
  className = '',
  disabled = false
}) => {
  const { uploadImage, uploading, progress } = useSupplierImageUpload();
  
  const [replacingImage, setReplacingImage] = useState<string | null>(null);
  const [replaceProgress, setReplaceProgress] = useState<ImageUploadProgress | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [optimizationInfo, setOptimizationInfo] = useState<any>(null);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle image upload
  const handleImageUpload = useCallback(async (file: File) => {
    // Validate file
    const validation = validateSupplierImage(file);
    if (!validation.isValid) {
      setError(validation.error || 'Invalid file');
      onError?.(validation.error || 'Invalid file');
      return;
    }

    setError(null);
    setOptimizationInfo(null);

    try {
      const result = await uploadImage(file, productId);
      
      // Show optimization info
      const info = getImageOptimizationInfo(file);
      setOptimizationInfo(info);
      
      onImageReplaced?.('', { 
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
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Upload failed';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [productId, onImageReplaced, onError, uploadImage]);

  // Handle file selection
  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    await handleImageUpload(files[0]);
  }, [handleImageUpload]);

  // Handle file input change
  const handleFileInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    handleFileSelect(e.target.files);
  }, [handleFileSelect]);

  // Handle image deletion (mock)
  const handleDeleteImage = useCallback(async (imageUrl: string) => {
    try {
      // Mock delete - in real app this would call an API
      await new Promise(resolve => setTimeout(resolve, 500));
      onImageDeleted?.(imageUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Delete failed';
      setError(errorMessage);
      onError?.(errorMessage);
    }
  }, [onImageDeleted, onError]);

  // Trigger file input for upload
  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.onchange = (e) => handleFileInputChange(e as any);
      fileInputRef.current.click();
    }
  }, [handleFileInputChange]);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* File Input for Replacement */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        disabled={disabled}
      />

      {/* Current Images */}
      {currentImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Current Product Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentImages.map((imageUrl, index) => (
              <div key={index} className="relative group">
                <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={imageUrl}
                    alt={`Product ${index + 1}`}
                    width={200}
                    height={200}
                    className="w-full h-full object-cover"
                  />
                  
                  {/* Overlay with actions */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                      <button
                        onClick={() => triggerFileInput()}
                        disabled={disabled || replacingImage === imageUrl}
                        className="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 disabled:opacity-50"
                        title="Replace image"
                      >
                        <Edit className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(imageUrl)}
                        disabled={disabled}
                        className="p-2 bg-red-500 rounded-full shadow-lg hover:bg-red-600 disabled:opacity-50"
                        title="Delete image"
                      >
                        <Trash2 className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  </div>
                  
                  {/* Loading indicator */}
                  {replacingImage === imageUrl && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <RefreshCw className="w-6 h-6 text-white animate-spin" />
                    </div>
                  )}
                </div>
                
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-600">Image {index + 1}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

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

      {/* Replace Progress */}
      {replaceProgress && (
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-blue-700 truncate">
                  Replacing: {replaceProgress.file.name}
                </span>
                <span className="text-xs text-blue-500">
                  {replaceProgress.progress}%
                </span>
              </div>
              <div className="w-full bg-blue-200 rounded-full h-2">
                <div
                  className={`
                    h-2 rounded-full transition-all duration-300
                    ${replaceProgress.status === 'completed' ? 'bg-green-500' :
                      replaceProgress.status === 'error' ? 'bg-red-500' : 'bg-blue-500'}
                  `}
                  style={{ width: `${replaceProgress.progress}%` }}
                />
              </div>
            </div>
            
            <div className="flex-shrink-0">
              {replaceProgress.status === 'completed' && (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              {replaceProgress.status === 'error' && (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              {replaceProgress.status === 'uploading' && (
                <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />
              )}
            </div>
          </div>
          
          {replaceProgress.error && (
            <p className="text-xs text-red-600 mt-2">{replaceProgress.error}</p>
          )}
        </div>
      )}

      {/* Optimization Info */}
      {optimizationInfo && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <h4 className="text-sm font-medium text-green-800 mb-2">
            Image Replaced & Optimized Successfully
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

      {/* Empty State */}
      {currentImages.length === 0 && (
        <div className="text-center py-8">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Product Images</h3>
          <p className="text-gray-600">Upload images to showcase your product</p>
        </div>
      )}
    </div>
  );
}; 
