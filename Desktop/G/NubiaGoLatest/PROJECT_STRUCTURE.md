# HomeBase Ecommerce - Project Structure Documentation

## Overview
This document outlines the professional structure and organization of the HomeBase ecommerce application. The project has been restructured to follow industry best practices for maintainability, scalability, and developer experience.

## Project Architecture

### Technology Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Validation**: Zod
- **Testing**: Jest + React Testing Library
- **Deployment**: Vercel
- **Backend**: Firebase (Firestore, Auth, Functions)
- **Database**: Firestore (NoSQL)

### Core Principles
1. **Separation of Concerns**: Clear boundaries between different layers
2. **Single Responsibility**: Each file/module has one clear purpose
3. **DRY (Don't Repeat Yourself)**: Reusable components and utilities
4. **Type Safety**: Full TypeScript coverage
5. **Performance**: Optimized loading and rendering
6. **Accessibility**: WCAG compliance
7. **Security**: Best practices for authentication and data handling

## Directory Structure

```
HomeBase/
├── src/                          # Source code
│   ├── app/                      # Next.js App Router pages
│   ├── components/               # React components
│   ├── hooks/                    # Custom React hooks
│   ├── lib/                      # Utility libraries and services
│   ├── store/                    # State management (Zustand)
│   └── types/                    # TypeScript type definitions
├── public/                       # Static assets
├── docs/                         # Documentation
├── scripts/                      # Build and utility scripts
└── config files                  # Configuration files
```

## Detailed Structure

### 1. App Router (`src/app/`)
Next.js 14 App Router with organized route groups:

```
src/app/
├── (auth)/                       # Authentication route group
│   ├── login/
│   ├── register/
│   └── forgot-password/
├── (dashboard)/                  # Dashboard route group
│   ├── admin/                    # Admin routes
│   ├── customer/                 # Customer routes
│   └── supplier/                 # Supplier routes
├── api/                          # API routes
├── products/                     # Product pages
├── cart/                         # Shopping cart
├── checkout/                     # Checkout process
├── account/                      # User account
├── layout.tsx                    # Root layout
└── page.tsx                      # Homepage
```

**Key Benefits:**
- Route groups for logical organization
- Consistent layout patterns
- SEO-friendly URL structure
- Proper metadata management

### 2. Components (`src/components/`)
Organized by feature and purpose:

```
src/components/
├── ui/                          # Reusable UI components
│   ├── button.tsx
│   ├── input.tsx
│   ├── card.tsx
│   ├── modal.tsx
│   └── index.ts                 # Centralized exports
├── features/                    # Feature-specific components
│   ├── auth/                    # Authentication components
│   ├── products/                # Product-related components
│   ├── cart/                    # Shopping cart components
│   ├── checkout/                # Checkout components
│   ├── admin/                   # Admin components
│   └── supplier/                # Supplier components
├── layout/                      # Layout components
│   ├── navigation.tsx
│   ├── footer.tsx
│   └── header.tsx
├── forms/                       # Form components
│   ├── product-form.tsx
│   ├── user-form.tsx
│   └── address-form.tsx
└── providers/                   # Context providers
    ├── auth-provider.tsx
    ├── theme-provider.tsx
    └── store-provider.tsx
```

**Key Benefits:**
- Clear component hierarchy
- Easy to find and maintain
- Consistent naming conventions
- Reusable component library

### 3. Hooks (`src/hooks/`)
Custom React hooks organized by functionality:

```
src/hooks/
├── core/                        # Core application hooks
│   ├── useAuth.tsx
│   ├── useFirebaseAuth.tsx
│   └── useCSRF.tsx
├── features/                    # Feature-specific hooks
│   ├── useProductSearch.tsx
│   ├── useCheckout.tsx
│   └── usePayment.tsx
├── utilities/                   # Utility hooks
│   ├── useLocalStorage.tsx
│   ├── useDebounce.tsx
│   └── useIntersectionObserver.tsx
└── index.ts                     # Centralized exports
```

**Key Benefits:**
- Consistent hook patterns
- Easy to test and debug
- Reusable across components
- Clear separation of concerns

### 4. Library (`src/lib/`)
Core utilities and services:

```
src/lib/
├── constants/                   # Application constants
│   ├── app.ts                  # App configuration
│   ├── api.ts                  # API configuration
│   └── ui.ts                   # UI configuration
├── services/                    # Business logic services
│   ├── api.service.ts          # HTTP client
│   ├── auth.service.ts         # Authentication
│   ├── product.service.ts      # Product management
│   ├── order.service.ts        # Order management
│   └── index.ts                # Centralized exports
├── utils/                       # Utility functions
│   ├── formatting.ts            # Data formatting
│   ├── validation.ts            # Data validation
│   └── security.ts              # Security utilities
├── errors/                      # Error handling
│   ├── index.ts                # Error classes
│   └── handlers.ts             # Error handlers
├── validation/                  # Validation schemas
│   ├── schemas.ts              # Zod schemas
│   └── validators.ts           # Validation functions
└── firebase/                    # Firebase configuration
    ├── config.ts
    ├── admin.ts
    └── auth.ts
```

**Key Benefits:**
- Centralized business logic
- Consistent error handling
- Reusable utilities
- Easy to test and maintain

### 5. Store (`src/store/`)
State management with Zustand:

```
src/store/
├── slices/                      # State slices
│   ├── auth.store.ts           # Authentication state
│   ├── cart.store.ts           # Shopping cart state
│   ├── user.store.ts           # User state
│   └── ui.store.ts             # UI state
├── middleware/                  # Store middleware
│   ├── persist.ts              # Persistence middleware
│   └── devtools.ts             # Development tools
└── index.ts                     # Store configuration
```

**Key Benefits:**
- Predictable state management
- Easy debugging with Redux DevTools
- Persistent state across sessions
- Type-safe state updates

### 6. Types (`src/types/`)
TypeScript type definitions:

```
src/types/
├── common.ts                    # Common types
├── api.ts                       # API types
├── auth.ts                      # Authentication types
├── product.ts                   # Product types
├── order.ts                     # Order types
├── user.ts                      # User types
├── ui.ts                        # UI component types
└── index.ts                     # Centralized exports
```

**Key Benefits:**
- Full type safety
- Consistent data structures
- Easy refactoring
- Better IDE support

## Key Features

### 1. Centralized Exports
All major directories have `index.ts` files for clean imports:

```typescript
// Instead of multiple imports
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'

// Use single import
import { Button, Input, Card } from '@/components/ui'
```

### 2. Route Configuration
Centralized routing with `src/app/routes.ts`:

```typescript
import { ROUTES } from '@/app/routes'

// Use consistent routes throughout the app
<Link href={ROUTES.PRODUCTS.DETAIL(product.slug)}>
  View Product
</Link>
```

### 3. Constants Management
Application-wide constants in `src/lib/constants/`:

```typescript
import { APP_CONFIG, UI_CONFIG } from '@/lib/constants'

// Use consistent values
const maxFileSize = APP_CONFIG.FILE_UPLOAD.MAX_SIZE
const primaryColor = UI_CONFIG.THEME.PRIMARY_COLOR
```

### 4. Error Handling
Comprehensive error system with custom error classes:

```typescript
import { createError, formatErrorResponse } from '@/lib/errors'

// Create specific errors
const error = createError.validation('Invalid input', fieldErrors)
const response = formatErrorResponse(error)
```

### 5. Validation
Zod-based validation schemas:

```typescript
import { schemas } from '@/lib/validation'

// Validate data consistently
const validatedData = schemas.product.create.parse(productData)
```

## Development Guidelines

### 1. File Naming
- Use kebab-case for file names: `product-card.tsx`
- Use PascalCase for component names: `ProductCard`
- Use camelCase for function names: `handleProductClick`

### 2. Component Structure
```typescript
// 1. Imports
import React from 'react'
import { Button } from '@/components/ui'

// 2. Types
interface ProductCardProps {
  product: Product
  onAddToCart: (productId: string) => void
}

// 3. Component
export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart
}) => {
  // 4. Hooks
  const { addToCart } = useCartStore()
  
  // 5. Event handlers
  const handleAddToCart = () => {
    onAddToCart(product.id)
  }
  
  // 6. Render
  return (
    <div className="product-card">
      {/* Component content */}
    </div>
  )
}
```

### 3. Import Organization
```typescript
// 1. React and Next.js
import React from 'react'
import Link from 'next/link'

// 2. Third-party libraries
import { z } from 'zod'
import { motion } from 'framer-motion'

// 3. Internal components
import { Button } from '@/components/ui'
import { ProductCard } from '@/components/features/products'

// 4. Hooks and utilities
import { useAuth } from '@/hooks'
import { formatPrice } from '@/lib/utils'

// 5. Types
import type { Product } from '@/types'
```

### 4. State Management
```typescript
// Use Zustand stores for global state
import { useCartStore } from '@/store'

const { items, addItem, removeItem } = useCartStore()

// Use local state for component-specific state
const [isLoading, setIsLoading] = useState(false)
```

## Performance Optimizations

### 1. Code Splitting
- Route-based code splitting with App Router
- Dynamic imports for heavy components
- Lazy loading for non-critical features

### 2. Image Optimization
- Next.js Image component with automatic optimization
- WebP and AVIF format support
- Responsive image sizes

### 3. Bundle Optimization
- Tree shaking for unused code
- Dynamic imports for large libraries
- Optimized dependencies

### 4. Caching
- Static generation where possible
- Incremental Static Regeneration (ISR)
- Service worker for offline support

## Testing Strategy

### 1. Unit Tests
- Component testing with React Testing Library
- Hook testing with custom test utilities
- Utility function testing

### 2. Integration Tests
- API endpoint testing
- User flow testing
- Cross-component interaction testing

### 3. E2E Tests
- Critical user journeys
- Payment flow testing
- Admin functionality testing

## Security Considerations

### 1. Authentication
- JWT token management
- Role-based access control
- Session management

### 2. Data Validation
- Input sanitization
- Schema validation with Zod
- SQL injection prevention

### 3. API Security
- Rate limiting
- CSRF protection
- Request validation

## Deployment

### 1. Environment Configuration
- Environment-specific configs
- Secure secret management
- Feature flags

### 2. Build Process
- Optimized production builds
- Asset optimization
- Bundle analysis

### 3. Monitoring
- Error tracking with Sentry
- Performance monitoring
- User analytics

## Maintenance

### 1. Code Quality
- ESLint configuration
- Prettier formatting
- TypeScript strict mode

### 2. Documentation
- Component documentation
- API documentation
- Setup instructions

### 3. Updates
- Dependency updates
- Security patches
- Feature additions

## Conclusion

This restructured project provides a solid foundation for a professional ecommerce application. The organization follows industry best practices and makes the codebase easy to understand, maintain, and extend.

Key benefits of this structure:
- **Maintainability**: Clear organization makes it easy to find and modify code
- **Scalability**: Modular structure supports growth and new features
- **Developer Experience**: Consistent patterns and clear documentation
- **Performance**: Optimized loading and rendering
- **Security**: Best practices for authentication and data handling
- **Testing**: Comprehensive testing strategy
- **Deployment**: Optimized build and deployment process

For questions or suggestions about this structure, please refer to the development team or create an issue in the project repository.
