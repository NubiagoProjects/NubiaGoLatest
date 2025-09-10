import { NextRequest, NextResponse } from 'next/server'
import { mobileMoneyService } from '@/lib/services/mobile-money.service'
import { orderService } from '@/lib/services/order.service'
import { EmailService } from '@/lib/services/email.service'

const emailService = new EmailService()

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    console.log('Mobile Money Webhook received:', {
      timestamp: new Date().toISOString(),
      body: body
    })

    // Verify webhook signature (in production, implement proper signature verification)
    // const signature = request.headers.get('verif-hash')
    // if (!signature || signature !== process.env.MOBILE_MONEY_WEBHOOK_SECRET) {
    //   return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    // }

    // Process webhook based on event type
    const eventType = body.event || body.type || 'unknown'
    
    switch (eventType) {
      case 'charge.completed':
      case 'payment.success':
      case 'transaction.success':
        // Payment completed successfully
        await processPaymentCompletion(body.data || body)
        break
        
      case 'charge.failed':
      case 'payment.failed':
      case 'transaction.failed':
        // Payment failed
        await processPaymentFailure(body.data || body)
        break
        
      case 'charge.pending':
      case 'payment.pending':
      case 'transaction.pending':
        // Payment still pending
        await processPaymentPending(body.data || body)
        break
        
      default:
        console.log(`Unhandled webhook event type: ${eventType}`)
        break
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Webhook processed successfully' 
    })
    
  } catch (error) {
    console.error('Webhook processing error:', error)
    return NextResponse.json(
      { 
        success: false, 
        message: 'Webhook processing failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

async function processPaymentCompletion(data: any) {
  try {
    console.log('Processing payment completion:', data)
    
    // Extract transaction reference
    const transactionRef = data.tx_ref || data.reference || data.transaction_id
    
    if (!transactionRef) {
      console.error('No transaction reference found in webhook data')
      return
    }

    // Find payment by transaction reference
    const payments = await mobileMoneyService.getAllPayments()
    const payment = payments.find(p => p.gatewayTransactionId === transactionRef)
    
    if (payment) {
      // Update payment status
      payment.status = 'completed'
      payment.completedAt = new Date()
      payment.updatedAt = new Date()
      payment.gatewayResponse = data
      
      console.log(`Payment ${payment.id} completed via webhook`)
      
      // Update order status in order management system
      try {
        await orderService.updatePaymentStatus(payment.orderId, 'paid')
        await orderService.updateOrderStatus(payment.orderId, 'confirmed')
        console.log(`Order ${payment.orderId} status updated to confirmed`)
      } catch (orderError) {
        console.error('Failed to update order status:', orderError)
      }
      
      // Send customer notification
      try {
        const order = await orderService.getOrder(payment.orderId)
        if (order) {
          await emailService.sendPaymentConfirmation(
            {
              uid: order.userId,
              email: order.userId, // Using userId as email fallback
              name: 'Customer',
              role: 'customer',
              createdAt: new Date()
            },
            {
              orderId: payment.orderId,
              amount: payment.amount,
              currency: payment.currency,
              paymentMethod: 'Mobile Money',
              transactionId: payment.gatewayTransactionId || payment.id
            }
          )
          console.log(`Payment success notification sent for order ${payment.orderId}`)
        }
      } catch (notificationError) {
        console.error('Failed to send payment notification:', notificationError)
      }
    } else {
      console.log(`Payment not found for transaction reference: ${transactionRef}`)
    }
  } catch (error) {
    console.error('Error processing payment completion:', error)
  }
}

async function processPaymentFailure(data: any) {
  try {
    console.log('Processing payment failure:', data)
    
    const transactionRef = data.tx_ref || data.reference || data.transaction_id
    
    if (!transactionRef) {
      console.error('No transaction reference found in webhook data')
      return
    }

    const payments = await mobileMoneyService.getAllPayments()
    const payment = payments.find(p => p.gatewayTransactionId === transactionRef)
    
    if (payment) {
      payment.status = 'failed'
      payment.updatedAt = new Date()
      payment.gatewayResponse = data
      
      console.log(`Payment ${payment.id} marked as failed via webhook`)
      
      // Update order status
      try {
        await orderService.updatePaymentStatus(payment.orderId, 'failed')
        console.log(`Order ${payment.orderId} payment status updated to failed`)
        
        // Release inventory reservation
        const order = await orderService.getOrder(payment.orderId)
        if (order) {
          await orderService.releaseInventoryReservation(order.items)
          console.log(`Inventory reservation released for order ${payment.orderId}`)
        }
      } catch (orderError) {
        console.error('Failed to update order status:', orderError)
      }
      
      // Send customer notification
      try {
        const order = await orderService.getOrder(payment.orderId)
        if (order) {
          await emailService.sendPaymentFailure(
            {
              uid: order.userId,
              email: order.userId, // Using userId as email fallback
              name: 'Customer',
              role: 'customer',
              createdAt: new Date()
            },
            {
              orderId: payment.orderId,
              amount: payment.amount,
              currency: payment.currency,
              paymentMethod: 'Mobile Money',
              transactionId: payment.gatewayTransactionId || payment.id,
              reason: data.message || 'Payment processing failed'
            }
          )
          console.log(`Payment failure notification sent for order ${payment.orderId}`)
        }
      } catch (notificationError) {
        console.error('Failed to send payment failure notification:', notificationError)
      }
    }
  } catch (error) {
    console.error('Error processing payment failure:', error)
  }
}

async function processPaymentPending(data: any) {
  try {
    console.log('Processing payment pending:', data)
    
    const transactionRef = data.tx_ref || data.reference || data.transaction_id
    
    if (!transactionRef) {
      console.error('No transaction reference found in webhook data')
      return
    }

    const payments = await mobileMoneyService.getAllPayments()
    const payment = payments.find(p => p.gatewayTransactionId === transactionRef)
    
    if (payment) {
      payment.status = 'pending'
      payment.updatedAt = new Date()
      payment.gatewayResponse = data
      
      console.log(`Payment ${payment.id} status updated to pending via webhook`)
    }
  } catch (error) {
    console.error('Error processing payment pending:', error)
  }
}
