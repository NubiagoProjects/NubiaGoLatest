import { 
  doc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  deleteDoc
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { User, Address } from '@/types'

export class UserService {
  // Get user profile
  async getUserProfile(uid: string): Promise<User | null> {
    try {
      const docRef = doc(db, 'users', uid)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        return null
      }

      return {
        uid: docSnap.id,
        ...docSnap.data()
      } as User
    } catch (error) {
      console.error('Error getting user profile:', error)
      // During build time, return null instead of throwing
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
        return null
      }
      throw new Error('Failed to fetch user profile')
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<User>): Promise<User> {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        ...updates,
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(userRef)
      return {
        uid: updatedDoc.id,
        ...updatedDoc.data()
      } as User
    } catch (error) {
      console.error('Error updating user profile:', error)
      throw new Error('Failed to update user profile')
    }
  }

  // Get user addresses
  async getUserAddresses(uid: string): Promise<Address[]> {
    try {
      const q = query(
        collection(db, 'users', uid, 'addresses'),
        where('isDefault', '==', false)
      )

      const snapshot = await getDocs(q)
      const addresses = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Address[]

      // Get default address
      const defaultQuery = query(
        collection(db, 'users', uid, 'addresses'),
        where('isDefault', '==', true)
      )
      const defaultSnapshot = await getDocs(defaultQuery)
      const defaultAddress = defaultSnapshot.docs[0]

      if (defaultAddress) {
        addresses.unshift({
          id: defaultAddress.id,
          ...defaultAddress.data()
        } as Address)
      }

      return addresses
    } catch (error) {
      console.error('Error getting user addresses:', error)
      // During build time, return empty array instead of throwing
      if (process.env.NODE_ENV === 'production' || process.env.NEXT_PHASE === 'phase-production-build') {
        return []
      }
      throw new Error('Failed to fetch user addresses')
    }
  }

  // Add user address
  async addUserAddress(uid: string, address: Omit<Address, 'id'>): Promise<Address> {
    try {
      // If this is the first address, make it default
      const existingAddresses = await this.getUserAddresses(uid)
      if (existingAddresses.length === 0) {
        address.isDefault = true
      }

      // If this address is set as default, unset others
      if (address.isDefault) {
        await this.clearDefaultAddress(uid)
      }

      const docRef = await addDoc(collection(db, 'users', uid, 'addresses'), {
        ...address,
        createdAt: new Date()
      })

      return {
        id: docRef.id,
        ...address
      } as Address
    } catch (error) {
      console.error('Error adding user address:', error)
      throw new Error('Failed to add address')
    }
  }

  // Update user address
  async updateUserAddress(uid: string, addressId: string, updates: Partial<Address>): Promise<Address> {
    try {
      const addressRef = doc(db, 'users', uid, 'addresses', addressId)
      await updateDoc(addressRef, {
        ...updates,
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(addressRef)
      return {
        id: updatedDoc.id,
        ...updatedDoc.data()
      } as Address
    } catch (error) {
      console.error('Error updating user address:', error)
      throw new Error('Failed to update address')
    }
  }

  // Delete user address
  async deleteUserAddress(uid: string, addressId: string): Promise<boolean> {
    try {
      const addressRef = doc(db, 'users', uid, 'addresses', addressId)
      await deleteDoc(addressRef)
      return true
    } catch (error) {
      console.error('Error deleting user address:', error)
      throw new Error('Failed to delete address')
    }
  }

  // Set default address
  async setDefaultAddress(uid: string, addressId: string): Promise<void> {
    try {
      // Clear current default
      await this.clearDefaultAddress(uid)

      // Set new default
      const addressRef = doc(db, 'users', uid, 'addresses', addressId)
      await updateDoc(addressRef, {
        isDefault: true,
        updatedAt: new Date()
      })
    } catch (error) {
      console.error('Error setting default address:', error)
      throw new Error('Failed to set default address')
    }
  }

  // Clear default address
  private async clearDefaultAddress(uid: string): Promise<void> {
    try {
      const q = query(
        collection(db, 'users', uid, 'addresses'),
        where('isDefault', '==', true)
      )
      const snapshot = await getDocs(q)
      
      const updatePromises = snapshot.docs.map(doc => 
        updateDoc(doc.ref, { isDefault: false })
      )
      
      await Promise.all(updatePromises)
    } catch (error) {
      console.error('Error clearing default address:', error)
      throw new Error('Failed to clear default address')
    }
  }

  // Get all users (admin only)
  async getAllUsers(): Promise<User[]> {
    try {
      const q = query(collection(db, 'users'))
      const snapshot = await getDocs(q)
      
      return snapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data()
      })) as User[]
    } catch (error) {
      console.error('Error getting all users:', error)
      throw new Error('Failed to fetch users')
    }
  }

  // Update user role (admin only)
  async updateUserRole(uid: string, role: 'customer' | 'supplier' | 'admin'): Promise<User> {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        role,
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(userRef)
      return {
        uid: updatedDoc.id,
        ...updatedDoc.data()
      } as User
    } catch (error) {
      console.error('Error updating user role:', error)
      throw new Error('Failed to update user role')
    }
  }

  // Update user status (admin only)
  async updateUserStatus(uid: string, status: 'active' | 'suspended' | 'pending'): Promise<User> {
    try {
      const userRef = doc(db, 'users', uid)
      await updateDoc(userRef, {
        status,
        updatedAt: new Date()
      })

      const updatedDoc = await getDoc(userRef)
      return {
        uid: updatedDoc.id,
        ...updatedDoc.data()
      } as User
    } catch (error) {
      console.error('Error updating user status:', error)
      throw new Error('Failed to update user status')
    }
  }
}

export const userService = new UserService() 
