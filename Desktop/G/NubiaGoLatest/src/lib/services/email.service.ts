import { User, Order, Product } from '@/types'

export interface EmailTemplate {
  subject: string
  html: string
  text: string
  attachments?: EmailAttachment[]
}

export interface EmailAttachment {
  filename: string
  content: string | Buffer
  contentType: string
}

export interface EmailProvider {
  name: string
  sendEmail: (to: string, template: EmailTemplate) => Promise<EmailSendResult>
}

export interface EmailSendResult {
  success: boolean
  messageId?: string
  error?: string
}

export interface EmailConfig {
  provider: 'sendgrid' | 'mailgun' | 'ses' | 'smtp' | 'console'
  apiKey?: string
  domain?: string
  fromEmail: string
  fromName: string
  replyTo?: string
}

export interface BulkEmailRequest {
  recipients: string[]
  template: EmailTemplate
  personalizations?: Record<string, any>[]
}

export class EmailService {
  private provider: EmailProvider
  private config: EmailConfig

  constructor(provider?: EmailProvider, config?: EmailConfig) {
    this.config = config || {
      provider: 'console',
      fromEmail: process.env.NEXT_PUBLIC_FROM_EMAIL || 'noreply@nubiago.com',
      fromName: 'NubiaGo',
      replyTo: process.env.NEXT_PUBLIC_REPLY_TO_EMAIL || 'support@nubiago.com'
    }
    this.provider = provider || this.createProvider()
  }

  private createProvider(): EmailProvider {
    switch (this.config.provider) {
      case 'sendgrid':
        return new SendGridProvider(this.config)
      case 'mailgun':
        return new MailgunProvider(this.config)
      case 'ses':
        return new SESProvider(this.config)
      case 'smtp':
        return new SMTPProvider(this.config)
      default:
        return new ConsoleEmailProvider()
    }
  }

  async sendEmail(to: string | string[], template: EmailTemplate): Promise<EmailSendResult> {
    try {
      if (!to || !template) {
        throw new Error('Email address and template are required')
      }

      const recipients = Array.isArray(to) ? to : [to]
      
      // Validate email formats
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      for (const email of recipients) {
        if (!emailRegex.test(email)) {
          throw new Error(`Invalid email address format: ${email}`)
        }
      }

      if (recipients.length === 1) {
        const result = await this.provider.sendEmail(recipients[0], template)
        console.log(`✅ Email sent successfully to: ${recipients[0]}`)
        return result
      } else {
        return await this.sendBulkEmail({ recipients, template })
      }
    } catch (error) {
      console.error('❌ Failed to send email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    }
  }

  async sendBulkEmail(request: BulkEmailRequest): Promise<EmailSendResult> {
    try {
      const results = await Promise.allSettled(
        request.recipients.map(recipient => 
          this.provider.sendEmail(recipient, request.template)
        )
      )

      const successful = results.filter(r => r.status === 'fulfilled').length
      const failed = results.filter(r => r.status === 'rejected').length

      console.log(`📧 Bulk email sent: ${successful} successful, ${failed} failed`)

      return {
        success: failed === 0,
        messageId: `bulk_${Date.now()}`,
        error: failed > 0 ? `${failed} emails failed to send` : undefined
      }
    } catch (error) {
      console.error('❌ Failed to send bulk email:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bulk email failed'
      }
    }
  }

  async sendSupplierRegistrationConfirmation(user: User): Promise<EmailSendResult> {
    if (!user || !user.email) {
      throw new Error('User and email are required')
    }

    const template: EmailTemplate = {
      subject: 'Supplier Registration Confirmation - NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Welcome to NubiaGo!</h2>
          <p>Dear ${user.displayName || 'Valued Supplier'},</p>
          <p>Thank you for registering as a supplier on NubiaGo. Your application has been received and is currently under review.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">What happens next?</h3>
            <ul>
              <li>Our admin team will review your business documents</li>
              <li>We'll verify your business information</li>
              <li>Background checks will be performed</li>
              <li>You'll receive an email notification of the decision</li>
            </ul>
            <p><strong>Approval typically takes 1-3 business days.</strong></p>
          </div>
          
          <p>If you have any questions, please contact our support team at <a href="mailto:support@nubiago.com">support@nubiago.com</a></p>
          
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Welcome to NubiaGo!
        
        Dear ${user.displayName || 'Valued Supplier'},
        
        Thank you for registering as a supplier on NubiaGo. Your application has been received and is currently under review.
        
        What happens next?
        - Our admin team will review your business documents
        - We'll verify your business information
        - Background checks will be performed
        - You'll receive an email notification of the decision
        
        Approval typically takes 1-3 business days.
        
        If you have any questions, please contact our support team at support@nubiago.com
        
        Best regards,
        The NubiaGo Team
      `
    }

    return await this.sendEmail(user.email, template)
  }

  async sendSupplierApprovalSuccess(user: User, approvedBy: string): Promise<EmailSendResult> {
    if (!user || !user.email) {
      throw new Error('User and email are required')
    }

    const template: EmailTemplate = {
      subject: 'Congratulations! Your Supplier Account is Approved - NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🎉 Your Account is Approved!</h2>
          <p>Dear ${user.displayName || 'Valued Supplier'},</p>
          <p>Great news! Your supplier account has been approved and is now active on NubiaGo.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #059669;">What you can do now:</h3>
            <ul>
              <li>Access your supplier dashboard</li>
              <li>Add products to your catalog</li>
              <li>Manage orders and inventory</li>
              <li>View analytics and reports</li>
            </ul>
          </div>
          
          <p><strong>Next steps:</strong></p>
          <ol>
            <li>Log in to your account at <a href="https://nubiago.com/supplier">nubiago.com/supplier</a></li>
            <li>Complete your business profile</li>
            <li>Add your first products</li>
            <li>Set up your payment methods</li>
          </ol>
          
          <p>If you need help getting started, our support team is here to assist you.</p>
          
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Congratulations! Your Account is Approved!
        
        Dear ${user.displayName || 'Valued Supplier'},
        
        Great news! Your supplier account has been approved and is now active on NubiaGo.
        
        What you can do now:
        - Access your supplier dashboard
        - Add products to your catalog
        - Manage orders and inventory
        - View analytics and reports
        
        Next steps:
        1. Log in to your account at nubiago.com/supplier
        2. Complete your business profile
        3. Add your first products
        4. Set up your payment methods
        
        If you need help getting started, our support team is here to assist you.
        
        Best regards,
        The NubiaGo Team
      `
    }

    return await this.sendEmail(user.email, template)
  }

  async sendSupplierRejection(user: User, reason: string, rejectedBy: string): Promise<EmailSendResult> {
    if (!user || !user.email) {
      throw new Error('User and email are required')
    }

    if (!reason) {
      throw new Error('Rejection reason is required')
    }

    const template: EmailTemplate = {
      subject: 'Supplier Application Update - NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Application Status Update</h2>
          <p>Dear ${user.displayName || 'Valued Applicant'},</p>
          <p>Thank you for your interest in becoming a supplier on NubiaGo. After careful review of your application, we regret to inform you that we are unable to approve your supplier account at this time.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">Reason for Rejection:</h3>
            <p>${reason}</p>
          </div>
          
          <p><strong>What you can do:</strong></p>
          <ul>
            <li>Review the feedback provided above</li>
            <li>Address any issues mentioned</li>
            <li>Reapply in 30 days with updated information</li>
            <li>Contact our support team for clarification</li>
          </ul>
          
          <p>If you believe this decision was made in error or if you have additional information to share, please contact our support team at <a href="mailto:support@nubiago.com">support@nubiago.com</a></p>
          
          <p>We appreciate your interest in NubiaGo and wish you the best in your future endeavors.</p>
          
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Application Status Update
        
        Dear ${user.displayName || 'Valued Applicant'},
        
        Thank you for your interest in becoming a supplier on NubiaGo. After careful review of your application, we regret to inform you that we are unable to approve your supplier account at this time.
        
        Reason for Rejection:
        ${reason}
        
        What you can do:
        - Review the feedback provided above
        - Address any issues mentioned
        - Reapply in 30 days with updated information
        - Contact our support team for clarification
        
        If you believe this decision was made in error or if you have additional information to share, please contact our support team at support@nubiago.com
        
        We appreciate your interest in NubiaGo and wish you the best in your future endeavors.
        
        Best regards,
        The NubiaGo Team
      `
    }

    return await this.sendEmail(user.email, template)
  }

  async sendAccountSuspension(user: User, reason: string, suspendedBy: string): Promise<EmailSendResult> {
    if (!user || !user.email) {
      throw new Error('User and email are required')
    }

    if (!reason) {
      throw new Error('Suspension reason is required')
    }

    const template: EmailTemplate = {
      subject: 'Account Suspension Notice - NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Account Suspension Notice</h2>
          <p>Dear ${user.displayName || 'Valued User'},</p>
          <p>We regret to inform you that your NubiaGo account has been suspended due to a violation of our terms of service.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #dc2626;">
            <h3 style="margin-top: 0; color: #dc2626;">Reason for Suspension:</h3>
            <p>${reason}</p>
          </div>
          
          <p><strong>What this means:</strong></p>
          <ul>
            <li>Your account is temporarily disabled</li>
            <li>You cannot access your dashboard or make transactions</li>
            <li>Your listings may be temporarily hidden</li>
            <li>You can still contact support for assistance</li>
          </ul>
          
          <p><strong>Next steps:</strong></p>
          <ol>
            <li>Review our terms of service and community guidelines</li>
            <li>Address the issue that led to the suspension</li>
            <li>Contact our support team to request account reactivation</li>
            <li>Provide any additional information or clarification needed</li>
          </ol>
          
          <p>If you believe this suspension was made in error, please contact our support team immediately at <a href="mailto:support@nubiago.com">support@nubiago.com</a></p>
          
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Account Suspension Notice
        
        Dear ${user.displayName || 'Valued User'},
        
        We regret to inform you that your NubiaGo account has been suspended due to a violation of our terms of service.
        
        Reason for Suspension:
        ${reason}
        
        What this means:
        - Your account is temporarily disabled
        - You cannot access your dashboard or make transactions
        - Your listings may be temporarily hidden
        - You can still contact support for assistance
        
        Next steps:
        1. Review our terms of service and community guidelines
        2. Address the issue that led to the suspension
        3. Contact our support team to request account reactivation
        4. Provide any additional information or clarification needed
        
        If you believe this suspension was made in error, please contact our support team immediately at support@nubiago.com
        
        Best regards,
        The NubiaGo Team
      `
    }

    return await this.sendEmail(user.email, template)
  }

  async sendAccountReactivation(user: User, reactivatedBy: string): Promise<EmailSendResult> {
    if (!user || !user.email) {
      throw new Error('User and email are required')
    }

    const template: EmailTemplate = {
      subject: 'Account Reactivated - Welcome Back to NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">🎉 Welcome Back!</h2>
          <p>Dear ${user.displayName || 'Valued User'},</p>
          <p>Great news! Your NubiaGo account has been reactivated and you can now access all features and services.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #059669;">
            <h3 style="margin-top: 0; color: #059669;">Your account is now:</h3>
            <ul>
              <li>✅ Fully active and accessible</li>
              <li>✅ Ready for transactions</li>
              <li>✅ All features restored</li>
              <li>✅ Your listings are visible again</li>
            </ul>
          </div>
          
          <p><strong>What you can do now:</strong></p>
          <ul>
            <li>Log in to your account at <a href="https://nubiago.com/login">nubiago.com/login</a></li>
            <li>Continue with your business activities</li>
            <li>Access your dashboard and analytics</li>
            <li>Manage your products and orders</li>
          </ul>
          
          <p>Thank you for your patience during this process. We appreciate your business and look forward to serving you again.</p>
          
          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
          
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Welcome Back!
        
        Dear ${user.displayName || 'Valued User'},
        
        Great news! Your NubiaGo account has been reactivated and you can now access all features and services.
        
        Your account is now:
        ✅ Fully active and accessible
        ✅ Ready for transactions
        ✅ All features restored
        ✅ Your listings are visible again
        
        What you can do now:
        - Log in to your account at nubiago.com/login
        - Continue with your business activities
        - Access your dashboard and analytics
        - Manage your products and orders
        
        Thank you for your patience during this process. We appreciate your business and look forward to serving you again.
        
        If you have any questions or need assistance, please don't hesitate to contact our support team.
        
        Best regards,
        The NubiaGo Team
      `
    }

    return await this.sendEmail(user.email, template)
  }

  // Order-related emails
  async sendOrderConfirmation(user: User, order: Order): Promise<EmailSendResult> {
    if (!user?.email || !order) {
      throw new Error('User email and order are required')
    }

    const template: EmailTemplate = {
      subject: `Order Confirmation #${order.id} - NubiaGo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Order Confirmation</h2>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>Thank you for your order! We've received your order and it's being processed.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Order Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            <p><strong>Order Date:</strong> ${new Date(order.createdAt).toLocaleDateString()}</p>
            <p><strong>Total Amount:</strong> $${order.total.toFixed(2)}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          
          <p>We'll send you another email when your order ships.</p>
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Order Confirmation
        
        Dear ${user.name || 'Valued Customer'},
        
        Thank you for your order! We've received your order and it's being processed.
        
        Order Details:
        Order ID: ${order.id}
        Order Date: ${new Date(order.createdAt).toLocaleDateString()}
        Total Amount: $${order.total.toFixed(2)}
        Status: ${order.status}
        
        We'll send you another email when your order ships.
        
        Best regards,
        The NubiaGo Team
      `
    }

    return await this.sendEmail(user.email, template)
  }

  async sendOrderShipped(user: User, order: Order, trackingNumber?: string): Promise<EmailSendResult> {
    if (!user?.email || !order) {
      throw new Error('User email and order are required')
    }

    const template: EmailTemplate = {
      subject: `Your Order #${order.id} Has Shipped - NubiaGo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">📦 Your Order Has Shipped!</h2>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>Great news! Your order has been shipped and is on its way to you.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Shipping Details</h3>
            <p><strong>Order ID:</strong> ${order.id}</p>
            ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ''}
            <p><strong>Estimated Delivery:</strong> 3-5 business days</p>
          </div>
          
          ${trackingNumber ? '<p>You can track your package using the tracking number above.</p>' : ''}
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Your Order Has Shipped!
        
        Dear ${user.name || 'Valued Customer'},
        
        Great news! Your order has been shipped and is on its way to you.
        
        Shipping Details:
        Order ID: ${order.id}
        ${trackingNumber ? `Tracking Number: ${trackingNumber}` : ''}
        Estimated Delivery: 3-5 business days
        
        ${trackingNumber ? 'You can track your package using the tracking number above.' : ''}
        
        Best regards,
        The NubiaGo Team
      `
    }

    return await this.sendEmail(user.email, template)
  }

  async sendPasswordReset(email: string, resetToken: string): Promise<EmailSendResult> {
    const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/reset-password?token=${resetToken}`

    const template: EmailTemplate = {
      subject: 'Reset Your Password - NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Reset Your Password</h2>
          <p>You requested to reset your password for your NubiaGo account.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${resetUrl}" style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a>
          </div>
          
          <p>If the button doesn't work, copy and paste this link into your browser:</p>
          <p style="word-break: break-all; color: #6b7280;">${resetUrl}</p>
          
          <p><strong>This link will expire in 1 hour.</strong></p>
          <p>If you didn't request this, please ignore this email.</p>
          
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Reset Your Password
        
        You requested to reset your password for your NubiaGo account.
        
        Click this link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour.
        If you didn't request this, please ignore this email.
        
        Best regards,
        The NubiaGo Team
      `
    }

    return await this.sendEmail(email, template)
  }

  async sendWelcomeEmail(user: User): Promise<EmailSendResult> {
    if (!user?.email) {
      throw new Error('User email is required')
    }

    const template: EmailTemplate = {
      subject: 'Welcome to NubiaGo!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">🎉 Welcome to NubiaGo!</h2>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>Welcome to NubiaGo! We're excited to have you join our community.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Get Started:</h3>
            <ul>
              <li>Browse our extensive product catalog</li>
              <li>Add items to your wishlist</li>
              <li>Enjoy secure checkout and fast delivery</li>
              <li>Track your orders in real-time</li>
            </ul>
          </div>
          
          <p>If you have any questions, our support team is here to help!</p>
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Welcome to NubiaGo!
        
        Dear ${user.name || 'Valued Customer'},
        
        Welcome to NubiaGo! We're excited to have you join our community.
        
        Get Started:
        - Browse our extensive product catalog
        - Add items to your wishlist
        - Enjoy secure checkout and fast delivery
        - Track your orders in real-time
        
        If you have any questions, our support team is here to help!
        
        Best regards,
        The NubiaGo Team
      `
    }

    return await this.sendEmail(user.email, template)
  }

  async sendNewsletterSubscriptionConfirmation(email: string): Promise<EmailSendResult> {
    const template: EmailTemplate = {
      subject: 'Newsletter Subscription Confirmed - NubiaGo',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">✅ Subscription Confirmed!</h2>
          <p>Thank you for subscribing to the NubiaGo newsletter!</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">What to expect:</h3>
            <ul>
              <li>Weekly product highlights and deals</li>
              <li>Exclusive subscriber-only discounts</li>
              <li>New arrival notifications</li>
              <li>Industry insights and trends</li>
            </ul>
          </div>
          
          <p>You can unsubscribe at any time by clicking the link in any newsletter.</p>
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Subscription Confirmed!
        
        Thank you for subscribing to the NubiaGo newsletter!
        
        What to expect:
        - Weekly product highlights and deals
        - Exclusive subscriber-only discounts
        - New arrival notifications
        - Industry insights and trends
        
        You can unsubscribe at any time by clicking the link in any newsletter.
        
        Best regards,
        The NubiaGo Team
      `
    }
    return await this.sendEmail(email, template)
  }

  // Send payment confirmation
  async sendPaymentConfirmation(user: User, paymentDetails: {
    orderId: string
    amount: number
    currency: string
    paymentMethod: string
    transactionId: string
  }): Promise<EmailSendResult> {
    const template: EmailTemplate = {
      subject: `Payment Confirmed - Order #${paymentDetails.orderId} - NubiaGo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #059669;">✅ Payment Confirmed!</h2>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>Your payment has been successfully processed.</p>
          
          <div style="background-color: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Payment Details</h3>
            <p><strong>Order ID:</strong> ${paymentDetails.orderId}</p>
            <p><strong>Amount:</strong> ${paymentDetails.currency} ${paymentDetails.amount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
            <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
          </div>
          
          <p>Your order is now being processed and you'll receive another email when it ships.</p>
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Payment Confirmed!
        
        Dear ${user.name || 'Valued Customer'},
        
        Your payment has been successfully processed.
        
        Payment Details:
        Order ID: ${paymentDetails.orderId}
        Amount: ${paymentDetails.currency} ${paymentDetails.amount.toFixed(2)}
        Payment Method: ${paymentDetails.paymentMethod}
        Transaction ID: ${paymentDetails.transactionId}
        
        Your order is now being processed and you'll receive another email when it ships.
        
        Best regards,
        The NubiaGo Team
      `
    }
    return await this.sendEmail(user.email, template)
  }

  // Send payment failure notification
  async sendPaymentFailure(user: User, paymentDetails: {
    orderId: string
    amount: number
    currency: string
    paymentMethod: string
    transactionId: string
    reason: string
  }): Promise<EmailSendResult> {
    const template: EmailTemplate = {
      subject: `Payment Failed - Order #${paymentDetails.orderId} - NubiaGo`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">❌ Payment Failed</h2>
          <p>Dear ${user.name || 'Valued Customer'},</p>
          <p>Unfortunately, your payment could not be processed.</p>
          
          <div style="background-color: #fef2f2; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0;">Payment Details</h3>
            <p><strong>Order ID:</strong> ${paymentDetails.orderId}</p>
            <p><strong>Amount:</strong> ${paymentDetails.currency} ${paymentDetails.amount.toFixed(2)}</p>
            <p><strong>Payment Method:</strong> ${paymentDetails.paymentMethod}</p>
            <p><strong>Transaction ID:</strong> ${paymentDetails.transactionId}</p>
            <p><strong>Reason:</strong> ${paymentDetails.reason}</p>
          </div>
          
          <p>Please try again or contact our support team for assistance.</p>
          <p>Best regards,<br>The NubiaGo Team</p>
        </div>
      `,
      text: `
        Payment Failed
        
        Dear ${user.name || 'Valued Customer'},
        
        Unfortunately, your payment could not be processed.
        
        Payment Details:
        Order ID: ${paymentDetails.orderId}
        Amount: ${paymentDetails.currency} ${paymentDetails.amount.toFixed(2)}
        Payment Method: ${paymentDetails.paymentMethod}
        Transaction ID: ${paymentDetails.transactionId}
        Reason: ${paymentDetails.reason}
        
        Please try again or contact our support team for assistance.
        
        Best regards,
        The NubiaGo Team
      `
    }
    return await this.sendEmail(user.email, template)
  }
}

// Email Provider Implementations

// Console email provider for development/testing
class ConsoleEmailProvider implements EmailProvider {
  name = 'console'

  async sendEmail(to: string, template: EmailTemplate): Promise<EmailSendResult> {
    console.log('📧 Sending email:')
    console.log(`To: ${to}`)
    console.log(`Subject: ${template.subject}`)
    console.log(`Content: ${template.text}`)
    
    // Simulate email sending delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return {
      success: true,
      messageId: `console_${Date.now()}`
    }
  }
}

// SendGrid email provider
class SendGridProvider implements EmailProvider {
  name = 'sendgrid'
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<EmailSendResult> {
    try {
      // In production, this would use the SendGrid API
      // For mock purposes, we'll simulate the API call
      console.log(`📧 [SendGrid] Sending email to: ${to}`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Mock API response
      return {
        success: true,
        messageId: `sg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SendGrid API error'
      }
    }
  }
}

// Mailgun email provider
class MailgunProvider implements EmailProvider {
  name = 'mailgun'
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<EmailSendResult> {
    try {
      // In production, this would use the Mailgun API
      console.log(`📧 [Mailgun] Sending email to: ${to}`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600))
      
      return {
        success: true,
        messageId: `mg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Mailgun API error'
      }
    }
  }
}

// Amazon SES email provider
class SESProvider implements EmailProvider {
  name = 'ses'
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<EmailSendResult> {
    try {
      // In production, this would use the AWS SES API
      console.log(`📧 [SES] Sending email to: ${to}`)
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 400))
      
      return {
        success: true,
        messageId: `ses_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SES API error'
      }
    }
  }
}

// SMTP email provider
class SMTPProvider implements EmailProvider {
  name = 'smtp'
  private config: EmailConfig

  constructor(config: EmailConfig) {
    this.config = config
  }

  async sendEmail(to: string, template: EmailTemplate): Promise<EmailSendResult> {
    try {
      // In production, this would use nodemailer or similar SMTP client
      console.log(`📧 [SMTP] Sending email to: ${to}`)
      
      // Simulate SMTP sending delay
      await new Promise(resolve => setTimeout(resolve, 800))
      
      return {
        success: true,
        messageId: `smtp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'SMTP error'
      }
    }
  }
}

// Export a default instance
export const emailService = new EmailService() 
