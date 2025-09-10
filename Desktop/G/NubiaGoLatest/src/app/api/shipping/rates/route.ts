import { NextRequest, NextResponse } from 'next/server'
import { logisticsService } from '@/lib/services/logistics.service'
import { protectAPI } from '@/lib/middleware/api-auth'

// POST /api/shipping/rates - Get shipping rates
export const POST = protectAPI()(async (request: NextRequest) => {
  try {
    const body = await request.json()
    
    // Validate required fields
    if (!body.fromAddress || !body.toAddress || !body.packages) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields: fromAddress, toAddress, packages' 
        },
        { status: 400 }
      )
    }

    // Validate addresses
    const requiredAddressFields = ['address1', 'city', 'state', 'postalCode', 'country']
    for (const field of requiredAddressFields) {
      if (!body.fromAddress[field] || !body.toAddress[field]) {
        return NextResponse.json(
          { 
            success: false, 
            error: `Missing required address field: ${field}` 
          },
          { status: 400 }
        )
      }
    }

    // Validate packages
    if (!Array.isArray(body.packages) || body.packages.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'At least one package is required' 
        },
        { status: 400 }
      )
    }

    // Validate package fields
    const requiredPackageFields = ['weight', 'length', 'width', 'height']
    for (const pkg of body.packages) {
      for (const field of requiredPackageFields) {
        if (!pkg[field] || pkg[field] <= 0) {
          return NextResponse.json(
            { 
              success: false, 
              error: `Invalid package ${field}: must be greater than 0` 
            },
            { status: 400 }
          )
        }
      }
    }

    // Get shipping rates from logistics service
    const rates = await logisticsService.getShippingRates(
      body.fromAddress,
      body.toAddress,
      body.packages
    )

    return NextResponse.json({
      success: true,
      data: rates,
      message: `Found ${rates.length} shipping options`
    })
  } catch (error: any) {
    console.error('Shipping rates calculation error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error.message || 'Failed to calculate shipping rates' 
      },
      { status: 500 }
    )
  }
})
