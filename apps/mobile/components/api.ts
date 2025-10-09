import { clearToken, getToken } from './auth';
import { NavigationService } from './NavigationService';

// API Base URL configuration
// - Uses environment variable if set
// - Falls back to localhost:3000 for development
// - Uses empty string (same-origin) for production builds
const getApiBaseUrl = () => {
  if (process.env.EXPO_PUBLIC_API_BASE_URL) {
    return process.env.EXPO_PUBLIC_API_BASE_URL;
  }
  
  // Development fallback
  if (__DEV__) {
    return 'http://localhost:3000';
  }
  
  // Production fallback (same-origin) 
  // This works because both frontend and API are on the same Vercel domain
  return '';
};

export const API_BASE_URL = getApiBaseUrl();

type ApiOptions = RequestInit & { auth?: boolean };

// Custom error class for authentication errors
export class AuthenticationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AuthenticationError';
  }
}

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
    // Handle authentication errors (401 Unauthorized, 403 Forbidden)
    if (res.status === 401 || res.status === 403) {
      // Clear the invalid token
      await clearToken();
      
      // Automatically redirect to login page
      NavigationService.redirectToLogin();
      
      throw new AuthenticationError('Authentication failed. Please login again.');
    }

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


