'use client'

import React, { useState, useEffect } from 'react'
import { Product } from '@/types'
import { aiRecommendationService, RecommendationContext } from '@/lib/services/ai-recommendation.service'
import { useAuth } from '@/hooks/useAuth'
import { ProductCard } from './ProductCard'
import { Loader2, Sparkles, TrendingUp, Heart, Eye } from 'lucide-react'

interface AIRecommendationsProps {
  context?: RecommendationContext
  title?: string
  limit?: number
  showReasons?: boolean
  className?: string
}

export function AIRecommendations({
  context = {},
  title = "Recommended for You",
  limit = 6,
  showReasons = true,
  className = ""
}: AIRecommendationsProps) {
  const { user } = useAuth()
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [algorithm, setAlgorithm] = useState<string>('')
  const [reasons, setReasons] = useState<{ [productId: string]: string[] }>({})

  useEffect(() => {
    loadRecommendations()
  }, [user?.id, context, limit])

  const loadRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)

      const recommendationContext: RecommendationContext = {
        ...context,
        userId: user?.id
      }

      const result = await aiRecommendationService.getPersonalizedRecommendations(
        recommendationContext,
        limit
      )

      setProducts(result.products)
      setAlgorithm(result.algorithm)
      
      // Map reasons to products
      const reasonsMap: { [productId: string]: string[] } = {}
      result.scores.forEach(score => {
        reasonsMap[score.productId] = score.reasons
      })
      setReasons(reasonsMap)

    } catch (err) {
      console.error('Error loading recommendations:', err)
      setError('Failed to load recommendations')
    } finally {
      setLoading(false)
    }
  }

  const getAlgorithmIcon = () => {
    switch (algorithm) {
      case 'hybrid':
        return <Sparkles className="h-5 w-5 text-purple-500" />
      case 'content-based':
        return <Eye className="h-5 w-5 text-blue-500" />
      case 'fallback':
        return <TrendingUp className="h-5 w-5 text-green-500" />
      default:
        return <Heart className="h-5 w-5 text-red-500" />
    }
  }

  const getAlgorithmDescription = () => {
    switch (algorithm) {
      case 'hybrid':
        return 'AI-powered personalized recommendations based on your preferences and similar users'
      case 'content-based':
        return 'Recommendations based on product features and categories you like'
      case 'fallback':
        return 'Popular and trending products'
      default:
        return 'Curated product suggestions'
    }
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <span className="ml-2 text-gray-600">Loading recommendations...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={loadRecommendations}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  if (products.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-sm p-6 ${className}`}>
        <div className="text-center py-8">
          <Sparkles className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No recommendations available at the moment.</p>
          <p className="text-sm text-gray-500 mt-2">
            Browse more products to get personalized suggestions!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-white rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {getAlgorithmIcon()}
            <div>
              <h2 className="text-xl font-semibold text-gray-900">{title}</h2>
              <p className="text-sm text-gray-500 mt-1">
                {getAlgorithmDescription()}
              </p>
            </div>
          </div>
          
          {algorithm && (
            <div className="flex items-center space-x-2">
              <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                {algorithm.replace('-', ' ')}
              </span>
              {algorithm === 'hybrid' && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span className="text-xs text-purple-600 font-medium">AI</span>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Products Grid */}
      <div className="p-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="relative">
              <ProductCard product={product} />
              
              {/* Recommendation Reasons */}
              {showReasons && reasons[product.id] && reasons[product.id].length > 0 && (
                <div className="mt-3 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border border-blue-100">
                  <div className="flex items-start space-x-2">
                    <Sparkles className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs font-medium text-blue-700 mb-1">
                        Why we recommend this:
                      </p>
                      <ul className="text-xs text-blue-600 space-y-1">
                        {reasons[product.id].slice(0, 2).map((reason, index) => (
                          <li key={index} className="flex items-start">
                            <span className="w-1 h-1 bg-blue-400 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                            {reason}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Load More Button */}
        {products.length >= limit && (
          <div className="text-center mt-8">
            <button
              onClick={() => loadRecommendations()}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg font-medium hover:from-blue-700 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 shadow-lg"
            >
              <Sparkles className="h-4 w-4 inline mr-2" />
              Discover More
            </button>
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between text-xs text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Powered by AI</span>
            <span>•</span>
            <span>Updated in real-time</span>
          </div>
          {user && (
            <span>Personalized for {user.name || user.email}</span>
          )}
        </div>
      </div>
    </div>
  )
}

// Specialized recommendation components
export function SimilarProducts({ productId, className }: { productId: string; className?: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadSimilar = async () => {
      try {
        const similar = await aiRecommendationService.getSimilarProducts(productId, 4)
        setProducts(similar)
      } catch (error) {
        console.error('Error loading similar products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadSimilar()
  }, [productId])

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-64 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  if (products.length === 0) return null

  return (
    <div className={className}>
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
        <Eye className="h-5 w-5 mr-2 text-blue-500" />
        Similar Products
      </h3>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

export function TrendingProducts({ className }: { className?: string }) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadTrending = async () => {
      try {
        const trending = await aiRecommendationService.getTrendingProducts(6)
        setProducts(trending)
      } catch (error) {
        console.error('Error loading trending products:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTrending()
  }, [])

  if (loading) {
    return (
      <div className={`animate-pulse ${className}`}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-gray-200 h-80 rounded-lg"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <AIRecommendations
      title="Trending Now"
      context={{}}
      limit={6}
      showReasons={false}
      className={className}
    />
  )
}
