'use client';

import { Suspense } from 'react';
import { SpeedInsights } from "@vercel/speed-insights/next"
import { ToastProvider } from '@/components/ui/toast';
import { ErrorBoundaryProvider } from '@/components/providers/error-boundary-provider';
import { FirebaseAuthProvider } from '@/hooks/useFirebaseAuth';
import { RoleChangeHandler } from '@/components/auth/role-change-handler';
import StoreProvider from '@/components/providers/store-provider';
import { SimpleLoading } from '@/components/ui/simple-loading';
import MobileLayoutWrapper from '@/components/layout/MobileLayoutWrapper';
import { MobileOptimizationProvider } from '@/components/providers/mobile-optimization-provider';
import { Footer } from '@/components/ui/footer';

// Loading fallback component
function AppLoadingFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading NubiaGo...</p>
      </div>
    </div>
  )
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {

  return (
    <ErrorBoundaryProvider>
      <Suspense fallback={<AppLoadingFallback />}>
        <FirebaseAuthProvider>
          <ToastProvider>
            <StoreProvider>
              <RoleChangeHandler>
                <MobileOptimizationProvider>
                  <MobileLayoutWrapper>
                    {children}
                  </MobileLayoutWrapper>
                </MobileOptimizationProvider>
              </RoleChangeHandler>
            </StoreProvider>
          </ToastProvider>
          <SpeedInsights />
        </FirebaseAuthProvider>
      </Suspense>
    </ErrorBoundaryProvider>
  )
}
