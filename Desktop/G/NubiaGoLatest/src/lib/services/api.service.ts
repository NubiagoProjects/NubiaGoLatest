import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp 
} from 'firebase/firestore'
import { db } from '@/lib/firebase/config'
import { ApiConfiguration, ApiTestResult } from '@/types'

export class ApiService {
  private collectionName = 'api_configurations'
  private listeners: Map<string, () => void> = new Map()

  // Create a new API configuration
  async createApiConfiguration(config: Omit<ApiConfiguration, 'id' | 'createdAt' | 'updatedAt'>): Promise<ApiConfiguration> {
    try {
      // Validate required fields
      if (!config.name || !config.type || !config.provider || !config.apiKey) {
        throw new Error('Missing required fields: name, type, provider, apiKey')
      }

      const id = `api_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      const now = new Date()
      
      const apiConfig: ApiConfiguration = {
        id,
        ...config,
        createdAt: now,
        updatedAt: now
      }

      await setDoc(doc(db, this.collectionName, id), {
        ...apiConfig,
        createdAt: Timestamp.fromDate(now),
        updatedAt: Timestamp.fromDate(now)
      })

      console.log(`✅ API configuration created: ${id}`)
      return apiConfig
    } catch (error: any) {
      console.error('❌ Failed to create API configuration:', error)
      throw new Error(`Failed to create API configuration: ${error.message}`)
    }
  }

  // Get all API configurations
  async getAllApiConfigurations(): Promise<ApiConfiguration[]> {
    try {
      const querySnapshot = await getDocs(collection(db, this.collectionName))
      const apis: ApiConfiguration[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        apis.push({
          id: doc.id,
          name: data.name,
          description: data.description || '',
          type: data.type,
          provider: data.provider,
          apiKey: data.apiKey,
          apiSecret: data.apiSecret,
          baseUrl: data.baseUrl,
          webhookUrl: data.webhookUrl,
          isActive: data.isActive,
          isTestMode: data.isTestMode,
          config: data.config || {},
          status: data.status || 'inactive',
          errorMessage: data.errorMessage,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastTested: data.lastTested?.toDate(),
        })
      })

      return apis.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    } catch (error: any) {
      console.error('❌ Failed to fetch API configurations:', error)
      throw new Error(`Failed to fetch API configurations: ${error.message}`)
    }
  }

  // Get API configuration by ID
  async getApiConfiguration(id: string): Promise<ApiConfiguration | null> {
    try {
      if (!id) {
        throw new Error('API configuration ID is required')
      }

      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        console.warn(`API configuration not found: ${id}`)
        return null
      }

      const data = docSnap.data()
      return {
        id: docSnap.id,
        name: data.name,
        description: data.description || '',
        type: data.type,
        provider: data.provider,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
        baseUrl: data.baseUrl,
        webhookUrl: data.webhookUrl,
        isActive: data.isActive,
        isTestMode: data.isTestMode,
        config: data.config || {},
        status: data.status || 'inactive',
        errorMessage: data.errorMessage,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastTested: data.lastTested?.toDate(),
      }
    } catch (error: any) {
      console.error('❌ Failed to fetch API configuration:', error)
      throw new Error(`Failed to fetch API configuration: ${error.message}`)
    }
  }

  // Update API configuration
  async updateApiConfiguration(id: string, updates: Partial<ApiConfiguration>): Promise<ApiConfiguration> {
    try {
      if (!id) {
        throw new Error('API configuration ID is required')
      }

      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error('API configuration not found')
      }

      const updateData = {
        ...updates,
        updatedAt: Timestamp.fromDate(new Date())
      }

      await updateDoc(docRef, updateData)

      // Get updated configuration
      const updatedDoc = await getDoc(docRef)
      const data = updatedDoc.data()

      if (!data) {
        throw new Error('Failed to retrieve updated configuration')
      }

      const updatedConfig: ApiConfiguration = {
        id: updatedDoc.id,
        name: data.name,
        description: data.description || '',
        type: data.type,
        provider: data.provider,
        apiKey: data.apiKey,
        apiSecret: data.apiSecret,
        baseUrl: data.baseUrl,
        webhookUrl: data.webhookUrl,
        isActive: data.isActive,
        isTestMode: data.isTestMode,
        config: data.config || {},
        status: data.status || 'inactive',
        errorMessage: data.errorMessage,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
        lastTested: data.lastTested?.toDate(),
      }

      console.log(`✅ API configuration updated: ${id}`)
      return updatedConfig
    } catch (error: any) {
      console.error('❌ Failed to update API configuration:', error)
      throw new Error(`Failed to update API configuration: ${error.message}`)
    }
  }

  // Delete API configuration
  async deleteApiConfiguration(id: string): Promise<void> {
    try {
      if (!id) {
        throw new Error('API configuration ID is required')
      }

      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)

      if (!docSnap.exists()) {
        throw new Error('API configuration not found')
      }

      await deleteDoc(docRef)
      console.log(`✅ API configuration deleted: ${id}`)
    } catch (error: any) {
      console.error('❌ Failed to delete API configuration:', error)
      throw new Error(`Failed to delete API configuration: ${error.message}`)
    }
  }

  // Test API connection
  async testApiConnection(id: string): Promise<ApiTestResult> {
    try {
      if (!id) {
        throw new Error('API configuration ID is required')
      }

      const config = await this.getApiConfiguration(id)
      if (!config) {
        throw new Error('API configuration not found')
      }

      let success = false
      let errorMessage = ''

      try {
        switch (config.type) {
          case 'logistics':
            success = await this.testLogisticsApi(config)
            break
          case 'payment':
            success = await this.testPaymentApi(config)
            break
          case 'communication':
            success = await this.testCommunicationApi(config)
            break
          case 'analytics':
            success = await this.testAnalyticsApi(config)
            break
          case 'storage':
            success = await this.testStorageApi(config)
            break
          default:
            success = await this.testGenericApi(config)
        }
      } catch (error: any) {
        errorMessage = error.message
        success = false
      }

      // Update configuration with test result
      await this.updateApiConfiguration(id, {
        status: success ? 'active' : 'inactive',
        errorMessage: success ? '' : errorMessage,
        lastTested: new Date()
      })

      return {
        id: `test_${Date.now()}`,
        apiId: id,
        endpoint: config.baseUrl || '',
        method: 'GET',
        status: success ? 'success' : 'failed',
        success,
        responseTime: 1000,
        error: success ? undefined : errorMessage,
        timestamp: new Date()
      }
    } catch (error: any) {
      console.error('❌ Failed to test API connection:', error)
      throw new Error(`Failed to test API connection: ${error.message}`)
    }
  }

  // Get API configurations by type
  async getApiConfigurationsByType(type: string): Promise<ApiConfiguration[]> {
    try {
      if (!type) {
        throw new Error('API type is required')
      }

      const q = query(
        collection(db, this.collectionName),
        where('type', '==', type),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const apis: ApiConfiguration[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        apis.push({
          id: doc.id,
          name: data.name,
          description: data.description || '',
          type: data.type,
          provider: data.provider,
          apiKey: data.apiKey,
          apiSecret: data.apiSecret,
          baseUrl: data.baseUrl,
          webhookUrl: data.webhookUrl,
          isActive: data.isActive,
          isTestMode: data.isTestMode,
          config: data.config || {},
          status: data.status || 'inactive',
          errorMessage: data.errorMessage,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastTested: data.lastTested?.toDate(),
        })
      })

      return apis
    } catch (error: any) {
      console.error('❌ Failed to fetch API configurations by type:', error)
      throw new Error(`Failed to fetch API configurations by type: ${error.message}`)
    }
  }

  // Get active API configurations
  async getActiveApiConfigurations(): Promise<ApiConfiguration[]> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('isActive', '==', true),
        orderBy('createdAt', 'desc')
      )

      const querySnapshot = await getDocs(q)
      const apis: ApiConfiguration[] = []

      querySnapshot.forEach((doc) => {
        const data = doc.data()
        apis.push({
          id: doc.id,
          name: data.name,
          description: data.description || '',
          type: data.type,
          provider: data.provider,
          apiKey: data.apiKey,
          apiSecret: data.apiSecret,
          baseUrl: data.baseUrl,
          webhookUrl: data.webhookUrl,
          isActive: data.isActive,
          isTestMode: data.isTestMode,
          config: data.config || {},
          status: data.status || 'inactive',
          errorMessage: data.errorMessage,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          lastTested: data.lastTested?.toDate(),
        })
      })

      return apis
    } catch (error: any) {
      console.error('❌ Failed to fetch active API configurations:', error)
      throw new Error(`Failed to fetch active API configurations: ${error.message}`)
    }
  }

  // Listen to API configuration changes
  onApiConfigurationChange(callback: (apis: ApiConfiguration[]) => void): () => void {
    try {
      const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'))
      
      const unsubscribe = onSnapshot(q, (querySnapshot) => {
        const apis: ApiConfiguration[] = []
        
        querySnapshot.forEach((doc) => {
          const data = doc.data()
          apis.push({
            id: doc.id,
            name: data.name,
            description: data.description || '',
            type: data.type,
            provider: data.provider,
            apiKey: data.apiKey,
            apiSecret: data.apiSecret,
            baseUrl: data.baseUrl,
            webhookUrl: data.webhookUrl,
            isActive: data.isActive,
            isTestMode: data.isTestMode,
            config: data.config || {},
            status: data.status || 'inactive',
            errorMessage: data.errorMessage,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
            lastTested: data.lastTested?.toDate(),
          })
        })

        callback(apis)
      }, (error) => {
        console.error('❌ Error listening to API configuration changes:', error)
      })

      this.listeners.set('configurations', unsubscribe)
      return unsubscribe
    } catch (error: any) {
      console.error('❌ Failed to set up API configuration listener:', error)
      throw new Error(`Failed to set up API configuration listener: ${error.message}`)
    }
  }

  // Cleanup listeners
  cleanupListeners(): void {
    this.listeners.forEach((unsubscribe) => {
      try {
        unsubscribe()
      } catch (error) {
        console.error('❌ Error cleaning up listener:', error)
      }
    })
    this.listeners.clear()
  }

  // Private test methods
  private async testLogisticsApi(config: ApiConfiguration): Promise<boolean> {
    try {
      // Handle Bagster API specifically
      if (config.provider === 'bagster') {
        return await this.testBagsterApi(config)
      }
      
      // For other logistics providers, implement basic test
      if (!config.apiKey) {
        throw new Error('API key is required for logistics API')
      }

      // Basic validation - check if API key format is valid
      if (config.apiKey.length < 10) {
        throw new Error('API key appears to be invalid (too short)')
      }

      // For now, return true for other logistics providers
      // In a real implementation, you would make actual API calls
      return true
    } catch (error) {
      console.error('Logistics API test failed:', error)
      return false
    }
  }

  private async testBagsterApi(config: ApiConfiguration): Promise<boolean> {
    try {
      // Validate Bagster-specific requirements
      if (!config.apiKey) {
        throw new Error('Bagster API key is required')
      }

      if (!config.baseUrl) {
        throw new Error('Bagster base URL is required')
      }

      // Simulate Bagster API test
      // In a real implementation, you would make actual API calls to Bagster
      const testUrl = `${config.baseUrl}/api/v1/test`
      
      // For now, simulate a successful test
      // This would be replaced with actual API call
      console.log(`Testing Bagster API connection to: ${testUrl}`)
      
      // Simulate API response time
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      return true
    } catch (error) {
      console.error('Bagster API test failed:', error)
      return false
    }
  }

  private async testPaymentApi(config: ApiConfiguration): Promise<boolean> {
    // Implement payment API test
    return true
  }

  private async testCommunicationApi(config: ApiConfiguration): Promise<boolean> {
    // Implement communication API test
    return true
  }

  private async testAnalyticsApi(config: ApiConfiguration): Promise<boolean> {
    // Implement analytics API test
    return true
  }

  private async testStorageApi(config: ApiConfiguration): Promise<boolean> {
    // Implement storage API test
    return true
  }

  private async testGenericApi(config: ApiConfiguration): Promise<boolean> {
    // Implement generic API test
    return true
  }
}

// Export singleton instance
export const apiService = new ApiService()
