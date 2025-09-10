import { db } from '@/lib/firebase/config'
import { collection, doc, setDoc, getDoc, deleteDoc, query, where, getDocs } from 'firebase/firestore'
import { emailService } from './email.service'
import { logger } from '@/lib/utils/logger'

export interface EmailVerificationToken {
  id: string
  userId: string
  email: string
  token: string
  expiresAt: Date
  createdAt: Date
  verified: boolean
  attempts: number
}

export class EmailVerificationService {
  private readonly collectionName = 'email_verifications'
  private readonly tokenExpiry = 24 * 60 * 60 * 1000 // 24 hours in milliseconds
  private readonly maxAttempts = 3

  /**
   * Generate a secure verification token
   */
  private generateToken(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    let token = ''
    for (let i = 0; i < 32; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }

  /**
   * Create and send verification email
   */
  async sendVerificationEmail(userId: string, email: string, userName: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Clean up any existing tokens for this user
      await this.cleanupUserTokens(userId)

      const token = this.generateToken()
      const expiresAt = new Date(Date.now() + this.tokenExpiry)
      
      const verificationData: EmailVerificationToken = {
        id: `${userId}_${Date.now()}`,
        userId,
        email,
        token,
        expiresAt,
        createdAt: new Date(),
        verified: false,
        attempts: 0
      }

      // Store verification token
      await setDoc(doc(db, this.collectionName, verificationData.id), verificationData)

      // Send verification email
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify-email?token=${token}&userId=${userId}`
      
      const emailTemplate = {
        subject: 'Verify Your NubiaGo Account',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Welcome to NubiaGo, ${userName}!</h2>
            <p>Please verify your email address by clicking the button below:</p>
            <a href="${verificationUrl}" style="display: inline-block; background-color: #3B82F6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0;">
              Verify Email Address
            </a>
            <p>Or copy and paste this link in your browser:</p>
            <p style="word-break: break-all; color: #666;">${verificationUrl}</p>
            <p>This link will expire in 24 hours.</p>
            <p>If you didn't create an account with NubiaGo, please ignore this email.</p>
          </div>
        `,
        text: `Welcome to NubiaGo, ${userName}! Please verify your email by visiting: ${verificationUrl}`
      }

      const emailSent = await emailService.sendEmail(email, emailTemplate)

      if (!emailSent.success) {
        throw new Error(emailSent.error || 'Failed to send verification email')
      }

      logger.info(`Verification email sent to ${email} for user ${userId}`)
      return { success: true }

    } catch (error: any) {
      logger.error('Error sending verification email:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Verify email token
   */
  async verifyEmail(token: string, userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Find verification record
      const q = query(
        collection(db, this.collectionName),
        where('token', '==', token),
        where('userId', '==', userId),
        where('verified', '==', false)
      )
      
      const querySnapshot = await getDocs(q)
      
      if (querySnapshot.empty) {
        return { success: false, error: 'Invalid or expired verification token' }
      }

      const verificationDoc = querySnapshot.docs[0]
      const verification = verificationDoc.data() as EmailVerificationToken

      // Check if token is expired
      if (new Date() > verification.expiresAt) {
        await deleteDoc(doc(db, this.collectionName, verificationDoc.id))
        return { success: false, error: 'Verification token has expired' }
      }

      // Check attempts limit
      if (verification.attempts >= this.maxAttempts) {
        await deleteDoc(doc(db, this.collectionName, verificationDoc.id))
        return { success: false, error: 'Too many verification attempts' }
      }

      // Mark as verified
      await setDoc(doc(db, this.collectionName, verificationDoc.id), {
        ...verification,
        verified: true,
        attempts: verification.attempts + 1
      })

      // Update user verification status
      await setDoc(doc(db, 'users', userId), {
        emailVerified: true,
        verifiedAt: new Date()
      }, { merge: true })

      logger.info(`Email verified successfully for user ${userId}`)
      return { success: true }

    } catch (error: any) {
      logger.error('Error verifying email:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Check if user's email is verified
   */
  async isEmailVerified(userId: string): Promise<boolean> {
    try {
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) return false
      
      const userData = userDoc.data()
      return userData.emailVerified === true
    } catch (error) {
      logger.error('Error checking email verification status:', error)
      return false
    }
  }

  /**
   * Resend verification email
   */
  async resendVerificationEmail(userId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Get user data
      const userDoc = await getDoc(doc(db, 'users', userId))
      if (!userDoc.exists()) {
        return { success: false, error: 'User not found' }
      }

      const userData = userDoc.data()
      if (userData.emailVerified) {
        return { success: false, error: 'Email is already verified' }
      }

      // Check if we can resend (rate limiting)
      const recentTokens = await this.getRecentTokens(userId)
      if (recentTokens.length >= 3) {
        return { success: false, error: 'Too many verification emails sent. Please wait before requesting another.' }
      }

      return await this.sendVerificationEmail(userId, userData.email, userData.name || 'User')

    } catch (error: any) {
      logger.error('Error resending verification email:', error)
      return { success: false, error: error.message }
    }
  }

  /**
   * Clean up expired tokens
   */
  async cleanupExpiredTokens(): Promise<void> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('expiresAt', '<', new Date())
      )
      
      const querySnapshot = await getDocs(q)
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      
      await Promise.all(deletePromises)
      logger.info(`Cleaned up ${deletePromises.length} expired verification tokens`)

    } catch (error) {
      logger.error('Error cleaning up expired tokens:', error)
    }
  }

  /**
   * Clean up all tokens for a specific user
   */
  private async cleanupUserTokens(userId: string): Promise<void> {
    try {
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId)
      )
      
      const querySnapshot = await getDocs(q)
      const deletePromises = querySnapshot.docs.map(doc => deleteDoc(doc.ref))
      
      await Promise.all(deletePromises)
    } catch (error) {
      logger.error('Error cleaning up user tokens:', error)
    }
  }

  /**
   * Get recent tokens for rate limiting
   */
  private async getRecentTokens(userId: string): Promise<EmailVerificationToken[]> {
    try {
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      const q = query(
        collection(db, this.collectionName),
        where('userId', '==', userId),
        where('createdAt', '>', oneHourAgo)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as EmailVerificationToken)
    } catch (error) {
      logger.error('Error getting recent tokens:', error)
      return []
    }
  }
}

export const emailVerificationService = new EmailVerificationService()
