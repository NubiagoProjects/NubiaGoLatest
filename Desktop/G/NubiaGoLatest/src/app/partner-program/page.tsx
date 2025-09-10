'use client'

import Link from 'next/link'
import { Users, TrendingUp, Award, Globe, ArrowRight, Users2 } from 'lucide-react'

export default function PartnerProgramPage() {
  const benefits = [
    {
      title: 'Revenue Sharing',
      description: 'Earn commissions on every sale made through your referral',
      icon: TrendingUp
    },
    {
      title: 'Marketing Support',
      description: 'Access to marketing materials, banners, and promotional content',
      icon: Globe
    },
    {
      title: 'Dedicated Support',
      description: 'Personal account manager and priority customer service',
      icon: Users
    },
    {
      title: 'Performance Rewards',
      description: 'Bonus incentives for top-performing partners',
      icon: Award
    }
  ]

  const partnerTypes = [
    {
      type: 'Affiliate Partners',
      description: 'Promote our products and earn commissions on sales',
      commission: '5-15%',
      requirements: ['Active website or social media presence', 'Quality content and engagement', 'Compliance with our guidelines']
    },
    {
      type: 'Reseller Partners',
      description: 'Sell our products through your own channels',
      commission: '10-25%',
      requirements: ['Business license and tax registration', 'Established customer base', 'Inventory management capabilities']
    },
    {
      type: 'Technology Partners',
      description: 'Integrate our platform with your software solutions',
      commission: 'Custom',
      requirements: ['Technical expertise and resources', 'API integration capabilities', 'Support for mutual customers']
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Partner Program
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Join our network of trusted partners and grow your business while helping us reach more customers across Africa.
            </p>
          </div>
        </div>
      </div>

      {/* Why Partner */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Why Partner With NubiaGo?
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => (
              <div key={index} className="bg-gray-50 p-6 rounded-lg border">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4">
                    <benefit.icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {benefit.title}
                  </h3>
                </div>
                <p className="text-gray-600">
                  {benefit.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Partner Types */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Partnership Opportunities
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {partnerTypes.map((partner, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                    <Users2 className="h-8 w-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {partner.type}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {partner.description}
                  </p>
                  <div className="text-2xl font-bold text-blue-600">
                    {partner.commission}
                  </div>
                  <div className="text-sm text-gray-500">Commission Rate</div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Requirements:</h4>
                  <ul className="space-y-2">
                    {partner.requirements.map((requirement, reqIndex) => (
                      <li key={reqIndex} className="flex items-start text-sm text-gray-600">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-2 flex-shrink-0"></div>
                        {requirement}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Success Stories */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Partner Success Stories
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-green-600 font-bold">A</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Aisha's Fashion Blog</h3>
                  <p className="text-sm text-gray-600">Affiliate Partner</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Since joining NubiaGo's partner program, I've been able to monetize my fashion blog while introducing my readers to amazing African fashion brands. The commission structure is fair and the support team is always helpful."
              </p>
              <div className="text-sm text-gray-500">
                <strong>Result:</strong> 40% increase in monthly revenue
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                  <span className="text-blue-600 font-bold">K</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Kemi's Tech Solutions</h3>
                  <p className="text-sm text-gray-600">Technology Partner</p>
                </div>
              </div>
              <p className="text-gray-600 mb-4">
                "Integrating NubiaGo's API into our e-commerce platform has opened up new revenue streams for our clients. The technical documentation is excellent and the partnership team is very responsive."
              </p>
              <div className="text-sm text-gray-500">
                <strong>Result:</strong> 25 new enterprise clients
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Application Process */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            How to Apply
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                1
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Submit Application</h3>
              <p className="text-sm text-gray-600">
                Fill out our partner application form with your business details
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                2
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Review Process</h3>
              <p className="text-sm text-gray-600">
                Our team will review your application within 5 business days
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                3
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Onboarding</h3>
              <p className="text-sm text-gray-600">
                Complete partner onboarding and receive your welcome kit
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-full flex items-center justify-center mx-auto mb-4 text-lg font-bold">
                4
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Start Earning</h3>
              <p className="text-sm text-gray-600">
                Begin promoting and earning commissions on successful sales
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Ready to Join Our Partner Program?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Start earning commissions and growing your business with NubiaGo today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Apply Now
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
            <Link 
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
} 
