import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import './safari-fixes.css'
import { PerformanceProvider } from '@/components/providers/performance-provider'
import { ToastProvider } from '@/components/ui/toast'
import { EnhancedErrorBoundary } from '@/components/ui/enhanced-error-boundary'
import SafariInitializer from '@/components/SafariInitializer'
import ClientLayout from './client-layout'

// Optimize font loading
const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial']
})

export const metadata: Metadata = {
  metadataBase: new URL('https://nubiago-ecommerce.vercel.app'),
  title: 'NubiaGo - Find what you need, faster!',
  description: 'Shop everyday essentials from trusted sellers across Africa — simple, quick, and reliable.',
  authors: [{ name: 'NubiaGo Team' }],
  keywords: ['ecommerce', 'africa', 'online shopping', 'nubiago'],
  robots: 'index, follow',
  openGraph: {
    title: 'NubiaGo - Find what you need, faster!',
    description: 'Shop everyday essentials from trusted sellers across Africa — simple, quick, and reliable.',
    url: 'https://nubiago-ecommerce.vercel.app/',
    siteName: 'NubiaGo',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    creator: '@nubiago',
    title: 'NubiaGo - Find what you need, faster!',
    description: 'Shop everyday essentials from trusted sellers across Africa — simple, quick, and reliable.',
  },
  icons: {
    icon: [
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/safari-pinned-tab.svg', color: '#5bbad5' },
    ],
  },
  manifest: '/site.webmanifest',
  themeColor: '#0F52BA',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'NubiaGo',
  },
  formatDetection: {
    telephone: false,
  },
  other: {
    'msapplication-TileColor': '#da532c',
    'msapplication-config': '/browserconfig.xml',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <link rel="preload" href="/safari-fixes.css" as="style" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
        <link rel="dns-prefetch" href="//cdnjs.cloudflare.com" />
        <link rel="dns-prefetch" href="//firebasestorage.googleapis.com" />
        <link rel="dns-prefetch" href="//images.unsplash.com" />
        <link rel="dns-prefetch" href="//api.nubiago.com" />

        {/* Preconnect to critical origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://firebasestorage.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://api.nubiago.com" crossOrigin="anonymous" />

        {/* Critical CSS preload */}
        <link rel="preload" href="/globals.css" as="style" />
        <link rel="preload" href="/safari-fixes.css" as="style" />
        <link rel="preload" href="/mobile.css" as="style" media="(max-width: 768px)" />
        <link rel="preload" href="/desktop.css" as="style" media="(min-width: 769px)" />

        {/* Critical fonts preload */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          as="style"
        />

        {/* Critical images preload */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        <link rel="preload" href="/hero-image.webp" as="image" type="image/webp" />
        <link rel="preload" href="/fallback-product.jpg" as="image" type="image/jpeg" />

        {/* Viewport and theme - Safari iOS compatible */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes, viewport-fit=cover" />
        <meta name="theme-color" content="#0F52BA" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="NubiaGo" />

        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('Service Worker registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('Service Worker registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </head>
      <body className={inter.className}>
        <SafariInitializer />
        <PerformanceProvider enableAutoOptimization={true}>
          <EnhancedErrorBoundary>
            <ToastProvider>
              <ClientLayout>
                {children}
              </ClientLayout>
            </ToastProvider>
          </EnhancedErrorBoundary>
        </PerformanceProvider>
      </body>
    </html>
  )
}
