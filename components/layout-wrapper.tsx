'use client'

import { useAuth } from '@/contexts/auth-context'
import { usePathname } from 'next/navigation'
import { SidebarNav } from '@/components/sidebar-nav'

export function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, loading } = useAuth()
  const pathname = usePathname()

  // Pages that don't need authentication
  const publicPages = ['/', '/auth/callback']
  const isPublicPage = publicPages.includes(pathname)

  // Show loading spinner during auth check
  if (loading && !isPublicPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // For public pages (home, auth callback), render without sidebar
  if (isPublicPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  // For authenticated pages, render with sidebar
  if (isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50">
        <SidebarNav />
        <main className="flex-1 p-6 ml-64">
          {children}
        </main>
      </div>
    )
  }

  // For non-authenticated users trying to access protected pages
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Authentication Required</h1>
        <p className="text-gray-600 mb-6">Please sign in to access this page.</p>
        <a 
          href="/" 
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
        >
          Go to Home
        </a>
      </div>
    </div>
  )
}
