import { NextRequest, NextResponse } from 'next/server'
import { mobileMoneyService } from '@/lib/services/mobile-money.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { country: string } }
) {
  try {
    const { country } = params
    
    if (!country) {
      return NextResponse.json(
        { success: false, message: 'Country parameter is required' },
        { status: 400 }
      )
    }

    const operators = await mobileMoneyService.getOperatorsByCountry(country)
    
    return NextResponse.json({
      success: true,
      data: operators,
      country: country.toUpperCase(),
      count: operators.length
    })
  } catch (error) {
    console.error('Failed to fetch operators:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to fetch operators',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
