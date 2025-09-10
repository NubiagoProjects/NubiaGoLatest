'use client'

import { ReactNode } from 'react'
import { cn } from '@/lib/utils'

// Mobile-optimized button component with proper touch targets
interface MobileButtonProps {
  children: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
}

export function MobileButton({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  className,
  disabled = false,
  type = 'button'
}: MobileButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizeClasses = {
    sm: 'min-h-[44px] px-3 py-2 text-sm min-w-[44px]',
    md: 'min-h-[48px] px-4 py-3 text-base min-w-[48px]',
    lg: 'min-h-[52px] px-6 py-4 text-lg min-w-[52px]'
  }
  
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </button>
  )
}

// Mobile-optimized input component with proper spacing
interface MobileInputProps {
  type?: string
  placeholder?: string
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void
  className?: string
  disabled?: boolean
  required?: boolean
  label?: string
  error?: string
}

export function MobileInput({
  type = 'text',
  placeholder,
  value,
  onChange,
  className,
  disabled = false,
  required = false,
  label,
  error
}: MobileInputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        disabled={disabled}
        required={required}
        className={cn(
          'w-full min-h-[44px] px-4 py-3 text-base border border-gray-300 rounded-lg',
          'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          'touch-manipulation',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
      />
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}

// Mobile-optimized select component
interface MobileSelectProps {
  options: { value: string; label: string }[]
  value?: string
  onChange?: (e: React.ChangeEvent<HTMLSelectElement>) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  label?: string
  error?: string
}

export function MobileSelect({
  options,
  value,
  onChange,
  placeholder,
  className,
  disabled = false,
  label,
  error
}: MobileSelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      <select
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={cn(
          'w-full min-h-[44px] px-4 py-3 text-base border border-gray-300 rounded-lg',
          'focus:ring-2 focus:ring-blue-500 focus:border-transparent',
          'disabled:bg-gray-100 disabled:cursor-not-allowed',
          'touch-manipulation appearance-none bg-white',
          error && 'border-red-500 focus:ring-red-500',
          className
        )}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="text-sm text-red-600 mt-1">{error}</p>
      )}
    </div>
  )
}

// Mobile-optimized card component with proper spacing
interface MobileCardProps {
  children: ReactNode
  className?: string
  padding?: 'sm' | 'md' | 'lg'
  onClick?: () => void
  hoverable?: boolean
}

export function MobileCard({
  children,
  className,
  padding = 'md',
  onClick,
  hoverable = false
}: MobileCardProps) {
  const paddingClasses = {
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8'
  }
  
  const Component = onClick ? 'button' : 'div'
  
  return (
    <Component
      onClick={onClick}
      className={cn(
        'bg-white rounded-xl border border-gray-200 transition-all duration-200',
        paddingClasses[padding],
        onClick && 'touch-manipulation min-h-[44px] text-left',
        hoverable && 'hover:shadow-lg hover:scale-[1.02]',
        onClick && 'hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        className
      )}
    >
      {children}
    </Component>
  )
}

// Mobile-optimized spacing utilities
export const mobileSpacing = {
  // Minimum touch target spacing
  touchTarget: 'min-h-[44px] min-w-[44px]',
  
  // Responsive padding classes
  padding: {
    xs: 'p-2 sm:p-3',
    sm: 'p-3 sm:p-4',
    md: 'p-4 sm:p-6',
    lg: 'p-6 sm:p-8',
    xl: 'p-8 sm:p-12'
  },
  
  // Responsive margin classes
  margin: {
    xs: 'm-2 sm:m-3',
    sm: 'm-3 sm:m-4',
    md: 'm-4 sm:m-6',
    lg: 'm-6 sm:m-8',
    xl: 'm-8 sm:m-12'
  },
  
  // Responsive gap classes for flex/grid
  gap: {
    xs: 'gap-2 sm:gap-3',
    sm: 'gap-3 sm:gap-4',
    md: 'gap-4 sm:gap-6',
    lg: 'gap-6 sm:gap-8',
    xl: 'gap-8 sm:gap-12'
  },
  
  // Responsive text sizes
  text: {
    xs: 'text-xs sm:text-sm',
    sm: 'text-sm sm:text-base',
    base: 'text-base sm:text-lg',
    lg: 'text-lg sm:text-xl',
    xl: 'text-xl sm:text-2xl',
    '2xl': 'text-2xl sm:text-3xl',
    '3xl': 'text-3xl sm:text-4xl'
  }
}

// Mobile-optimized icon button
interface MobileIconButtonProps {
  icon: ReactNode
  onClick?: () => void
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  disabled?: boolean
  'aria-label'?: string
}

export function MobileIconButton({
  icon,
  onClick,
  variant = 'ghost',
  size = 'md',
  className,
  disabled = false,
  'aria-label': ariaLabel
}: MobileIconButtonProps) {
  const baseClasses = 'inline-flex items-center justify-center rounded-lg transition-all duration-200 touch-manipulation focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    ghost: 'bg-transparent text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500'
  }
  
  const sizeClasses = {
    sm: 'h-10 w-10 min-h-[44px] min-w-[44px]',
    md: 'h-12 w-12 min-h-[48px] min-w-[48px]',
    lg: 'h-14 w-14 min-h-[52px] min-w-[52px]'
  }
  
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      aria-label={ariaLabel}
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {icon}
    </button>
  )
}
