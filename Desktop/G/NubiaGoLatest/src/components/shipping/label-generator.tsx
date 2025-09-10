'use client'

import { useState } from 'react'
import { CheckCircle } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
// Button and Input components replaced with standard HTML elements
import { toast } from '@/components/ui/toast'
import { Package, Printer, Download, Truck, MapPin } from 'lucide-react'

const labelGeneratorSchema = z.object({
  orderId: z.string().min(1, 'Order ID is required'),
  fromAddress: z.object({
    name: z.string().min(1, 'Sender name is required'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }),
  toAddress: z.object({
    name: z.string().min(1, 'Recipient name is required'),
    company: z.string().optional(),
    address1: z.string().min(1, 'Address is required'),
    address2: z.string().optional(),
    city: z.string().min(1, 'City is required'),
    state: z.string().min(1, 'State is required'),
    postalCode: z.string().min(1, 'Postal code is required'),
    country: z.string().min(1, 'Country is required'),
    phone: z.string().optional(),
    email: z.string().email().optional(),
  }),
  packages: z.array(z.object({
    weight: z.number().positive('Weight must be positive'),
    length: z.number().positive('Length must be positive'),
    width: z.number().positive('Width must be positive'),
    height: z.number().positive('Height must be positive'),
    weightUnit: z.enum(['lb', 'kg']),
    dimensionUnit: z.enum(['in', 'cm']),
  })).min(1, 'At least one package is required'),
  serviceCode: z.string().min(1, 'Service code is required'),
  labelFormat: z.enum(['pdf', 'png', 'zpl']).default('pdf'),
})

type LabelGeneratorFormData = z.infer<typeof labelGeneratorSchema>

interface LabelGeneratorProps {
  orderId?: string
  className?: string
}

export function LabelGenerator({ orderId, className = '' }: LabelGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedLabel, setGeneratedLabel] = useState<{
    labelId: string
    trackingNumber: string
    carrierCode: string
    labelUrl: string
    labelFormat: string
  } | null>(null)
  const [packages, setPackages] = useState([
    {
      weight: 1,
      length: 10,
      width: 8,
      height: 6,
      weightUnit: 'lb' as const,
      dimensionUnit: 'in' as const,
    },
  ])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<LabelGeneratorFormData>({
    resolver: zodResolver(labelGeneratorSchema),
    defaultValues: {
      orderId: orderId || '',
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
      packages,
      serviceCode: '',
      labelFormat: 'pdf',
    },
  })

  const onSubmit = async (data: LabelGeneratorFormData) => {
    try {
      setIsGenerating(true)

      const response = await fetch('/api/shipping/labels', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${typeof window !== 'undefined' && typeof localStorage !== 'undefined' ? localStorage.getItem('authToken') : ''}`,
        },
        body: JSON.stringify({
          ...data,
          packages,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Failed to generate shipping label')
      }

      setGeneratedLabel(result.data)
      toast.success('Shipping label generated successfully!')
    } catch (error: any) {
      toast.error(error.message || 'Failed to generate shipping label')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleDownloadLabel = () => {
    if (generatedLabel?.labelUrl) {
      window.open(generatedLabel.labelUrl, '_blank')
    }
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

  const updatePackage = (index: number, field: string, value: any) => {
    const updatedPackages = packages.map((pkg, i) =>
      i === index ? { ...pkg, [field]: value } : pkg
    )
    setPackages(updatedPackages)
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div className="flex items-center space-x-2 mb-6">
        <Printer className="h-5 w-5 text-primary-600" />
        <h2 className="text-lg font-medium text-gray-900">Generate Shipping Label</h2>
      </div>

      {!generatedLabel ? (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Order Information */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Order Information</h3>
            <Input
              {...register('orderId')}
              placeholder="Order ID"
              error={errors.orderId?.message}
            />
          </div>

          {/* From Address */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-4 w-4 text-gray-500" />
              <h3 className="text-md font-medium text-gray-900">From Address</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('fromAddress.name')}
                placeholder="Sender Name"
                error={errors.fromAddress?.name?.message}
              />
              <Input
                {...register('fromAddress.company')}
                placeholder="Company (Optional)"
              />
              <Input
                {...register('fromAddress.address1')}
                placeholder="Address Line 1"
                error={errors.fromAddress?.address1?.message}
              />
              <Input
                {...register('fromAddress.address2')}
                placeholder="Address Line 2 (Optional)"
              />
              <Input
                {...register('fromAddress.city')}
                placeholder="City"
                error={errors.fromAddress?.city?.message}
              />
              <Input
                {...register('fromAddress.state')}
                placeholder="State/Province"
                error={errors.fromAddress?.state?.message}
              />
              <Input
                {...register('fromAddress.postalCode')}
                placeholder="Postal Code"
                error={errors.fromAddress?.postalCode?.message}
              />
              <Input
                {...register('fromAddress.country')}
                placeholder="Country"
                error={errors.fromAddress?.country?.message}
              />
              <Input
                {...register('fromAddress.phone')}
                placeholder="Phone (Optional)"
              />
              <Input
                {...register('fromAddress.email')}
                placeholder="Email (Optional)"
                type="email"
              />
            </div>
          </div>

          {/* To Address */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <MapPin className="h-4 w-4 text-gray-500" />
              <h3 className="text-md font-medium text-gray-900">To Address</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                {...register('toAddress.name')}
                placeholder="Recipient Name"
                error={errors.toAddress?.name?.message}
              />
              <Input
                {...register('toAddress.company')}
                placeholder="Company (Optional)"
              />
              <Input
                {...register('toAddress.address1')}
                placeholder="Address Line 1"
                error={errors.toAddress?.address1?.message}
              />
              <Input
                {...register('toAddress.address2')}
                placeholder="Address Line 2 (Optional)"
              />
              <Input
                {...register('toAddress.city')}
                placeholder="City"
                error={errors.toAddress?.city?.message}
              />
              <Input
                {...register('toAddress.state')}
                placeholder="State/Province"
                error={errors.toAddress?.state?.message}
              />
              <Input
                {...register('toAddress.postalCode')}
                placeholder="Postal Code"
                error={errors.toAddress?.postalCode?.message}
              />
              <Input
                {...register('toAddress.country')}
                placeholder="Country"
                error={errors.toAddress?.country?.message}
              />
              <Input
                {...register('toAddress.phone')}
                placeholder="Phone (Optional)"
              />
              <Input
                {...register('toAddress.email')}
                placeholder="Email (Optional)"
                type="email"
              />
            </div>
          </div>

          {/* Packages */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Package className="h-4 w-4 text-gray-500" />
                <h3 className="text-md font-medium text-gray-900">Packages</h3>
              </div>
              <Button
                type="button"
                onClick={addPackage}
                variant="outline"
                size="sm"
              >
                Add Package
              </Button>
            </div>
            <div className="space-y-4">
              {packages.map((pkg, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-900">
                      Package {index + 1}
                    </h4>
                    {packages.length > 1 && (
                      <Button
                        type="button"
                        onClick={() => removePackage(index)}
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700"
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Weight
                      </label>
                      <Input
                        type="number"
                        value={pkg.weight}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updatePackage(index, 'weight', parseFloat(e.target.value))
                        }
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Weight Unit
                      </label>
                      <select
                        value={pkg.weightUnit}
                        onChange={(e) =>
                          updatePackage(index, 'weightUnit', e.target.value as 'lb' | 'kg')
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="lb">Pounds (lb)</option>
                        <option value="kg">Kilograms (kg)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Length
                      </label>
                      <Input
                        type="number"
                        value={pkg.length}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updatePackage(index, 'length', parseFloat(e.target.value))
                        }
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Width
                      </label>
                      <Input
                        type="number"
                        value={pkg.width}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updatePackage(index, 'width', parseFloat(e.target.value))
                        }
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Height
                      </label>
                      <Input
                        type="number"
                        value={pkg.height}
                        onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                          updatePackage(index, 'height', parseFloat(e.target.value))
                        }
                        min="0.1"
                        step="0.1"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Dimension Unit
                      </label>
                      <select
                        value={pkg.dimensionUnit}
                        onChange={(e) =>
                          updatePackage(index, 'dimensionUnit', e.target.value as 'in' | 'cm')
                        }
                        className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                      >
                        <option value="in">Inches (in)</option>
                        <option value="cm">Centimeters (cm)</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Service Options */}
          <div>
            <h3 className="text-md font-medium text-gray-900 mb-4">Shipping Service</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Code
                </label>
                <select
                  {...register('serviceCode')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="">Select service</option>
                  <option value="usps_priority">USPS Priority Mail</option>
                  <option value="usps_first_class">USPS First Class</option>
                  <option value="fedex_ground">FedEx Ground</option>
                  <option value="fedex_2day">FedEx 2-Day</option>
                  <option value="ups_ground">UPS Ground</option>
                  <option value="ups_2nd_day_air">UPS 2nd Day Air</option>
                </select>
                {errors.serviceCode && (
                  <p className="text-red-600 text-xs mt-1">{errors.serviceCode.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label Format
                </label>
                <select
                  {...register('labelFormat')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option value="pdf">PDF</option>
                  <option value="png">PNG</option>
                  <option value="zpl">ZPL (Zebra)</option>
                </select>
              </div>
            </div>
          </div>

          <Button
            type="submit"
            disabled={isGenerating}
            className="w-full"
          >
            {isGenerating ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                <span>Generating Label...</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Printer className="h-4 w-4" />
                <span>Generate Label</span>
              </div>
            )}
          </Button>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-3">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-medium text-green-900">
                Label Generated Successfully!
              </h3>
            </div>
            <div className="space-y-2 text-sm">
              <p><strong>Label ID:</strong> {generatedLabel.labelId}</p>
              <p><strong>Tracking Number:</strong> {generatedLabel.trackingNumber}</p>
              <p><strong>Carrier:</strong> {generatedLabel.carrierCode.toUpperCase()}</p>
              <p><strong>Format:</strong> {generatedLabel.labelFormat.toUpperCase()}</p>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button
              onClick={handleDownloadLabel}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Download Label
            </Button>
            <Button
              onClick={() => setGeneratedLabel(null)}
              variant="outline"
            >
              Generate Another
            </Button>
          </div>
        </div>
      )}
    </div>
  )
} 
