'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  EyeIcon, 
  EyeSlashIcon, 
  CheckCircleIcon,
  XCircleIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline'

interface MobileInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  success?: string
  hint?: string
  icon?: React.ReactNode
  showPasswordToggle?: boolean
}

export function MobileInput({
  label,
  error,
  success,
  hint,
  icon,
  type = 'text',
  showPasswordToggle = false,
  className = '',
  ...props
}: MobileInputProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const inputType = showPasswordToggle && type === 'password' 
    ? (showPassword ? 'text' : 'password')
    : type

  const hasContent = props.value || props.defaultValue
  const isFloatingLabel = isFocused || hasContent

  return (
    <div className={`relative ${className}`}>
      {/* Input container */}
      <div className="relative">
        {/* Icon */}
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 z-10">
            {icon}
          </div>
        )}

        {/* Input */}
        <input
          ref={inputRef}
          type={inputType}
          className={`input w-full no-zoom transition-all duration-200 ${
            icon ? 'pl-12' : 'pl-4'
          } ${
            showPasswordToggle ? 'pr-12' : 'pr-4'
          } ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : success
              ? 'border-green-500 focus:border-green-500 focus:ring-green-500'
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          } ${
            isFloatingLabel ? 'pt-6 pb-2' : 'py-4'
          }`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFloatingLabel ? '' : label}
          {...props}
        />

        {/* Floating label */}
        <motion.label
          initial={false}
          animate={{
            top: isFloatingLabel ? '0.75rem' : '50%',
            fontSize: isFloatingLabel ? '0.75rem' : '1rem',
            transform: isFloatingLabel ? 'translateY(0)' : 'translateY(-50%)',
          }}
          className={`absolute left-4 pointer-events-none transition-colors duration-200 ${
            icon ? 'left-12' : 'left-4'
          } ${
            error
              ? 'text-red-500'
              : success
              ? 'text-green-500'
              : isFocused
              ? 'text-blue-500'
              : 'text-gray-500'
          }`}
          onClick={() => inputRef.current?.focus()}
        >
          {label}
        </motion.label>

        {/* Password toggle */}
        {showPasswordToggle && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
          >
            {showPassword ? (
              <EyeSlashIcon className="w-5 h-5" />
            ) : (
              <EyeIcon className="w-5 h-5" />
            )}
          </button>
        )}

        {/* Status indicator */}
        {(error || success) && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            {error ? (
              <XCircleIcon className="w-5 h-5 text-red-500" />
            ) : (
              <CheckCircleIcon className="w-5 h-5 text-green-500" />
            )}
          </div>
        )}
      </div>

      {/* Messages */}
      <AnimatePresence>
        {(error || success || hint) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2"
          >
            {error && (
              <p className="text-sm text-red-600 flex items-center">
                <XCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                {error}
              </p>
            )}
            {success && (
              <p className="text-sm text-green-600 flex items-center">
                <CheckCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                {success}
              </p>
            )}
            {hint && !error && !success && (
              <p className="text-sm text-gray-500 flex items-center">
                <InformationCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
                {hint}
              </p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

interface MobileSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string
  options: Array<{ value: string; label: string }>
  error?: string
  placeholder?: string
}

export function MobileSelect({
  label,
  options,
  error,
  placeholder = 'Select an option',
  className = '',
  ...props
}: MobileSelectProps) {
  const [isFocused, setIsFocused] = useState(false)
  const hasValue = Boolean(props.value || props.defaultValue)
  const isFloatingLabel = isFocused || hasValue

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <select
          className={`input w-full no-zoom appearance-none bg-white transition-all duration-200 ${
            isFloatingLabel ? 'pt-6 pb-2' : 'py-4'
          } ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          {...props}
        >
          <option value="">{placeholder}</option>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {/* Floating label */}
        <motion.label
          initial={false}
          animate={{
            top: isFloatingLabel ? '0.75rem' : '50%',
            fontSize: isFloatingLabel ? '0.75rem' : '1rem',
            transform: isFloatingLabel ? 'translateY(0)' : 'translateY(-50%)',
          }}
          className={`absolute left-4 pointer-events-none transition-colors duration-200 ${
            error
              ? 'text-red-500'
              : isFocused
              ? 'text-blue-500'
              : 'text-gray-500'
          }`}
        >
          {label}
        </motion.label>

        {/* Dropdown arrow */}
        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-2 text-sm text-red-600 flex items-center"
          >
            <XCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}

interface MobileTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string
  error?: string
  maxLength?: number
}

export function MobileTextarea({
  label,
  error,
  maxLength,
  className = '',
  ...props
}: MobileTextareaProps) {
  const [isFocused, setIsFocused] = useState(false)
  const [charCount, setCharCount] = useState(0)
  const hasContent = props.value || props.defaultValue
  const isFloatingLabel = isFocused || hasContent

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCharCount(e.target.value.length)
    props.onChange?.(e)
  }

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <textarea
          className={`input w-full no-zoom resize-none transition-all duration-200 min-h-[120px] ${
            isFloatingLabel ? 'pt-6 pb-2' : 'py-4'
          } ${
            error 
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500' 
              : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500'
          }`}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onChange={handleChange}
          maxLength={maxLength}
          {...props}
        />

        {/* Floating label */}
        <motion.label
          initial={false}
          animate={{
            top: isFloatingLabel ? '0.75rem' : '2rem',
            fontSize: isFloatingLabel ? '0.75rem' : '1rem',
            transform: isFloatingLabel ? 'translateY(0)' : 'translateY(-50%)',
          }}
          className={`absolute left-4 pointer-events-none transition-colors duration-200 ${
            error
              ? 'text-red-500'
              : isFocused
              ? 'text-blue-500'
              : 'text-gray-500'
          }`}
        >
          {label}
        </motion.label>
      </div>

      {/* Character count and error */}
      <div className="mt-2 flex justify-between items-start">
        <AnimatePresence>
          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-600 flex items-center flex-1"
            >
              <XCircleIcon className="w-4 h-4 mr-1 flex-shrink-0" />
              {error}
            </motion.p>
          )}
        </AnimatePresence>
        
        {maxLength && (
          <p className={`text-xs ml-auto ${
            charCount > maxLength * 0.9 ? 'text-red-500' : 'text-gray-400'
          }`}>
            {charCount}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}

// Mobile-optimized form wrapper
export function MobileForm({
  children,
  onSubmit,
  className = '',
  ...props
}: React.FormHTMLAttributes<HTMLFormElement>) {
  return (
    <form
      onSubmit={onSubmit}
      className={`space-y-6 ${className}`}
      noValidate
      {...props}
    >
      {children}
    </form>
  )
}
