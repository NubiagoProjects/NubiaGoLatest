# 🛠️ HomeBase Development Guide

A comprehensive guide for developers working on the HomeBase e-commerce platform.

## 📋 Table of Contents

1. [Development Setup](#development-setup)
2. [Testing Strategy](#testing-strategy)
3. [Code Quality](#code-quality)
4. [TypeScript Guidelines](#typescript-guidelines)
5. [Logging & Debugging](#logging--debugging)
6. [Troubleshooting](#troubleshooting)
7. [Development Workflow](#development-workflow)

---

## 🚀 Development Setup

### Prerequisites
- Node.js 18+
- npm or yarn
- Git
- Firebase CLI
- Vercel CLI (for deployment)

### Initial Setup
```bash
# Clone the repository
git clone <repository-url>
cd HomeBase

# Install dependencies
npm install

# Environment setup
cp env.local.template .env.local
# Edit .env.local with your Firebase configuration

# Firebase setup
npm install -g firebase-tools
firebase login
firebase init
```

### Development Commands
```bash
# Start development server
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Lint code
npm run lint

# Format code
npm run format
```

---

## 🧪 Testing Strategy

### Jest Testing Infrastructure

The project uses Jest with React Testing Library for comprehensive testing.

#### Test Configuration
- **Environment:** jsdom for DOM testing
- **Coverage:** Current coverage: 0.61% statements, 0.63% branches
- **Target:** 70%+ coverage across all components

#### Test Structure
```
src/
├── __tests__/           # Test files
├── components/          # Component tests
├── lib/                # Service tests
├── hooks/              # Hook tests
└── utils/              # Utility tests
```

#### Running Tests
```bash
# Run all tests
npm test

# Run specific test file
npm test -- component-name.test.tsx

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

#### Test Coverage Goals
- **Components:** 80%+ coverage
- **Services:** 90%+ coverage
- **Hooks:** 85%+ coverage
- **Utilities:** 95%+ coverage

#### Testing Best Practices
1. **Component Testing**
   - Test user interactions
   - Verify state changes
   - Test error boundaries
   - Mock external dependencies

2. **Service Testing**
   - Test business logic
   - Mock API calls
   - Test error handling
   - Verify data transformations

3. **Hook Testing**
   - Test state management
   - Test side effects
   - Test cleanup functions
   - Mock external services

---

## 📝 Code Quality

### ESLint Configuration
The project uses ESLint with TypeScript support for code quality.

#### Linting Rules
- **TypeScript:** Strict type checking
- **React:** Best practices and hooks rules
- **Accessibility:** WCAG compliance rules
- **Security:** Security-focused rules

#### Running Lint
```bash
# Lint all files
npm run lint

# Lint specific file
npm run lint -- src/components/Button.tsx

# Auto-fix issues
npm run lint -- --fix
```

### Prettier Configuration
Consistent code formatting across the project.

```bash
# Format all files
npm run format

# Check formatting
npm run format:check
```

### Git Hooks
Husky pre-commit hooks ensure code quality.

```bash
# Install git hooks
npm run prepare

# Hooks run automatically on commit
# - Linting
# - Type checking
# - Test running
# - Format checking
```

---

## 🔧 TypeScript Guidelines

### Type Safety Improvements

#### Recent Fixes Applied
- ✅ Removed `any` types from all components
- ✅ Implemented strict type checking
- ✅ Added proper interface definitions
- ✅ Enhanced generic type usage

#### Type Guidelines
1. **Avoid `any` Type**
   ```typescript
   // ❌ Bad
   const data: any = fetchData();
   
   // ✅ Good
   const data: UserData = fetchData();
   ```

2. **Use Proper Interfaces**
   ```typescript
   // ✅ Good
   interface User {
     id: string;
     name: string;
     email: string;
     role: UserRole;
   }
   ```

3. **Generic Types**
   ```typescript
   // ✅ Good
   interface ApiResponse<T> {
     data: T;
     status: number;
     message: string;
   }
   ```

4. **Union Types**
   ```typescript
   // ✅ Good
   type UserRole = 'admin' | 'supplier' | 'customer';
   ```

#### Type Checking Commands
```bash
# Check TypeScript types
npm run type-check

# Build with type checking
npm run build

# Watch for type errors
npm run type-check:watch
```

---

## 📊 Logging & Debugging

### Production-Safe Logging

#### Logger Implementation
The project uses a production-safe logger that:
- ✅ Removes console.log statements in production
- ✅ Provides structured logging
- ✅ Supports different log levels
- ✅ Includes error tracking

#### Log Levels
```typescript
// Development
logger.debug('Debug information');
logger.info('General information');
logger.warn('Warning message');
logger.error('Error message');

// Production (debug logs are filtered)
logger.info('User logged in');
logger.error('Payment failed', { userId, orderId });
```

#### Console Logging Fixes
- ✅ Removed 50+ console.log statements
- ✅ Implemented production-safe logging
- ✅ Added automated fix scripts
- ✅ Enhanced error tracking

#### Debugging Tools
```bash
# Enable debug logging
DEBUG=* npm run dev

# Run with verbose output
npm run dev -- --verbose

# Check for console statements
npm run check:console
```

---

## 🔍 Troubleshooting

### Common Development Issues

#### 1. Build Failures
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript errors
npm run type-check

# Verify environment variables
npm run check:env
```

#### 2. Test Failures
```bash
# Clear Jest cache
npm run test:clear

# Run tests with verbose output
npm test -- --verbose

# Check test configuration
npm run test:config
```

#### 3. TypeScript Errors
```bash
# Check for type errors
npm run type-check

# Auto-fix simple issues
npm run type-check:fix

# Verify tsconfig
npm run tsconfig:check
```

#### 4. Environment Issues
```bash
# Verify environment setup
npm run check:env

# Copy fresh template
cp env.local.template .env.local

# Check Firebase configuration
npm run check:firebase
```

---

## 🔄 Development Workflow

### Git Workflow
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/feature-name
   ```

2. **Make Changes**
   - Write code
   - Add tests
   - Update documentation

3. **Quality Checks**
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run build
   ```

4. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat: add new feature"
   ```

5. **Push and Create PR**
   ```bash
   git push origin feature/feature-name
   # Create Pull Request
   ```

### Code Review Checklist
- [ ] Code follows project standards
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No console.log statements
- [ ] TypeScript types are proper
- [ ] Accessibility requirements met
- [ ] Performance considerations addressed

### Release Process
1. **Version Bump**
   ```bash
   npm version patch|minor|major
   ```

2. **Build and Test**
   ```bash
   npm run build
   npm test
   npm run lint
   ```

3. **Deploy**
   ```bash
   npm run deploy
   ```

4. **Update Changelog**
   - Document new features
   - List bug fixes
   - Note breaking changes

---

## 📚 Additional Resources

### Documentation
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Guide](./SECURITY.md)
- [Performance Guide](./PERFORMANCE.md)

### Tools & Services
- **Firebase Console:** [console.firebase.google.com](https://console.firebase.google.com)
- **Vercel Dashboard:** [vercel.com/dashboard](https://vercel.com/dashboard)
- **GitHub Repository:** [github.com/your-org/HomeBase](https://github.com/your-org/HomeBase)

### Support
- **Development Issues:** Create GitHub issue
- **Technical Questions:** Team chat or email
- **Emergency Issues:** Direct contact with team lead

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")  
**Version:** 1.0.0  
**Maintainer:** Development Team
