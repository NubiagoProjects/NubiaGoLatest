# Performance Monitoring Setup Guide

## Overview

This guide covers setting up comprehensive performance monitoring for the NubiaGo UX Optimization System, including real-time metrics collection, alerting, and analytics dashboard integration.

## Monitoring Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Client-Side Monitoring                   │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Performance     │  │ Error Tracking  │  │ User         │ │
│  │ Observer API    │  │ & Recovery      │  │ Analytics    │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Collection Layer                    │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Performance     │  │ Error Logger    │  │ Network      │ │
│  │ Budget Manager  │  │ Service         │  │ Monitor      │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Analytics & Alerting                     │
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │ Real-time       │  │ Performance     │  │ Alert        │ │
│  │ Dashboard       │  │ Reports         │  │ System       │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## Implementation

### 1. Performance Metrics Collection

Create a comprehensive metrics collector:

```typescript
// lib/monitoring/performance-collector.ts
export class PerformanceCollector {
  private metrics: Map<string, any> = new Map()
  private observers: PerformanceObserver[] = []

  constructor() {
    this.initializeObservers()
    this.startCollection()
  }

  private initializeObservers() {
    // Core Web Vitals
    this.observeWebVitals()
    
    // Custom Metrics
    this.observeCustomMetrics()
    
    // Resource Timing
    this.observeResourceTiming()
    
    // Navigation Timing
    this.observeNavigationTiming()
  }

  private observeWebVitals() {
    // LCP Observer
    const lcpObserver = new PerformanceObserver((list) => {
      const entries = list.getEntries()
      const lastEntry = entries[entries.length - 1]
      this.recordMetric('lcp', lastEntry.startTime, {
        element: lastEntry.element?.tagName,
        url: lastEntry.url
      })
    })
    lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] })
    this.observers.push(lcpObserver)

    // FID Observer
    const fidObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        this.recordMetric('fid', entry.processingStart - entry.startTime, {
          eventType: entry.name,
          target: entry.target?.tagName
        })
      })
    })
    fidObserver.observe({ entryTypes: ['first-input'] })
    this.observers.push(fidObserver)

    // CLS Observer
    let clsValue = 0
    const clsObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry: any) => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value
          this.recordMetric('cls', clsValue, {
            sources: entry.sources?.map((s: any) => s.node?.tagName)
          })
        }
      })
    })
    clsObserver.observe({ entryTypes: ['layout-shift'] })
    this.observers.push(clsObserver)
  }

  private observeCustomMetrics() {
    // Time to Interactive
    this.measureTTI()
    
    // First Contentful Paint
    this.measureFCP()
    
    // Total Blocking Time
    this.measureTBT()
  }

  private recordMetric(name: string, value: number, metadata?: any) {
    const metric = {
      name,
      value,
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      connection: this.getConnectionInfo(),
      metadata
    }

    this.metrics.set(`${name}-${Date.now()}`, metric)
    this.sendToAnalytics(metric)
  }

  private getConnectionInfo() {
    const connection = (navigator as any).connection
    return connection ? {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData
    } : null
  }

  private sendToAnalytics(metric: any) {
    // Send to your analytics service
    if (typeof window !== 'undefined') {
      // Google Analytics 4
      if (window.gtag) {
        window.gtag('event', 'performance_metric', {
          metric_name: metric.name,
          metric_value: metric.value,
          custom_parameters: metric.metadata
        })
      }

      // Custom analytics endpoint
      fetch('/api/analytics/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(metric)
      }).catch(console.error)
    }
  }
}
```

### 2. Error Monitoring Integration

Enhanced error tracking with context:

```typescript
// lib/monitoring/error-monitor.ts
export class ErrorMonitor {
  private errorQueue: any[] = []
  private maxQueueSize = 100

  constructor() {
    this.setupGlobalErrorHandlers()
    this.setupUnhandledRejectionHandler()
    this.setupReactErrorBoundaryIntegration()
  }

  private setupGlobalErrorHandlers() {
    window.addEventListener('error', (event) => {
      this.captureError({
        type: 'javascript_error',
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        context: this.gatherContext()
      })
    })

    window.addEventListener('unhandledrejection', (event) => {
      this.captureError({
        type: 'unhandled_promise_rejection',
        message: event.reason?.message || 'Unhandled Promise Rejection',
        stack: event.reason?.stack,
        timestamp: Date.now(),
        url: window.location.href,
        context: this.gatherContext()
      })
    })
  }

  private gatherContext() {
    return {
      performance: this.getPerformanceSnapshot(),
      network: this.getNetworkInfo(),
      memory: this.getMemoryInfo(),
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      },
      timestamp: Date.now()
    }
  }

  captureError(error: any) {
    this.errorQueue.push(error)
    
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift()
    }

    this.sendErrorToService(error)
  }

  private sendErrorToService(error: any) {
    // Send to error tracking service (Sentry, LogRocket, etc.)
    if (window.Sentry) {
      window.Sentry.captureException(error)
    }

    // Send to custom error endpoint
    fetch('/api/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(error)
    }).catch(console.error)
  }
}
```

### 3. Real-Time Dashboard Component

```typescript
// components/monitoring/PerformanceDashboard.tsx
'use client'

import React, { useState, useEffect } from 'react'
import { performanceBudgetManager } from '@/lib/utils/performance-budget'
import { usePerformance } from '@/components/providers/performance-provider'

export function PerformanceDashboard() {
  const [metrics, setMetrics] = useState<any>({})
  const [violations, setViolations] = useState<any[]>([])
  const { performanceScore, networkInfo } = usePerformance()

  useEffect(() => {
    const interval = setInterval(() => {
      // Collect current metrics
      const currentMetrics = {
        lcp: performance.getEntriesByType('largest-contentful-paint')[0]?.startTime || 0,
        fid: 0, // Will be updated by observer
        cls: 0, // Will be updated by observer
        memory: (performance as any).memory?.usedJSHeapSize / 1024 / 1024 || 0,
        score: performanceScore
      }

      setMetrics(currentMetrics)
      setViolations(performanceBudgetManager.getViolations(Date.now() - 60000))
    }, 1000)

    return () => clearInterval(interval)
  }, [performanceScore])

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-300 rounded-lg shadow-lg p-4 max-w-sm z-50">
      <div className="text-sm font-semibold mb-3">Performance Monitor</div>
      
      {/* Performance Score */}
      <div className="mb-3">
        <div className="flex justify-between items-center">
          <span>Score:</span>
          <span className={`font-bold ${
            performanceScore >= 90 ? 'text-green-600' :
            performanceScore >= 70 ? 'text-yellow-600' : 'text-red-600'
          }`}>
            {performanceScore}/100
          </span>
        </div>
      </div>

      {/* Core Web Vitals */}
      <div className="space-y-2 mb-3">
        <MetricRow 
          label="LCP" 
          value={`${(metrics.lcp / 1000).toFixed(2)}s`}
          status={metrics.lcp < 2500 ? 'good' : metrics.lcp < 4000 ? 'needs-improvement' : 'poor'}
        />
        <MetricRow 
          label="Memory" 
          value={`${metrics.memory.toFixed(1)}MB`}
          status={metrics.memory < 50 ? 'good' : metrics.memory < 100 ? 'needs-improvement' : 'poor'}
        />
      </div>

      {/* Network Info */}
      {networkInfo && (
        <div className="mb-3 text-xs text-gray-600">
          <div>Network: {networkInfo.effectiveType}</div>
          <div>Speed: {networkInfo.downlink}Mbps</div>
          <div>RTT: {networkInfo.rtt}ms</div>
        </div>
      )}

      {/* Violations */}
      {violations.length > 0 && (
        <div className="border-t pt-2">
          <div className="text-xs font-semibold text-red-600 mb-1">
            Recent Issues ({violations.length})
          </div>
          <div className="max-h-20 overflow-y-auto text-xs">
            {violations.slice(0, 3).map((violation, index) => (
              <div key={index} className="text-red-600">
                {violation.metric}: {violation.actual} > {violation.budget}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function MetricRow({ label, value, status }: {
  label: string
  value: string
  status: 'good' | 'needs-improvement' | 'poor'
}) {
  const statusColors = {
    good: 'text-green-600',
    'needs-improvement': 'text-yellow-600',
    poor: 'text-red-600'
  }

  return (
    <div className="flex justify-between items-center text-xs">
      <span>{label}:</span>
      <span className={statusColors[status]}>{value}</span>
    </div>
  )
}
```

### 4. Analytics API Endpoints

```typescript
// app/api/analytics/performance/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const metric = await request.json()
    
    // Validate metric data
    if (!metric.name || typeof metric.value !== 'number') {
      return NextResponse.json({ error: 'Invalid metric data' }, { status: 400 })
    }

    // Store in database or send to analytics service
    await storeMetric(metric)
    
    // Check for performance budget violations
    await checkPerformanceBudget(metric)
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Analytics error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

async function storeMetric(metric: any) {
  // Store in your database
  // Example: await db.metrics.create({ data: metric })
  
  // Or send to external analytics service
  // Example: await sendToDatadog(metric)
}

async function checkPerformanceBudget(metric: any) {
  const budgets = {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    memory: 50
  }

  if (budgets[metric.name] && metric.value > budgets[metric.name]) {
    // Send alert
    await sendPerformanceAlert({
      metric: metric.name,
      value: metric.value,
      budget: budgets[metric.name],
      timestamp: metric.timestamp,
      url: metric.url
    })
  }
}

async function sendPerformanceAlert(alert: any) {
  // Send to alerting service (Slack, email, etc.)
  console.warn('Performance budget violation:', alert)
}
```

### 5. Monitoring Integration

Add monitoring to your app:

```typescript
// app/layout.tsx
import { PerformanceCollector } from '@/lib/monitoring/performance-collector'
import { ErrorMonitor } from '@/lib/monitoring/error-monitor'
import { PerformanceDashboard } from '@/components/monitoring/PerformanceDashboard'

export default function RootLayout({ children }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize monitoring
      new PerformanceCollector()
      new ErrorMonitor()
    }
  }, [])

  return (
    <html>
      <body>
        {children}
        {process.env.NODE_ENV === 'development' && <PerformanceDashboard />}
      </body>
    </html>
  )
}
```

## Configuration

### Environment Variables

```bash
# .env.local
NEXT_PUBLIC_ANALYTICS_ENDPOINT=https://your-analytics-service.com
NEXT_PUBLIC_ERROR_REPORTING_URL=https://your-error-service.com
NEXT_PUBLIC_PERFORMANCE_MONITORING=true
SENTRY_DSN=your-sentry-dsn
GOOGLE_ANALYTICS_ID=your-ga-id
```

### Performance Budgets

```typescript
// config/performance-budgets.ts
export const PERFORMANCE_BUDGETS = {
  development: {
    lcp: 3000,
    fid: 150,
    cls: 0.15,
    memory: 100
  },
  production: {
    lcp: 2500,
    fid: 100,
    cls: 0.1,
    memory: 50
  }
}
```

## Alerting Setup

### Slack Integration

```typescript
// lib/monitoring/slack-alerts.ts
export async function sendSlackAlert(alert: any) {
  const webhook = process.env.SLACK_WEBHOOK_URL
  if (!webhook) return

  const message = {
    text: `🚨 Performance Alert`,
    blocks: [
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Performance Budget Violation*\n*Metric:* ${alert.metric}\n*Value:* ${alert.value}\n*Budget:* ${alert.budget}\n*URL:* ${alert.url}`
        }
      }
    ]
  }

  await fetch(webhook, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(message)
  })
}
```

### Email Alerts

```typescript
// lib/monitoring/email-alerts.ts
export async function sendEmailAlert(alert: any) {
  // Using your email service (SendGrid, Nodemailer, etc.)
  const emailData = {
    to: process.env.ALERT_EMAIL,
    subject: `Performance Alert: ${alert.metric}`,
    html: `
      <h2>Performance Budget Violation</h2>
      <p><strong>Metric:</strong> ${alert.metric}</p>
      <p><strong>Value:</strong> ${alert.value}</p>
      <p><strong>Budget:</strong> ${alert.budget}</p>
      <p><strong>URL:</strong> ${alert.url}</p>
      <p><strong>Time:</strong> ${new Date(alert.timestamp).toISOString()}</p>
    `
  }

  // Send email using your preferred service
}
```

## Dashboard Integration

### Custom Analytics Dashboard

```typescript
// components/analytics/AnalyticsDashboard.tsx
export function AnalyticsDashboard() {
  const [data, setData] = useState(null)

  useEffect(() => {
    fetchAnalyticsData().then(setData)
  }, [])

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <MetricCard title="Average LCP" value={data?.avgLCP} />
      <MetricCard title="Error Rate" value={data?.errorRate} />
      <MetricCard title="Performance Score" value={data?.avgScore} />
      
      <div className="col-span-full">
        <PerformanceChart data={data?.timeSeries} />
      </div>
    </div>
  )
}
```

## Best Practices

1. **Sampling**: Don't monitor 100% of users in production
2. **Privacy**: Respect user privacy and GDPR compliance
3. **Performance**: Monitoring shouldn't impact app performance
4. **Alerting**: Set up meaningful alerts, avoid alert fatigue
5. **Retention**: Define data retention policies
6. **Security**: Secure your monitoring endpoints

## Troubleshooting

### Common Issues

1. **High Memory Usage**: Monitor for memory leaks in observers
2. **Network Overhead**: Batch analytics requests
3. **Privacy Concerns**: Anonymize sensitive data
4. **False Positives**: Tune alert thresholds

This monitoring setup provides comprehensive visibility into your application's performance and user experience, enabling proactive optimization and issue resolution.
