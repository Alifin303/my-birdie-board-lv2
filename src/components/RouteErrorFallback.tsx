/**
 * Custom error element for React Router routes.
 *
 * React Router has its OWN error boundary (RenderErrorBoundary) that
 * catches errors thrown by route components or lazy imports.  It fires
 * BEFORE our AppErrorBoundary, so it is what the user actually sees.
 *
 * Without a custom `errorElement` React Router shows the ugly default
 * "Unexpected Application Error!" white screen.  This component
 * replaces that with a friendly UI + auto-reload for chunk errors.
 */

import { useRouteError } from 'react-router-dom';

export function RouteErrorFallback() {
  const error = useRouteError() as Error | undefined;
  const message = error?.message || String(error) || '';

  // Detect stale-chunk / HTML-instead-of-JS errors and auto-reload once
  const isChunkError =
    message.includes('Failed to fetch dynamically imported module') ||
    message.includes('is not valid JSON') ||
    message.includes("Unexpected token '<'") ||
    message.includes('Loading chunk') ||
    message.includes('Loading CSS chunk');

  if (isChunkError) {
    const key = 'chunk_error_reload';
    const now = Date.now();
    const last = parseInt(sessionStorage.getItem(key) || '0', 10);
    if (!last || now - last > 10_000) {
      sessionStorage.setItem(key, String(now));
      window.location.reload();
      // Return minimal UI while reload is pending
      return null;
    }
  }

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: '2rem',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        textAlign: 'center',
        backgroundColor: '#f9fafb',
        color: '#1f2937',
      }}
    >
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.75rem' }}>
        Temporary loading issue
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '1.5rem', maxWidth: '400px' }}>
        We hit a snag loading this page. A quick refresh usually fixes it.
      </p>
      <button
        onClick={() => {
          try { sessionStorage.removeItem('chunk_error_reload'); } catch {}
          window.location.reload();
        }}
        style={{
          padding: '0.625rem 1.5rem',
          borderRadius: '0.5rem',
          border: 'none',
          backgroundColor: '#2C4A3B',
          color: '#fff',
          fontSize: '0.875rem',
          fontWeight: 500,
          cursor: 'pointer',
        }}
      >
        Refresh Page
      </button>
    </div>
  );
}
