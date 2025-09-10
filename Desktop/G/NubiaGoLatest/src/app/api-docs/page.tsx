'use client'

import React, { useState } from 'react'
import { Tab } from '@headlessui/react'
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/outline'

// ============================================================================
// API DOCUMENTATION COMPONENT
// ============================================================================

interface Endpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  path: string
  description: string
  auth: boolean
  params?: Array<{
    name: string
    type: string
    required: boolean
    description: string
  }>
  body?: {
    type: string
    schema: any
  }
  responses: Array<{
    code: number
    description: string
    example: any
  }>
}

const API_ENDPOINTS: Record<string, Endpoint[]> = {
  'Authentication': [
    {
      method: 'POST',
      path: '/api/auth/login',
      description: 'Authenticate user with email and password',
      auth: false,
      body: {
        type: 'application/json',
        schema: {
          email: 'string',
          password: 'string',
        },
      },
      responses: [
        {
          code: 200,
          description: 'Login successful',
          example: {
            success: true,
            user: {
              id: 'user-123',
              email: 'user@example.com',
              name: 'John Doe',
              role: 'customer',
            },
            token: 'jwt-token-here',
          },
        },
        {
          code: 401,
          description: 'Invalid credentials',
          example: {
            success: false,
            error: 'Invalid email or password',
          },
        },
      ],
    },
    {
      method: 'POST',
      path: '/api/auth/register',
      description: 'Register new user account',
      auth: false,
      body: {
        type: 'application/json',
        schema: {
          email: 'string',
          password: 'string',
          firstName: 'string',
          lastName: 'string',
          phone: 'string',
          role: 'customer | supplier',
        },
      },
      responses: [
        {
          code: 201,
          description: 'Registration successful',
          example: {
            success: true,
            user: {
              id: 'user-123',
              email: 'user@example.com',
              name: 'John Doe',
              role: 'customer',
            },
          },
        },
        {
          code: 400,
          description: 'Validation error',
          example: {
            success: false,
            error: 'Email already exists',
          },
        },
      ],
    },
  ],
  'Products': [
    {
      method: 'GET',
      path: '/api/products',
      description: 'Get all products with pagination and filters',
      auth: false,
      params: [
        {
          name: 'page',
          type: 'number',
          required: false,
          description: 'Page number (default: 1)',
        },
        {
          name: 'limit',
          type: 'number',
          required: false,
          description: 'Items per page (default: 20)',
        },
        {
          name: 'category',
          type: 'string',
          required: false,
          description: 'Filter by category',
        },
        {
          name: 'search',
          type: 'string',
          required: false,
          description: 'Search term',
        },
      ],
      responses: [
        {
          code: 200,
          description: 'Products retrieved successfully',
          example: {
            success: true,
            data: [
              {
                id: 'product-123',
                name: 'Wireless Headphones',
                description: 'High-quality wireless headphones',
                price: 99.99,
                category: 'electronics',
                images: ['https://example.com/image1.jpg'],
                rating: 4.5,
                stock: 50,
              },
            ],
            pagination: {
              page: 1,
              limit: 20,
              total: 100,
              pages: 5,
            },
          },
        },
      ],
    },
    {
      method: 'GET',
      path: '/api/products/[id]',
      description: 'Get product by ID',
      auth: false,
      params: [
        {
          name: 'id',
          type: 'string',
          required: true,
          description: 'Product ID',
        },
      ],
      responses: [
        {
          code: 200,
          description: 'Product retrieved successfully',
          example: {
            success: true,
            data: {
              id: 'product-123',
              name: 'Wireless Headphones',
              description: 'High-quality wireless headphones',
              price: 99.99,
              category: 'electronics',
              images: ['https://example.com/image1.jpg'],
              rating: 4.5,
              stock: 50,
              supplier: {
                id: 'supplier-123',
                name: 'TechCorp',
              },
              reviews: [
                {
                  id: 'review-123',
                  rating: 5,
                  comment: 'Great product!',
                  user: 'John Doe',
                  date: '2024-01-15',
                },
              ],
            },
          },
        },
        {
          code: 404,
          description: 'Product not found',
          example: {
            success: false,
            error: 'Product not found',
          },
        },
      ],
    },
  ],
  'Orders': [
    {
      method: 'POST',
      path: '/api/orders',
      description: 'Create new order',
      auth: true,
      body: {
        type: 'application/json',
        schema: {
          items: [
            {
              productId: 'string',
              quantity: 'number',
            },
          ],
          shippingAddress: {
            street: 'string',
            city: 'string',
            state: 'string',
            zipCode: 'string',
            country: 'string',
          },
          paymentMethod: 'card | mobile_money | bank_transfer',
        },
      },
      responses: [
        {
          code: 201,
          description: 'Order created successfully',
          example: {
            success: true,
            data: {
              id: 'order-123',
              status: 'pending',
              total: 199.98,
              items: [
                {
                  productId: 'product-123',
                  quantity: 2,
                  price: 99.99,
                },
              ],
              shippingAddress: {
                street: '123 Main St',
                city: 'New York',
                state: 'NY',
                zipCode: '10001',
                country: 'USA',
              },
            },
          },
        },
        {
          code: 400,
          description: 'Validation error',
          example: {
            success: false,
            error: 'Invalid order data',
          },
        },
      ],
    },
    {
      method: 'GET',
      path: '/api/orders',
      description: 'Get user orders',
      auth: true,
      params: [
        {
          name: 'status',
          type: 'string',
          required: false,
          description: 'Filter by order status',
        },
        {
          name: 'page',
          type: 'number',
          required: false,
          description: 'Page number',
        },
      ],
      responses: [
        {
          code: 200,
          description: 'Orders retrieved successfully',
          example: {
            success: true,
            data: [
              {
                id: 'order-123',
                status: 'completed',
                total: 199.98,
                createdAt: '2024-01-15T10:30:00Z',
                items: [
                  {
                    productId: 'product-123',
                    name: 'Wireless Headphones',
                    quantity: 2,
                    price: 99.99,
                  },
                ],
              },
            ],
          },
        },
      ],
    },
  ],
  'Payments': [
    {
      method: 'POST',
      path: '/api/payments/initiate',
      description: 'Initiate payment for order',
      auth: true,
      body: {
        type: 'application/json',
        schema: {
          orderId: 'string',
          paymentMethod: 'card | mobile_money | bank_transfer',
          amount: 'number',
        },
      },
      responses: [
        {
          code: 200,
          description: 'Payment initiated successfully',
          example: {
            success: true,
            data: {
              paymentId: 'payment-123',
              status: 'pending',
              redirectUrl: 'https://payment-gateway.com/pay',
            },
          },
        },
      ],
    },
  ],
  'User Management': [
    {
      method: 'GET',
      path: '/api/users/profile',
      description: 'Get user profile',
      auth: true,
      responses: [
        {
          code: 200,
          description: 'Profile retrieved successfully',
          example: {
            success: true,
            data: {
              id: 'user-123',
              email: 'user@example.com',
              name: 'John Doe',
              role: 'customer',
              profile: {
                firstName: 'John',
                lastName: 'Doe',
                phone: '+1234567890',
                avatar: 'https://example.com/avatar.jpg',
              },
            },
          },
        },
      ],
    },
    {
      method: 'PUT',
      path: '/api/users/profile',
      description: 'Update user profile',
      auth: true,
      body: {
        type: 'application/json',
        schema: {
          firstName: 'string',
          lastName: 'string',
          phone: 'string',
        },
      },
      responses: [
        {
          code: 200,
          description: 'Profile updated successfully',
          example: {
            success: true,
            data: {
              id: 'user-123',
              email: 'user@example.com',
              name: 'John Doe',
              profile: {
                firstName: 'John',
                lastName: 'Doe',
                phone: '+1234567890',
              },
            },
          },
        },
      ],
    },
  ],
}

const ApiDocsPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState(0)
  const [expandedEndpoints, setExpandedEndpoints] = useState<Set<string>>(new Set())

  const toggleEndpoint = (endpointKey: string) => {
    const newExpanded = new Set(expandedEndpoints)
    if (newExpanded.has(endpointKey)) {
      newExpanded.delete(endpointKey)
    } else {
      newExpanded.add(endpointKey)
    }
    setExpandedEndpoints(newExpanded)
  }

  const getMethodColor = (method: string) => {
    const colors = {
      GET: 'bg-green-100 text-green-800',
      POST: 'bg-blue-100 text-blue-800',
      PUT: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      PATCH: 'bg-purple-100 text-purple-800',
    }
    return colors[method as keyof typeof colors] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">NubiaGo API Documentation</h1>
          <p className="text-lg text-gray-600">
            Comprehensive API reference for the NubiaGo e-commerce platform
          </p>
        </div>

        {/* Base URL */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Base URL</h2>
          <div className="bg-gray-100 rounded-md p-4">
            <code className="text-lg font-mono">https://api.nubiago.com</code>
          </div>
        </div>

        {/* Authentication */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Authentication</h2>
          <p className="text-gray-600 mb-4">
            Most API endpoints require authentication. Include your JWT token in the Authorization header:
          </p>
          <div className="bg-gray-100 rounded-md p-4">
            <code className="text-sm font-mono">
              Authorization: Bearer YOUR_JWT_TOKEN
            </code>
          </div>
        </div>

        {/* API Endpoints */}
        <div className="bg-white rounded-lg shadow-sm">
          <Tab.Group selectedIndex={selectedTab} onChange={setSelectedTab}>
            <Tab.List className="flex space-x-1 rounded-xl bg-gray-100 p-1">
              {Object.keys(API_ENDPOINTS).map((category) => (
                <Tab
                  key={category}
                  className={({ selected }: { selected: boolean }) =>
                    `w-full rounded-lg py-2.5 text-sm font-medium leading-5 ${
                      selected
                        ? 'bg-white text-blue-700 shadow'
                        : 'text-gray-600 hover:text-gray-800'
                    }`
                  }
                >
                  {category}
                </Tab>
              ))}
            </Tab.List>
            <Tab.Panels className="mt-6">
              {Object.entries(API_ENDPOINTS).map(([category, endpoints]) => (
                <Tab.Panel key={category} className="space-y-4">
                  {endpoints.map((endpoint, index) => {
                    const endpointKey = `${category}-${index}`
                    const isExpanded = expandedEndpoints.has(endpointKey)

                    return (
                      <div key={endpointKey} className="border border-gray-200 rounded-lg">
                        <button
                          onClick={() => toggleEndpoint(endpointKey)}
                          className="w-full px-6 py-4 text-left hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-medium ${getMethodColor(
                                  endpoint.method
                                )}`}
                              >
                                {endpoint.method}
                              </span>
                              <code className="text-sm font-mono text-gray-900">
                                {endpoint.path}
                              </code>
                            </div>
                            <div className="flex items-center space-x-2">
                              {endpoint.auth && (
                                <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                                  Auth Required
                                </span>
                              )}
                              {isExpanded ? (
                                <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                              ) : (
                                <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                              )}
                            </div>
                          </div>
                          <p className="mt-2 text-sm text-gray-600">{endpoint.description}</p>
                        </button>

                        {isExpanded && (
                          <div className="px-6 pb-4 border-t border-gray-200">
                            {/* Parameters */}
                            {endpoint.params && endpoint.params.length > 0 && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Parameters</h4>
                                <div className="overflow-x-auto">
                                  <table className="min-w-full divide-y divide-gray-200">
                                    <thead className="bg-gray-50">
                                      <tr>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Name
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Type
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Required
                                        </th>
                                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                          Description
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody className="bg-white divide-y divide-gray-200">
                                      {endpoint.params.map((param) => (
                                        <tr key={param.name}>
                                          <td className="px-3 py-2 text-sm font-medium text-gray-900">
                                            {param.name}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-500">
                                            {param.type}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-500">
                                            {param.required ? 'Yes' : 'No'}
                                          </td>
                                          <td className="px-3 py-2 text-sm text-gray-500">
                                            {param.description}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            )}

                            {/* Request Body */}
                            {endpoint.body && (
                              <div className="mt-4">
                                <h4 className="text-sm font-medium text-gray-900 mb-2">Request Body</h4>
                                <div className="bg-gray-100 rounded-md p-4">
                                  <p className="text-sm text-gray-600 mb-2">
                                    Content-Type: {endpoint.body.type}
                                  </p>
                                  <pre className="text-sm text-gray-800 overflow-x-auto">
                                    <code>{JSON.stringify(endpoint.body.schema, null, 2)}</code>
                                  </pre>
                                </div>
                              </div>
                            )}

                            {/* Responses */}
                            <div className="mt-4">
                              <h4 className="text-sm font-medium text-gray-900 mb-2">Responses</h4>
                              <div className="space-y-3">
                                {endpoint.responses.map((response) => (
                                  <div key={response.code} className="border border-gray-200 rounded-md">
                                    <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                      <span
                                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                          response.code >= 200 && response.code < 300
                                            ? 'bg-green-100 text-green-800'
                                            : response.code >= 400 && response.code < 500
                                            ? 'bg-red-100 text-red-800'
                                            : 'bg-yellow-100 text-yellow-800'
                                        }`}
                                      >
                                        {response.code}
                                      </span>
                                      <span className="ml-2 text-sm text-gray-600">
                                        {response.description}
                                      </span>
                                    </div>
                                    <div className="p-4">
                                      <pre className="text-sm text-gray-800 overflow-x-auto">
                                        <code>{JSON.stringify(response.example, null, 2)}</code>
                                      </pre>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </Tab.Panel>
              ))}
            </Tab.Panels>
          </Tab.Group>
        </div>

        {/* Rate Limiting */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Rate Limiting</h2>
          <p className="text-gray-600 mb-4">
            API requests are rate limited to ensure fair usage:
          </p>
          <ul className="list-disc list-inside text-gray-600 space-y-2">
            <li>100 requests per 15 minutes for authenticated users</li>
            <li>20 requests per 15 minutes for unauthenticated users</li>
            <li>Rate limit headers are included in all responses</li>
          </ul>
        </div>

        {/* Error Codes */}
        <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Error Codes</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Code
                  </th>
                  <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Description
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">400</td>
                  <td className="px-3 py-2 text-sm text-gray-500">Bad Request - Invalid input</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">401</td>
                  <td className="px-3 py-2 text-sm text-gray-500">Unauthorized - Authentication required</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">403</td>
                  <td className="px-3 py-2 text-sm text-gray-500">Forbidden - Insufficient permissions</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">404</td>
                  <td className="px-3 py-2 text-sm text-gray-500">Not Found - Resource not found</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">429</td>
                  <td className="px-3 py-2 text-sm text-gray-500">Too Many Requests - Rate limit exceeded</td>
                </tr>
                <tr>
                  <td className="px-3 py-2 text-sm font-medium text-gray-900">500</td>
                  <td className="px-3 py-2 text-sm text-gray-500">Internal Server Error - Server error</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApiDocsPage 
