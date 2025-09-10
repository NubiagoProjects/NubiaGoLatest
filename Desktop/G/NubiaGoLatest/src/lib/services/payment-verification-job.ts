import { mobileMoneyService } from './mobile-money.service'

export class PaymentVerificationJob {
  private isRunning = false
  private intervalId: NodeJS.Timeout | null = null

  // Start the payment verification job
  start() {
    if (this.isRunning) {
      console.log('Payment verification job is already running')
      return
    }

    console.log('Starting payment verification job...')
    this.isRunning = true

    // Run every 2 minutes
    this.intervalId = setInterval(async () => {
      await this.verifyPendingPayments()
    }, 2 * 60 * 1000) // 2 minutes

    // Run immediately on start
    this.verifyPendingPayments()
  }

  // Stop the payment verification job
  stop() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = null
    }
    this.isRunning = false
    console.log('Payment verification job stopped')
  }

  // Verify all pending payments
  private async verifyPendingPayments() {
    try {
      console.log('Running payment verification job...')
      
      const allPayments = await mobileMoneyService.getAllPayments()
      
      // Get payments that are pending and older than 5 minutes
      const pendingPayments = allPayments.filter(payment => {
        if (payment.status !== 'pending') return false
        
        const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
        if (payment.createdAt < fiveMinutesAgo) return true
        
        // Don't check too frequently
        if (payment.lastVerificationCheck) {
          const twoMinutesAgo = new Date(Date.now() - 2 * 60 * 1000)
          return payment.lastVerificationCheck < twoMinutesAgo
        }
        
        return true
      })

      console.log(`Found ${pendingPayments.length} payments to verify`)

      // Process payments in batches to avoid overwhelming the system
      const batchSize = 10
      for (let i = 0; i < pendingPayments.length; i += batchSize) {
        const batch = pendingPayments.slice(i, i + batchSize)
        
        await Promise.all(
          batch.map(payment => this.verifyIndividualPayment(payment))
        )
        
        // Small delay between batches
        if (i + batchSize < pendingPayments.length) {
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    } catch (error) {
      console.error('Payment verification job failed:', error)
    }
  }

  // Verify individual payment
  private async verifyIndividualPayment(payment: any) {
    try {
      // Update last verification check timestamp
      payment.lastVerificationCheck = new Date()
      payment.updatedAt = new Date()

      // Verify payment with gateway
      if (payment.gatewayTransactionId) {
        const verification = await mobileMoneyService.getPaymentStatus(payment.id)
        
        if (verification) {
          console.log(`Payment ${payment.id} status: ${verification.status}`)
          
          // If payment is completed, update order status
          if (verification.status === 'completed') {
            await this.updateOrderStatus(payment.orderId, 'paid')
            console.log(`Order ${payment.orderId} marked as paid`)
          }
        }
      }

      // Check if payment has expired
      if (this.isPaymentExpired(payment)) {
        payment.status = 'expired'
        payment.updatedAt = new Date()
        console.log(`Payment ${payment.id} marked as expired`)
      }
    } catch (error) {
      console.error(`Failed to verify payment ${payment.id}:`, error)
    }
  }

  // Check if payment has expired
  private isPaymentExpired(payment: any): boolean {
    const hoursSinceCreation = (Date.now() - payment.createdAt.getTime()) / (1000 * 60 * 60)
    return hoursSinceCreation > 24 // Expire after 24 hours
  }

  // Update order status (placeholder for integration with order service)
  private async updateOrderStatus(orderId: string, status: string) {
    try {
      // Integrate with existing order service
      const { OrderService } = await import('./order.service')
      const orderService = new OrderService()
      
      if (status === 'completed') {
        await orderService.updatePaymentStatus(orderId, 'paid')
        await orderService.updateOrderStatus(orderId, 'confirmed')
      } else if (status === 'failed') {
        await orderService.updatePaymentStatus(orderId, 'failed')
      }
      
      console.log(`Order ${orderId} payment status updated to: ${status}`)
    } catch (error) {
      console.error(`Failed to update order ${orderId} status:`, error)
    }
  }

  // Get job status
  getStatus() {
    return {
      isRunning: this.isRunning,
      intervalId: this.intervalId ? 'active' : 'inactive'
    }
  }

  // Manually trigger verification for a specific payment
  async verifyPayment(paymentId: string) {
    try {
      const payment = await mobileMoneyService.getPaymentStatus(paymentId)
      if (payment) {
        await this.verifyIndividualPayment(payment)
        return { success: true, message: 'Payment verification completed' }
      } else {
        return { success: false, message: 'Payment not found' }
      }
    } catch (error) {
      return { 
        success: false, 
        message: 'Payment verification failed',
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }
}

// Create singleton instance
export const paymentVerificationJob = new PaymentVerificationJob()

// Start the job when the module is imported (for development)
if (process.env.NODE_ENV === 'development') {
  // Only start in development to avoid multiple instances
  setTimeout(() => {
    paymentVerificationJob.start()
  }, 5000) // Start after 5 seconds
}
