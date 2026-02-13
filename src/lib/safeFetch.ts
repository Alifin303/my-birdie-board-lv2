/**
 * Safe wrapper around fetch() that validates the response is JSON
 * before parsing. Prevents the "Unexpected token '<'" crash that
 * occurs when an HTML page (e.g. SPA fallback) is returned instead
 * of a JSON API response.
 */
export async function safeFetch<T = unknown>(
  url: string | URL | Request,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(url, options);

  if (!response.ok) {
    // 401 = auth expired — don't try to parse, just throw
    if (response.status === 401) {
      throw new SafeFetchError(
        'Authentication expired. Please log in again.',
        response.status,
      );
    }
    throw new SafeFetchError(
      `HTTP error ${response.status}`,
      response.status,
    );
  }

  const contentType = response.headers.get('content-type') || '';
  if (!contentType.includes('application/json')) {
    const text = await response.text();
    console.error('[safeFetch] Expected JSON but received:', text.slice(0, 200));
    throw new SafeFetchError('Expected JSON response but received non-JSON content', response.status);
  }

  return response.json() as Promise<T>;
}

export class SafeFetchError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = 'SafeFetchError';
    this.status = status;
  }
}
