import { NextRequest, NextResponse } from 'next/server'
import { apiService } from '@/lib/services/api.service'
import { protectAdminAPI } from '@/lib/middleware/api-auth'

// POST /api/apis/[id]/test - Test API connection
export const POST = protectAdminAPI(async (request: NextRequest) => {
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

    const testResult = await apiService.testApiConnection(id)

    return NextResponse.json({
      success: true,
      data: testResult,
      message: testResult.success ? 'API connection test successful' : 'API connection test failed'
    })
  } catch (error: any) {
    console.error('API connection test error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to test API connection' 
      },
      { status: 500 }
    )
  }
})
