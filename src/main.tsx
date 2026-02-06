import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import { supabase } from './integrations/supabase/client'
import './index.css'

/**
 * ViteReactSSG creates the root for both SSG (build time) and hydration (client-side)
 * - At build time: renders each route to static HTML with full content
 * - At runtime: hydrates the static HTML with React for interactivity
 * 
 * This ensures Googlebot sees fully rendered HTML without executing JavaScript
 */
export const createRoot = ViteReactSSG(
  // Router options - no future flags (they can break vite-react-ssg's internal router)
  { routes },
  // Context callback - runs on both server and client
  ({ isClient }) => {
    // Client-side only initialization
    if (isClient) {
      // Initialize Supabase auth on client
      supabase.auth.getSession().then(({ data, error }) => {
        if (error) {
          console.error('Error initializing auth:', error)
        } else if (data?.session) {
          console.log('Session restored successfully')
        }
      })
    }
  },
  // Client options
  {
    rootContainer: '#root',
  }
)
