'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { 
  CreditCard, MapPin, Phone, Mail, User, Lock, 
  ArrowLeft, CheckCircle, Package, Truck, Shield, Clock, Loader2, AlertCircle
} from 'lucide-react'
import Link from 'next/link'
import { CartService } from '@/lib/services/cart.service'
import { OrderService } from '@/lib/services/order.service'
import { useAuth } from '@/hooks/useAuth'
import { PaymentForm } from '@/components/payment/payment-form'
import { PaymentStatus } from '@/components/payment/payment-status'
import { usePaymentStore } from '@/store/payment'
import { useLogistics } from '@/hooks/useLogistics'
import { ShippingAddress, ShippingPackage } from '@/lib/services/logistics.service'
import { toast } from '@/lib/utils'

interface CheckoutForm {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: {
    street: string
    city: string
    state: string
    zipCode: string
    country: string
  }
}

export default function CheckoutPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user } = useAuth()
  const { paymentUrl, status, clearPayment } = usePaymentStore()
  const { rates, loading: ratesLoading, error: ratesError, getRates, clearRates } = useLogistics()
  const cartService = new CartService()
  const orderService = new OrderService()
  
  const [cartItems, setCartItems] = useState<any[]>([])
  const [cartTotal, setCartTotal] = useState(0)
  const [loading, setLoading] = useState(false)
  const [selectedRate, setSelectedRate] = useState<any>(null)
  
  // Fixed: Using user.name instead of user.displayName to match User interface
  const [formData, setFormData] = useState<CheckoutForm>({
    firstName: user?.name?.split(' ')[0] || '',
    lastName: user?.name?.split(' ')[1] || '',
    email: user?.email || '',
    phone: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: ''
    }
  })
  const [step, setStep] = useState(1)
  const [orderId, setOrderId] = useState<string | null>(null)
  const [paymentId, setPaymentId] = useState<string | null>(null)
  const [formErrors, setFormErrors] = useState<{[key: string]: string}>({})

  // Load cart data
  useEffect(() => {
    const loadCart = async () => {
      if (!user?.uid) return
      
      try {
        const cart = await cartService.getCart(user.uid)
        setCartItems(cart.items)
        setCartTotal(cart.total)
      } catch (error) {
        console.error('Error loading cart:', error)
      }
    }
    
    loadCart()
  }, [user?.uid])

  // Check for existing order from URL params
  useEffect(() => {
    const orderIdParam = searchParams.get('orderId')
    const paymentIdParam = searchParams.get('paymentId')
    
    if (orderIdParam) setOrderId(orderIdParam)
    if (paymentIdParam) setPaymentId(paymentIdParam)
  }, [searchParams])

  // Redirect to payment URL if available
  useEffect(() => {
    if (paymentUrl && status === 'pending') {
      window.open(paymentUrl, '_blank')
    }
  }, [paymentUrl, status])

  // Calculate shipping rates when address changes
  useEffect(() => {
    const calculateShippingRates = async () => {
      if (!formData.address.street || !formData.address.city || !formData.address.state || !formData.address.zipCode || !formData.address.country) {
        return
      }

      // Create shipping addresses
      const fromAddress: ShippingAddress = {
        name: 'Nubiago Store',
        company: 'Nubiago',
        address1: '123 Main Street',
        address2: '',
        city: 'Lagos',
        state: 'Lagos',
        postalCode: '100001',
        country: 'Nigeria',
        phone: '+234 123 456 7890',
        email: 'store@nubiago.com'
      }

      const toAddress: ShippingAddress = {
        name: `${formData.firstName} ${formData.lastName}`,
        company: '',
        address1: formData.address.street,
        address2: '',
        city: formData.address.city,
        state: formData.address.state,
        postalCode: formData.address.zipCode,
        country: formData.address.country,
        phone: formData.phone,
        email: formData.email
      }

      // Create package from cart items
      const packages: ShippingPackage[] = [{
        weight: Math.max(1, cartItems.reduce((total, item) => total + (item.quantity || 1), 0)),
        length: 10,
        width: 8,
        height: 6,
        weightUnit: 'lb',
        dimensionUnit: 'in'
      }]

      try {
        await getRates(fromAddress, toAddress, packages)
      } catch (error) {
        console.error('Failed to calculate shipping rates:', error)
      }
    }

    // Debounce the calculation
    const timeoutId = setTimeout(calculateShippingRates, 1000)
    return () => clearTimeout(timeoutId)
  }, [formData.address, cartItems, getRates])

  const handleInputChange = (field: string, value: string) => {
    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.')
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...(prev[parent as keyof CheckoutForm] as any),
          [child]: value
        }
      }))
    } else {
      setFormData(prev => ({ ...prev, [field]: value }))
    }
  }

  const validateForm = () => {
    const errors: {[key: string]: string} = {}
    
    if (!formData.firstName.trim()) errors.firstName = 'First name is required'
    if (!formData.lastName.trim()) errors.lastName = 'Last name is required'
    if (!formData.email.trim()) errors.email = 'Email is required'
    if (!formData.phone.trim()) errors.phone = 'Phone number is required'
    if (!formData.address.street.trim()) errors['address.street'] = 'Street address is required'
    if (!formData.address.city.trim()) errors['address.city'] = 'City is required'
    if (!formData.address.state.trim()) errors['address.state'] = 'State is required'
    if (!formData.address.zipCode.trim()) errors['address.zipCode'] = 'ZIP code is required'
    if (!formData.address.country.trim()) errors['address.country'] = 'Country is required'
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handlePaymentSuccess = () => {
    setStep(3)
  }

  const handlePaymentError = (error: string) => {
    console.error('Payment error:', error)
  }

  const handlePaymentStatusChange = async (newStatus: string) => {
    if (newStatus === 'completed') {
      if (user?.uid) {
        await cartService.clearCart(user.uid)
      }
      clearPayment()
      router.push(`/checkout/success?orderId=${orderId}&paymentId=${paymentId}`)
    } else if (newStatus === 'failed') {
      router.push(`/checkout/failed?orderId=${orderId}&paymentId=${paymentId}&error=${encodeURIComponent('Payment failed')}`)
    }
  }

  const createOrder = async () => {
    try {
      setLoading(true)
      
      const orderData = {
        userId: user?.uid || '',
        items: cartItems.map(item => ({
          id: `${item.productId}-${Date.now()}`,
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          total: item.price * item.quantity,
          product: item.product,
        })),
        shippingAddress: {
          id: `shipping-${Date.now()}`,
          type: 'shipping' as const,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          postalCode: formData.address.zipCode,
          country: formData.address.country,
          phone: formData.phone,
          isDefault: false,
        },
        billingAddress: {
          id: `billing-${Date.now()}`,
          type: 'billing' as const,
          firstName: formData.firstName,
          lastName: formData.lastName,
          address1: formData.address.street,
          city: formData.address.city,
          state: formData.address.state,
          postalCode: formData.address.zipCode,
          country: formData.address.country,
          phone: formData.phone,
          isDefault: false,
        },
        paymentMethod: 'credit_card', // Default payment method
        shippingMethod: selectedRate ? selectedRate.serviceName : 'standard',
        subtotal: cartTotal,
        shipping: selectedRate ? selectedRate.rate : 0,
        tax: cartTotal * 0.08,
        total: cartTotal + (selectedRate ? selectedRate.rate : 0) + (cartTotal * 0.08),
        status: 'pending',
        paymentStatus: 'pending'
      }
      
      const newOrder = await orderService.createOrder(orderData)
      return newOrder.id
    } catch (error) {
      console.error('Error creating order:', error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const handleContinueToPayment = async () => {
    if (!validateForm()) {
      toast.error('Please fill in all required fields')
      return
    }
    
    if (!selectedRate && rates.length > 0) {
      toast.error('Please select a shipping method')
      return
    }
    
    try {
      const newOrderId = await createOrder()
      setOrderId(newOrderId)
      setStep(2)
    } catch (error) {
      console.error('Error creating order:', error)
      toast.error('Failed to create order. Please try again.')
    }
  }

  const subtotal = cartTotal
  const shipping = selectedRate ? selectedRate.rate : 0
  const tax = subtotal * 0.08
  const total = subtotal + shipping + tax

  // If we have a payment ID, show payment status
  if (paymentId) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 mb-8">
            <Link href="/cart" className="text-gray-400 hover:text-blue-600 transition-colors">
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <h1 className="text-2xl font-bold text-gray-900">
              Payment Status
            </h1>
          </div>
          
          <PaymentStatus 
            paymentId={paymentId} 
            onStatusChange={handlePaymentStatusChange}
          />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link 
            href="/cart" 
            className="inline-flex items-center text-gray-600 hover:text-blue-600 transition-colors mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            <span className="font-medium">Back to Cart</span>
          </Link>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Checkout
          </h1>
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center space-x-8 mt-6">
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                1
              </div>
              <span className={`text-sm font-medium ${
                step >= 1 ? 'text-gray-900' : 'text-gray-500'
              }`}>Shipping</span>
            </div>
            
            <div className="w-12 h-0.5 bg-gray-200"></div>
            
            <div className="flex items-center space-x-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'
              }`}>
                2
              </div>
              <span className={`text-sm font-medium ${
                step >= 2 ? 'text-gray-900' : 'text-gray-500'
              }`}>Payment</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Shipping Information */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-6">
                <MapPin className="h-5 w-5 text-blue-600" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Shipping Information</h2>
                  <p className="text-sm text-gray-500">Where should we deliver your order?</p>
                </div>
              </div>
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(e) => handleInputChange('firstName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.firstName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.firstName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.firstName}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(e) => handleInputChange('lastName', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.lastName ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.lastName && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.lastName}</p>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.email && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors.phone ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors.phone && (
                      <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Street Address *</label>
                  <input
                    type="text"
                    value={formData.address.street}
                    onChange={(e) => handleInputChange('address.street', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors['address.street'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  />
                  {formErrors['address.street'] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors['address.street']}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">City *</label>
                    <input
                      type="text"
                      value={formData.address.city}
                      onChange={(e) => handleInputChange('address.city', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors['address.city'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors['address.city'] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors['address.city']}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">State *</label>
                    <input
                      type="text"
                      value={formData.address.state}
                      onChange={(e) => handleInputChange('address.state', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors['address.state'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors['address.state'] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors['address.state']}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code *</label>
                    <input
                      type="text"
                      value={formData.address.zipCode}
                      onChange={(e) => handleInputChange('address.zipCode', e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formErrors['address.zipCode'] ? 'border-red-500' : 'border-gray-300'
                      }`}
                      required
                    />
                    {formErrors['address.zipCode'] && (
                      <p className="text-red-500 text-sm mt-1">{formErrors['address.zipCode']}</p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Country *</label>
                  <select
                    value={formData.address.country}
                    onChange={(e) => handleInputChange('address.country', e.target.value)}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      formErrors['address.country'] ? 'border-red-500' : 'border-gray-300'
                    }`}
                    required
                  >
                    <option value="">Select Country</option>
                    <option value="Nigeria">Nigeria</option>
                    <option value="Ghana">Ghana</option>
                    <option value="USA">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="UK">United Kingdom</option>
                  </select>
                  {formErrors['address.country'] && (
                    <p className="text-red-500 text-sm mt-1">{formErrors['address.country']}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Rates */}
            {rates.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <Truck className="h-5 w-5 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Shipping Options</h2>
                    <p className="text-sm text-gray-500">Choose your preferred shipping method</p>
                  </div>
                </div>
                
                {ratesLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                    <span className="ml-2 text-gray-600">Calculating shipping rates...</span>
                  </div>
                ) : ratesError ? (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex items-center">
                      <AlertCircle className="h-5 w-5 text-red-400" />
                      <span className="ml-2 text-red-800">{ratesError}</span>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {rates.map((rate, index) => (
                      <div
                        key={index}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                          selectedRate?.id === rate.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => setSelectedRate(rate)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                              selectedRate?.id === rate.id
                                ? 'border-blue-500 bg-blue-500'
                                : 'border-gray-300'
                            }`}>
                              {selectedRate?.id === rate.id && (
                                <div className="w-2 h-2 bg-white rounded-full"></div>
                              )}
                            </div>
                            <div>
                              <h3 className="font-medium text-gray-900">{rate.serviceName}</h3>
                              <p className="text-sm text-gray-500">
                                {rate.carrier} • {rate.estimatedDays} days
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-gray-900">${rate.rate.toFixed(2)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Payment Information */}
            {step >= 2 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <div className="flex items-center space-x-3 mb-6">
                  <CreditCard className="h-5 w-5 text-blue-600" />
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">Payment Information</h2>
                    <p className="text-sm text-gray-500">Secure payment processing</p>
                  </div>
                </div>
                
                {orderId ? (
                  <PaymentForm
                    amount={total}
                    currency="NGN"
                    orderId={orderId}
                    onSuccess={handlePaymentSuccess}
                    onError={handlePaymentError}
                  />
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <CreditCard className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-gray-600 mb-6">
                      Please complete your shipping information first to proceed with payment.
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Continue Button */}
            {step === 1 && (
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <button
                  onClick={handleContinueToPayment}
                  disabled={loading}
                  className="w-full bg-blue-600 text-white py-3 px-6 rounded-md font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? 'Creating Order...' : 'Continue to Payment'}
                </button>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg">
              <div className="px-6 py-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold text-gray-900">Order Summary</h2>
              </div>
              
              <div className="px-6 py-4 space-y-4">
                {cartItems.map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gray-100 rounded flex items-center justify-center">
                      <Package className="h-6 w-6 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">{item.product.name}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                    <p className="font-semibold text-gray-900">${(item.price * item.quantity).toFixed(2)}</p>
                  </div>
                ))}
                
                <div className="border-t border-gray-200 pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal</span>
                    <span className="font-medium">${subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">
                      Shipping {selectedRate && `(${selectedRate.serviceName})`}
                    </span>
                    <span className="font-medium">${shipping.toFixed(2)}</span>
                  </div>
                  {selectedRate && (
                    <div className="text-xs text-gray-500 pl-4">
                      {selectedRate.carrier} • {selectedRate.estimatedDays} days
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Tax</span>
                    <span className="font-medium">${tax.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-gray-200 pt-2">
                    <div className="flex justify-between">
                      <span className="text-lg font-semibold text-gray-900">Total</span>
                      <span className="text-lg font-semibold text-gray-900">${total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Security & Trust */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Shield className="h-5 w-5 text-green-600" />
                <h3 className="text-sm font-semibold text-gray-900">Secure Checkout</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">SSL encrypted payment</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Your data is protected</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-sm text-gray-600">Secure payment processing</span>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <div className="flex items-center space-x-3 mb-4">
                <Truck className="h-5 w-5 text-blue-600" />
                <h3 className="text-sm font-semibold text-gray-900">Delivery Information</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Standard delivery: 3-5 business days</span>
                </div>
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-gray-600" />
                  <span className="text-sm text-gray-600">Free shipping on orders over $50</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
