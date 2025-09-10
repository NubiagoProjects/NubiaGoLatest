import { NextRequest, NextResponse } from 'next/server'
import { apiService } from '@/lib/services/api.service'
import { protectAdminAPI } from '@/lib/middleware/api-auth'
import { apiConfigurationSchema } from '@/lib/validation-schemas'
import { z } from 'zod'

// GET /api/apis - Get all API configurations
export const GET = protectAdminAPI(async (request: NextRequest) => {
  try {
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const status = searchParams.get('status')
    const active = searchParams.get('active')

    let apis

    if (type && type !== 'all') {
      apis = await apiService.getApiConfigurationsByType(type)
    } else if (active === 'true') {
      apis = await apiService.getActiveApiConfigurations()
    } else {
      apis = await apiService.getAllApiConfigurations()
    }

    // Filter by status if provided
    if (status && status !== 'all') {
      apis = apis.filter(api => api.status === status)
    }

    return NextResponse.json({
      success: true,
      data: apis,
      count: apis.length,
      message: 'API configurations retrieved successfully'
    })
  } catch (error: any) {
    console.error('API configurations fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch API configurations',
        code: 'FETCH_ERROR'
      },
      { status: 500 }
    )
  }
})

// POST /api/apis - Create new API configuration
export const POST = protectAdminAPI(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate input using Zod schema
    const validatedData = apiConfigurationSchema.parse(body)
    
    const apiConfig = await apiService.createApiConfiguration({
      name: validatedData.name as string,
      description: validatedData.description as string || '',
      type: validatedData.type as 'logistics' | 'payment' | 'communication' | 'analytics' | 'storage' | 'other',
      provider: validatedData.provider as string,
      apiKey: validatedData.apiKey as string | undefined,
      apiSecret: validatedData.apiSecret as string | undefined || '',
      baseUrl: validatedData.baseUrl as string | undefined || '',
      webhookUrl: validatedData.webhookUrl as string | undefined || '',
      isActive: validatedData.isActive !== undefined ? Boolean(validatedData.isActive) : true,
      isTestMode: validatedData.isTestMode !== undefined ? Boolean(validatedData.isTestMode) : true,
      config: validatedData.config || {},
      status: 'active'
    })

    return NextResponse.json({
      success: true,
      data: apiConfig,
      message: 'API configuration created successfully'
    }, { status: 201 })
  } catch (error: any) {
    console.error('API configuration creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed',
          details: error.errors,
          code: 'VALIDATION_ERROR'
        },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to create API configuration',
        code: 'CREATION_ERROR'
      },
      { status: 500 }
    )
  }
})
