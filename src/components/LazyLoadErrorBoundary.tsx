import React, { Component, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Catches chunk load failures (e.g. after a new deploy changes filenames)
 * and auto-reloads the page once to pick up the new chunks.
 */
export class LazyLoadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State | null {
    // Detect chunk load / dynamic import failures
    const msg = error?.message || '';
    if (
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('is not valid JSON') ||
      msg.includes("Unexpected token '<'") ||
      msg.includes('Loading chunk') ||
      msg.includes('Loading CSS chunk')
    ) {
      return { hasError: true };
    }
    return null;
  }

  componentDidCatch(error: Error) {
    const msg = error?.message || '';
    const isChunkError =
      msg.includes('Failed to fetch dynamically imported module') ||
      msg.includes('is not valid JSON') ||
      msg.includes("Unexpected token '<'") ||
      msg.includes('Loading chunk') ||
      msg.includes('Loading CSS chunk');

    if (isChunkError) {
      const key = 'chunk_error_reload';
      const now = Date.now();
      const last = parseInt(sessionStorage.getItem(key) || '0', 10);
      if (!last || (now - last) > 10000) {
        sessionStorage.setItem(key, String(now));
        window.location.reload();
      }
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-4 text-center">
          <p className="text-lg font-medium">A new version is available.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 rounded bg-primary text-primary-foreground hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
