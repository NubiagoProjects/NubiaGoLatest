'use client'

import React, { forwardRef } from 'react'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'yellow' | 'black'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    children, 
    variant = 'primary', 
    size = 'md', 
    loading = false,
    leftIcon,
    rightIcon,
    className = '',
    disabled,
    ...props 
  }, ref) => {
    const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
    
    const sizeClasses = {
      xs: 'px-2.5 py-1.5 text-xs',
      sm: 'px-3 py-2 text-sm',
      md: 'px-4 py-2.5 text-sm',
      lg: 'px-6 py-3 text-base',
      xl: 'px-8 py-4 text-lg',
    }
    
    const variantClasses = {
      primary: 'bg-primary-600 text-white focus:ring-primary-500',
      secondary: 'bg-neutral-100 text-neutral-900 focus:ring-neutral-500',
      outline: 'border border-neutral-300 bg-white text-neutral-700 focus:ring-primary-500',
      ghost: 'text-neutral-700 bg-transparent focus:ring-neutral-500',
      danger: 'bg-error-500 text-white focus:ring-error-500',
      yellow: 'bg-yellow-500 text-neutral-900 focus:ring-yellow-500',
      black: 'bg-neutral-900 text-white focus:ring-neutral-500',
    }

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          sizeClasses[size as keyof typeof sizeClasses],
          variantClasses[variant as keyof typeof variantClasses],
          className
        )}
        disabled={disabled || loading}
        {...props}
      >
        {loading && (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && (
          <span className="mr-2">{leftIcon}</span>
        )}
        {children}
        {!loading && rightIcon && (
          <span className="ml-2">{rightIcon}</span>
        )}
      </button>
    )
  }
)

Button.displayName = 'Button' 
