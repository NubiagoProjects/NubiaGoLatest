// API Types for the application

export interface ApiConfiguration {
  id: string;
  name: string;
  description: string;
  type: 'payment' | 'logistics' | 'communication' | 'analytics' | 'storage' | 'other';
  provider?: string;
  baseUrl: string;
  webhookUrl?: string;
  apiKey?: string;
  apiSecret?: string;
  headers?: Record<string, string>;
  rateLimit?: {
    requests: number;
    window: string;
  };
  authentication?: {
    type: 'bearer' | 'api-key' | 'oauth2' | 'none';
    token?: string;
    clientId?: string;
    clientSecret?: string;
  };
  endpoints?: ApiEndpoint[];
  status: 'active' | 'inactive' | 'testing';
  isActive?: boolean;
  isTestMode?: boolean;
  config?: Record<string, any>;
  errorMessage?: string;
  lastTested?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiEndpoint {
  id: string
  name: string
  path: string
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'
  description?: string
  parameters?: ApiParameter[]
  responseSchema?: any
  rateLimit?: {
    requests: number
    window: string
  }
}

export interface ApiParameter {
  name: string
  type: 'string' | 'number' | 'boolean' | 'object' | 'array'
  required: boolean
  description?: string
  defaultValue?: any
}

export interface ApiProvider {
  id: string
  name: string
  description: string
  type: string
  baseUrl?: string
  website?: string
  documentation?: string
  documentationUrl?: string
  features?: string[]
  pricing?: string
  isPopular?: boolean
  status?: 'active' | 'inactive' | 'maintenance'
  apis?: ApiConfiguration[]
}

export interface ApiTestResult {
  id: string
  apiId: string
  endpoint: string
  method: string
  status: 'success' | 'failed' | 'timeout'
  success: boolean
  responseTime: number
  statusCode?: number
  responseBody?: any
  error?: string
  timestamp: Date
  requestHeaders?: Record<string, string>
  requestBody?: any
}

export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
  statusCode: number
  timestamp: Date
}

export interface ApiRequest {
  url: string
  method: string
  headers?: Record<string, string>
  body?: any
  timeout?: number
}

export interface ApiMetrics {
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  averageResponseTime: number
  lastRequestTime: Date
  rateLimitRemaining?: number
  rateLimitReset?: Date
}
