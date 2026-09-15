// Smart API fetcher with multiple fallback endpoints
const API_BASE_URLS = [
  '', // Relative (Vite proxy / Same origin)
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

export async function apiFetch(endpoint: string, options: RequestInit = {}): Promise<Response> {
  const cleanEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  let lastError: any = null;

  for (const base of API_BASE_URLS) {
    const url = `${base}${cleanEndpoint}`;
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...(options.headers || {}),
        },
      });
      return response;
    } catch (err) {
      lastError = err;
      // Continue to next fallback base URL
    }
  }

  throw lastError || new Error('No se pudo conectar con el servidor backend');
}