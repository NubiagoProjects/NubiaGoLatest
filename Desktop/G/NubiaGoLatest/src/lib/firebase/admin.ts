import { initializeApp, getApps, cert, applicationDefault } from 'firebase-admin/app'
import { getAuth } from 'firebase-admin/auth'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'
import { logger } from '@/lib/utils/logger'

// Initialize Firebase Admin with fallback options
let adminApp

try {
  if (getApps().length === 0) {
    // Try to use service account credentials first
    if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
      adminApp = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET || `${process.env.FIREBASE_PROJECT_ID}.appspot.com`,
      })
    } else {
      // For client-side only apps, create a minimal admin app
      // This won't interfere with client-side authentication
      adminApp = initializeApp({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'concrete-setup-468208-v0',
        storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'concrete-setup-468208-v0'}.appspot.com`,
      }, 'admin-app')
    }
  } else {
    adminApp = getApps()[0]
  }
} catch (error) {
  logger.error('Firebase Admin initialization failed:', error)
  
  // Create a minimal app for build time or fallback
  adminApp = initializeApp({
    projectId: 'concrete-setup-468208-v0',
    storageBucket: 'concrete-setup-468208-v0.appspot.com',
  }, 'fallback-admin')
}

// Initialize Admin services with error handling
export const adminAuth = getAuth(adminApp)
export const adminDb = getFirestore(adminApp)
export const adminStorage = getStorage(adminApp)

export default adminApp 
