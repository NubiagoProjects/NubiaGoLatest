// Firebase Storage Service
// Optimized imports to reduce bundle size

import { 
  ref, 
  uploadBytes, 
  uploadString as firebaseUploadString, 
  getDownloadURL, 
  deleteObject,
  listAll,
  StorageReference,
  UploadResult,
  ListResult
} from 'firebase/storage'

import { storage as existingStorage } from './config'

// Use existing Firebase storage instance
export const getFirebaseStorage = () => {
  return existingStorage
}

// Storage helpers
export const getStorageRef = (path: string): StorageReference => {
  const storage = getFirebaseStorage()
  return ref(storage, path)
}

export const getStorageRefFromURL = (url: string): StorageReference => {
  const storage = getFirebaseStorage()
  return ref(storage, url)
}

// Upload functions
export const uploadFile = async (
  path: string, 
  file: File | Blob
): Promise<{ url: string | null; success: boolean; error: string | null }> => {
  try {
    const storageRef = getStorageRef(path)
    const snapshot = await uploadBytes(storageRef, file)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return { url: downloadURL, success: true, error: null }
  } catch (error: any) {
    return { url: null, success: false, error: error.message }
  }
}

export const uploadString = async (
  path: string, 
  data: string, 
  format: 'raw' | 'base64' | 'base64url' | 'data_url' = 'raw'
): Promise<{ url: string | null; success: boolean; error: string | null }> => {
  try {
    const storageRef = getStorageRef(path)
    const snapshot = await firebaseUploadString(storageRef, data, format)
    const downloadURL = await getDownloadURL(snapshot.ref)
    
    return { url: downloadURL, success: true, error: null }
  } catch (error: any) {
    return { url: null, success: false, error: error.message }
  }
}

// Download functions
export const getFileURL = async (
  path: string
): Promise<{ url: string | null; success: boolean; error: string | null }> => {
  try {
    const storageRef = getStorageRef(path)
    const downloadURL = await getDownloadURL(storageRef)
    
    return { url: downloadURL, success: true, error: null }
  } catch (error: any) {
    return { url: null, success: false, error: error.message }
  }
}

// Delete functions
export const deleteFile = async (
  path: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const storageRef = getStorageRef(path)
    await deleteObject(storageRef)
    
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// List functions
export const listFiles = async (
  path: string
): Promise<{ files: string[]; success: boolean; error: string | null }> => {
  try {
    const storageRef = getStorageRef(path)
    const result = await listAll(storageRef)
    
    const files = result.items.map(item => item.fullPath)
    
    return { files, success: true, error: null }
  } catch (error: any) {
    return { files: [], success: false, error: error.message }
  }
}

// Utility functions
export const generateUniquePath = (folder: string, filename: string): string => {
  const timestamp = Date.now()
  const randomString = Math.random().toString(36).substring(2, 15)
  const extension = filename.split('.').pop()
  const nameWithoutExtension = filename.split('.').slice(0, -1).join('.')
  
  return `${folder}/${nameWithoutExtension}_${timestamp}_${randomString}.${extension}`
}

export const getFileExtension = (filename: string): string => {
  return filename.split('.').pop()?.toLowerCase() || ''
}

export const isValidImageFile = (file: File): boolean => {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  return validTypes.includes(file.type)
}

export const isValidDocumentFile = (file: File): boolean => {
  const validTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
  return validTypes.includes(file.type)
}

// Export types
export type { 
  StorageReference, 
  UploadResult, 
  ListResult 
}
