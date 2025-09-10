import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Simplified middleware for Firebase Hosting compatibility
// Only run in production to avoid conflicts with static export
export async function middleware(request: NextRequest) {
  // Skip middleware in development
  if (process.env.NODE_ENV === 'development') {
    return NextResponse.next()
  }

  const { pathname } = request.nextUrl

  // Allow all static files and API routes
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/static') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  // Basic public routes check
  const publicRoutes = [
    '/',
    '/about',
    '/contact',
    '/terms',
    '/privacy',
    '/help',
    '/faq',
    '/blog',
    '/careers',
    '/press',
    '/partner-program',
    '/enterprise',
    '/become-supplier',
    '/gdpr',
    '/cookies',
    '/auth/login',
    '/auth/register',
    '/auth/forgot-password',
    '/auth/verify-email',
    '/login',
    '/register',
    '/forgot-password',
    '/products',
    '/unauthorized',
    '/account-suspended',
    '/not-found',
    '/error',
    '/test-email-verification'
  ]

  // Check if it's a public route
  if (publicRoutes.includes(pathname) || pathname.startsWith('/products/')) {
    return NextResponse.next()
  }

  // For protected routes, just allow access for now
  // Authentication will be handled at the component level
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
} 
