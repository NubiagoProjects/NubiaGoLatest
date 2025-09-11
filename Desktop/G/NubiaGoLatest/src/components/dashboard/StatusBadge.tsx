'use client'

import { ReactNode } from 'react'
import { CheckCircle, Clock, XCircle, AlertCircle, Truck, Package, CreditCard } from 'lucide-react'

interface StatusBadgeProps {
  status: string
  variant?: 'default' | 'dot' | 'pill'
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export default function StatusBadge({ 
  status, 
  variant = 'default', 
  size = 'md', 
  showIcon = true,
  className = '' 
}: StatusBadgeProps) {
  
  const getStatusConfig = (status: string) => {
    const configs: Record<string, { 
      color: string, 
      bgColor: string, 
      icon: any, 
      label: string 
    }> = {
      // Order statuses
      'pending': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: Clock, label: 'Pending' },
      'confirmed': { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: CheckCircle, label: 'Confirmed' },
      'processing': { color: 'text-orange-700', bgColor: 'bg-orange-100', icon: Package, label: 'Processing' },
      'shipped': { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: Truck, label: 'Shipped' },
      'delivered': { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Delivered' },
      'cancelled': { color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle, label: 'Cancelled' },
      
      // Payment statuses
      'paid': { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Paid' },
      'unpaid': { color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle, label: 'Unpaid' },
      'refunded': { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: CreditCard, label: 'Refunded' },
      
      // User statuses
      'active': { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Active' },
      'inactive': { color: 'text-gray-700', bgColor: 'bg-gray-100', icon: Clock, label: 'Inactive' },
      'suspended': { color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle, label: 'Suspended' },
      'verified': { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Verified' },
      'unverified': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: AlertCircle, label: 'Unverified' },
      
      // Product statuses
      'in_stock': { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle, label: 'In Stock' },
      'out_of_stock': { color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle, label: 'Out of Stock' },
      'low_stock': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: AlertCircle, label: 'Low Stock' },
      
      // Generic statuses
      'success': { color: 'text-green-700', bgColor: 'bg-green-100', icon: CheckCircle, label: 'Success' },
      'error': { color: 'text-red-700', bgColor: 'bg-red-100', icon: XCircle, label: 'Error' },
      'warning': { color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: AlertCircle, label: 'Warning' },
      'info': { color: 'text-blue-700', bgColor: 'bg-blue-100', icon: AlertCircle, label: 'Info' },
    }
    
    return configs[status.toLowerCase()] || configs['info']
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm'
  }

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3 w-3',
    lg: 'h-4 w-4'
  }

  if (variant === 'dot') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <div className={`h-2 w-2 rounded-full ${config.bgColor.replace('bg-', 'bg-')} mr-2`} />
        <span className={`text-sm ${config.color}`}>{config.label}</span>
      </div>
    )
  }

  if (variant === 'pill') {
    return (
      <span className={`inline-flex items-center ${sizeClasses[size]} rounded-full font-medium ${config.color} ${config.bgColor} ${className}`}>
        {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
        {config.label}
      </span>
    )
  }

  return (
    <span className={`inline-flex items-center ${sizeClasses[size]} rounded-md font-medium ${config.color} ${config.bgColor} ${className}`}>
      {showIcon && <Icon className={`${iconSizes[size]} mr-1`} />}
      {config.label}
    </span>
  )
}
