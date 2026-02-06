import { ViteReactSSG } from 'vite-react-ssg'
import { routes } from './routes'
import './index.css'

export const createRoot = ViteReactSSG(
  { routes },
  ({ isClient }) => {
    if (isClient) {
      // Lazy-load supabase auth init only on client
      import('./integrations/supabase/client').then(({ supabase }) => {
        supabase.auth.getSession().then(({ data, error }) => {
          if (error) {
            console.error('Error initializing auth:', error)
          }
        })
      })
    }
  },
  {
    rootContainer: '#root',
  }
)
