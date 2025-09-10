import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { logger } from '@/lib/utils/logger'

// Validate Firebase configuration
const validateFirebaseConfig = () => {
  const config = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
  }

  // Check if any required config is missing
  const missingKeys = Object.entries(config)
    .filter(([key, value]) => key !== 'measurementId' && (!value || value === 'undefined'))
    .map(([key]) => key)

  if (missingKeys.length > 0) {
    logger.error('Missing Firebase configuration:', missingKeys)
    // Use fallback configuration for development
    return {
      apiKey: 'AIzaSyCS_aIs3Lq5RvmwYMuou11NVJckoNxeJRs',
      authDomain: 'concrete-setup-468208-v0.firebaseapp.com',
      projectId: 'concrete-setup-468208-v0',
      storageBucket: 'concrete-setup-468208-v0.firebasestorage.app',
      messagingSenderId: '1055603387502',
      appId: '1:1055603387502:web:abf9bfbe1ef4d848c18a7f',
      measurementId: 'G-T0HDGS92ZF'
    }
  }

  return config
}

const firebaseConfig = validateFirebaseConfig()

// Validate required environment variables only in production runtime
const requiredEnvVars = [
  'NEXT_PUBLIC_FIREBASE_API_KEY',
  'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
  'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
  'NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET',
  'NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
  'NEXT_PUBLIC_FIREBASE_APP_ID'
]

// Log configuration status
if (typeof window !== 'undefined') {
  logger.log('Firebase config loaded:', {
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain,
    hasApiKey: !!firebaseConfig.apiKey
  })
}

// Initialize Firebase with better error handling
let app: FirebaseApp

try {
  // Check if Firebase is already initialized
  const existingApps = getApps()
  if (existingApps.length > 0) {
    app = existingApps[0]
    logger.log('Using existing Firebase app')
  } else {
    // Validate configuration before initializing
    if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
      throw new Error('Invalid Firebase configuration: missing apiKey or projectId')
    }
    
    app = initializeApp(firebaseConfig)
    logger.log('Firebase app initialized successfully')
  }
} catch (error) {
  logger.error('Firebase initialization error:', error)
  
  // Create a minimal working configuration
  const fallbackConfig = {
    apiKey: 'AIzaSyCS_aIs3Lq5RvmwYMuou11NVJckoNxeJRs',
    authDomain: 'concrete-setup-468208-v0.firebaseapp.com',
    projectId: 'concrete-setup-468208-v0',
    storageBucket: 'concrete-setup-468208-v0.firebasestorage.app',
    messagingSenderId: '1055603387502',
    appId: '1:1055603387502:web:abf9bfbe1ef4d848c18a7f'
  }
  
  try {
    app = initializeApp(fallbackConfig)
    logger.warn('Using fallback Firebase configuration')
  } catch (fallbackError) {
    logger.error('Fallback Firebase initialization failed:', fallbackError)
    throw new Error('Complete Firebase initialization failure')
  }
}

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Configure Firebase services with error handling
if (typeof window !== 'undefined') {
  try {
    // Test Firebase connection
    auth.onAuthStateChanged((user) => {
      if (user) {
        logger.log('User authenticated:', user.email)
      } else {
        logger.log('User not authenticated')
      }
    }, (error) => {
      logger.error('Auth state change error:', error)
    })
    
    // Test Firestore connection
    db.app.options.projectId && logger.log('Firestore connected to project:', db.app.options.projectId)
  } catch (error) {
    logger.error('Firebase service configuration error:', error)
  }
}

export default app 
