import { Metadata } from 'next'

// Base metadata for the application
export const baseMetadata: Metadata = {
  title: {
    default: 'NubiaGo - Premium E-commerce Platform',
    template: '%s | NubiaGo'
  },
  description: 'Discover premium products on NubiaGo, your trusted e-commerce platform. Shop electronics, fashion, home & living, and more with secure payments and fast delivery.',
  keywords: ['e-commerce', 'online shopping', 'electronics', 'fashion', 'home & living', 'Nigeria', 'premium products'],
  authors: [{ name: 'NubiaGo Team' }],
  creator: 'NubiaGo',
  publisher: 'NubiaGo',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://nubiago.com'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://nubiago.com',
    siteName: 'NubiaGo',
    title: 'NubiaGo - Premium E-commerce Platform',
    description: 'Discover premium products on NubiaGo, your trusted e-commerce platform.',
    images: [
      {
        url: '/ui-logo-1.jpg',
        width: 1200,
        height: 630,
        alt: 'NubiaGo - Premium E-commerce Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'NubiaGo - Premium E-commerce Platform',
    description: 'Discover premium products on NubiaGo, your trusted e-commerce platform.',
    images: ['/ui-logo-1.jpg'],
    creator: '@nubiago',
    site: '@nubiago',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: 'your-google-verification-code',
    yandex: 'your-yandex-verification-code',
    yahoo: 'your-yahoo-verification-code',
  },
}

// Product metadata generator
export function generateProductMetadata(product: {
  name: string
  description: string
  price: number
  category: string
  imageUrl: string
  id: string
}): Metadata {
  return {
    title: product.name,
    description: product.description,
    keywords: [product.name, product.category, 'e-commerce', 'online shopping'],
    openGraph: {
      title: product.name,
      description: product.description,
      type: 'website',
      url: `https://nubiago.com/products/${product.id}`,
      images: [
        {
          url: product.imageUrl,
          width: 800,
          height: 600,
          alt: product.name,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: product.description,
      images: [product.imageUrl],
    },
    alternates: {
      canonical: `/products/${product.id}`,
    },
  }
}

// Category metadata generator
export function generateCategoryMetadata(category: {
  name: string
  description: string
  imageUrl?: string
}): Metadata {
  return {
    title: `${category.name} - Shop Online`,
    description: category.description,
    keywords: [category.name, 'e-commerce', 'online shopping', 'Nigeria'],
    openGraph: {
      title: `${category.name} - Shop Online`,
      description: category.description,
      type: 'website',
      url: `https://nubiago.com/products?category=${encodeURIComponent(category.name)}`,
      images: category.imageUrl ? [
        {
          url: category.imageUrl,
          width: 1200,
          height: 630,
          alt: category.name,
        },
      ] : undefined,
    },
    alternates: {
      canonical: `/products?category=${encodeURIComponent(category.name)}`,
    },
  }
}

// Page metadata generator
export function generatePageMetadata(page: {
  title: string
  description: string
  path: string
  imageUrl?: string
}): Metadata {
  return {
    title: page.title,
    description: page.description,
    openGraph: {
      title: page.title,
      description: page.description,
      url: `https://nubiago.com${page.path}`,
      images: page.imageUrl ? [
        {
          url: page.imageUrl,
          width: 1200,
          height: 630,
          alt: page.title,
        },
      ] : undefined,
    },
    alternates: {
      canonical: page.path,
    },
  }
}

// Structured data for products
export function generateProductStructuredData(product: {
  id: string
  name: string
  description: string
  price: number
  originalPrice?: number
  imageUrl: string
  category: string
  brand?: string
  rating?: number
  reviewCount?: number
  availability: 'in-stock' | 'out-of-stock'
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description,
    image: product.imageUrl,
    brand: product.brand ? {
      '@type': 'Brand',
      name: product.brand,
    } : undefined,
    category: product.category,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: 'NGN',
      availability: product.availability === 'in-stock' 
        ? 'https://schema.org/InStock' 
        : 'https://schema.org/OutOfStock',
      url: `https://nubiago.com/products/${product.id}`,
      ...(product.originalPrice && {
        priceSpecification: {
          '@type': 'PriceSpecification',
          price: product.originalPrice,
          priceCurrency: 'NGN',
        },
      }),
    },
    ...(product.rating && product.reviewCount && {
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: product.rating,
        reviewCount: product.reviewCount,
      },
    }),
  }
}

// Structured data for organization
export function generateOrganizationStructuredData() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'NubiaGo',
    url: 'https://nubiago.com',
    logo: 'https://nubiago.com/ui-logo-1.jpg',
    description: 'Premium e-commerce platform offering quality products with secure payments and fast delivery.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'NG',
      addressLocality: 'Lagos',
      addressRegion: 'Lagos',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+234-123-456-7890',
      contactType: 'customer service',
      availableLanguage: 'English',
    },
    sameAs: [
      'https://facebook.com/nubiago',
      'https://twitter.com/nubiago',
      'https://instagram.com/nubiago',
    ],
  }
}

// Structured data for breadcrumbs
export function generateBreadcrumbStructuredData(breadcrumbs: Array<{
  name: string
  url: string
}>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: breadcrumb.name,
      item: `https://nubiago.com${breadcrumb.url}`,
    })),
  }
}

// SEO utility functions
export const seoUtils = {
  // Generate meta tags for social sharing
  generateSocialMeta: (title: string, description: string, imageUrl?: string) => ({
    'og:title': title,
    'og:description': description,
    'og:image': imageUrl,
    'twitter:title': title,
    'twitter:description': description,
    'twitter:image': imageUrl,
  }),

  // Generate canonical URL
  generateCanonicalUrl: (path: string) => `https://nubiago.com${path}`,

  // Generate sitemap URL
  generateSitemapUrl: () => 'https://nubiago.com/sitemap.xml',

  // Generate robots.txt content
  generateRobotsTxt: () => `User-agent: *
Allow: /

Sitemap: https://nubiago.com/sitemap.xml`,

  // Generate sitemap XML
  generateSitemapXml: (pages: Array<{ url: string; lastModified: string; changeFrequency: string; priority: number }>) => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${pages.map(page => `  <url>
    <loc>https://nubiago.com${page.url}</loc>
    <lastmod>${page.lastModified}</lastmod>
    <changefreq>${page.changeFrequency}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`
    return xml
  },

  // Generate JSON-LD structured data
  generateJsonLd: (data: any) => JSON.stringify(data, null, 2),

  // Sanitize text for meta tags
  sanitizeText: (text: string, maxLength: number = 160) => {
    const sanitized = text.replace(/[<>]/g, '').trim()
    return sanitized.length > maxLength 
      ? sanitized.substring(0, maxLength - 3) + '...' 
      : sanitized
  },

  // Generate keywords from text
  generateKeywords: (text: string, maxKeywords: number = 10) => {
    const words = text.toLowerCase()
      .replace(/[^\w\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 3)
    
    const wordCount = words.reduce((acc, word) => {
      acc[word] = (acc[word] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(wordCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, maxKeywords)
      .map(([word]) => word)
  },
}

// SEO hook for dynamic metadata
export function useSEO(metadata: Metadata) {
  useEffect(() => {
    // Update document title
    if (metadata.title) {
      document.title = typeof metadata.title === 'string' 
        ? metadata.title 
        : (metadata.title as any)?.default || ''
    }

    // Update meta tags
    const updateMetaTag = (name: string, content: string) => {
      let meta = document.querySelector(`meta[name="${name}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('name', name)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    const updatePropertyTag = (property: string, content: string) => {
      let meta = document.querySelector(`meta[property="${property}"]`)
      if (!meta) {
        meta = document.createElement('meta')
        meta.setAttribute('property', property)
        document.head.appendChild(meta)
      }
      meta.setAttribute('content', content)
    }

    // Update description
    if (metadata.description) {
      updateMetaTag('description', metadata.description)
    }

    // Update keywords
    if (metadata.keywords) {
      const keywords = Array.isArray(metadata.keywords) 
        ? metadata.keywords.join(', ') 
        : metadata.keywords
      updateMetaTag('keywords', keywords)
    }

    // Update Open Graph tags
    if (metadata.openGraph) {
      const og = metadata.openGraph
      if (og.title) updatePropertyTag('og:title', typeof og.title === 'string' ? og.title : (og.title as any)?.default || '')
      if (og.description) updatePropertyTag('og:description', og.description)
      if (og.url) updatePropertyTag('og:url', typeof og.url === 'string' ? og.url : og.url.toString())
      if ((og as any).type) updatePropertyTag('og:type', (og as any).type)
      if (og.siteName) updatePropertyTag('og:site_name', og.siteName)
    }

    // Update Twitter Card tags
    if (metadata.twitter) {
      const twitter = metadata.twitter
      if ((twitter as any).card) updateMetaTag('twitter:card', (twitter as any).card)
      if (twitter.title) updateMetaTag('twitter:title', typeof twitter.title === 'string' ? twitter.title : (twitter.title as any)?.default || '')
      if (twitter.description) updateMetaTag('twitter:description', twitter.description)
      if (twitter.creator) updateMetaTag('twitter:creator', twitter.creator)
      if (twitter.site) updateMetaTag('twitter:site', twitter.site)
    }
  }, [metadata])
}

// Import missing useEffect
import { useEffect } from 'react' 
