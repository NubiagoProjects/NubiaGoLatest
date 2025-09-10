'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Truck, Package, Calculator, ArrowRight, CheckCircle, AlertCircle } from 'lucide-react'
import { useShippingStore } from '@/store/shipping'
import { ShippingAddress, ShippingPackage } from '@/lib/services/logistics.service'
import { toast } from '@/lib/utils'

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
  email: z.string().email('Invalid email').optional(),
})

const packageSchema = z.object({
  weight: z.number().min(0.1, 'Weight must be at least 0.1'),
  length: z.number().min(0.1, 'Length must be at least 0.1'),
  width: z.number().min(0.1, 'Width must be at least 0.1'),
  height: z.number().min(0.1, 'Height must be at least 0.1'),
  weightUnit: z.enum(['lb', 'kg']),
  dimensionUnit: z.enum(['in', 'cm']),
})

const shippingCalculatorSchema = z.object({
  fromAddress: addressSchema,
  toAddress: addressSchema,
  packages: z.array(packageSchema).min(1, 'At least one package is required'),
})

type ShippingCalculatorFormData = z.infer<typeof shippingCalculatorSchema>

interface ShippingCalculatorProps {
  onRateSelect?: (rate: any) => void
  className?: string
}

export function ShippingCalculator({ onRateSelect, className = '' }: ShippingCalculatorProps) {
  const [step, setStep] = useState(1)
  const [packages, setPackages] = useState<ShippingPackage[]>([
    {
      weight: 1,
      length: 10,
      width: 8,
      height: 6,
      weightUnit: 'lb',
      dimensionUnit: 'in',
    },
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<ShippingCalculatorFormData>({
    resolver: zodResolver(shippingCalculatorSchema),
    defaultValues: {
      fromAddress: {
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
      toAddress: {
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
      packages: packages,
    },
  })

  const {
    rates,
    ratesLoading,
    ratesError,
    getRates,
    selectRate,
    clearRates,
  } = useShippingStore()

  const watchedFromAddress = watch('fromAddress')
  const watchedToAddress = watch('toAddress')

  const onSubmit = async (data: ShippingCalculatorFormData) => {
    try {
      // Convert form data to logistics service format
      const fromAddress: ShippingAddress = {
        name: data.fromAddress.name,
        company: data.fromAddress.company,
        address1: data.fromAddress.address1,
        address2: data.fromAddress.address2,
        city: data.fromAddress.city,
        state: data.fromAddress.state,
        postalCode: data.fromAddress.postalCode,
        country: data.fromAddress.country,
        phone: data.fromAddress.phone,
        email: data.fromAddress.email,
      }

      const toAddress: ShippingAddress = {
        name: data.toAddress.name,
        company: data.toAddress.company,
        address1: data.toAddress.address1,
        address2: data.toAddress.address2,
        city: data.toAddress.city,
        state: data.toAddress.state,
        postalCode: data.toAddress.postalCode,
        country: data.toAddress.country,
        phone: data.toAddress.phone,
        email: data.toAddress.email,
      }

      const success = await getRates({
        fromAddress,
        toAddress,
        packages: data.packages,
      })

      if (success) {
        setStep(2)
        toast.success('Shipping rates calculated successfully!')
      } else {
        toast.error(ratesError || 'Failed to calculate shipping rates')
      }
    } catch (error) {
      toast.error('An error occurred while calculating rates')
    }
  }

  const handleRateSelect = (rate: any) => {
    selectRate(rate)
    onRateSelect?.(rate)
    toast.success(`Selected ${rate.serviceName} - $${rate.rate.toFixed(2)}`)
  }

  const addPackage = () => {
    setPackages([
      ...packages,
      {
        weight: 1,
        length: 10,
        width: 8,
        height: 6,
        weightUnit: 'lb',
        dimensionUnit: 'in',
      },
    ])
  }

  const removePackage = (index: number) => {
    if (packages.length > 1) {
      setPackages(packages.filter((_, i) => i !== index))
    }
  }

  const updatePackage = (index: number, field: keyof ShippingPackage, value: any) => {
    const updatedPackages = packages.map((pkg, i) =>
      i === index ? { ...pkg, [field]: value } : pkg
    )
    setPackages(updatedPackages)
  }

  const resetCalculator = () => {
    setStep(1)
    clearRates()
    setPackages([
      {
        weight: 1,
        length: 10,
        width: 8,
        height: 6,
        weightUnit: 'lb',
        dimensionUnit: 'in',
      },
    ])
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Calculator className="h-6 w-6 text-primary-600" />
        <h2 className="text-xl font-semibold text-gray-900">Shipping Calculator</h2>
      </div>

      {step === 1 && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* From Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Truck className="h-5 w-5 mr-2" />
              From Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  {...register('fromAddress.name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Full name"
                />
                {errors.fromAddress?.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.fromAddress.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  {...register('fromAddress.company')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Company name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  {...register('fromAddress.address1')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Street address"
                />
                {errors.fromAddress?.address1 && (
                  <p className="text-red-600 text-xs mt-1">{errors.fromAddress.address1.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <input
                  {...register('fromAddress.address2')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  {...register('fromAddress.city')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="City"
                />
                {errors.fromAddress?.city && (
                  <p className="text-red-600 text-xs mt-1">{errors.fromAddress.city.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province *
                </label>
                <input
                  {...register('fromAddress.state')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="State"
                />
                {errors.fromAddress?.state && (
                  <p className="text-red-600 text-xs mt-1">{errors.fromAddress.state.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <input
                  {...register('fromAddress.postalCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Postal code"
                />
                {errors.fromAddress?.postalCode && (
                  <p className="text-red-600 text-xs mt-1">{errors.fromAddress.postalCode.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  {...register('fromAddress.country')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Country"
                />
                {errors.fromAddress?.country && (
                  <p className="text-red-600 text-xs mt-1">{errors.fromAddress.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* To Address */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <ArrowRight className="h-5 w-5 mr-2" />
              To Address
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  {...register('toAddress.name')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Full name"
                />
                {errors.toAddress?.name && (
                  <p className="text-red-600 text-xs mt-1">{errors.toAddress.name.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company
                </label>
                <input
                  {...register('toAddress.company')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Company name"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Address *
                </label>
                <input
                  {...register('toAddress.address1')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Street address"
                />
                {errors.toAddress?.address1 && (
                  <p className="text-red-600 text-xs mt-1">{errors.toAddress.address1.message}</p>
                )}
              </div>
              <div className="md:col-span-2">
                <input
                  {...register('toAddress.address2')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Apartment, suite, etc. (optional)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  City *
                </label>
                <input
                  {...register('toAddress.city')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="City"
                />
                {errors.toAddress?.city && (
                  <p className="text-red-600 text-xs mt-1">{errors.toAddress.city.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  State/Province *
                </label>
                <input
                  {...register('toAddress.state')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="State"
                />
                {errors.toAddress?.state && (
                  <p className="text-red-600 text-xs mt-1">{errors.toAddress.state.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postal Code *
                </label>
                <input
                  {...register('toAddress.postalCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Postal code"
                />
                {errors.toAddress?.postalCode && (
                  <p className="text-red-600 text-xs mt-1">{errors.toAddress.postalCode.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Country *
                </label>
                <input
                  {...register('toAddress.country')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  placeholder="Country"
                />
                {errors.toAddress?.country && (
                  <p className="text-red-600 text-xs mt-1">{errors.toAddress.country.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Packages */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
              <Package className="h-5 w-5 mr-2" />
              Packages
            </h3>
            {packages.map((pkg, index) => (
              <div key={index} className="border border-gray-200 rounded-lg p-4 mb-4">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-medium">Package {index + 1}</h4>
                  {packages.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePackage(index)}
                      className="text-red-600 hover:text-red-800 text-sm"
                    >
                      Remove
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Weight *
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        step="0.1"
                        value={pkg.weight}
                        onChange={(e) => updatePackage(index, 'weight', parseFloat(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Weight"
                      />
                      <select
                        value={pkg.weightUnit}
                        onChange={(e) => updatePackage(index, 'weightUnit', e.target.value as 'lb' | 'kg')}
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="lb">lb</option>
                        <option value="kg">kg</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Length *
                    </label>
                    <div className="flex">
                      <input
                        type="number"
                        step="0.1"
                        value={pkg.length}
                        onChange={(e) => updatePackage(index, 'length', parseFloat(e.target.value))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                        placeholder="Length"
                      />
                      <select
                        value={pkg.dimensionUnit}
                        onChange={(e) => updatePackage(index, 'dimensionUnit', e.target.value as 'in' | 'cm')}
                        className="px-3 py-2 border border-l-0 border-gray-300 rounded-r-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      >
                        <option value="in">in</option>
                        <option value="cm">cm</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Width *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={pkg.width}
                      onChange={(e) => updatePackage(index, 'width', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Width"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Height *
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={pkg.height}
                      onChange={(e) => updatePackage(index, 'height', parseFloat(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                      placeholder="Height"
                    />
                  </div>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={addPackage}
              className="w-full py-2 px-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-primary-500 hover:text-primary-600 transition-colors"
            >
              + Add Package
            </button>
          </div>

          <button
            type="submit"
            disabled={ratesLoading}
            className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {ratesLoading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Calculating rates...
              </div>
            ) : (
              'Calculate Rates'
            )}
          </button>
        </form>
      )}

      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-gray-900">Available Shipping Rates</h3>
            <button
              onClick={resetCalculator}
              className="text-primary-600 hover:text-primary-800 text-sm font-medium"
            >
              Calculate New Rates
            </button>
          </div>

          {ratesError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertCircle className="h-5 w-5 text-red-400 mr-2" />
                <p className="text-red-800">{ratesError}</p>
              </div>
            </div>
          )}

          {rates.length > 0 && (
            <div className="space-y-4">
              {rates.map((rate) => (
                <div
                  key={rate.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:shadow-md transition-all cursor-pointer"
                  onClick={() => handleRateSelect(rate)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-medium text-gray-900">{rate.serviceName}</h4>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {rate.carrier}
                        </span>
                        {rate.guaranteedDelivery && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Guaranteed
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">
                        {rate.estimatedDays} • {rate.currency} ${rate.rate.toFixed(2)}
                      </p>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-semibold text-gray-900">
                        ${rate.rate.toFixed(2)}
                      </div>
                      <div className="text-sm text-gray-500">{rate.currency}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {rates.length === 0 && !ratesLoading && !ratesError && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No shipping rates available for the specified route.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
} 
