import { getToken } from './auth';

// Default to same-origin in production; fall back to localhost for dev
export const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || '';

type ApiOptions = RequestInit & { auth?: boolean };

export async function apiFetch(path: string, options: ApiOptions = {}) {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (options.auth) {
    const token = await getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const res = await fetch(url, { ...options, headers });
  let data: any = undefined;
  const text = await res.text().catch(() => undefined);
  try {
    data = text ? JSON.parse(text) : undefined;
  } catch {
    // non-JSON response, keep text
  }

  if (!res.ok) {
    const message =
      (data && (data.error || data.message)) ||
      (text && text.slice(0, 500)) ||
      `${res.status} ${res.statusText}` ||
      'Request failed';
    // Helpful console to debug failures
    console.error('apiFetch error', { url, status: res.status, statusText: res.statusText, body: options.body, responseText: text });
    throw new Error(message);
  }

  return data ?? {};
}


