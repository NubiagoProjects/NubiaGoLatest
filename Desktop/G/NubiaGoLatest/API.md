# 🔌 HomeBase API Documentation

Comprehensive API documentation and integration guide for the HomeBase e-commerce platform.

## 📋 Table of Contents

1. [API Overview](#api-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Endpoints](#api-endpoints)
4. [Request/Response Formats](#requestresponse-formats)
5. [Error Handling](#error-handling)
6. [Rate Limiting](#rate-limiting)
7. [API Security](#api-security)
8. [Integration Examples](#integration-examples)
9. [Testing & Debugging](#testing--debugging)

---

## 🌐 API Overview

### API Base URL
```
Production: https://your-domain.com/api
Development: http://localhost:3000/api
```

### API Versioning
- **Current Version:** v1
- **Version Header:** `X-API-Version: 1`
- **Deprecation Policy:** 6 months notice for breaking changes

### Supported HTTP Methods
- **GET:** Retrieve data
- **POST:** Create new resources
- **PUT:** Update entire resources
- **PATCH:** Partial resource updates
- **DELETE:** Remove resources

### Response Format
All API responses follow a standardized format:
```typescript
interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    timestamp: string;
    requestId: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}
```

---

## 🔐 Authentication & Authorization

### Authentication Methods

#### 1. JWT Token Authentication
```typescript
// Request header format
Authorization: Bearer <jwt_token>

// Example
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

#### 2. API Key Authentication (for external integrations)
```typescript
// Request header format
X-API-Key: <api_key>

// Example
X-API-Key: hb_live_1234567890abcdef
```

### Token Management

#### Obtaining JWT Token
```typescript
// Login endpoint
POST /api/auth/login

// Request body
{
  "email": "user@example.com",
  "password": "securepassword"
}

// Response
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "refresh_token_here",
    "expiresIn": 3600,
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "role": "customer"
    }
  }
}
```

#### Token Refresh
```typescript
// Refresh token endpoint
POST /api/auth/refresh

// Request body
{
  "refreshToken": "refresh_token_here"
}

// Response
{
  "success": true,
  "data": {
    "token": "new_jwt_token_here",
    "expiresIn": 3600
  }
}
```

### Authorization Levels

#### Role-Based Access Control
```typescript
type UserRole = 'admin' | 'supplier' | 'customer';

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

---

## 🛣️ API Endpoints

### Authentication Endpoints

#### User Authentication
```typescript
// User login
POST /api/auth/login
POST /api/auth/register
POST /api/auth/logout
POST /api/auth/refresh
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/verify-email

// OAuth authentication
GET /api/auth/google
GET /api/auth/google/callback
GET /api/auth/facebook
GET /api/auth/facebook/callback
```

#### Supplier Authentication
```typescript
// Supplier registration and verification
POST /api/auth/supplier/register
POST /api/auth/supplier/verify
POST /api/auth/supplier/approval
GET /api/auth/supplier/status
```

### Product Management Endpoints

#### Product CRUD Operations
```typescript
// Product management
GET /api/products                    // List products
GET /api/products/:id               // Get product details
POST /api/products                  // Create product (supplier only)
PUT /api/products/:id               // Update product (supplier only)
DELETE /api/products/:id            // Delete product (supplier only)
PATCH /api/products/:id             // Partial update (supplier only)

// Product search and filtering
GET /api/products/search            // Search products
GET /api/products/category/:id      // Products by category
GET /api/products/supplier/:id      // Products by supplier
GET /api/products/featured          // Featured products
```

#### Product Categories
```typescript
// Category management
GET /api/categories                 // List categories
GET /api/categories/:id            // Get category details
GET /api/categories/:id/products   // Products in category
POST /api/categories               // Create category (admin only)
PUT /api/categories/:id            // Update category (admin only)
DELETE /api/categories/:id         // Delete category (admin only)
```

### Order Management Endpoints

#### Order Operations
```typescript
// Order management
GET /api/orders                     // List user orders
GET /api/orders/:id                // Get order details
POST /api/orders                   // Create order
PUT /api/orders/:id                // Update order
PATCH /api/orders/:id              // Partial order update
DELETE /api/orders/:id             // Cancel order

// Order status management
POST /api/orders/:id/status        // Update order status
GET /api/orders/:id/tracking       // Get order tracking
POST /api/orders/:id/tracking      // Update tracking info
```

#### Shopping Cart
```typescript
// Cart management
GET /api/cart                      // Get user cart
POST /api/cart/items              // Add item to cart
PUT /api/cart/items/:id           // Update cart item
DELETE /api/cart/items/:id        // Remove item from cart
POST /api/cart/clear              // Clear cart
POST /api/cart/checkout           // Checkout cart
```

### User Management Endpoints

#### User Profile
```typescript
// User profile management
GET /api/users/profile             // Get user profile
PUT /api/users/profile             // Update user profile
PATCH /api/users/profile           // Partial profile update
POST /api/users/profile/avatar     // Upload profile avatar
DELETE /api/users/profile/avatar   // Remove profile avatar

// User preferences
GET /api/users/preferences         // Get user preferences
PUT /api/users/preferences         // Update user preferences
POST /api/users/preferences/reset  // Reset to defaults
```

#### Admin User Management
```typescript
// Admin user management
GET /api/admin/users               // List all users (admin only)
GET /api/admin/users/:id           // Get user details (admin only)
PUT /api/admin/users/:id           // Update user (admin only)
DELETE /api/admin/users/:id        // Delete user (admin only)
POST /api/admin/users/:id/role     // Change user role (admin only)
POST /api/admin/users/:id/status   // Change user status (admin only)
```

### Payment Endpoints

#### Payment Processing
```typescript
// Payment operations
POST /api/payments/process         // Process payment
GET /api/payments/:id              // Get payment details
POST /api/payments/:id/refund      // Process refund
GET /api/payments/methods          // Get payment methods
POST /api/payments/methods         // Add payment method
DELETE /api/payments/methods/:id   // Remove payment method
```

#### Mobile Money Integration
```typescript
// Mobile money payments
POST /api/mobile-money/initiate    // Initiate mobile money payment
GET /api/mobile-money/status/:id   // Check payment status
POST /api/mobile-money/webhook     // Payment webhook
GET /api/mobile-money/operators    // Get available operators
```

### Shipping Endpoints

#### Shipping Management
```typescript
// Shipping operations
GET /api/shipping/rates            // Get shipping rates
POST /api/shipping/calculate       // Calculate shipping cost
GET /api/shipping/tracking/:id     // Track shipment
POST /api/shipping/labels          // Generate shipping label
GET /api/shipping/carriers         // Get available carriers
```

### Analytics Endpoints

#### Business Analytics
```typescript
// Analytics data
GET /api/analytics/sales           // Sales analytics
GET /api/analytics/products        // Product performance
GET /api/analytics/users           // User analytics
GET /api/analytics/orders          // Order analytics
GET /api/analytics/revenue         // Revenue analytics
```

---

## 📤 Request/Response Formats

### Request Headers
```typescript
// Standard request headers
{
  "Content-Type": "application/json",
  "Authorization": "Bearer <jwt_token>",
  "X-API-Version": "1",
  "X-Request-ID": "unique_request_id",
  "Accept": "application/json"
}
```

### Request Body Examples

#### Create Product
```typescript
POST /api/products
{
  "name": "Product Name",
  "description": "Product description",
  "price": 29.99,
  "categoryId": "category_id",
  "images": [
    "https://example.com/image1.jpg",
    "https://example.com/image2.jpg"
  ],
  "attributes": {
    "color": "Red",
    "size": "Medium",
    "weight": "500g"
  },
  "inventory": {
    "quantity": 100,
    "lowStockThreshold": 10
  }
}
```

#### Update Order Status
```typescript
PATCH /api/orders/:id
{
  "status": "shipped",
  "trackingNumber": "TRK123456789",
  "shippedAt": "2024-01-15T10:30:00Z",
  "notes": "Package shipped via express delivery"
}
```

### Response Examples

#### Successful Response
```typescript
{
  "success": true,
  "data": {
    "id": "product_id",
    "name": "Product Name",
    "price": 29.99,
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

#### Paginated Response
```typescript
{
  "success": true,
  "data": [
    // Array of items
  ],
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789",
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

#### Error Response
```typescript
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "price": "Price must be a positive number",
      "name": "Name is required"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "requestId": "req_123456789"
  }
}
```

---

## ❌ Error Handling

### Error Codes

#### HTTP Status Codes
- **200:** Success
- **201:** Created
- **400:** Bad Request
- **401:** Unauthorized
- **403:** Forbidden
- **404:** Not Found
- **422:** Validation Error
- **429:** Too Many Requests
- **500:** Internal Server Error

#### Application Error Codes
```typescript
enum ErrorCode {
  // Authentication errors
  INVALID_CREDENTIALS = 'INVALID_CREDENTIALS',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  INSUFFICIENT_PERMISSIONS = 'INSUFFICIENT_PERMISSIONS',
  
  // Validation errors
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  REQUIRED_FIELD = 'REQUIRED_FIELD',
  INVALID_FORMAT = 'INVALID_FORMAT',
  
  // Resource errors
  RESOURCE_NOT_FOUND = 'RESOURCE_NOT_FOUND',
  RESOURCE_ALREADY_EXISTS = 'RESOURCE_ALREADY_EXISTS',
  RESOURCE_IN_USE = 'RESOURCE_IN_USE',
  
  // Business logic errors
  INSUFFICIENT_INVENTORY = 'INSUFFICIENT_INVENTORY',
  PAYMENT_FAILED = 'PAYMENT_FAILED',
  ORDER_CANNOT_BE_CANCELLED = 'ORDER_CANNOT_BE_CANCELLED',
  
  // System errors
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'DATABASE_ERROR'
}
```

### Error Response Format
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: ErrorCode;
    message: string;
    details?: Record<string, any>;
    timestamp: string;
    requestId: string;
  };
}
```

### Error Handling Best Practices

#### Client-Side Error Handling
```typescript
// Error handling utility
const handleApiError = (error: any) => {
  if (error.response) {
    const { status, data } = error.response;
    
    switch (status) {
      case 401:
        // Handle unauthorized - redirect to login
        redirectToLogin();
        break;
      case 403:
        // Handle forbidden - show access denied
        showAccessDenied();
        break;
      case 422:
        // Handle validation errors
        showValidationErrors(data.error.details);
        break;
      case 429:
        // Handle rate limiting
        showRateLimitMessage();
        break;
      default:
        // Handle other errors
        showGenericError(data.error.message);
    }
  } else if (error.request) {
    // Handle network errors
    showNetworkError();
  } else {
    // Handle other errors
    showGenericError('An unexpected error occurred');
  }
};
```

---

## 🚦 Rate Limiting

### Rate Limit Configuration

#### Default Limits
```typescript
// Rate limiting configuration
const rateLimits = {
  // General API endpoints
  general: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // 100 requests per window
    message: 'Too many requests from this IP'
  },
  
  // Authentication endpoints
  auth: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 requests per window
    message: 'Too many authentication attempts'
  },
  
  // Product creation (supplier endpoints)
  productCreation: {
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 50, // 50 products per hour
    message: 'Product creation rate limit exceeded'
  },
  
  // Order creation
  orderCreation: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // 10 orders per 15 minutes
    message: 'Order creation rate limit exceeded'
  }
};
```

#### Rate Limit Headers
```typescript
// Rate limit response headers
{
  "X-RateLimit-Limit": "100",
  "X-RateLimit-Remaining": "95",
  "X-RateLimit-Reset": "1642233600",
  "Retry-After": "900"
}
```

### Rate Limit Handling

#### Client-Side Rate Limit Handling
```typescript
// Rate limit handling utility
const handleRateLimit = (response: Response) => {
  const remaining = response.headers.get('X-RateLimit-Remaining');
  const reset = response.headers.get('X-RateLimit-Reset');
  
  if (remaining === '0') {
    const resetTime = new Date(parseInt(reset) * 1000);
    const waitTime = Math.ceil((resetTime.getTime() - Date.now()) / 1000);
    
    showRateLimitMessage(waitTime);
    
    // Implement exponential backoff
    setTimeout(() => {
      retryRequest();
    }, waitTime * 1000);
  }
};
```

---

## 🛡️ API Security

### Security Headers
```typescript
// Security headers configuration
const securityHeaders = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
  'Content-Security-Policy': "default-src 'self'",
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};
```

### Input Validation

#### Zod Schema Validation
```typescript
import { z } from 'zod';

// Product validation schema
const productSchema = z.object({
  name: z.string().min(1).max(200),
  description: z.string().min(10).max(2000),
  price: z.number().positive().max(999999.99),
  categoryId: z.string().uuid(),
  images: z.array(z.string().url()).min(1).max(10),
  attributes: z.record(z.string(), z.string()).optional(),
  inventory: z.object({
    quantity: z.number().int().min(0),
    lowStockThreshold: z.number().int().min(0)
  }).optional()
});

// Validation middleware
export function validateProductInput(req: NextApiRequest, res: NextApiResponse, next: NextFunction) {
  try {
    const validatedData = productSchema.parse(req.body);
    req.body = validatedData;
    next();
  } catch (error) {
    return res.status(422).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid product data',
        details: error.errors
      }
    });
  }
}
```

### CSRF Protection

#### CSRF Token Implementation
```typescript
// CSRF token generation
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

// CSRF validation middleware
export function csrfProtection(req: NextApiRequest, res: NextApiResponse, next: NextFunction) {
  if (req.method === 'GET') {
    return next();
  }

  const csrfToken = req.headers['x-csrf-token'] as string;
  const sessionToken = req.session.csrfToken;

  if (!csrfToken || !validateCSRFToken(csrfToken, sessionToken)) {
    return res.status(403).json({
      success: false,
      error: {
        code: 'CSRF_TOKEN_INVALID',
        message: 'CSRF token validation failed'
      }
    });
  }

  next();
}
```

---

## 🔗 Integration Examples

### JavaScript/TypeScript Integration

#### Basic API Client
```typescript
// API client class
class HomeBaseAPI {
  private baseURL: string;
  private token: string | null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = null;
  }

  setToken(token: string) {
    this.token = token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseURL}${endpoint}`;
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-API-Version': '1',
      ...options.headers
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(url, {
      ...options,
      headers
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.json();
  }

  // Product methods
  async getProducts(params?: ProductQueryParams): Promise<Product[]> {
    const queryString = new URLSearchParams(params).toString();
    const response = await this.request<Product[]>(`/products?${queryString}`);
    return response.data || [];
  }

  async createProduct(product: CreateProductRequest): Promise<Product> {
    const response = await this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product)
    });
    return response.data!;
  }

  // Order methods
  async createOrder(order: CreateOrderRequest): Promise<Order> {
    const response = await this.request<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order)
    });
    return response.data!;
  }
}

// Usage example
const api = new HomeBaseAPI('https://your-domain.com/api');
api.setToken('your_jwt_token');

// Get products
const products = await api.getProducts({ category: 'electronics', limit: 20 });

// Create product
const newProduct = await api.createProduct({
  name: 'New Product',
  description: 'Product description',
  price: 29.99,
  categoryId: 'category_id'
});
```

#### React Hook Integration
```typescript
// Custom hook for API calls
const useApi = <T>(endpoint: string, options?: RequestInit) => {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const response = await api.request<T>(endpoint, options);
        setData(response.data || null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [endpoint]);

  return { data, loading, error };
};

// Usage in component
const ProductList = () => {
  const { data: products, loading, error } = useApi<Product[]>('/products');

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!products) return <div>No products found</div>;

  return (
    <div>
      {products.map(product => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

### Python Integration

#### Python API Client
```python
import requests
import json
from typing import Dict, Any, Optional

class HomeBaseAPI:
    def __init__(self, base_url: str):
        self.base_url = base_url
        self.token = None
        self.session = requests.Session()
    
    def set_token(self, token: str):
        self.token = token
        self.session.headers.update({'Authorization': f'Bearer {token}'})
    
    def _request(self, method: str, endpoint: str, **kwargs) -> Dict[str, Any]:
        url = f"{self.base_url}{endpoint}"
        headers = {
            'Content-Type': 'application/json',
            'X-API-Version': '1'
        }
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'
        
        response = self.session.request(
            method=method,
            url=url,
            headers=headers,
            **kwargs
        )
        
        response.raise_for_status()
        return response.json()
    
    def get_products(self, **params) -> list:
        response = self._request('GET', '/products', params=params)
        return response.get('data', [])
    
    def create_product(self, product_data: Dict[str, Any]) -> Dict[str, Any]:
        response = self._request('POST', '/products', json=product_data)
        return response.get('data', {})

# Usage example
api = HomeBaseAPI('https://your-domain.com/api')
api.set_token('your_jwt_token')

# Get products
products = api.get_products(category='electronics', limit=20)

# Create product
new_product = api.create_product({
    'name': 'New Product',
    'description': 'Product description',
    'price': 29.99,
    'categoryId': 'category_id'
})
```

---

## 🧪 Testing & Debugging

### API Testing

#### Postman Collection
```json
{
  "info": {
    "name": "HomeBase API",
    "description": "Complete API collection for HomeBase e-commerce platform"
  },
  "item": [
    {
      "name": "Authentication",
      "item": [
        {
          "name": "Login",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"user@example.com\",\n  \"password\": \"password123\"\n}"
            },
            "url": {
              "raw": "{{base_url}}/api/auth/login",
              "host": ["{{base_url}}"],
              "path": ["api", "auth", "login"]
            }
          }
        }
      ]
    }
  ]
}
```

#### Automated Testing
```typescript
// API test suite
describe('HomeBase API', () => {
  let api: HomeBaseAPI;
  let authToken: string;

  beforeAll(async () => {
    api = new HomeBaseAPI('http://localhost:3000/api');
    
    // Login to get token
    const response = await api.login({
      email: 'test@example.com',
      password: 'testpassword'
    });
    
    authToken = response.data.token;
    api.setToken(authToken);
  });

  describe('Products API', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'Test description',
        price: 19.99,
        categoryId: 'test-category-id'
      };

      const product = await api.createProduct(productData);
      
      expect(product).toBeDefined();
      expect(product.name).toBe(productData.name);
      expect(product.price).toBe(productData.price);
    });

    it('should retrieve products with pagination', async () => {
      const products = await api.getProducts({ page: 1, limit: 10 });
      
      expect(Array.isArray(products)).toBe(true);
      expect(products.length).toBeLessThanOrEqual(10);
    });
  });
});
```

### Debugging Tools

#### API Debugging Middleware
```typescript
// Debug middleware for development
export function debugMiddleware(req: NextApiRequest, res: NextApiResponse, next: NextFunction) {
  if (process.env.NODE_ENV === 'development') {
    console.log('=== API Request ===');
    console.log('Method:', req.method);
    console.log('URL:', req.url);
    console.log('Headers:', req.headers);
    console.log('Body:', req.body);
    console.log('Query:', req.query);
    console.log('==================');
  }
  
  next();
}

// Response logging
export function responseLogging(req: NextApiRequest, res: NextApiResponse, next: NextFunction) {
  const originalSend = res.send;
  
  res.send = function(data) {
    if (process.env.NODE_ENV === 'development') {
      console.log('=== API Response ===');
      console.log('Status:', res.statusCode);
      console.log('Data:', data);
      console.log('===================');
    }
    
    originalSend.call(this, data);
  };
  
  next();
}
```

---

## 📚 Additional Resources

### Documentation
- [Development Guide](./DEVELOPMENT.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Security Guide](./SECURITY.md)
- [Performance Guide](./PERFORMANCE.md)

### API Tools
- **Postman:** [postman.com](https://postman.com)
- **Insomnia:** [insomnia.rest](https://insomnia.rest)
- **Swagger UI:** [swagger.io/tools/swagger-ui](https://swagger.io/tools/swagger-ui)
- **API Blueprint:** [apiblueprint.org](https://apiblueprint.org)

### Testing Tools
- **Jest:** [jestjs.io](https://jestjs.io)
- **Supertest:** [github.com/visionmedia/supertest](https://github.com/visionmedia/supertest)
- **Postman Newman:** [github.com/postmanlabs/newman](https://github.com/postmanlabs/newman)

---

**Last Updated:** $(Get-Date -Format "yyyy-MM-dd")  
**Version:** 1.0.0  
**Maintainer:** API Team
