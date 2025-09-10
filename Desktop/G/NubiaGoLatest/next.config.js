/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // ============================================================================
  // VERCEL HOSTING CONFIGURATION
  // ============================================================================
  
  // ============================================================================
  // IMAGE OPTIMIZATION FOR VERCEL - Safari Compatible
  // ============================================================================
  images: {
    unoptimized: false,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [320, 480, 640, 750, 828, 1080, 1200],
    imageSizes: [16, 24, 32, 48, 64, 96, 128, 256],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
    loader: 'default',
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'source.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        port: '',
        pathname: '/**',
      },
    ],
  },

  // ============================================================================
  // COMPILER OPTIMIZATION
  // ============================================================================
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },

  // ============================================================================
  // PERFORMANCE OPTIMIZATIONS
  // ============================================================================
  // Enable output file tracing for better bundle analysis
  outputFileTracing: true,
  
  // Enable static optimization
  trailingSlash: false,
  
  // Optimize bundle generation
  generateEtags: false,
  
  // Enable compression
  compress: true,
  
  // Optimize powered by header
  poweredByHeader: false,

  // ============================================================================
  // EXPERIMENTAL FEATURES - Safari Compatible
  // ============================================================================
  experimental: {
    // Temporarily disabled to fix router error
    // webpackBuildWorker: true,
    // optimizeCss: true,
    optimizePackageImports: [
      '@headlessui/react', 
      '@heroicons/react', 
      'lucide-react',
      'framer-motion',
      'react-hook-form',
      'react-intersection-observer',
      'react-spring',
      '@react-spring/web',
      'react-swipeable',
      'zustand',
      'firebase/app',
      'firebase/auth',
      'firebase/firestore',
      'firebase/storage',
      'date-fns',
      'uuid',
      '@hookform/resolvers',
      'zod'
    ],
    // Enable SWC minification for better performance
    swcMinify: true,
    // Ensure ES modules are handled correctly for Safari
    esmExternals: false,
    optimizeCss: true,
    scrollRestoration: true
  },

  // ============================================================================
  // WEBPACK OPTIMIZATION
  // ============================================================================
  webpack: (config, { dev, isServer, webpack }) => {
    // Handle Node.js modules for server-side code
    if (isServer) {
      config.externals = config.externals || []
      config.externals.push({
        'firebase-admin': 'commonjs firebase-admin',
        'firebase-admin/app': 'commonjs firebase-admin/app',
        'firebase-admin/auth': 'commonjs firebase-admin/auth',
        'firebase-admin/firestore': 'commonjs firebase-admin/firestore',
        'firebase-admin/storage': 'commonjs firebase-admin/storage',
      })
    }

    // Handle node: protocol and Node.js modules for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
        'node:process': false,
        'node:fs': false,
        'node:path': false,
        'node:crypto': false,
        'node:stream': false,
        'node:util': false,
        'node:buffer': false,
        'node:events': false,
        'node:querystring': false,
        'node:url': false,
        'node:http': false,
        'node:https': false,
        'node:zlib': false,
        'node:child_process': false,
        'node:cluster': false,
        'node:dgram': false,
        'node:dns': false,
        'node:domain': false,
        'node:module': false,
        'node:net': false,
        'node:os': false,
        'node:punycode': false,
        'node:readline': false,
        'node:repl': false,
        'node:string_decoder': false,
        'node:sys': false,
        'node:timers': false,
        'node:tls': false,
        'node:tty': false,
        'node:vm': false,
        'node:worker_threads': false,
        process: false,
      }
    }

    // Handle SVG files
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    })

    // Production optimizations
    if (!dev) {
      // Add webpack bundle analyzer in production builds (optional)
      if (process.env.ANALYZE === 'true') {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer')
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            openAnalyzer: false,
            reportFilename: 'bundle-analysis.html',
          })
        )
      }
    }

    // Development optimizations
    if (dev) {
      // Enable fast refresh for better development experience
      config.resolve.alias = {
        ...config.resolve.alias,
        'react-dom$': 'react-dom/profiling',
        'scheduler/tracing': 'scheduler/tracing-profiling',
      }
    }

    return config
  },

  // ============================================================================
  // HEADERS & CACHING OPTIMIZATION
  // ============================================================================
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
        ],
      },
      {
        source: '/static/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/api/(.*)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'no-cache, no-store, must-revalidate',
          },
        ],
      },
    ]
  },

  // ============================================================================
  // REWRITES FOR PERFORMANCE
  // ============================================================================
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: '/api/:path*',
      },
    ]
  },
}

module.exports = nextConfig 