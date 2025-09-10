import { NextRequest, NextResponse } from 'next/server'
import { logisticsService } from '@/lib/services/logistics.service'
import { protectAPI } from '@/lib/middleware/api-auth'

// POST /api/shipping/tracking - Get tracking information
export const POST = protectAPI()(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.trackingNumber || !body.carrierCode) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: trackingNumber, carrierCode' 
        },
        { status: 400 }
      )
    }

    // Validate tracking number format
    if (body.trackingNumber.length < 5) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid tracking number format' 
        },
        { status: 400 }
      )
    }

    // Get tracking information from logistics service
    const trackingInfo = await logisticsService.getTrackingInfo(
      body.trackingNumber,
      body.carrierCode
    )

    if (!trackingInfo) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tracking information not found' 
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: trackingInfo,
      message: 'Tracking information retrieved successfully'
    })
  } catch (error: any) {
    console.error('Shipping tracking error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to get tracking information' 
      },
      { status: 500 }
    )
  }
})
