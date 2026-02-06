import { Outlet } from 'react-router-dom'
import { Providers } from '@/components/Providers'

/**
 * Legacy RootLayout - kept for compatibility.
 * Routes no longer use this as a layout wrapper;
 * providers are applied directly per-route instead.
 */
export function RootLayout() {
  return (
    <Providers>
      <Outlet />
    </Providers>
  )
}

export default RootLayout
