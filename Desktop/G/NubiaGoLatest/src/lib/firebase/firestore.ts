// Firebase Firestore Service
// Optimized imports to reduce bundle size

import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  Firestore,
  CollectionReference,
  DocumentReference,
  Query,
  DocumentData
} from 'firebase/firestore'

import { db as existingFirestore } from './config'

// Use existing Firebase firestore instance
export const getFirebaseFirestore = () => {
  return existingFirestore
}

// Collection helpers
export const getCollection = <T = DocumentData>(collectionName: string): CollectionReference<T> => {
  const firestore = getFirebaseFirestore()
  return collection(firestore, collectionName) as CollectionReference<T>
}

export const getDocument = <T = DocumentData>(collectionName: string, docId: string): DocumentReference<T> => {
  const firestore = getFirebaseFirestore()
  return doc(firestore, collectionName, docId) as DocumentReference<T>
}

// CRUD operations
export const createDocument = async <T extends DocumentData>(
  collectionName: string, 
  data: T
): Promise<{ id: string; success: boolean; error: string | null }> => {
  try {
    const collectionRef = getCollection(collectionName)
    const docRef = await addDoc(collectionRef, data as any)
    return { id: docRef.id, success: true, error: null }
  } catch (error: any) {
    return { id: '', success: false, error: error.message }
  }
}

export const getDocumentData = async <T = DocumentData>(
  collectionName: string, 
  docId: string
): Promise<{ data: T | null; success: boolean; error: string | null }> => {
  try {
    const docRef = getDocument(collectionName, docId)
    const docSnap = await getDoc(docRef)
    
    if (docSnap.exists()) {
      return { data: { id: docSnap.id, ...docSnap.data() } as T, success: true, error: null }
    } else {
      return { data: null, success: false, error: 'Document not found' }
    }
  } catch (error: any) {
    return { data: null, success: false, error: error.message }
  }
}

export const updateDocument = async <T = DocumentData>(
  collectionName: string, 
  docId: string, 
  data: Partial<T>
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const docRef = getDocument(collectionName, docId)
    await updateDoc(docRef, data as any)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

export const deleteDocument = async (
  collectionName: string, 
  docId: string
): Promise<{ success: boolean; error: string | null }> => {
  try {
    const docRef = getDocument(collectionName, docId)
    await deleteDoc(docRef)
    return { success: true, error: null }
  } catch (error: any) {
    return { success: false, error: error.message }
  }
}

// Query helpers
export const createQuery = <T = DocumentData>(
  collectionName: string,
  constraints: Array<{ field: string; operator: string; value: any }> = [],
  sortBy?: { field: string; direction: 'asc' | 'desc' },
  limitCount?: number
): Query<T> => {
  const collectionRef = getCollection<T>(collectionName)
  let q: Query<T> = collectionRef

  // Add where constraints
  constraints.forEach(({ field, operator, value }) => {
    q = query(q, where(field, operator as any, value))
  })

  // Add sorting
  if (sortBy) {
    q = query(q, orderBy(sortBy.field, sortBy.direction))
  }

  // Add limit
  if (limitCount) {
    q = query(q, limit(limitCount))
  }

  return q
}

export const getDocuments = async <T = DocumentData>(
  collectionName: string,
  constraints: Array<{ field: string; operator: string; value: any }> = [],
  sortBy?: { field: string; direction: 'asc' | 'desc' },
  limitCount?: number
): Promise<{ data: T[]; success: boolean; error: string | null }> => {
  try {
    const q = createQuery<T>(collectionName, constraints, sortBy, limitCount)
    const querySnapshot = await getDocs(q)
    
    const documents: T[] = []
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() } as T)
    })
    
    return { data: documents, success: true, error: null }
  } catch (error: any) {
    return { data: [], success: false, error: error.message }
  }
}

// Real-time listeners
export const subscribeToDocument = <T = DocumentData>(
  collectionName: string,
  docId: string,
  callback: (data: T | null) => void
) => {
  const docRef = getDocument<T>(collectionName, docId)
  return onSnapshot(docRef, (doc) => {
    if (doc.exists()) {
      callback({ id: doc.id, ...doc.data() } as T)
    } else {
      callback(null)
    }
  })
}

export const subscribeToCollection = <T = DocumentData>(
  collectionName: string,
  callback: (data: T[]) => void,
  constraints: Array<{ field: string; operator: string; value: any }> = [],
  sortBy?: { field: string; direction: 'asc' | 'desc' },
  limitCount?: number
) => {
  const q = createQuery<T>(collectionName, constraints, sortBy, limitCount)
  return onSnapshot(q, (querySnapshot) => {
    const documents: T[] = []
    querySnapshot.forEach((doc) => {
      documents.push({ id: doc.id, ...doc.data() } as T)
    })
    callback(documents)
  })
}

// Export types
export type { 
  Firestore, 
  CollectionReference, 
  DocumentReference, 
  Query, 
  DocumentData 
}
