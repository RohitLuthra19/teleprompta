import { useRouter } from 'expo-router';
import { useCallback } from 'react';
import { AuthenticationError } from './api';

/**
 * Hook to handle API calls with automatic authentication error handling
 * Automatically redirects to login page when authentication fails
 */
export function useApiCall() {
  const router = useRouter();

  const handleApiCall = useCallback(async <T>(
    apiCall: () => Promise<T>,
    onError?: (error: Error) => void
  ): Promise<T | null> => {
    try {
      return await apiCall();
    } catch (error) {
      console.error('API call failed:', error);
      
      // Handle authentication errors
      if (error instanceof AuthenticationError) {
        console.log('Authentication failed, redirecting to login...');
        router.replace('/(auth)/login');
        return null;
      }
      
      // Handle other errors
      if (onError) {
        onError(error as Error);
      }
      
      throw error;
    }
  }, [router]);

  return { handleApiCall };
}