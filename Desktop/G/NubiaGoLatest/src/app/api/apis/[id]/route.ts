import { NextRequest, NextResponse } from 'next/server'
import { apiService } from '@/lib/services/api.service'
import { protectAdminAPI } from '@/lib/middleware/api-auth'

// GET /api/apis/[id] - Get specific API configuration
export const GET = protectAdminAPI(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API configuration ID is required' 
        },
        { status: 400 }
      )
    }

    const apiConfig = await apiService.getApiConfiguration(id)
    
    if (!apiConfig) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API configuration not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: apiConfig
    })
  } catch (error: any) {
    console.error('API configuration fetch error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to fetch API configuration' 
      },
      { status: 500 }
    )
  }
})

// PUT /api/apis/[id] - Update API configuration
export const PUT = protectAdminAPI(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API configuration ID is required' 
        },
        { status: 400 }
      )
    }

    const body = await request.json()
    
    // Validate required fields
    if (!body.name || !body.type || !body.provider || !body.apiKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: name, type, provider, apiKey' 
        },
        { status: 400 }
      )
    }

    const updatedConfig = await apiService.updateApiConfiguration(id, {
      name: body.name,
      type: body.type,
      provider: body.provider,
      apiKey: body.apiKey,
      apiSecret: body.apiSecret || '',
      baseUrl: body.baseUrl || '',
      webhookUrl: body.webhookUrl || '',
      isActive: body.isActive !== undefined ? body.isActive : true,
      isTestMode: body.isTestMode !== undefined ? body.isTestMode : true,
      config: body.config || {}
    })

    return NextResponse.json({
      success: true,
      data: updatedConfig,
      message: 'API configuration updated successfully'
    })
  } catch (error: any) {
    console.error('API configuration update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to update API configuration' 
      },
      { status: 500 }
    )
  }
})

// DELETE /api/apis/[id] - Delete API configuration
export const DELETE = protectAdminAPI(async (request: NextRequest) => {
  try {
    const url = new URL(request.url)
    const id = url.pathname.split('/').pop()
    
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'API configuration ID is required' 
        },
        { status: 400 }
      )
    }

    await apiService.deleteApiConfiguration(id)

    return NextResponse.json({
      success: true,
      message: 'API configuration deleted successfully'
    })
  } catch (error: any) {
    console.error('API configuration delete error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to delete API configuration' 
      },
      { status: 500 }
    )
  }
})
