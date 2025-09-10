import { useState } from 'react'
import { getImagePath, validateImagePath } from './image-utils'

export interface SupplierImage {
  id: string
  url: string
  name: string
  size: number
  type: string
  uploadedAt: Date
  isActive: boolean
}

export interface ImageUploadProgress {
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  error?: string
}

export const supplierImageUtils = {
  // Validate image file
  validateImageFile: (file: File): { isValid: boolean; error?: string } => {
    const maxSize = 5 * 1024 * 1024 // 5MB
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.' }
    }
    
    if (file.size > maxSize) {
      return { isValid: false, error: 'File size too large. Maximum size is 5MB.' }
    }
    
    return { isValid: true }
  },

  // Generate image URL for supplier
  generateSupplierImageUrl: (imageName: string, supplierId: string): string => {
    return `/suppliers/${supplierId}/${imageName}`
  },

  // Process image for supplier use
  processSupplierImage: async (file: File): Promise<SupplierImage> => {
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        const image: SupplierImage = {
          id: `img-${Date.now()}`,
          url: reader.result as string,
          name: file.name,
          size: file.size,
          type: file.type,
          uploadedAt: new Date(),
          isActive: true
        }
        resolve(image)
      }
      reader.readAsDataURL(file)
    })
  },

  // Mock upload function
  uploadSupplierImage: async (file: File, supplierId: string): Promise<SupplierImage> => {
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      id: `supplier-img-${Date.now()}`,
      url: URL.createObjectURL(file),
      name: file.name,
      size: file.size,
      type: file.type,
      uploadedAt: new Date(),
      isActive: true
    }
  },

  // Delete supplier image
  deleteSupplierImage: async (imageId: string): Promise<boolean> => {
    // Simulate delete delay
    await new Promise(resolve => setTimeout(resolve, 500))
    return true
  },

  // Get supplier images
  getSupplierImages: async (supplierId: string): Promise<SupplierImage[]> => {
    // Mock data
    return [
      {
        id: 'supplier-img-1',
        url: '/product-headphones-1.jpg',
        name: 'headphones-1.jpg',
        size: 1024000,
        type: 'image/jpeg',
        uploadedAt: new Date(),
        isActive: true
      },
      {
        id: 'supplier-img-2',
        url: '/product-headphones-2.jpg',
        name: 'headphones-2.jpg',
        size: 2048000,
        type: 'image/jpeg',
        uploadedAt: new Date(),
        isActive: true
      }
    ]
  },

  // Update image status
  updateImageStatus: async (imageId: string, isActive: boolean): Promise<boolean> => {
    // Simulate update delay
    await new Promise(resolve => setTimeout(resolve, 300))
    return true
  },

  // Bulk operations
  bulkUploadImages: async (files: File[], supplierId: string): Promise<SupplierImage[]> => {
    const uploadPromises = files.map(file => supplierImageUtils.uploadSupplierImage(file, supplierId))
    return Promise.all(uploadPromises)
  },

  bulkDeleteImages: async (imageIds: string[]): Promise<boolean> => {
    const deletePromises = imageIds.map(id => supplierImageUtils.deleteSupplierImage(id))
    await Promise.all(deletePromises)
    return true
  }
}

// Hook for supplier image upload
export const useSupplierImageUpload = () => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState<ImageUploadProgress[]>([])

  const uploadImage = async (file: File, supplierId: string): Promise<SupplierImage> => {
    setUploading(true)
    const progressItem: ImageUploadProgress = {
      file,
      progress: 0,
      status: 'uploading'
    }
    setProgress(prev => [...prev, progressItem])

    try {
      // Simulate upload progress
      for (let i = 0; i <= 100; i += 10) {
        await new Promise(resolve => setTimeout(resolve, 100))
        setProgress(prev => 
          prev.map(item => 
            item.file === file 
              ? { ...item, progress: i }
              : item
          )
        )
      }

      const result = await supplierImageUtils.uploadSupplierImage(file, supplierId)
      
      setProgress(prev => 
        prev.map(item => 
          item.file === file 
            ? { ...item, progress: 100, status: 'completed' as const }
            : item
        )
      )
      
      setUploading(false)
      return result
    } catch (error) {
      setProgress(prev => 
        prev.map(item => 
          item.file === file 
            ? { ...item, status: 'error' as const, error: error instanceof Error ? error.message : 'Upload failed' }
            : item
        )
      )
      setUploading(false)
      throw error
    }
  }

  return {
    uploading,
    progress,
    uploadImage
  }
}

// Validation function
export const validateSupplierImage = (file: File): { isValid: boolean; error?: string } => {
  return supplierImageUtils.validateImageFile(file)
}

// Image optimization info
export const getImageOptimizationInfo = (file: File) => {
  return {
    originalSize: file.size,
    estimatedOptimizedSize: Math.round(file.size * 0.7), // Estimate 30% reduction
    canOptimize: file.size > 1024 * 1024, // Optimize if > 1MB
    recommendedWidth: 1920,
    recommendedHeight: 1080
  }
}

export default supplierImageUtils 
