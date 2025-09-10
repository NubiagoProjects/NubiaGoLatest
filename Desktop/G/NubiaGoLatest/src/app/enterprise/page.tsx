'use client'

import Link from 'next/link'
import { Building, Users, Shield, Zap, ArrowRight, CheckCircle } from 'lucide-react'

export default function EnterprisePage() {
  const features = [
    {
      title: 'Custom Integration',
      description: 'Seamlessly integrate our marketplace into your existing systems and workflows',
      icon: Zap
    },
    {
      title: 'Dedicated Support',
      description: '24/7 priority support with dedicated account managers and technical specialists',
      icon: Users
    },
    {
      title: 'Advanced Security',
      description: 'Enterprise-grade security with custom authentication and compliance features',
      icon: Shield
    },
    {
      title: 'White-Label Solutions',
      description: 'Custom branding and private marketplace solutions for your organization',
      icon: Building
    }
  ]

  const solutions = [
    {
      title: 'B2B Marketplace',
      description: 'Connect your business customers with verified suppliers and streamline procurement processes.',
      benefits: ['Bulk ordering capabilities', 'Custom pricing tiers', 'Approval workflows', 'Analytics dashboard']
    },
    {
      title: 'Supplier Network',
      description: 'Access our extensive network of verified suppliers across multiple categories and regions.',
      benefits: ['Vetted supplier database', 'Quality assurance', 'Performance tracking', 'Risk management']
    },
    {
      title: 'Custom Development',
      description: 'Tailored solutions built specifically for your business requirements and industry needs.',
      benefits: ['Custom API development', 'Integration services', 'Training and onboarding', 'Ongoing maintenance']
    }
  ]

  const testimonials = [
    {
      company: 'TechCorp Nigeria',
      role: 'Procurement Director',
      quote: 'NubiaGo\'s enterprise solution has transformed our procurement process. We\'ve reduced costs by 30% and improved supplier relationships significantly.',
      name: 'Sarah Okonkwo'
    },
    {
      company: 'Global Retail Group',
      role: 'IT Manager',
      quote: 'The custom integration was seamless and the support team is exceptional. Our e-commerce platform now connects directly with NubiaGo\'s marketplace.',
      name: 'Michael Chen'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Enterprise Solutions
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Scale your business with our enterprise-grade marketplace solutions. Custom integrations, dedicated support, and white-label options for large organizations.
            </p>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="py-16 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Enterprise Features
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <feature.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {feature.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Solutions */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Enterprise Solutions
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {solutions.map((solution, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {solution.title}
                </h3>
                <p className="text-gray-600 mb-4">
                  {solution.description}
                </p>
                <ul className="space-y-2">
                  {solution.benefits.map((benefit, benefitIndex) => (
                    <li key={benefitIndex} className="flex items-center text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-500 mr-2 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Testimonials */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            What Our Enterprise Clients Say
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <span className="text-blue-600 font-bold">
                      {testimonial.name.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                    <p className="text-sm text-gray-600">{testimonial.role}</p>
                    <p className="text-sm text-gray-500">{testimonial.company}</p>
                  </div>
                </div>
                <p className="text-gray-600 italic">
                  "{testimonial.quote}"
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pricing Tiers */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Enterprise Pricing
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Starter</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">Custom</div>
              <p className="text-gray-600 mb-6">Perfect for growing businesses</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Basic API access
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Email support
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Standard integration
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border border-blue-500 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                  Most Popular
                </span>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Professional</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">Custom</div>
              <p className="text-gray-600 mb-6">For established enterprises</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Full API access
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Priority support
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Custom integration
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Dedicated account manager
                </li>
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg border">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Enterprise</h3>
              <div className="text-3xl font-bold text-blue-600 mb-4">Custom</div>
              <p className="text-gray-600 mb-6">For large organizations</p>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  White-label solution
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  24/7 dedicated support
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  Custom development
                </li>
                <li className="flex items-center text-sm">
                  <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                  SLA guarantees
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Scale Your Business?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Let's discuss how NubiaGo's enterprise solutions can help your organization grow.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Schedule a Demo
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
