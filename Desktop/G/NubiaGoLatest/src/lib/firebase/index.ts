// Firebase Service Index
// Optimized exports to reduce bundle size - only export what's needed

// Core Firebase app initialization
export { initializeApp } from 'firebase/app'

// Authentication service
export {
  signInUser,
  createUser,
  signOutUser,
  resetPassword,
  confirmPasswordResetCode,
  onAuthStateChange,
  type User,
  type Auth
} from './auth'

// Firestore service
export {
  createDocument,
  getDocumentData,
  updateDocument,
  deleteDocument,
  getDocuments,
  subscribeToDocument,
  subscribeToCollection,
  type Firestore,
  type CollectionReference,
  type DocumentReference,
  type Query,
  type DocumentData
} from './firestore'

// Storage service
export {
  uploadFile,
  uploadString,
  getFileURL,
  deleteFile,
  listFiles,
  generateUniquePath,
  getFileExtension,
  isValidImageFile,
  isValidDocumentFile,
  type StorageReference,
  type UploadResult,
  type ListResult
} from './storage'

// Configuration
export { default as firebaseConfig } from './config'

// Re-export only essential Firebase types
export type { FirebaseApp } from 'firebase/app'
