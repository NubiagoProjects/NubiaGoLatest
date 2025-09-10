'use client'

import React, { useState, useRef, forwardRef } from 'react'
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

// ============================================================================
// TYPES
// ============================================================================

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  helperText?: string
  inputSize?: 'sm' | 'md' | 'lg'
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  variant?: 'default' | 'filled' | 'outlined'
}

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
  variant?: 'default' | 'filled' | 'outlined'
  textAreaSize?: 'sm' | 'md' | 'lg'
}

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  error?: string
  helperText?: string
  options: Array<{ value: string; label: string; disabled?: boolean }>
  placeholder?: string
  variant?: 'default' | 'filled' | 'outlined'
  selectSize?: 'sm' | 'md' | 'lg'
}

interface CheckboxProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
  checkboxSize?: 'sm' | 'md' | 'lg'
}

interface RadioProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  label?: string
  error?: string
  helperText?: string
  radioSize?: 'sm' | 'md' | 'lg'
}

interface FormFieldProps {
  label?: string
  error?: string
  helperText?: string
  required?: boolean
  children: React.ReactNode
  className?: string
}

// ============================================================================
// FORM FIELD COMPONENT
// ============================================================================

export function FormField({ 
  label, 
  error, 
  helperText, 
  required, 
  children, 
  className = '' 
}: FormFieldProps) {
  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      {children}
      {(error || helperText) && (
        <div className="flex items-center space-x-2">
          {error ? (
            <XCircle className="h-4 w-4 text-red-500" />
          ) : (
            <AlertCircle className="h-4 w-4 text-gray-400" />
          )}
          <span className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
            {error || helperText}
          </span>
        </div>
      )}
    </div>
  )
}

// ============================================================================
// FORM VALIDATION UTILITIES
// ============================================================================

export function validateEmail(email: string): string | null {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email) return 'Email is required'
  if (!emailRegex.test(email)) return 'Please enter a valid email address'
  return null
}

export function validatePassword(password: string): string | null {
  if (!password) return 'Password is required'
  if (password.length < 6) return 'Password must be at least 6 characters'
  return null
}

export function validatePhone(phone: string): string | null {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  if (!phone) return 'Phone number is required'
  if (!phoneRegex.test(phone.replace(/\s/g, ''))) return 'Please enter a valid phone number'
  return null
}

export function validateRequired(value: string, fieldName: string): string | null {
  if (!value || value.trim() === '') return `${fieldName} is required`
  return null
}

// ============================================================================
// INPUT COMPONENT
// ============================================================================

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    label, 
    error, 
    helperText, 
    leftIcon, 
    rightIcon, 
    variant = 'default', 
    inputSize = 'md',
    className = '',
    type = 'text',
    ...props 
  }, ref) => {
    const [showPassword, setShowPassword] = useState(false)
    const [isFocused, setIsFocused] = useState(false)

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    }

    const variantClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      filled: 'bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-blue-500',
      outlined: 'border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    }

    const inputType = type === 'password' && showPassword ? 'text' : type

    return (
      <FormField label={label} error={error} helperText={helperText} required={props.required}>
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            className={`
              w-full rounded-lg border transition-all duration-200
              ${sizeClasses[inputSize as keyof typeof sizeClasses]}
              ${variantClasses[variant as keyof typeof variantClasses]}
              ${leftIcon ? 'pl-10' : ''}
              ${rightIcon || (type === 'password') ? 'pr-10' : ''}
              ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
              ${className}
            `}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            {...props}
          />
          {type === 'password' && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          {rightIcon && type !== 'password' && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
      </FormField>
    )
  }
)

Input.displayName = 'Input'

// ============================================================================
// TEXTAREA COMPONENT
// ============================================================================

export const TextArea = forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ 
    label, 
    error, 
    helperText, 
    variant = 'default', 
    textAreaSize = 'md',
    className = '',
    ...props 
  }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    }

    const variantClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      filled: 'bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-blue-500',
      outlined: 'border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    }

    return (
      <FormField label={label} error={error} helperText={helperText} required={props.required}>
        <textarea
          ref={ref}
          className={`
            w-full rounded-lg border transition-all duration-200 resize-none
            ${sizeClasses[textAreaSize as keyof typeof sizeClasses]}
            ${variantClasses[variant as keyof typeof variantClasses]}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        />
      </FormField>
    )
  }
)

TextArea.displayName = 'TextArea'

// ============================================================================
// SELECT COMPONENT
// ============================================================================

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    label, 
    error, 
    helperText, 
    options, 
    placeholder,
    variant = 'default', 
    selectSize = 'md',
    className = '',
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm',
      md: 'px-4 py-2 text-sm',
      lg: 'px-4 py-3 text-base',
    }

    const variantClasses = {
      default: 'border-gray-300 focus:border-blue-500 focus:ring-blue-500',
      filled: 'bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-blue-500',
      outlined: 'border-2 border-gray-300 focus:border-blue-500 focus:ring-blue-500',
    }

    return (
      <FormField label={label} error={error} helperText={helperText} required={props.required}>
        <select
          ref={ref}
          className={`
            w-full rounded-lg border transition-all duration-200
            ${sizeClasses[selectSize as keyof typeof sizeClasses]}
            ${variantClasses[variant as keyof typeof variantClasses]}
            ${error ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option: { value: string; label: string; disabled?: boolean }) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
      </FormField>
    )
  }
)

Select.displayName = 'Select'

// ============================================================================
// CHECKBOX COMPONENT
// ============================================================================

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ 
    label, 
    error, 
    helperText, 
    checkboxSize = 'md',
    className = '',
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }

    return (
      <FormField label={label} error={error} helperText={helperText} required={props.required}>
        <div className="flex items-center space-x-3">
          <input
            ref={ref}
            type="checkbox"
            className={`
              rounded border-gray-300 text-blue-600 focus:ring-blue-500
              ${sizeClasses[checkboxSize as keyof typeof sizeClasses]}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
          {label && (
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              {label}
            </label>
          )}
        </div>
      </FormField>
    )
  }
)

Checkbox.displayName = 'Checkbox'

// ============================================================================
// RADIO COMPONENT
// ============================================================================

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  ({ 
    label, 
    error, 
    helperText, 
    radioSize = 'md',
    className = '',
    ...props 
  }, ref) => {
    const sizeClasses = {
      sm: 'h-4 w-4',
      md: 'h-5 w-5',
      lg: 'h-6 w-6',
    }

    return (
      <FormField label={label} error={error} helperText={helperText} required={props.required}>
        <div className="flex items-center space-x-3">
          <input
            ref={ref}
            type="radio"
            className={`
              border-gray-300 text-blue-600 focus:ring-blue-500
              ${sizeClasses[radioSize as keyof typeof sizeClasses]}
              ${error ? 'border-red-500' : ''}
              ${className}
            `}
            {...props}
          />
          {label && (
            <label className="text-sm font-medium text-gray-700 cursor-pointer">
              {label}
            </label>
          )}
        </div>
      </FormField>
    )
  }
)

Radio.displayName = 'Radio'
