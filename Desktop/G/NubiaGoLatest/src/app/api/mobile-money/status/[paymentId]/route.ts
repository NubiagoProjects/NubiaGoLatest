import { NextRequest, NextResponse } from 'next/server'
import { mobileMoneyService } from '@/lib/services/mobile-money.service'

export async function GET(
  request: NextRequest,
  { params }: { params: { paymentId: string } }
) {
  try {
    const { paymentId } = params
    
    if (!paymentId) {
      return NextResponse.json(
        { success: false, message: 'Payment ID parameter is required' },
        { status: 400 }
      )
    }

    const payment = await mobileMoneyService.getPaymentStatus(paymentId)
    
    if (!payment) {
      return NextResponse.json(
        { success: false, message: 'Payment not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      data: {
        paymentId: payment.id,
        orderId: payment.orderId,
        status: payment.status,
        amount: payment.amount,
        currency: payment.currency,
        operator: payment.operator,
        country: payment.country,
        phoneNumber: payment.phoneNumber,
        gatewayProvider: payment.gatewayProvider,
        gatewayTransactionId: payment.gatewayTransactionId,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
        completedAt: payment.completedAt,
        lastVerificationCheck: payment.lastVerificationCheck
      }
    })
  } catch (error) {
    console.error('Failed to get payment status:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Failed to get payment status',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
