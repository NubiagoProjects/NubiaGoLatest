# 🔐 HomeBase Security Guide

Comprehensive security implementation and best practices for the HomeBase e-commerce platform.

## 📋 Table of Contents

1. [Security Overview](#security-overview)
2. [Authentication System](#authentication-system)
3. [Authorization & Access Control](#authorization--access-control)
4. [Firebase Security](#firebase-security)
5. [API Security](#api-security)
6. [Data Protection](#data-protection)
7. [Security Monitoring](#security-monitoring)
8. [Security Best Practices](#security-best-practices)
9. [Incident Response](#incident-response)

---

## 🛡️ Security Overview

### Security Principles
- **Defense in Depth:** Multiple layers of security
- **Least Privilege:** Users have minimal required access
- **Zero Trust:** Verify every request and user
- **Security by Design:** Security built into every component

### Security Features
- ✅ JWT-based authentication with signature validation
- ✅ Role-based access control (RBAC)
- ✅ CSRF protection middleware
- ✅ Rate limiting and abuse prevention
- ✅ Input validation and sanitization
- ✅ Secure error handling
- ✅ Audit logging and monitoring
- ✅ Environment variable protection

---

## 🔑 Authentication System

### Firebase Authentication

#### Supported Authentication Methods
1. **Email/Password Authentication**
   - Secure password requirements
   - Email verification required
   - Password reset functionality

2. **Google OAuth Integration**
   - Secure OAuth 2.0 flow
   - Google account verification
   - Automatic profile creation

3. **JWT Token Management**
   - Secure token generation
   - Token expiration handling
   - Refresh token rotation

#### Authentication Flow
```typescript
// 1. User signs in
const userCredential = await signInWithEmailAndPassword(auth, email, password);

// 2. JWT token generated
const idToken = await userCredential.user.getIdToken();

// 3. Token validated on each request
const decodedToken = await verifyIdToken(idToken);
```

#### Recent Authentication Fixes
- ✅ Removed hardcoded Firebase credentials
- ✅ Implemented proper JWT verification
- ✅ Enhanced authentication middleware
- ✅ Added email verification requirements
- ✅ Improved role-based access control

### OAuth Setup

#### Google OAuth Configuration
1. **Google Cloud Console Setup**
   ```bash
   # Enable Google+ API
   # Create OAuth 2.0 credentials
   # Configure authorized origins
   # Set redirect URIs
   ```

2. **Firebase Configuration**
   ```typescript
   // Enable Google sign-in method
   // Configure OAuth consent screen
   // Set authorized domains
   // Configure scopes
   ```

3. **Environment Variables**
   ```bash
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   GOOGLE_REDIRECT_URI=https://your-domain.com/auth/callback
   ```

---

## 🚪 Authorization & Access Control

### Role-Based Access Control (RBAC)

#### User Roles
```typescript
type UserRole = 'admin' | 'supplier' | 'customer';

interface User {
  id: string;
  email: string;
  role: UserRole;
  permissions: Permission[];
}
```

#### Permission System
```typescript
interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete';
  conditions?: Record<string, any>;
}

// Example permissions
const permissions = {
  admin: ['*:*'], // Full access
  supplier: [
    'products:create',
    'products:update',
    'products:delete',
    'orders:read'
  ],
  customer: [
    'products:read',
    'orders:create',
    'orders:read',
    'profile:update'
  ]
};
```

#### Access Control Implementation
```typescript
// Middleware for route protection
export function requireAuth(requiredRole?: UserRole) {
  return async (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
    try {
      const token = req.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return res.status(401).json({ error: 'Authentication required' });
      }

      const decodedToken = await verifyIdToken(token);
      const user = await getUserById(decodedToken.uid);

      if (requiredRole && user.role !== requiredRole) {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }

      req.user = user;
      next();
    } catch (error) {
      return res.status(401).json({ error: 'Invalid token' });
    }
  };
}
```

### Route Protection

#### Protected Routes
```typescript
// Admin-only routes
app.use('/admin/*', requireAuth('admin'));

// Supplier routes
app.use('/supplier/*', requireAuth('supplier'));

// Customer routes
app.use('/dashboard/*', requireAuth('customer'));
```

#### API Route Protection
```typescript
// Example: Protected product creation
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify authentication and authorization
  const user = await authenticateUser(req);
  if (!user || user.role !== 'supplier') {
    return res.status(403).json({ error: 'Supplier access required' });
  }

  // Process request
  const product = await createProduct(req.body, user.id);
  res.status(201).json(product);
}
```

---

## 🔥 Firebase Security

### Firestore Security Rules

#### User Data Protection
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
      
      // Admins can read all users
      allow read: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

#### Product Security
```javascript
// Products - suppliers manage their own, customers can read
match /products/{productId} {
  allow read: if true; // Public read access
  
  allow create: if request.auth != null && 
    request.auth.token.role == 'supplier';
    
  allow update, delete: if request.auth != null && 
    request.auth.token.role == 'supplier' &&
    resource.data.supplierId == request.auth.uid;
}
```

#### Order Security
```javascript
// Orders - users manage their own, admins can access all
match /orders/{orderId} {
  allow read, write: if request.auth != null && 
    (resource.data.userId == request.auth.uid || 
     request.auth.token.role == 'admin');
}
```

### Storage Security Rules

#### File Access Control
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // User files - only owner can access
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    
    // Product images - public read, supplier write
    match /products/{productId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.role == 'supplier';
    }
    
    // Admin files - admin only
    match /admin/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.token.role == 'admin';
    }
  }
}
```

---

## 🛡️ API Security

### CSRF Protection

#### CSRF Token Implementation
```typescript
// Generate CSRF token
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// Validate CSRF token
export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken;
}

// CSRF middleware
export function csrfProtection(req: NextApiRequest, res: NextApiResponse, next: NextFunction) {
  if (req.method === 'GET') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session.csrfToken;

  if (!csrfToken || !validateCSRFToken(csrfToken, sessionToken)) {
    return res.status(403).json({ error: 'CSRF token invalid' });
  }

  next();
}
```

### Rate Limiting

#### API Rate Limiting
```typescript
import rateLimit from 'express-rate-limit';

// General API rate limiting
export const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP'
});

// Authentication rate limiting
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: 'Too many authentication attempts'
});

// Apply to routes
app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

### Input Validation

#### Zod Schema Validation
```typescript
import { z } from 'zod';

// User input validation
const userSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/),
  name: z.string().min(2).max(100),
  role: z.enum(['customer', 'supplier'])
});

// Product input validation
const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().positive(),
  category: z.string().min(1),
  images: z.array(z.string().url()).min(1)
});

// Validation middleware
export function validateInput(schema: z.ZodSchema) {
  return (req: NextApiRequest, res: NextApiResponse, next: NextFunction) => {
    try {
      const validatedData = schema.parse(req.body);
      req.body = validatedData;
      next();
    } catch (error) {
      return res.status(400).json({ 
        error: 'Validation failed', 
        details: error.errors 
      });
    }
  };
}
```

---

## 🔒 Data Protection

### Data Encryption

#### Sensitive Data Handling
```typescript
// Encrypt sensitive data before storage
export async function encryptSensitiveData(data: string): Promise<string> {
  const algorithm = 'aes-256-gcm';
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
  const iv = crypto.randomBytes(16);
  
  const cipher = crypto.createCipher(algorithm, key);
  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return `${iv.toString('hex')}:${encrypted}`;
}

// Decrypt sensitive data
export async function decryptSensitiveData(encryptedData: string): Promise<string> {
  const [ivHex, encrypted] = encryptedData.split(':');
  const key = crypto.scryptSync(process.env.ENCRYPTION_KEY!, 'salt', 32);
  const iv = Buffer.from(ivHex, 'hex');
  
  const decipher = crypto.createDecipher('aes-256-gcm', key);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}
```

### PII Protection

#### Personal Data Handling
```typescript
// Mask sensitive information in logs
export function maskPII(data: any): any {
  const masked = { ...data };
  
  if (masked.email) {
    masked.email = masked.email.replace(/(.{2}).*@/, '$1***@');
  }
  
  if (masked.phone) {
    masked.phone = masked.phone.replace(/(\d{3})\d{3}(\d{4})/, '$1-***-$2');
  }
  
  if (masked.address) {
    masked.address = masked.address.replace(/(\d+)\s+\w+/, '$1 *** St');
  }
  
  return masked;
}
```

---

## 📊 Security Monitoring

### Audit Logging

#### Comprehensive Audit Trail
```typescript
interface AuditLog {
  id: string;
  userId: string;
  action: string;
  resource: string;
  resourceId: string;
  details: Record<string, any>;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
  success: boolean;
}

// Audit logging service
export class AuditService {
  async logAction(userId: string, action: string, resource: string, details: any) {
    const auditLog: AuditLog = {
      id: generateId(),
      userId,
      action,
      resource,
      resourceId: details.resourceId || '',
      details,
      ipAddress: getClientIP(),
      userAgent: getClientUserAgent(),
      timestamp: new Date(),
      success: true
    };

    await this.saveAuditLog(auditLog);
  }

  async logSecurityEvent(userId: string, event: string, details: any) {
    await this.logAction(userId, event, 'security', details);
  }
}
```

### Security Alerts

#### Automated Security Monitoring
```typescript
// Security event monitoring
export class SecurityMonitor {
  async monitorFailedLogins(userId: string, ipAddress: string) {
    const failedAttempts = await this.getFailedLoginAttempts(userId, ipAddress);
    
    if (failedAttempts.length >= 5) {
      await this.triggerSecurityAlert({
        type: 'BRUTE_FORCE_ATTEMPT',
        userId,
        ipAddress,
        attempts: failedAttempts.length
      });
      
      // Temporarily block IP
      await this.blockIPAddress(ipAddress, 15 * 60 * 1000); // 15 minutes
    }
  }

  async monitorSuspiciousActivity(userId: string, activity: string) {
    const riskScore = await this.calculateRiskScore(userId, activity);
    
    if (riskScore > 0.8) {
      await this.triggerSecurityAlert({
        type: 'SUSPICIOUS_ACTIVITY',
        userId,
        activity,
        riskScore
      });
    }
  }
}
```

---

## 🛡️ Security Best Practices

### Development Security

#### Code Security Guidelines
1. **Input Validation**
   - Always validate and sanitize user input
   - Use type-safe validation schemas
   - Implement proper error handling

2. **Authentication**
   - Never store passwords in plain text
   - Use secure session management
   - Implement proper logout procedures

3. **Authorization**
   - Check permissions at every level
   - Implement principle of least privilege
   - Validate user ownership of resources

4. **Data Protection**
   - Encrypt sensitive data at rest
   - Use HTTPS for all communications
   - Implement proper data retention policies

### Environment Security

#### Environment Variable Protection
```bash
# Never commit sensitive data
.env.local
.env.production
firebase-service-account.json

# Use templates for documentation
.env.local.template
.env.production.template
```

#### Secret Management
```typescript
// Use environment variables for secrets
const config = {
  jwtSecret: process.env.JWT_SECRET!,
  firebaseConfig: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!
  }
};

// Validate required environment variables
function validateEnvironment() {
  const required = ['JWT_SECRET', 'NEXT_PUBLIC_FIREBASE_API_KEY'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}
```

---

## 🚨 Incident Response

### Security Incident Types

#### 1. Authentication Breaches
- **Detection:** Failed login attempts, suspicious login patterns
- **Response:** Block IP addresses, reset affected accounts
- **Recovery:** Audit affected accounts, implement additional security

#### 2. Data Breaches
- **Detection:** Unusual data access patterns, unauthorized data exports
- **Response:** Isolate affected systems, notify stakeholders
- **Recovery:** Restore from backups, implement additional monitoring

#### 3. API Abuse
- **Detection:** Rate limit violations, unusual API usage patterns
- **Response:** Implement stricter rate limiting, block abusive IPs
- **Recovery:** Monitor for continued abuse, adjust rate limits

### Incident Response Plan

#### Immediate Response (0-1 hour)
1. **Assess Impact**
   - Determine scope of incident
   - Identify affected systems and users
   - Assess data sensitivity

2. **Contain Threat**
   - Isolate affected systems
   - Block malicious IP addresses
   - Disable compromised accounts

3. **Document Incident**
   - Record incident details
   - Capture system logs
   - Document response actions

#### Short-term Response (1-24 hours)
1. **Investigate Root Cause**
   - Analyze system logs
   - Review security configurations
   - Identify vulnerability exploited

2. **Implement Fixes**
   - Patch security vulnerabilities
   - Update security configurations
   - Implement additional monitoring

3. **Notify Stakeholders**
   - Inform development team
   - Update management
   - Prepare customer communication

#### Long-term Response (1-30 days)
1. **Post-Incident Review**
   - Conduct incident analysis
   - Identify lessons learned
   - Update security procedures

2. **Implement Improvements**
   - Enhance security measures
   - Improve monitoring systems
   - Update incident response plan

3. **Document Lessons Learned**
   - Update security documentation
   - Train team on new procedures
   - Plan security improvements

---

## 📚 Additional Resources

### Documentation
- [Development Guide](./DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [API Documentation](./API.md)
- [Performance Guide](./PERFORMANCE.md)

### Security Tools
- **Firebase Security Rules:** [firebase.google.com/docs/rules](https://firebase.google.com/docs/rules)
- **OWASP Security Guidelines:** [owasp.org](https://owasp.org)
- **Security Headers:** [securityheaders.com](https://securityheaders.com)

### Security Contacts
- **Security Team:** security@nubiago.com
- **Emergency Contact:** +1-XXX-XXX-XXXX
- **Security Issues:** [GitHub Security](https://github.com/your-org/HomeBase/security)

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")  
**Version:** 1.0.0  
**Maintainer:** Security Team
