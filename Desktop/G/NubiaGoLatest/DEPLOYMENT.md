# 🚀 HomeBase Deployment Guide

Complete guide for deploying the HomeBase e-commerce platform to production.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Firebase Configuration](#firebase-configuration)
4. [Vercel Deployment](#vercel-deployment)
5. [Firebase Deployment](#firebase-deployment)
6. [Environment Variables](#environment-variables)
7. [Deployment Scripts](#deployment-scripts)
8. [Troubleshooting](#troubleshooting)
9. [Monitoring & Maintenance](#monitoring--maintenance)

---

## ✅ Prerequisites

### Required Tools
- [Node.js 18+](https://nodejs.org/)
- [Git](https://git-scm.com/)
- [Firebase CLI](https://firebase.google.com/docs/cli)
- [Vercel CLI](https://vercel.com/cli)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Required Accounts
- **Firebase Account:** [console.firebase.google.com](https://console.firebase.google.com)
- **Vercel Account:** [vercel.com](https://vercel.com)
- **GitHub Account:** [github.com](https://github.com)

---

## 🔧 Environment Setup

### 1. Install CLI Tools
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Install Vercel CLI globally
npm install -g vercel

# Verify installations
firebase --version
vercel --version
```

### 2. Login to Services
```bash
# Login to Firebase
firebase login

# Login to Vercel
vercel login
```

### 3. Project Initialization
```bash
# Clone repository
git clone <repository-url>
cd HomeBase

# Install dependencies
npm install

# Initialize Firebase (if not already done)
firebase init

# Link Vercel project
vercel link
```

---

## 🔥 Firebase Configuration

### Firebase Project Setup

#### 1. Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Add project"
3. Enter project name: `nubiago-aa411`
4. Enable Google Analytics (recommended)
5. Click "Create project"

#### 2. Enable Services
Enable the following Firebase services:

- **Authentication** - User management
- **Firestore Database** - Data storage
- **Storage** - File storage
- **Functions** - Serverless functions
- **Hosting** - Web hosting (optional, using Vercel)

#### 3. Configure Authentication
1. Go to Authentication → Sign-in method
2. Enable Email/Password
3. Enable Google OAuth (if needed)
4. Configure authorized domains

#### 4. Configure Firestore
1. Go to Firestore Database
2. Click "Create database"
3. Choose production mode
4. Select location (closest to your users)
5. Set up security rules

#### 5. Configure Storage
1. Go to Storage
2. Click "Get started"
3. Choose production mode
4. Select location
5. Set up security rules

### Firebase Configuration Files

#### `.firebaserc`
```json
{
  "projects": {
    "default": "nubiago-aa411"
  }
}
```

#### `firebase.json`
```json
{
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  },
  "functions": {
    "source": "functions",
    "runtime": "nodejs18"
  }
}
```

#### `firestore.rules`
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can read/write their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Products - suppliers can manage their own, customers can read
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.role == 'supplier' &&
        resource.data.supplierId == request.auth.uid;
    }
    
    // Orders - users can manage their own
    match /orders/{orderId} {
      allow read, write: if request.auth != null && 
        (resource.data.userId == request.auth.uid || 
         request.auth.token.role == 'admin');
    }
  }
}
```

#### `storage.rules`
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload to their own folder
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Product images - suppliers can upload, everyone can read
    match /products/{productId}/{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.role == 'supplier';
    }
  }
}
```

---

## 🌍 Vercel Deployment

### Vercel Project Setup

#### 1. Link Project
```bash
# Link to existing Vercel project
vercel link

# Or create new project
vercel
```

#### 2. Configure Build Settings
Vercel automatically detects Next.js and configures:
- **Framework Preset:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Install Command:** `npm install`

#### 3. Environment Variables
Set environment variables in Vercel dashboard:
1. Go to Project Settings → Environment Variables
2. Add all variables from `.env.local`
3. Set production values

#### 4. Domain Configuration
1. Go to Domains in Vercel dashboard
2. Add custom domain (if applicable)
3. Configure DNS settings

### Deployment Commands

#### Manual Deployment
```bash
# Build project
npm run build

# Deploy to Vercel
vercel --prod

# Or use npm script
npm run vercel:deploy
```

#### Automated Deployment
```bash
# Deploy using scripts
# Windows
deploy-vercel.bat

# Unix/Linux/macOS
./deploy-vercel.sh
```

---

## 🔥 Firebase Deployment

### Deploy Firestore Rules
```bash
# Deploy Firestore security rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### Deploy Storage Rules
```bash
# Deploy Storage security rules
firebase deploy --only storage
```

### Deploy Functions
```bash
# Deploy Cloud Functions
firebase deploy --only functions

# Deploy specific function
firebase deploy --only functions:functionName
```

### Deploy Everything
```bash
# Deploy all Firebase services
firebase deploy
```

---

## 🔐 Environment Variables

### Required Environment Variables

#### Firebase Configuration
```bash
# Client Configuration (Public)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=nubiago-aa411
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id

# Admin Configuration (Server-side only)
FIREBASE_PROJECT_ID=nubiago-aa411
FIREBASE_CLIENT_EMAIL=your_service_account_email
FIREBASE_PRIVATE_KEY=your_private_key
FIREBASE_STORAGE_BUCKET=your_project.appspot.com
```

#### Security Keys
```bash
# JWT Configuration
JWT_SECRET=your-super-secure-jwt-secret-key-here
SESSION_SECRET=your-super-secure-session-secret-key-here
CSRF_SECRET=your-super-secure-csrf-secret-key-here

# API Keys
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://your-domain.com
```

#### External Services
```bash
# Payment Gateway
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
SMTP_HOST=your_smtp_host
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
```

### Environment Templates

#### `.env.local.template`
```bash
# Copy this file to .env.local and fill in your values
cp env.local.template .env.local
```

#### `.env.vercel.template`
```bash
# Vercel-specific environment variables
cp env.vercel.template .env.local
```

### Environment Validation
```bash
# Check environment setup
npm run check:env

# Validate Firebase configuration
npm run check:firebase

# Push environment variables to Vercel
npm run vercel:env:push
```

---

## 📜 Deployment Scripts

### Available Scripts

#### Windows Scripts
```bash
# Deploy to Vercel
deploy-vercel.bat

# Deploy to Firebase
deploy.bat

# Fix console logging
fix-console-logging.bat

# Fix TypeScript any types
fix-typescript-any.bat
```

#### Unix/Linux/macOS Scripts
```bash
# Deploy to Vercel
./deploy-vercel.sh

# Deploy to Firebase
./deploy.sh

# Fix console logging
./fix-console-logging.sh

# Fix TypeScript any types
./fix-typescript-any.sh
```

#### npm Scripts
```json
{
  "scripts": {
    "build": "next build",
    "start": "next start",
    "deploy": "vercel --prod",
    "deploy:firebase": "firebase deploy",
    "vercel:env:push": "vercel env pull .env.local",
    "check:env": "node scripts/check-env.js",
    "check:firebase": "node scripts/check-firebase.js"
  }
}
```

---

## 🔍 Troubleshooting

### Common Deployment Issues

#### 1. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json .next
npm install

# Check for TypeScript errors
npm run type-check

# Verify environment variables
npm run check:env
```

#### 2. Environment Variable Issues
```bash
# Check Vercel environment variables
vercel env ls

# Pull environment variables
vercel env pull .env.local

# Push environment variables
vercel env push .env.local
```

#### 3. Firebase Configuration Issues
```bash
# Check Firebase project
firebase projects:list

# Switch Firebase project
firebase use nubiago-aa411

# Check Firebase configuration
firebase projects:list
```

#### 4. Vercel Deployment Issues
```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Redeploy
vercel --prod
```

### Error Solutions

#### "Initializing..." Message Stuck
**Cause:** Missing environment variables or Firebase configuration
**Solution:**
1. Check Vercel dashboard → Environment Variables
2. Ensure all Firebase variables are set
3. Redeploy after fixing variables

#### Firebase Permission Denied
**Cause:** Incorrect project ID or insufficient permissions
**Solution:**
1. Verify `.firebaserc` project ID
2. Check Firebase project permissions
3. Ensure Firebase CLI is logged in

#### Build Timeout
**Cause:** Large dependencies or complex build process
**Solution:**
1. Optimize bundle size
2. Use build caching
3. Split build into smaller chunks

---

## 📊 Monitoring & Maintenance

### Deployment Monitoring

#### Vercel Analytics
- **Performance:** Core Web Vitals
- **Analytics:** Page views, user behavior
- **Functions:** Serverless function metrics
- **Edge:** Edge network performance

#### Firebase Monitoring
- **Performance:** App performance metrics
- **Crashlytics:** Crash reporting
- **Analytics:** User engagement data
- **Functions:** Cloud function metrics

### Health Checks

#### Automated Health Checks
```bash
# Check application health
npm run health:check

# Monitor performance
npm run performance:monitor

# Check error rates
npm run error:monitor
```

#### Manual Health Checks
1. **Homepage Load Time:** < 3 seconds
2. **API Response Time:** < 500ms
3. **Error Rate:** < 1%
4. **Uptime:** > 99.9%

### Maintenance Tasks

#### Daily
- Check error logs
- Monitor performance metrics
- Verify deployment status

#### Weekly
- Review security logs
- Update dependencies
- Performance optimization

#### Monthly
- Security audit
- Performance review
- Documentation updates

---

## 📚 Additional Resources

### Documentation
- [Development Guide](./DEVELOPMENT.md)
- [API Documentation](./API.md)
- [Security Guide](./SECURITY.md)
- [Performance Guide](./PERFORMANCE.md)

### External Resources
- **Firebase Documentation:** [firebase.google.com/docs](https://firebase.google.com/docs)
- **Vercel Documentation:** [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation:** [nextjs.org/docs](https://nextjs.org/docs)

### Support
- **Firebase Support:** [firebase.google.com/support](https://firebase.google.com/support)
- **Vercel Support:** [vercel.com/support](https://vercel.com/support)
- **GitHub Issues:** [github.com/your-org/HomeBase/issues](https://github.com/your-org/HomeBase/issues)

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")  
**Version:** 1.0.0  
**Maintainer:** DevOps Team
