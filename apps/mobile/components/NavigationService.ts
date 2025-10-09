import { router } from 'expo-router';

/**
 * Navigation service for use outside of React components
 * Provides centralized navigation methods that can be called from API layer
 */
export class NavigationService {
  /**
   * Navigate to login page and clear navigation stack
   */
  static redirectToLogin() {
    console.log('NavigationService: Redirecting to login...');
    router.replace('/(auth)/login');
  }

  /**
   * Navigate to home page
   */
  static redirectToHome() {
    console.log('NavigationService: Redirecting to home...');
    router.replace('/');
  }

  /**
   * Go back to previous screen
   */
  static goBack() {
    if (router.canGoBack()) {
      router.back();
    }
  }
}