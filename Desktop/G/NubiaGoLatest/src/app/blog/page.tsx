'use client'

import Link from 'next/link'
import { Calendar, User, Clock, ArrowRight, Tag } from 'lucide-react'

export default function BlogPage() {
  const blogPosts = [
    {
      title: 'The Future of E-commerce in Africa',
      excerpt: 'How digital transformation is reshaping retail across the continent and what it means for businesses and consumers.',
      author: 'Sarah Johnson',
      date: 'March 20, 2024',
      readTime: '5 min read',
      category: 'Industry Insights',
      image: '/api/blog/future-ecommerce-africa'
    },
    {
      title: 'Building Trust in Online Marketplaces',
      excerpt: 'Essential strategies for creating secure and trustworthy e-commerce platforms that customers love.',
      author: 'Michael Chen',
      date: 'March 15, 2024',
      readTime: '4 min read',
      category: 'Business Strategy',
      image: '/api/blog/building-trust-marketplaces'
    },
    {
      title: 'Supporting Local Artisans Through Technology',
      excerpt: 'How NubiaGo is helping traditional craftspeople reach global markets through our platform.',
      author: 'Aisha Oke',
      date: 'March 10, 2024',
      readTime: '6 min read',
      category: 'Community',
      image: '/api/blog/supporting-local-artisans'
    },
    {
      title: 'Payment Solutions for African Markets',
      excerpt: 'Understanding the unique challenges and opportunities in digital payments across different African countries.',
      author: 'David Mwangi',
      date: 'March 5, 2024',
      readTime: '7 min read',
      category: 'Technology',
      image: '/api/blog/payment-solutions-africa'
    },
    {
      title: 'Sustainable Business Practices in E-commerce',
      excerpt: 'How we\'re implementing eco-friendly practices while building a successful marketplace.',
      author: 'Emma Thompson',
      date: 'February 28, 2024',
      readTime: '5 min read',
      category: 'Sustainability',
      image: '/api/blog/sustainable-business-practices'
    },
    {
      title: 'Customer Success Stories: From Local to Global',
      excerpt: 'Real stories from suppliers who have grown their businesses from local markets to international customers.',
      author: 'James Okonkwo',
      date: 'February 20, 2024',
      readTime: '8 min read',
      category: 'Success Stories',
      image: '/api/blog/customer-success-stories'
    }
  ]

  const categories = [
    'All Posts',
    'Industry Insights',
    'Business Strategy',
    'Technology',
    'Community',
    'Sustainability',
    'Success Stories'
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              NubiaGo Blog
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Insights, stories, and updates from our team and community. Discover the latest in e-commerce, technology, and business growth.
            </p>
          </div>
        </div>
      </div>

      {/* Categories Filter */}
      <div className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-wrap gap-2 justify-center">
            {categories.map((category, index) => (
              <button
                key={index}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  index === 0 
                    ? 'bg-blue-600 text-white' 
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Featured Post */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-50 rounded-lg p-8">
            <div className="flex items-center space-x-2 mb-4">
              <span className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full">
                Featured
              </span>
              <span className="px-3 py-1 bg-green-100 text-green-800 text-sm font-medium rounded-full">
                {blogPosts[0].category}
              </span>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              {blogPosts[0].title}
            </h2>
            <p className="text-lg text-gray-600 mb-6">
              {blogPosts[0].excerpt}
            </p>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  {blogPosts[0].author}
                </div>
                <div className="flex items-center">
                  <Calendar className="h-4 w-4 mr-1" />
                  {blogPosts[0].date}
                </div>
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-1" />
                  {blogPosts[0].readTime}
                </div>
              </div>
              <Link 
                href={`/blog/${blogPosts[0].title.toLowerCase().replace(/\s+/g, '-')}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
              >
                Read Full Article
                <ArrowRight className="h-4 w-4 ml-1" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Blog Posts Grid */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
            Latest Articles
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {blogPosts.slice(1).map((post, index) => (
              <article key={index} className="bg-white rounded-lg border hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                      {post.category}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-gray-600 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3 text-sm text-gray-500">
                      <div className="flex items-center">
                        <User className="h-3 w-3 mr-1" />
                        {post.author}
                      </div>
                      <div className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {post.readTime}
                      </div>
                    </div>
                    <Link 
                      href={`/blog/${post.title.toLowerCase().replace(/\s+/g, '-')}`}
                      className="inline-flex items-center text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Read More
                      <ArrowRight className="h-3 w-3 ml-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Section */}
      <div className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Stay Updated
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Get the latest insights and stories delivered to your inbox. No spam, just valuable content.
          </p>
          <div className="max-w-md mx-auto">
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 
