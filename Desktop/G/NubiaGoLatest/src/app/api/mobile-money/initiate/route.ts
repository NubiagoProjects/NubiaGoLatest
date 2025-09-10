import { NextRequest, NextResponse } from 'next/server'
import { mobileMoneyService, MobileMoneyPaymentRequest } from '@/lib/services/mobile-money.service'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'orderId', 'amount', 'currency', 'customerPhone', 
      'customerEmail', 'customerName', 'operatorCode', 'country'
    ]
    
    const missingFields = requiredFields.filter(field => !body[field])
    
    if (missingFields.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Missing required fields',
          missingFields 
        },
        { status: 400 }
      )
    }

    // Validate amount
    if (typeof body.amount !== 'number' || body.amount <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Amount must be a positive number' 
        },
        { status: 400 }
      )
    }

    // Validate currency
    const validCurrencies = ['XAF', 'XOF', 'NGN', 'GHS', 'KES', 'UGX', 'TZS', 'USD', 'EUR']
    if (!validCurrencies.includes(body.currency)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid currency. Supported currencies: ' + validCurrencies.join(', ') 
        },
        { status: 400 }
      )
    }

    // Validate phone number
    const phoneRegex = /^\+?[\d\s-]{10,15}$/
    if (!phoneRegex.test(body.customerPhone)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid phone number format' 
        },
        { status: 400 }
      )
    }

    // Validate email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(body.customerEmail)) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Invalid email format' 
        },
        { status: 400 }
      )
    }

    const paymentRequest: MobileMoneyPaymentRequest = {
      orderId: body.orderId,
      amount: body.amount,
      currency: body.currency,
      customerPhone: body.customerPhone,
      customerEmail: body.customerEmail,
      customerName: body.customerName,
      operatorCode: body.operatorCode,
      country: body.country,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/payment/success`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/mobile-money/webhook`
    }

    const response = await mobileMoneyService.initiatePayment(paymentRequest)

    if (response.success) {
      return NextResponse.json({
        success: true,
        data: {
          paymentId: response.data?.paymentId,
          paymentUrl: response.data?.paymentUrl,
          transactionId: response.data?.transactionId,
          reference: response.reference
        },
        message: response.message
      })
    } else {
      return NextResponse.json(
        { 
          success: false, 
          message: response.message 
        },
        { status: 400 }
      )
    }

  } catch (error) {
    console.error('Payment initiation failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Payment initiation failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
