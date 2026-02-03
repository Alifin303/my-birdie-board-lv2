import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Outlet } from 'react-router-dom'
import { Toaster } from '@/components/ui/toaster'

// Create a query client
const queryClient = new QueryClient()

/**
 * Root layout component that wraps all routes with global providers
 * This ensures HelmetProvider, QueryClient, and Toaster are available on all pages
 */
export function RootLayout() {
  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <div className="min-h-screen">
          <div className="flex flex-col min-h-screen">
            <main className="flex-1">
              <Outlet />
            </main>
          </div>
        </div>
        <Toaster />
      </QueryClientProvider>
    </HelmetProvider>
  )
}

export default RootLayout
