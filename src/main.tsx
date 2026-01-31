import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import './index.css'

/**
 * ViteReactSSG creates the root for both SSG (build time) and hydration (client-side)
 * - At build time: renders each route to static HTML with full content
 * - At runtime: hydrates the static HTML with React for interactivity
 * 
 * This ensures Googlebot sees fully rendered HTML without executing JavaScript
 */
export const createRoot = ViteReactSSG(
  // Router options
  { 
    routes,
    future: {
      v7_normalizeFormMethod: true,
      v7_fetcherPersist: true,
      v7_relativeSplatPath: true,
      v7_skipActionErrorRevalidation: true,
      v7_partialHydration: true,
    },
  },
  // Context callback - runs on both server and client
  ({ isClient }) => {
    // Client-side only initialization
    if (isClient) {
      // Initialize Supabase auth on client
      import('./integrations/supabase/client').then(({ supabase }) => {
        supabase.auth.getSession().then(({ data, error }) => {
          if (error) {
            console.error('Error initializing auth:', error)
          } else if (data?.session) {
            console.log('Session restored successfully')
          }
        })
      })
    }
  },
  // Client options
  {
    rootContainer: '#root',
  }
)
