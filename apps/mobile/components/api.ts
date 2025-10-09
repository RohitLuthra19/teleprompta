import { clearToken, getToken } from './auth';
import { NavigationService } from './NavigationService';

// API Base URL configuration
// Simple and reliable approach for Vercel deployment
const getApiBaseUrl = () => {
  // If EXPO_PUBLIC_API_BASE_URL is set in Vercel dashboard, use it
  if (typeof process.env.EXPO_PUBLIC_API_BASE_URL === 'string') {
    return process.env.EXPO_PUBLIC_API_BASE_URL; // Could be empty string for same-origin
  }
  
  // Fallback logic based on environment detection
  const isLocalDevelopment = typeof window !== 'undefined' && 
                             window.location.hostname === 'localhost';
  
  const isDevEnvironment = __DEV__ || process.env.NODE_ENV === 'development';
  
  console.log('API URL Detection:', {
    isLocalDevelopment,
    isDevEnvironment,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server',
    NODE_ENV: process.env.NODE_ENV,
    __DEV__,
  });
  
  // Only use localhost if we're actually running on localhost
  if (isLocalDevelopment && isDevEnvironment) {
    console.log('Using localhost for local development');
    return 'http://localhost:3000';
  }
  
  // Default to same-origin for production/Vercel
  console.log('Using same-origin for production');
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


