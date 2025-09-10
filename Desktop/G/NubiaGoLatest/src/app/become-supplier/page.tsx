'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, CheckCircle, Star, Users, TrendingUp, Shield, Truck, Globe, Award, Zap, Building, Target, DollarSign, BarChart3 } from 'lucide-react'

export default function BecomeSupplierPage() {
  const [activeTab, setActiveTab] = useState('overview')

  const benefits = [
    {
      icon: TrendingUp,
      title: 'Growing Market',
      description: 'Access to millions of customers across Africa',
      color: 'from-green-600 to-green-700'
    },
    {
      icon: Shield,
      title: 'Secure Payments',
      description: 'Safe and reliable payment processing',
      color: 'from-blue-600 to-blue-700'
    },
    {
      icon: Truck,
      title: 'Logistics Support',
      description: 'Integrated shipping and delivery solutions',
      color: 'from-purple-600 to-purple-700'
    },
    {
      icon: Globe,
      title: 'Global Reach',
      description: 'Expand your business internationally',
      color: 'from-orange-600 to-orange-700'
    }
  ]

  const requirements = [
    'Valid business registration',
    'Quality product standards',
    'Reliable shipping capability',
    'Customer service commitment',
    'Regular inventory updates',
    'Compliance with platform policies'
  ]

  const steps = [
    {
      number: '01',
      title: 'Apply Online',
      description: 'Fill out our supplier application form with your business details'
    },
    {
      number: '02',
      title: 'Document Review',
      description: 'We review your business documents and verify your information'
    },
    {
      number: '03',
      title: 'Account Setup',
      description: 'Get your supplier dashboard and start listing products'
    },
    {
      number: '04',
      title: 'Start Selling',
      description: 'Begin selling your products to customers worldwide'
    }
  ]

  const stats = [
    { number: '10K+', label: 'Active Suppliers', icon: Building },
    { number: '50M+', label: 'Products Sold', icon: Target },
    { number: '$500M+', label: 'Revenue Generated', icon: DollarSign },
    { number: '99.9%', label: 'Uptime', icon: BarChart3 }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Premium Header */}
        <div className="mb-12">
          <Link 
            href="/" 
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors duration-200 mb-6 group"
          >
            <ArrowLeft className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform duration-200" />
            <span className="font-medium">Back to Home</span>
          </Link>
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold rounded-full mb-6 shadow-lg">
              <Building className="w-4 h-4 mr-2" />
              Enterprise Partnership
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-6">
              Become a Supplier
            </h1>
            <p className="text-xl lg:text-2xl text-gray-600 max-w-4xl mx-auto leading-relaxed">
              Join thousands of successful suppliers and grow your business with our enterprise-grade platform
            </p>
          </div>
        </div>

        {/* Premium Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon
            return (
              <div key={index} className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-6 text-center hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-300">
                <div className="w-12 h-12 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-xl flex items-center justify-center mx-auto mb-4">
                  <IconComponent className="h-6 w-6 text-white" />
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{stat.number}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </div>
            )
          })}
        </div>

        {/* Premium Navigation Tabs */}
        <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] mb-8 overflow-hidden">
          <div className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-gray-100">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'benefits', label: 'Benefits' },
                { id: 'requirements', label: 'Requirements' },
                { id: 'process', label: 'Application Process' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-6 px-1 border-b-2 font-semibold text-sm transition-all duration-200 ${
                    activeTab === tab.id
                      ? 'border-primary-500 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-8">
            {activeTab === 'overview' && (
              <div className="space-y-12">
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-r from-primary-600 to-secondary-600 mb-6">
                    <Users className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-6">Why Become a Supplier?</h2>
                  <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                    Join our marketplace and tap into a growing customer base. We provide the tools, 
                    support, and infrastructure you need to succeed in e-commerce at an enterprise level.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {benefits.map((benefit, index) => {
                    const IconComponent = benefit.icon
                    return (
                      <div key={index} className="text-center group">
                        <div className={`mx-auto flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-r ${benefit.color} mb-6 group-hover:scale-110 transition-transform duration-300`}>
                          <IconComponent className="h-8 w-8 text-white" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-3">{benefit.title}</h3>
                        <p className="text-gray-600 leading-relaxed">{benefit.description}</p>
                      </div>
                    )
                  })}
                </div>

                <div className="text-center pt-8">
                  <Link
                    href="/register/supplier"
                    className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <Award className="h-6 w-6 mr-3" />
                    Start Your Application
                  </Link>
                </div>
              </div>
            )}

            {activeTab === 'benefits' && (
              <div className="space-y-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Enterprise Benefits</h2>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  <div className="space-y-8">
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-300">
                      <div className="flex items-start space-x-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-green-600 to-green-700 rounded-xl flex items-center justify-center">
                          <CheckCircle className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">Zero Setup Fees</h3>
                          <p className="text-gray-600 leading-relaxed">Start selling immediately with no upfront costs or hidden fees</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-300">
                      <div className="flex items-start space-x-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                          <TrendingUp className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">Marketing Support</h3>
                          <p className="text-gray-600 leading-relaxed">Promote your products with our advanced marketing tools and analytics</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-300">
                      <div className="flex items-start space-x-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-purple-700 rounded-xl flex items-center justify-center">
                          <Shield className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">Secure Payments</h3>
                          <p className="text-gray-600 leading-relaxed">Get paid securely and on time with enterprise-grade payment processing</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-8">
                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-300">
                      <div className="flex items-start space-x-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-xl flex items-center justify-center">
                          <Truck className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">Logistics Solutions</h3>
                          <p className="text-gray-600 leading-relaxed">Access to comprehensive shipping and fulfillment services</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-300">
                      <div className="flex items-start space-x-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-indigo-700 rounded-xl flex items-center justify-center">
                          <Globe className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">Global Reach</h3>
                          <p className="text-gray-600 leading-relaxed">Sell to customers worldwide with our international marketplace</p>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8 hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-300">
                      <div className="flex items-start space-x-6">
                        <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-red-700 rounded-xl flex items-center justify-center">
                          <Star className="h-6 w-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">Analytics Dashboard</h3>
                          <p className="text-gray-600 leading-relaxed">Track your sales and performance metrics with real-time analytics</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'requirements' && (
              <div className="space-y-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Enterprise Requirements</h2>
                
                <div className="bg-white rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Basic Requirements</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {requirements.map((requirement, index) => (
                      <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-2xl">
                        <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
                        <span className="text-gray-700 font-medium">{requirement}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-3xl p-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">What We Look For</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <ul className="space-y-4 text-gray-700">
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Quality products that meet our enterprise standards</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Reliable shipping and fulfillment capabilities</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Excellent customer service commitment</span>
                      </li>
                    </ul>
                    <ul className="space-y-4 text-gray-700">
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Competitive pricing and market knowledge</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Willingness to grow and adapt</span>
                      </li>
                      <li className="flex items-start space-x-3">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                        <span>Compliance with enterprise policies</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'process' && (
              <div className="space-y-12">
                <h2 className="text-3xl font-bold text-gray-900 mb-8">Application Process</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {steps.map((step, index) => (
                    <div key={index} className="text-center group">
                      <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-3xl bg-gradient-to-r from-primary-600 to-secondary-600 mb-6 group-hover:scale-110 transition-transform duration-300">
                        <span className="text-3xl font-bold text-white">{step.number}</span>
                      </div>
                      <h3 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h3>
                      <p className="text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-12">
                  <Link
                    href="/register/supplier"
                    className="inline-flex items-center px-10 py-5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white rounded-2xl font-semibold text-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
                  >
                    <Zap className="h-6 w-6 mr-3" />
                    Apply Now
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
} 
