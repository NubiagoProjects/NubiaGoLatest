# HomeBase Ecommerce - Development Setup Guide

## Prerequisites

Before setting up the HomeBase project, ensure you have the following installed:

### Required Software
- **Node.js**: Version 18.17 or higher (LTS recommended)
- **npm**: Version 9.0 or higher (comes with Node.js)
- **Git**: Version 2.30 or higher
- **VS Code**: Recommended editor with extensions

### Recommended VS Code Extensions
```json
{
  "recommendations": [
    "bradlc.vscode-tailwindcss",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-vscode.vscode-typescript-next",
    "ms-vscode.vscode-json",
    "formulahendry.auto-rename-tag",
    "christian-kohler.path-intellisense",
    "ms-vscode.vscode-git-graph",
    "ms-vscode.vscode-gitlens"
  ]
}
```

## Initial Setup

### 1. Clone the Repository
```bash
# Clone the main repository
git clone https://github.com/NubiagoProjects/NubiaGoLatest.git
cd NubiaGoLatest

# Checkout the main branch
git checkout main
```

### 2. Install Dependencies
```bash
# Install all dependencies
npm install

# Verify installation
npm run type-check
```

### 3. Environment Configuration
```bash
# Copy environment template
cp env.local.template .env.local

# Edit .env.local with your configuration
nano .env.local
```

#### Required Environment Variables
```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Admin (for server-side operations)
FIREBASE_ADMIN_PROJECT_ID=your_project_id
FIREBASE_ADMIN_PRIVATE_KEY=your_private_key
FIREBASE_ADMIN_CLIENT_EMAIL=your_client_email

# External Services
NEXT_PUBLIC_SENDBIRD_APP_ID=your_sendbird_app_id
NEXT_PUBLIC_SENTRY_DSN=your_sentry_dsn
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=your_vercel_analytics_id

# Payment Services
MOBILE_MONEY_API_KEY=your_mobile_money_api_key
MOBILE_MONEY_SECRET=your_mobile_money_secret

# Email Service
SENDGRID_API_KEY=your_sendgrid_api_key
SENDGRID_FROM_EMAIL=your_from_email
```

### 4. Firebase Setup
```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase (if not already done)
firebase init

# Select the following services:
# - Firestore
# - Functions
# - Hosting
# - Storage
```

## Development Workflow

### 1. Starting Development Server
```bash
# Start development server
npm run dev

# The application will be available at:
# http://localhost:3000
```

### 2. Available Scripts
```bash
# Development
npm run dev              # Start development server
npm run build           # Build for production
npm run start           # Start production server
npm run lint            # Run ESLint
npm run type-check      # Run TypeScript type checking

# Testing
npm run test            # Run all tests
npm run test:watch      # Run tests in watch mode
npm run test:coverage   # Run tests with coverage
npm run test:e2e        # Run end-to-end tests

# Code Quality
npm run format          # Format code with Prettier
npm run format:check    # Check code formatting
npm run security:audit  # Run security audit
npm run security:fix    # Fix security vulnerabilities

# Deployment
npm run vercel:deploy   # Deploy to Vercel
npm run vercel:build    # Build for Vercel
```

### 3. Git Workflow
```bash
# Create a new feature branch
git checkout -b feature/your-feature-name

# Make your changes and commit
git add .
git commit -m "feat: add your feature description"

# Push to remote
git push origin feature/your-feature-name

# Create a pull request on GitHub
# Wait for review and merge
```

## Project Structure Understanding

### Key Directories
```
src/
├── app/                 # Next.js App Router pages
├── components/          # React components
├── hooks/              # Custom React hooks
├── lib/                # Utilities and services
├── store/              # State management
└── types/              # TypeScript types
```

### Component Organization
- **UI Components** (`src/components/ui/`): Reusable UI elements
- **Feature Components** (`src/components/features/`): Feature-specific components
- **Layout Components** (`src/components/layout/`): Page layout components

### Import Patterns
```typescript
// Use centralized imports
import { Button, Input, Card } from '@/components/ui'
import { useAuth, useCartStore } from '@/hooks'
import { schemas } from '@/lib/validation'

// Use route constants
import { ROUTES } from '@/app/routes'
```

## Development Guidelines

### 1. Code Style
- Follow the existing code style
- Use TypeScript for all new code
- Use functional components with hooks
- Follow the component structure template

### 2. Component Structure
```typescript
// 1. Imports
import React from 'react'
import { Button } from '@/components/ui'

// 2. Types
interface ComponentProps {
  // Define props
}

// 3. Component
export const Component: React.FC<ComponentProps> = (props) => {
  // 4. Hooks
  // 5. Event handlers
  // 6. Render
  return (
    <div>
      {/* Component content */}
    </div>
  )
}
```

### 3. Error Handling
```typescript
import { createError, handleError } from '@/lib/errors'

try {
  // Your code
} catch (error) {
  const appError = handleError(error)
  // Handle error appropriately
}
```

### 4. Validation
```typescript
import { schemas } from '@/lib/validation'

const validatedData = schemas.product.create.parse(productData)
```

## Testing

### 1. Running Tests
```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- --testPathPattern=button.test.tsx
```

### 2. Writing Tests
```typescript
// Example component test
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui'

describe('Button', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>)
    expect(screen.getByText('Click me')).toBeInTheDocument()
  })
})
```

### 3. Test Structure
```
src/components/__tests__/
├── button.test.tsx
├── input.test.tsx
└── card.test.tsx
```

## Database and Backend

### 1. Firestore Rules
```bash
# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Firestore indexes
firebase deploy --only firestore:indexes
```

### 2. Firebase Functions
```bash
# Deploy functions
firebase deploy --only functions

# Test functions locally
firebase emulators:start --only functions
```

### 3. Storage Rules
```bash
# Deploy storage rules
firebase deploy --only storage
```

## Performance and Optimization

### 1. Bundle Analysis
```bash
# Analyze bundle size
npm run build
npm run analyze
```

### 2. Image Optimization
- Use Next.js Image component
- Optimize images before upload
- Use appropriate image formats (WebP, AVIF)

### 3. Code Splitting
- Use dynamic imports for heavy components
- Implement lazy loading where appropriate
- Use route-based code splitting

## Debugging

### 1. Development Tools
- React Developer Tools (browser extension)
- Redux DevTools (for Zustand stores)
- Next.js debugging tools

### 2. Console Logging
```typescript
import { logger } from '@/lib/utils/logger'

// Use structured logging
logger.info('User action', { userId, action: 'login' })
logger.error('API error', { error, endpoint })
```

### 3. Error Tracking
- Sentry integration for error tracking
- Browser console for development
- Network tab for API debugging

## Deployment

### 1. Vercel Deployment
```bash
# Deploy to Vercel
npm run vercel:deploy

# Deploy preview
npm run vercel:deploy:preview
```

### 2. Environment Variables
- Set production environment variables in Vercel dashboard
- Use different environments for staging/production
- Never commit sensitive data

### 3. Build Optimization
```bash
# Build for production
npm run build

# Analyze build output
npm run analyze
```

## Troubleshooting

### Common Issues

#### 1. Build Errors
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

#### 2. TypeScript Errors
```bash
# Check types
npm run type-check

# Clear TypeScript cache
rm -rf tsconfig.tsbuildinfo
```

#### 3. Dependency Issues
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. Firebase Issues
```bash
# Check Firebase configuration
firebase projects:list

# Reinitialize Firebase
firebase init
```

### Getting Help
1. Check the project documentation
2. Review existing issues on GitHub
3. Ask questions in the development team
4. Create a new issue for bugs
5. Use the troubleshooting scripts

## Additional Resources

### Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev)
- [TypeScript Documentation](https://www.typescriptlang.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Firebase Documentation](https://firebase.google.com/docs)

### Project-Specific
- `PROJECT_STRUCTURE.md` - Detailed project organization
- `API.md` - API documentation
- `FEATURES.md` - Feature documentation
- `SECURITY.md` - Security guidelines
- `PERFORMANCE.md` - Performance guidelines

### Development Tools
- [VS Code](https://code.visualstudio.com)
- [GitHub Desktop](https://desktop.github.com)
- [Postman](https://www.postman.com) - API testing
- [Figma](https://www.figma.com) - Design collaboration

## Conclusion

This setup guide provides everything you need to start developing with the HomeBase project. Follow the guidelines and best practices to maintain code quality and consistency.

For additional questions or support:
- Check the project documentation
- Ask the development team
- Create issues on GitHub
- Review the codebase examples

Happy coding! 🚀
