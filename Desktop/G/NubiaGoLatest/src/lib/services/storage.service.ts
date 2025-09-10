import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL, 
  deleteObject,
  listAll,
  StorageReference
} from 'firebase/storage'
import { storage } from '@/lib/firebase/config'

export interface UploadResult {
  url: string
  path: string
  filename: string
  size: number
  contentType: string
}

export interface DocumentMetadata {
  originalName: string
  contentType: string
  size: number
  uploadedAt: Date
  uploadedBy: string
}

export class StorageService {
  private storage = getStorage()

  /**
   * Validate file size
   */
  validateFileSize(file: File, maxSizeMB: number): boolean {
    const maxSizeBytes = maxSizeMB * 1024 * 1024 // Convert MB to bytes
    return file.size <= maxSizeBytes
  }

  /**
   * Validate file type
   */
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type)
  }

  /**
   * Upload business documents for supplier registration
   */
  async uploadBusinessDocuments(
    userId: string, 
    files: File[], 
    category: 'business-license' | 'tax-document' | 'certification' | 'other' = 'other'
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []

    for (const file of files) {
      try {
        // Validate file
        this.validateFile(file)

        // Create unique filename
        const timestamp = Date.now()
        const filename = `${category}_${timestamp}_${file.name}`
        const path = `business-documents/${userId}/${filename}`

        // Upload to Firebase Storage
        const storageRef = ref(this.storage, path)
        const snapshot = await uploadBytes(storageRef, file)

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref)

        // Store metadata in Firestore
        await this.storeDocumentMetadata(userId, {
          path,
          filename,
          originalName: file.name,
          contentType: file.type,
          size: file.size,
          uploadedAt: new Date(),
          uploadedBy: userId,
          category
        })

        results.push({
          url: downloadURL,
          path,
          filename,
          size: file.size,
          contentType: file.type
        })

        console.log(`✅ Uploaded: ${file.name} -> ${path}`)
      } catch (error) {
        console.error(`❌ Failed to upload ${file.name}:`, error)
        throw new Error(`Failed to upload ${file.name}: ${error}`)
      }
    }

    return results
  }

  /**
   * Upload product images
   */
  async uploadProductImages(
    productId: string, 
    files: File[]
  ): Promise<UploadResult[]> {
    const results: UploadResult[] = []

    for (const file of files) {
      try {
        // Validate image file
        this.validateImageFile(file)

        // Create unique filename
        const timestamp = Date.now()
        const filename = `product_${timestamp}_${file.name}`
        const path = `products/${productId}/${filename}`

        // Upload to Firebase Storage
        const storageRef = ref(this.storage, path)
        const snapshot = await uploadBytes(storageRef, file)

        // Get download URL
        const downloadURL = await getDownloadURL(snapshot.ref)

        results.push({
          url: downloadURL,
          path,
          filename,
          size: file.size,
          contentType: file.type
        })

        console.log(`✅ Uploaded product image: ${file.name} -> ${path}`)
      } catch (error) {
        console.error(`❌ Failed to upload product image ${file.name}:`, error)
        throw new Error(`Failed to upload product image ${file.name}: ${error}`)
      }
    }

    return results
  }

  /**
   * Upload user profile image
   */
  async uploadProfileImage(
    userId: string, 
    file: File
  ): Promise<UploadResult> {
    try {
      // Validate image file
      this.validateImageFile(file)

      // Create filename
      const timestamp = Date.now()
      const filename = `profile_${timestamp}_${file.name}`
      const path = `profiles/${userId}/${filename}`

      // Upload to Firebase Storage
      const storageRef = ref(this.storage, path)
      const snapshot = await uploadBytes(storageRef, file)

      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref)

      console.log(`✅ Uploaded profile image: ${file.name} -> ${path}`)

      return {
        url: downloadURL,
        path,
        filename,
        size: file.size,
        contentType: file.type
      }
    } catch (error) {
      console.error(`❌ Failed to upload profile image ${file.name}:`, error)
      throw new Error(`Failed to upload profile image ${file.name}: ${error}`)
    }
  }

  /**
   * Delete file from storage
   */
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(this.storage, path)
      await deleteObject(storageRef)
      console.log(`✅ Deleted file: ${path}`)
    } catch (error) {
      console.error(`❌ Failed to delete file ${path}:`, error)
      throw new Error(`Failed to delete file ${path}: ${error}`)
    }
  }

  /**
   * Delete all files for a user
   */
  async deleteUserFiles(userId: string): Promise<void> {
    try {
      const userFolderRef = ref(this.storage, `business-documents/${userId}`)
      const files = await listAll(userFolderRef)

      // Delete all files in the folder
      const deletePromises = files.items.map(item => deleteObject(item))
      await Promise.all(deletePromises)

      console.log(`✅ Deleted all files for user: ${userId}`)
    } catch (error) {
      console.error(`❌ Failed to delete user files for ${userId}:`, error)
      throw new Error(`Failed to delete user files for ${userId}: ${error}`)
    }
  }

  /**
   * Get download URL for a file
   */
  async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(this.storage, path)
      return await getDownloadURL(storageRef)
    } catch (error) {
      console.error(`❌ Failed to get download URL for ${path}:`, error)
      throw new Error(`Failed to get download URL for ${path}: ${error}`)
    }
  }

  /**
   * Validate file before upload
   */
  private validateFile(file: File): void {
    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error(`File size exceeds 10MB limit: ${file.name}`)
    }

    // Check file type
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/webp',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ]

    if (!allowedTypes.includes(file.type)) {
      throw new Error(`File type not allowed: ${file.type}`)
    }
  }

  /**
   * Validate image file
   */
  private validateImageFile(file: File): void {
    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      throw new Error(`File is not an image: ${file.name}`)
    }

    // Check file size (max 5MB for images)
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error(`Image size exceeds 5MB limit: ${file.name}`)
    }

    // Check image dimensions (optional - would need to load image)
    // This could be implemented to check actual image dimensions
  }

  /**
   * Store document metadata in Firestore
   */
  private async storeDocumentMetadata(
    userId: string, 
    metadata: DocumentMetadata & { path: string; filename: string; category: string }
  ): Promise<void> {
    try {
      const { getFirestore, doc, setDoc } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase/config')

      await setDoc(doc(db, 'user_documents', `${userId}_${metadata.filename}`), {
        userId,
        ...metadata,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Failed to store document metadata:', error)
      // Don't throw error here as the file is already uploaded
    }
  }

  /**
   * Get user documents
   */
  async getUserDocuments(userId: string): Promise<any[]> {
    try {
      const { getFirestore, collection, query, where, getDocs } = await import('firebase/firestore')
      const { db } = await import('@/lib/firebase/config')

      const docsRef = collection(db, 'user_documents')
      const q = query(docsRef, where('userId', '==', userId))
      const snapshot = await getDocs(q)

      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))
    } catch (error) {
      console.error('Failed to get user documents:', error)
      return []
    }
  }

  /**
   * Generate thumbnail URL for images
   */
  async generateThumbnailURL(imageURL: string, width: number = 300): Promise<string> {
    // In a real implementation, you might use Firebase Extensions or a separate service
    // For now, return the original URL
    return imageURL
  }

  /**
   * Compress image before upload
   */
  async compressImage(file: File, quality: number = 0.8): Promise<File> {
    return new Promise((resolve, reject) => {
      if (typeof window === 'undefined') {
        resolve(file)
        return
      }
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new window.Image()

      img.onload = () => {
        // Calculate new dimensions (max 1200px width)
        const maxWidth = 1200
        const maxHeight = 1200
        let { width, height } = img

        if (width > maxWidth) {
          height = (height * maxWidth) / width
          width = maxWidth
        }

        if (height > maxHeight) {
          width = (width * maxHeight) / height
          height = maxHeight
        }

        canvas.width = width
        canvas.height = height

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height)
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Compression failed'))
              return
            }
            const compressedFile = new File([blob], file.name, { type: 'image/jpeg' })
            resolve(compressedFile)
          },
          'image/jpeg',
          quality
        )
      }

      img.onerror = () => reject(new Error('Failed to load image for compression'))
      
      const reader = new FileReader()
      reader.onload = (e) => {
        img.src = e.target?.result as string
      }
      reader.onerror = () => reject(new Error('Failed to read file'))
      reader.readAsDataURL(file)
    })
  }
}

export const storageService = new StorageService() 
