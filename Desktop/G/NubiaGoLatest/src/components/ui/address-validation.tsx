'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Input } from '@/components/ui/form'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/ui/toast'
import { MapPin, CheckCircle, XCircle, Loader2, Search } from 'lucide-react'

const addressSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  company: z.string().optional(),
  address1: z.string().min(1, 'Address is required'),
  address2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  state: z.string().min(1, 'State is required'),
  postalCode: z.string().min(1, 'Postal code is required'),
  country: z.string().min(1, 'Country is required'),
  phone: z.string().optional(),
  email: z.string().email().optional(),
})

type AddressFormData = z.infer<typeof addressSchema>

interface AddressValidationProps {
  type: 'from' | 'to'
  onValidated?: (address: AddressFormData) => void
  onClear?: () => void
  className?: string
}

export function AddressValidation({ 
  type, 
  onValidated, 
  onClear, 
  className = '' 
}: AddressValidationProps) {
  const [isValidating, setIsValidating] = useState(false)
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean
    suggestions?: AddressFormData[]
    formattedAddress?: AddressFormData
  } | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
    reset,
  } = useForm<AddressFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: '',
      company: '',
      address1: '',
      address2: '',
      city: '',
      state: '',
      postalCode: '',
      country: '',
      phone: '',
      email: '',
    },
  })

  const watchedAddress = watch()

  const validateAddress = async (data: AddressFormData) => {
    try {
      setIsValidating(true)
      setValidationResult(null)

      const response = await fetch('/api/shipping/validate-address', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      const result = await response.json()

      if (result.success) {
        setValidationResult({
          isValid: result.data.isValid,
          suggestions: result.data.suggestions,
          formattedAddress: result.data.formattedAddress,
        })

        if (result.data.isValid) {
          toast.success('Address validated successfully')
          onValidated?.(result.data.formattedAddress || data)
        } else {
          toast.error('Address validation failed')
        }
      } else {
        toast.error(result.error || 'Address validation failed')
      }
    } catch (error) {
      toast.error('Failed to validate address')
    } finally {
      setIsValidating(false)
    }
  }

  const handleAddressSubmit = (data: AddressFormData) => {
    validateAddress(data)
  }

  const applySuggestion = (suggestion: AddressFormData) => {
    Object.entries(suggestion).forEach(([key, value]) => {
      setValue(key as keyof AddressFormData, value)
    })
    setValidationResult(null)
  }

  const applyFormattedAddress = () => {
    if (validationResult?.formattedAddress) {
      Object.entries(validationResult.formattedAddress).forEach(([key, value]) => {
        setValue(key as keyof AddressFormData, value)
      })
      setValidationResult(null)
    }
  }

  const clearForm = () => {
    reset()
    setValidationResult(null)
    onClear?.()
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <MapPin className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-medium text-gray-900">
          {type === 'from' ? 'From Address' : 'To Address'} Validation
        </h2>
      </div>

      <form onSubmit={handleSubmit(handleAddressSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              {...register('name')}
              placeholder="Enter full name"
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && (
              <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company
            </label>
            <Input
              {...register('company')}
              placeholder="Company name (optional)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 1 *
          </label>
          <Input
            {...register('address1')}
            placeholder="Street address"
            className={errors.address1 ? 'border-red-500' : ''}
          />
          {errors.address1 && (
            <p className="text-red-500 text-sm mt-1">{errors.address1.message}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Address Line 2
          </label>
          <Input
            {...register('address2')}
            placeholder="Apartment, suite, etc. (optional)"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              City *
            </label>
            <Input
              {...register('city')}
              placeholder="City"
              className={errors.city ? 'border-red-500' : ''}
            />
            {errors.city && (
              <p className="text-red-500 text-sm mt-1">{errors.city.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              State/Province *
            </label>
            <Input
              {...register('state')}
              placeholder="State"
              className={errors.state ? 'border-red-500' : ''}
            />
            {errors.state && (
              <p className="text-red-500 text-sm mt-1">{errors.state.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Postal Code *
            </label>
            <Input
              {...register('postalCode')}
              placeholder="Postal code"
              className={errors.postalCode ? 'border-red-500' : ''}
            />
            {errors.postalCode && (
              <p className="text-red-500 text-sm mt-1">{errors.postalCode.message}</p>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Country *
            </label>
            <Input
              {...register('country')}
              placeholder="Country"
              className={errors.country ? 'border-red-500' : ''}
            />
            {errors.country && (
              <p className="text-red-500 text-sm mt-1">{errors.country.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <Input
              {...register('phone')}
              placeholder="Phone number (optional)"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <Input
            {...register('email')}
            type="email"
            placeholder="Email address (optional)"
            className={errors.email ? 'border-red-500' : ''}
          />
          {errors.email && (
            <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
          )}
        </div>

        <div className="flex space-x-3">
          <Button
            type="submit"
            disabled={isValidating}
            className="flex-1"
          >
            {isValidating ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Validating...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Search className="h-4 w-4" />
                <span>Validate Address</span>
              </div>
            )}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={clearForm}
          >
            Clear
          </Button>
        </div>
      </form>

      {/* Validation Results */}
      {validationResult && (
        <div className="mt-6 space-y-4">
          <div className={`p-4 rounded-lg border ${
            validationResult.isValid 
              ? 'bg-green-50 border-green-200' 
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {validationResult.isValid ? (
                <CheckCircle className="h-5 w-5 text-green-500" />
              ) : (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className={`font-medium ${
                validationResult.isValid ? 'text-green-800' : 'text-red-800'
              }`}>
                {validationResult.isValid ? 'Address is valid' : 'Address needs correction'}
              </span>
            </div>
          </div>

          {/* Suggestions */}
          {validationResult.suggestions && validationResult.suggestions.length > 0 && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="font-medium text-blue-900 mb-3">Address Suggestions</h4>
              <div className="space-y-2">
                {validationResult.suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => applySuggestion(suggestion)}
                    className="w-full text-left p-3 bg-white rounded border border-blue-200 hover:border-blue-300 transition-colors"
                  >
                    <div className="text-sm text-blue-800">
                      {suggestion.address1}, {suggestion.city}, {suggestion.state} {suggestion.postalCode}
                    </div>
                    <div className="text-xs text-blue-600 mt-1">
                      Click to apply this suggestion
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Formatted Address */}
          {validationResult.formattedAddress && !validationResult.isValid && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h4 className="font-medium text-yellow-900 mb-3">Formatted Address</h4>
              <div className="text-sm text-yellow-800 mb-3">
                {validationResult.formattedAddress.address1}, {validationResult.formattedAddress.city}, {validationResult.formattedAddress.state} {validationResult.formattedAddress.postalCode}
              </div>
              <Button
                onClick={applyFormattedAddress}
                size="sm"
                variant="outline"
              >
                Apply Formatted Address
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
