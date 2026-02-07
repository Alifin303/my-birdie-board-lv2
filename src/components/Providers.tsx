import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'

const queryClient = new QueryClient()

/**
 * Global providers wrapper - used by both SSG pages and client-only pages.
 * This is NOT a layout route — it wraps individual page elements directly.
 * Note: Do NOT wrap with HelmetProvider here — vite-react-ssg's Head component
 * manages its own helmet context for SSG head injection.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster />
    </QueryClientProvider>
  )
}
