'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Star, ShoppingCart, Heart, ArrowRight, Clock, Users, Award, ChevronLeft, ChevronRight, Search, Shirt, Laptop, Globe } from 'lucide-react'
import { productService } from '@/lib/services/product.service'
import { promotionService } from '@/lib/services/promotion.service'
import { Product, Deal } from '@/types'
import PullToRefresh from '@/components/mobile/PullToRefresh'

// ============================================================================
// HERO SECTION
// ============================================================================

function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Section 1: Fashion Apparel Image */}
          <div className="relative">
            <div className="relative aspect-[16/9] lg:aspect-[3/2] rounded-2xl overflow-hidden shadow-xl">
              <Image
                src="/hero-fashion.jpg"
                alt="Fashion hero image showcasing stylish clothing and accessories"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>

          {/* Section 2: Search Bar and Content */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="bg-white/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium">
                Global 34+ Countries in Africa
              </span>
              <span className="bg-yellow-500/20 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-medium text-yellow-200">
                Star Best Quality Products
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight">
              Find what you need, 
              <span className="text-yellow-400">faster!</span>
            </h2>

            <p className="text-lg text-white/90 mb-4 max-w-xl">
              Shop everyday essentials from trusted sellers across Africa — simple, quick, and reliable.
            </p>

            {/* Search Bar */}
            <div className="relative max-w-xl mb-4">
              <input type="text" 
                     placeholder="e.g., smartphone, lipstick, washing machine..." 
                     className="w-full px-4 py-3 pr-12 rounded-full text-neutral-900 placeholder-neutral-500 focus:outline-none focus:ring-4 focus:ring-white/20 shadow-lg" />
              <button className="absolute right-1 top-1 bg-primary-600 hover:bg-primary-700 text-white p-2 rounded-full transition-colors">
                <Search className="h-4 w-4" />
              </button>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap gap-4">
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">10M+</div>
                <div className="text-white/80 text-xs">Happy Customers</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">500K+</div>
                <div className="text-white/80 text-xs">Products</div>
              </div>
              <div className="text-center">
                <div className="text-xl font-bold text-yellow-400">34+</div>
                <div className="text-white/80 text-xs">Countries</div>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-3">
              <Link href="/products" className="inline-flex items-center justify-center px-6 py-3 bg-yellow-500 hover:bg-yellow-400 text-gray-900 font-bold rounded-full transition-all duration-300 transform hover:scale-105 shadow-lg">
                Start Shopping
                <Search className="h-4 w-4 ml-2" />
              </Link>
              <Link href="/products?category=Fashion" className="inline-flex items-center justify-center px-6 py-3 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-semibold rounded-full border border-white/20 transition-all duration-300">
                Explore Fashion
                <Shirt className="h-4 w-4 ml-2" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Background Decorative Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-yellow-400/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-white/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  )
}

// ============================================================================
// NEW ARRIVALS SECTION
// ============================================================================

function NewArrivalsSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchNewestProducts = async () => {
      try {
        setLoading(true)
        const newestProducts = await productService.getNewestProducts(6)
        setProducts(newestProducts)
      } catch (error) {
        console.error('Error fetching newest products:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchNewestProducts()
  }, [])

  return (
    <section className="relative py-20 bg-neutral-50 overflow-hidden">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-4 py-2 bg-primary-600 text-white text-sm font-semibold rounded-full mb-4">
            <span className="w-2 h-2 bg-white rounded-full mr-2"></span>
            Fresh Arrivals
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-neutral-900 mb-4">
            New Arrivals
          </h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto leading-relaxed">
            Curated selection of premium products, handpicked for discerning customers
          </p>
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="bg-white rounded-2xl border border-neutral-200 shadow-soft overflow-hidden animate-pulse">
                <div className="aspect-[4/5] bg-neutral-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-neutral-200 rounded"></div>
                  <div className="h-3 bg-neutral-200 rounded w-2/3"></div>
                </div>
              </div>
            ))
          ) : (
            products.map((product) => {
              // Determine badge based on product properties
              const isNew = product.createdAt && new Date(product.createdAt).getTime() > Date.now() - (30 * 24 * 60 * 60 * 1000) // 30 days
              const badge = isNew ? 'New' : (product.featured ? 'Hot' : null)
              
              return (
                <div key={product.id} className="bg-white rounded-2xl border border-neutral-200 shadow-soft overflow-hidden">
                  <div className="relative aspect-[4/5] overflow-hidden">
                    <Link href={`/products/${product.id}`}>
                      <Image
                        src={product.images?.[0] || product.image || '/placeholder-product.jpg'}
                        alt={product.name}
                        width={400}
                        height={500}
                        className="w-full h-full object-cover"
                      />
                    </Link>
                    
                    {/* Badge */}
                    {badge && (
                      <div className={`absolute top-3 left-3 ${badge === 'New' ? 'bg-primary-600' : 'bg-yellow-500'} text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-medium`}>
                        {badge}
                      </div>
                    )}
                    
                    {/* Quick Actions */}
                    <div className="absolute top-3 right-3">
                      <Link href="/wishlist" className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-medium">
                        <Heart className="h-4 w-4 text-neutral-700" />
                      </Link>
                    </div>
                  </div>
                  
                  {/* Product Info */}
                  <div className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <Link href={`/products/${product.id}`} className="text-sm font-semibold text-neutral-900 line-clamp-2 leading-tight">
                        {product.name}
                      </Link>
                      <div className="text-sm font-bold text-primary-600 ml-2">${product.price}</div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1">
                        <div className="flex text-yellow-500">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="h-3 w-3 fill-current" />
                          ))}
                        </div>
                        <span className="text-xs text-neutral-500 ml-1">({product.reviewCount || 0})</span>
                      </div>
                      <Link href={`/products/${product.id}`} className="text-xs text-neutral-500">
                        Quick View
                      </Link>
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <Link href="/products" className="inline-flex items-center px-8 py-4 bg-primary-600 text-white font-semibold rounded-2xl shadow-medium">
            View All New Arrivals
            <ArrowRight className="w-5 h-5 ml-2" />
          </Link>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// SHOP BY CATEGORIES SECTION
// ============================================================================

function ShopByCategoriesSection() {
  const categories = [
    {
      id: 1,
      name: 'Women',
              image: '/category-electronics.jpg',
      count: '750+ Products',
      href: '/products?category=Women'
    },
    {
      id: 2,
      name: 'Men',
              image: '/category-men.jpg',
      count: '600+ Products',
      href: '/products?category=Men'
    },
    {
      id: 3,
      name: 'Mother & Child',
              image: '/category-mother-child.jpg',
      count: '450+ Products',
      href: '/products?category=Mother & Child'
    },
    {
      id: 4,
      name: 'Home & Living',
              image: '/category-home-living.jpg',
      count: '500+ Products',
      href: '/products?category=Home & Living'
    },
    {
      id: 5,
      name: 'Cosmetics',
              image: '/product-lipstick-1.jpg',
      count: '400+ Products',
      href: '/products?category=Cosmetics'
    },
    {
      id: 6,
      name: 'Shoes & Bags',
              image: '/category-shoes-bags.jpg',
      count: '350+ Products',
      href: '/products?category=Shoes & Bags'
    },
    {
      id: 7,
      name: 'Electronics',
              image: '/category-electronics-2.jpg',
      count: '600+ Products',
      href: '/products?category=Electronics'
    }
  ]

  return (
    <section className="py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Shop by Categories</h2>
          <p className="text-lg text-gray-600">Explore our wide range of product categories</p>
        </div>

        <div className="grid grid-cols-6 gap-6">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={category.href}
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-2"
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={category.image}
                  alt={category.name}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end">
                  <div className="p-8 text-white">
                    <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mb-4">
                      <Laptop className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold mb-2">{category.name}</h3>
                    <p className="text-white/80">{category.count}</p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// FASHION COLLECTION SECTION
// ============================================================================

function FashionCollectionSection() {
  return (
    <section className="relative py-12 bg-gradient-to-br from-slate-50 via-white to-slate-50 overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%23f1f5f9%22%20fill-opacity%3D%220.4%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%222%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-20"></div>
      
      <div className="relative w-full px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Content Side */}
          <div className="space-y-6">
            {/* Premium Header */}
            <div className="space-y-3">
              <div className="inline-flex items-center px-3 py-1.5 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-xs font-semibold rounded-full mb-4 shadow-lg">
                <span className="w-1.5 h-1.5 bg-white rounded-full mr-2 animate-pulse"></span>
                New Collection
              </div>
              <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent leading-tight">
                Fashion Forward
              </h2>
              <div className="space-y-1">
                <h3 className="text-lg lg:text-xl text-gray-700 font-semibold">The Urban Style Collection</h3>
                <h4 className="text-base lg:text-lg text-gray-500">Street Series</h4>
              </div>
            </div>

            {/* Product Previews - Larger and More Prominent */}
            <div className="grid grid-cols-4 gap-3">
              <Link href="/products?category=Fashion" className="group relative aspect-[1/2] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/ui-logo-1.jpg"
                  alt="Denim Jacket"
                  width={120}
                  height={240}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href="/products?category=Fashion" className="group relative aspect-[1/2] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/ui-logo-2.jpg"
                  alt="Casual Wear"
                  width={120}
                  height={240}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href="/products?category=Fashion" className="group relative aspect-[1/2] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/ui-logo-3.jpg"
                  alt="Sneakers"
                  width={120}
                  height={240}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
              <Link href="/products?category=Fashion" className="group relative aspect-[1/2] rounded-xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                <Image
                  src="/ui-logo-4.jpg"
                  alt="Accessories"
                  width={120}
                  height={240}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Link>
            </div>

            {/* Description - More Compact */}
            <p className="text-gray-600 leading-relaxed max-w-lg text-sm lg:text-base">
              With a style inspired by urban streets and contemporary fashion trends for the modern lifestyle.
            </p>

            {/* Premium CTA */}
            <div className="flex items-center space-x-4">
              <Link href="/products?category=Fashion" className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-gray-900 to-gray-800 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300">
                Shop Collection
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>Hot Trending</span>
                <span>•</span>
                <span>2.4k+ Sold</span>
              </div>
            </div>
          </div>

          {/* Hero Image - Larger and More Impactful */}
          <div className="relative group">
            <div className="relative rounded-3xl overflow-hidden shadow-[0_20px_60px_rgb(0,0,0,0.15)] hover:shadow-[0_30px_80px_rgb(0,0,0,0.25)] transition-all duration-500 hover:-translate-y-2">
              <Link href="/products?category=Fashion">
                <Image
                  src="/hero-cosmetics-banner.jpg"
                  alt="Fashion Collection Showcase"
                  width={700}
                  height={500}
                  className="w-full h-[500px] lg:h-[600px] object-cover group-hover:scale-105 transition-transform duration-700"
                />
              </Link>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              
              {/* Floating Badge */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm text-gray-900 px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                Featured
              </div>
              
              {/* Quick Stats */}
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-lg">
                <div className="text-xs text-gray-600 mb-1">Collection Stats</div>
                <div className="flex items-center space-x-4 text-sm">
                  <div>
                    <div className="font-semibold text-gray-900">150+</div>
                    <div className="text-gray-500">Items</div>
                  </div>
                  <div>
                    <div className="font-semibold text-gray-900 flex items-center">
                      4.8<Star className="h-3 w-3 text-yellow-400 fill-current ml-1" />
                    </div>
                    <div className="text-gray-500">Rating</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
// SHOP OUR OFFERS SECTION
// ============================================================================

function ShopOurOffersSection() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProductsOnSale = async () => {
      try {
        setLoading(true)
        const saleProducts = await productService.getProductsOnSale(5)
        setProducts(saleProducts)
      } catch (error) {
        console.error('Error fetching products on sale:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProductsOnSale()
  }, [])

  return (
    <section className="py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Shop Our Offers</h2>
            <p className="text-lg text-gray-600">Adorable styles for little ones at unbeatable prices.</p>
          </div>
          <Link href="/products" className="flex items-center space-x-2 text-gray-900 font-semibold hover:text-primary-600 transition-colors mt-4 lg:mt-0">
            Shop All Products
            →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-6">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 5 }).map((_, index) => (
              <div key={index} className="bg-gray-50 rounded-xl overflow-hidden animate-pulse">
                <div className="h-48 bg-gray-200"></div>
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                </div>
              </div>
            ))
          ) : (
            products.map((product) => {
              const discountPercentage = product.originalPrice 
                ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
                : 0
              
              return (
                <Link key={product.id} href={`/products/${product.id}`} className="bg-gray-50 rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 hover:-translate-y-2">
                  <div className="relative">
                    <Image
                      src={product.images?.[0] || product.image || '/placeholder-product.jpg'}
                      alt={product.name}
                      width={300}
                      height={200}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-3 left-3 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-semibold">
                      {discountPercentage}% OFF
                    </div>
                  </div>
                  <div className="p-4">
                    <div className="text-xs text-gray-500 uppercase tracking-wide mb-1">{product.category}</div>
                    <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{product.name}</h3>
                    <div className="flex items-center space-x-2 mb-3">
                      <span className="text-lg font-bold text-primary-600">${product.price}</span>
                      {product.originalPrice && (
                        <span className="text-sm text-gray-500 line-through">${product.originalPrice}</span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex text-yellow-500">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className={`h-3 w-3 ${i < Math.floor(product.rating || 0) ? 'fill-current' : 'stroke-current fill-none'}`} />
                        ))}
                      </div>
                      <span className="text-xs text-gray-500">Save ${product.originalPrice ? (product.originalPrice - product.price).toFixed(2) : '0'}</span>
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// TESTIMONIALS SECTION
// ============================================================================

function TestimonialsSection() {
  const testimonials = [
    {
      id: 1,
      name: 'Sarah Johnson',
      role: 'Fashion Enthusiast',
              avatar: '/avatar-user-5.jpg',
      content: 'Amazing quality products and lightning-fast delivery! The customer service is exceptional.',
      rating: 5,
      location: 'Lagos, Nigeria'
    },
    {
      id: 2,
      name: 'David Chen',
      role: 'Tech Professional',
              avatar: '/avatar-user-2.jpg',
      content: 'Found exactly what I was looking for at great prices. Highly recommend this platform!',
      rating: 5,
      location: 'Nairobi, Kenya'
    },
    {
      id: 3,
      name: 'Amina Hassan',
      role: 'Home Decor Lover',
              avatar: '/avatar-user-3.jpg',
      content: 'The variety of products is incredible. I love how easy it is to find unique items.',
      rating: 5,
      location: 'Cairo, Egypt'
    }
  ]

  return (
    <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-primary-600 to-secondary-600 text-white text-sm font-semibold rounded-full mb-4 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            Customer Reviews
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 bg-clip-text text-transparent mb-4">
            What Our Customers Say
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Join thousands of satisfied customers across Africa who trust us for their shopping needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial) => (
            <div key={testimonial.id} className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-2">
              <div className="flex items-center mb-6">
                <Image
                  src={testimonial.avatar}
                  alt={testimonial.name}
                  width={60}
                  height={60}
                  className="w-15 h-15 rounded-full object-cover"
                />
                <div className="ml-4">
                  <h3 className="font-semibold text-gray-900">{testimonial.name}</h3>
                  <p className="text-sm text-gray-500">{testimonial.role}</p>
                  <p className="text-xs text-gray-400">{testimonial.location}</p>
                </div>
              </div>
              
              <div className="flex items-center mb-4">
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className="h-4 w-4 text-yellow-400 fill-current" />
                ))}
              </div>
              
              <p className="text-gray-600 leading-relaxed italic">
                "{testimonial.content}"
              </p>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <div className="flex items-center justify-center space-x-8 text-sm text-gray-500">
            <div className="flex items-center space-x-2">
              <Star className="h-6 w-6 text-yellow-400 fill-current" />
              <span>4.9/5 Average Rating</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-6 w-6 text-gray-600" />
              <span>50K+ Happy Customers</span>
            </div>
            <div className="flex items-center space-x-2">
              <Globe className="h-6 w-6 text-gray-600" />
              <span>34+ Countries</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// FEATURED DEALS SECTION
// ============================================================================

function FeaturedDealsSection() {
  const [deals, setDeals] = useState<Deal[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchFeaturedDeals = async () => {
      try {
        setLoading(true)
        const featuredDeals = await promotionService.getFeaturedDeals(3)
        setDeals(featuredDeals)
      } catch (error) {
        console.error('Error fetching featured deals:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchFeaturedDeals()
  }, [])

  return (
    <section className="py-16 bg-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12">
          <div>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Featured Deals</h2>
            <p className="text-lg text-gray-600">Don't miss out on these incredible offers</p>
          </div>
          <Link href="/products" className="flex items-center space-x-2 text-gray-900 font-semibold hover:text-primary-600 transition-colors mt-4 lg:mt-0">
            View All Deals
            →
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {loading ? (
            // Loading skeleton
            Array.from({ length: 3 }).map((_, index) => (
              <div key={index} className="rounded-3xl overflow-hidden animate-pulse">
                <div className="aspect-[4/3] bg-gray-200"></div>
                <div className="p-6 space-y-3">
                  <div className="h-6 bg-gray-200 rounded"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-4 bg-gray-200 rounded"></div>
                </div>
              </div>
            ))
          ) : (
            deals.map((deal) => {
              const timeLeft = new Date(deal.endDate).getTime() - Date.now()
              const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)))
              
              return (
                <Link key={deal.id} href={`/products/${deal.productId}`} className="group relative overflow-hidden rounded-3xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:shadow-[0_20px_60px_rgb(0,0,0,0.12)] transition-all duration-500 hover:-translate-y-3">
                  <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                      src="/category-electronics.jpg"
                      alt={deal.title}
                      width={400}
                      height={300}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
                    
                    {/* Badge */}
                    <div className={`absolute top-4 left-4 ${
                      deal.badge === 'Hot' ? 'bg-red-600' :
                      deal.badge === 'New' ? 'bg-green-600' :
                      deal.badge === 'Sale' ? 'bg-blue-600' :
                      deal.badge === 'Limited' ? 'bg-purple-600' :
                      'bg-primary-600'
                    } text-white px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg`}>
                      {deal.badge}
                    </div>
                    
                    {/* Time Left */}
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-gray-900 px-3 py-1.5 rounded-full text-xs font-semibold shadow-lg">
                      {daysLeft > 0 ? `${daysLeft} days left` : 'Ending soon'}
                    </div>
                  </div>
                  
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{deal.title}</h3>
                    <p className="text-2xl font-bold text-primary-600 mb-2">{deal.discountPercentage}% OFF</p>
                    <p className="text-gray-600 mb-4">{deal.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-lg font-bold text-gray-900">${deal.salePrice}</span>
                        <span className="text-sm text-gray-500 line-through">${deal.originalPrice}</span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                  </div>
                </Link>
              )
            })
          )}
        </div>
      </div>
    </section>
  )
}

// ============================================================================
// NEWSLETTER SECTION
// ============================================================================

function NewsletterSection() {
  return (
    <section className="py-16 bg-gradient-to-br from-primary-600 to-secondary-600 text-white">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm text-white text-sm font-semibold rounded-full mb-6 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></span>
            Stay Updated
          </div>
          
          <h2 className="text-4xl lg:text-5xl font-bold mb-6">
            Get the Latest Updates
          </h2>
          
          <p className="text-xl text-white/90 mb-8 max-w-2xl mx-auto leading-relaxed">
            Subscribe to our newsletter and be the first to know about new products, exclusive deals, and special offers.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
            <input
              type="email"
              placeholder="Enter your email address"
              className="flex-1 px-6 py-4 rounded-full text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-white/20"
            />
            <button className="bg-yellow-400 hover:bg-yellow-300 text-gray-900 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105 shadow-lg">
              Subscribe
            </button>
          </div>
          
          <p className="text-sm text-white/70 mt-4">
            By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
          </p>
        </div>
      </div>
    </section>
  )
}



// ============================================================================
// MAIN PAGE COMPONENT
// ============================================================================

export default function HomePage() {
  const [isClient, setIsClient] = useState(false)
  const [loadingTimeout, setLoadingTimeout] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'fallback' | 'error'>('fallback')

  useEffect(() => {
    setIsClient(true)
    
    // Temporarily skip Firebase connection check to fix loading issue
    setConnectionStatus('fallback')
    
    // Add timeout to prevent infinite loading
    const timeout = setTimeout(() => {
      setLoadingTimeout(true)
    }, 3000) // Reduced to 3 seconds timeout
    
    return () => clearTimeout(timeout)
  }, [])

  // Handle search functionality
  const handleSearch = (query: string) => {
    // Redirect to search page with query
    window.location.href = `/search?q=${encodeURIComponent(query)}`
  }

  // Handle category selection
  const handleCategorySelect = (category: string) => {
    if (category === 'all') {
      window.location.href = '/products'
    } else {
      window.location.href = `/products?category=${encodeURIComponent(category)}`
    }
  }

  // Show loading state while detecting device
  if (!isClient) {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-neutral-300 border-t-primary-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-neutral-600">
            {loadingTimeout ? 'Loading taking longer than expected...' : 'Loading...'}
          </p>
          {connectionStatus === 'fallback' && (
            <p className="mt-2 text-sm text-yellow-600">
              Using offline mode - some features may be limited
            </p>
          )}
          {loadingTimeout && (
            <button 
              onClick={() => window.location.reload()} 
              className="mt-4 px-4 py-2 bg-primary-600 text-white rounded-lg"
            >
              Reload Page
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <>
{/* Homepage - responsive design */}
      <div>
        <PullToRefresh onRefresh={() => Promise.resolve(window.location.reload())}>
          <HeroSection />
          <NewArrivalsSection />
          <ShopByCategoriesSection />
          <FashionCollectionSection />
          <ShopOurOffersSection />
          <TestimonialsSection />
          <FeaturedDealsSection />
          <NewsletterSection />
        </PullToRefresh>
      </div>
    </>
  )
} 
