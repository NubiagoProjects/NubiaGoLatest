'use client'

import Link from 'next/link'
import { Calendar, Download, ExternalLink, FileText, Users, TrendingUp } from 'lucide-react'

export default function PressPage() {
  const pressReleases = [
    {
      title: 'NubiaGo Launches New Mobile App',
      date: 'March 15, 2024',
      summary: 'NubiaGo announces the launch of its new mobile application, making it easier for customers to shop and suppliers to manage their stores.',
      category: 'Product Launch'
    },
    {
      title: 'Partnership with Major African Retailers',
      date: 'February 28, 2024',
      summary: 'NubiaGo forms strategic partnerships with leading retailers across Africa to expand its marketplace reach.',
      category: 'Partnership'
    },
    {
      title: 'Series A Funding Round Completed',
      date: 'January 10, 2024',
      summary: 'NubiaGo secures $5M in Series A funding to accelerate growth and expand operations across Africa.',
      category: 'Funding'
    }
  ]

  const mediaKit = {
    logo: '/api/press/logo',
    images: '/api/press/images',
    factSheet: '/api/press/fact-sheet',
    teamPhotos: '/api/press/team'
  }

  const stats = [
    { label: 'Active Users', value: '50K+', icon: Users },
    { label: 'Suppliers', value: '2K+', icon: TrendingUp },
    { label: 'Products Listed', value: '100K+', icon: FileText }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Press & Media
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Stay updated with the latest news, press releases, and media resources from NubiaGo.
            </p>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            NubiaGo at a Glance
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <stat.icon className="h-8 w-8 text-blue-600" />
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Press Releases */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Latest Press Releases
          </h2>
          <div className="space-y-8">
            {pressReleases.map((release, index) => (
              <div key={index} className="bg-white p-6 rounded-lg border">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                        {release.category}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm">
                        <Calendar className="h-4 w-4 mr-1" />
                        {release.date}
                      </div>
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">
                      {release.title}
                    </h3>
                    <p className="text-gray-600 mb-4">
                      {release.summary}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <Link 
                    href={`/press/${release.title.toLowerCase().replace(/\s+/g, '-')}`}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Read Full Release
                    <ExternalLink className="h-4 w-4 ml-1" />
                  </Link>
                  <Link 
                    href={`/press/${release.title.toLowerCase().replace(/\s+/g, '-')}/pdf`}
                    className="inline-flex items-center text-gray-600 hover:text-gray-700"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download PDF
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Media Kit */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Media Resources
          </h2>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Brand Assets
              </h3>
              <div className="space-y-3">
                <Link 
                  href={mediaKit.logo}
                  className="flex items-center justify-between p-3 bg-white rounded border hover:shadow-sm transition-shadow"
                >
                  <span>Company Logo</span>
                  <Download className="h-4 w-4 text-gray-400" />
                </Link>
                <Link 
                  href={mediaKit.images}
                  className="flex items-center justify-between p-3 bg-white rounded border hover:shadow-sm transition-shadow"
                >
                  <span>Product Images</span>
                  <Download className="h-4 w-4 text-gray-400" />
                </Link>
                <Link 
                  href={mediaKit.teamPhotos}
                  className="flex items-center justify-between p-3 bg-white rounded border hover:shadow-sm transition-shadow"
                >
                  <span>Team Photos</span>
                  <Download className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </div>
            <div className="bg-gray-50 p-6 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Company Information
              </h3>
              <div className="space-y-3">
                <Link 
                  href={mediaKit.factSheet}
                  className="flex items-center justify-between p-3 bg-white rounded border hover:shadow-sm transition-shadow"
                >
                  <span>Fact Sheet</span>
                  <Download className="h-4 w-4 text-gray-400" />
                </Link>
                <Link 
                  href="/about"
                  className="flex items-center justify-between p-3 bg-white rounded border hover:shadow-sm transition-shadow"
                >
                  <span>Company Overview</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
                <Link 
                  href="/contact"
                  className="flex items-center justify-between p-3 bg-white rounded border hover:shadow-sm transition-shadow"
                >
                  <span>Contact Information</span>
                  <ExternalLink className="h-4 w-4 text-gray-400" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Section */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Media Inquiries
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            For press inquiries, interviews, or additional information, please contact our media team.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/contact"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
            >
              Contact Media Team
            </Link>
            <a 
              href="mailto:press@nubiago.com"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
            >
              press@nubiago.com
            </a>
          </div>
        </div>
      </div>
    </div>
  )
} 
