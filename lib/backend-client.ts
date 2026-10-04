/**
 * Backend Client for Server-to-Service Communication
 * 
 * In Vercel Services mode, the 'app' service binds to the 'server' service.
 * Vercel automatically injects the internal URL into process.env.SERVER_URL.
 */

export function getBackendBaseUrl(): string {
  // 1. Injected by Vercel via service binding { type: "service", service: "server", format: "url", env: "SERVER_URL" }
  if (process.env.SERVER_URL) {
    return process.env.SERVER_URL.replace(/\/$/, '');
  }

  // 2. Fallback to local Express port in development
  const localPort = process.env.SERVER_PORT || process.env.PORT || '5000';
  return `http://localhost:${localPort}`;
}

/**
 * Perform a server-side fetch to the internal Express backend service
 * @param path Relative path, e.g. '/api/v1/movies' or 'api/v1/app-config'
 * @param init Standard RequestInit options
 */
export async function callBackendService(path: string, init?: RequestInit): Promise<Response> {
  const baseUrl = getBackendBaseUrl();
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  const targetUrl = new URL(cleanPath, `${baseUrl}/`);

  return fetch(targetUrl.toString(), {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  });
}
