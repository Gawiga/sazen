import PocketBase from 'pocketbase';
import type { AuthModel } from 'pocketbase';

const POCKETBASE_URL = import.meta.env.PUBLIC_POCKETBASE_URL || 'https://gawiga-server.bonito-dace.ts.net/';
const POCKETBASE_COLLECTION = import.meta.env.PUBLIC_POCKETBASE_COLLECTION || 'users';

/**
 * Authentication service for PocketBase
 */
export class AuthService {
  private pb: PocketBase;
  private collectionName: string;

  constructor(pb?: PocketBase, collection: string = POCKETBASE_COLLECTION) {
    this.pb = pb || new PocketBase(POCKETBASE_URL);
    this.collectionName = collection;
  }

  /**
   * Authenticate with email and password
   */
  async loginWithPassword(email: string, password: string) {
    try {
      const authData = await this.pb.collection(this.collectionName).authWithPassword(email, password);

      // Store auth data in localStorage for persistence
      if (typeof window !== 'undefined') {
        localStorage.setItem(
          'pb_auth',
          JSON.stringify({
            token: this.pb.authStore.token,
            record: this.pb.authStore.record,
          })
        );
      }

      return {
        success: true,
        data: authData,
        user: this.pb.authStore.record,
      };
    } catch (error) {
      console.error('Login error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Login failed',
      };
    }
  }

  /**
   * Logout and clear auth state
   */
  logout() {
    try {
      this.pb.authStore.clear();

      if (typeof window !== 'undefined') {
        localStorage.removeItem('pb_auth');
      }

      return {
        success: true,
        message: 'Logged out successfully',
      };
    } catch (error) {
      console.error('Logout error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Logout failed',
      };
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.pb.authStore.isValid;
  }

  /**
   * Get current authenticated user
   */
  getCurrentUser(): AuthModel | null {
    return this.pb.authStore.record;
  }

  /**
   * Get auth token
   */
  getToken(): string {
    return this.pb.authStore.token;
  }

  /**
   * Get PocketBase client instance
   */
  getClient(): PocketBase {
    return this.pb;
  }

  /**
   * Create new user account
   */
  async signup(email: string, password: string, passwordConfirm: string, data?: Record<string, unknown>) {
    try {
      await this.pb.collection(this.collectionName).create({
        email,
        password,
        passwordConfirm,
        ...(data as Record<string, unknown> | undefined),
      });

      // Automatically login after signup
      return this.loginWithPassword(email, password);
    } catch (error) {
      console.error('Signup error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Signup failed',
      };
    }
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string) {
    try {
      await this.pb.collection(this.collectionName).requestPasswordReset(email);
      return {
        success: true,
        message: 'Password reset email sent',
      };
    } catch (error) {
      console.error('Password reset request error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Password reset request failed',
      };
    }
  }
}

/**
 * Create and return auth service instance
 */
export function createAuthService(pb?: PocketBase): AuthService {
  return new AuthService(pb);
}

export default AuthService;
