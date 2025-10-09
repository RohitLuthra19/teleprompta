import { clearToken } from './auth';
import { NavigationService } from './NavigationService';

/**
 * Utility functions for testing authentication behavior
 * These can be called from the console or components for testing
 */
export const AuthTestUtils = {
  /**
   * Simulate an authentication failure by clearing the token
   * and triggering the redirect flow
   */
  async simulateAuthFailure() {
    console.log('🧪 AuthTestUtils: Simulating authentication failure...');
    await clearToken();
    NavigationService.redirectToLogin();
  },

  /**
   * Force logout and redirect to login
   */
  async forceLogout() {
    console.log('🔓 AuthTestUtils: Force logout...');
    await clearToken();
    NavigationService.redirectToLogin();
  }
};

// Make it available globally for console testing in development
if (__DEV__) {
  (globalThis as any).AuthTestUtils = AuthTestUtils;
}