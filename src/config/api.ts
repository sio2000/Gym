export const API_BASE_URL: string = (import.meta as any).env?.VITE_API_BASE || 'http://localhost:3001/api';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}

export async function apiFetch<T>(
  path: string,
  options: { method?: HttpMethod; body?: unknown; token?: string } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token } = options;

  const res = await fetch(`${API_BASE_URL}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body !== undefined ? JSON.stringify(body) : undefined,
    credentials: 'include',
  });

  const contentType = res.headers.get('content-type') || '';
  const isJson = contentType.includes('application/json');
  const payload = isJson ? await res.json() : undefined;

  if (!res.ok) {
    const message = (payload && (payload.message || payload.error)) || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return payload as ApiResponse<T>;
}


