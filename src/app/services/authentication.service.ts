import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { environment } from 'src/environments/environment';
import { StorageService } from './storage.service';

/**
 * Interface representing the token response from the authentication server
 */
export interface TokenResponse {
  /** JWT access token for API authorization */
  AccessToken: string;
  /** JWT refresh token for obtaining new access tokens */
  RefreshToken: string;
}

/**
 * Service responsible for handling authentication operations
 * including login, token refresh, and session management
 */
@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {
  /** Base URL for API endpoints */
  private readonly apiUrl = environment.apiUrl;

  /** List of endpoints that don't require authentication */
  private readonly publicEndpoints = [
    '/authentication/login',
    '/authentication/refresh',
    '/authentication/ping',
    '/authentication/register',
    '/authentication/exist'
  ];

  constructor(
    private readonly storage: StorageService
  ) {}

  /**
   * Checks if an endpoint should be excluded from authentication
   * @param {string} url - The URL to check
   * @returns {boolean} True if the endpoint should be excluded from authentication
   */
  public isPublicEndpoint(url: string): boolean {
    return this.publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Checks if the server is reachable
   * @returns {Promise<boolean>} True if server is reachable, false otherwise
   */
  async ping(): Promise<boolean> {
    try {
      const response = await CapacitorHttp.get({
        url: `${this.apiUrl}/authentication/ping`,
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        webFetchExtra: {
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit'
        }
      });
      return response.status === 200;
    } catch (error) {
      if (error instanceof Error) {
        console.error('❌ Ping error details:', {
          message: error.message,
          name: error.name
        });
      }
      return false;
    }
  }

  /**
   * Authenticates a user with the provided credentials
   * @param {string} username - User's email address
   * @param {string} password - User's password
   * @returns {Promise<boolean>} True if login successful, false otherwise
   * @throws {Error} If the server request fails
   */
  async login(username: string, password: string): Promise<boolean> {
    try {
      const response = await CapacitorHttp.post({
        url: `${this.apiUrl}/authentication/login`,
        data: { username, password },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        webFetchExtra: {
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit'
        }
      });

      if (response.status === 200 && response.data) {
        await this.setTokens(response.data, username);
        return true;
      }
      console.error('❌ Login failed - Invalid response');
      return false;
    } catch (error) {
      console.error('❌ Login failed:', error);
      if (error instanceof Error) {
        console.error('❌ Error details:', {
          message: error.message,
          name: error.name
        });
      }
      throw error;
    }
  }

  /**
   * Registers a new user
   * @param {string} email - User's email address
   * @param {string} name - User's name
   * @param {string} password - User's password
   * @returns {Promise<boolean>} True if registration successful, false otherwise
   * @throws {Error} If the server request fails
   */
  async register(email: string, name: string, password: string): Promise<boolean> {
    try {
      const response = await CapacitorHttp.post({
        url: `${this.apiUrl}/authentication/register`,
        data: { email, name, password },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        webFetchExtra: {
          mode: 'no-cors',
          cache: 'no-cache',
          credentials: 'omit'
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Registration failed:', error);
      throw error;
    }
  }

  /**
   * Checks if a user exists with the given email
   * @param {string} email - Email address to check
   * @returns {Promise<boolean>} True if user exists, false otherwise
   * @throws {Error} If the server request fails
   */
  async existUser(email: string): Promise<boolean> {
    try {
      const response = await CapacitorHttp.post({
        url: `${this.apiUrl}/authentication/exist`,
        data: { email },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        webFetchExtra: {
          mode: 'no-cors',
          cache: 'no-cache',
          credentials: 'omit'
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('User existence check failed:', error);
      throw error;
    }
  }

  /**
   * Changes the user's name
   * @param {string} currentPassword - User's current password for verification
   * @param {string} newName - New name to set
   * @returns {Promise<boolean>} True if name change successful, false otherwise
   * @throws {Error} If the server request fails
   */
  async changeName(currentPassword: string, newName: string): Promise<boolean> {
    try {
      const response = await CapacitorHttp.post({
        url: `${this.apiUrl}/authentication/change-name`,
        data: { currentPassword, newName },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        webFetchExtra: {
          mode: 'no-cors',
          cache: 'no-cache',
          credentials: 'omit'
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Name change failed:', error);
      throw error;
    }
  }

  /**
   * Changes the user's password
   * @param {string} currentPassword - User's current password for verification
   * @param {string} newPassword - New password to set
   * @returns {Promise<boolean>} True if password change successful, false otherwise
   * @throws {Error} If the server request fails
   */
  async changePassword(currentPassword: string, newPassword: string): Promise<boolean> {
    try {
      const response = await CapacitorHttp.post({
        url: `${this.apiUrl}/authentication/change-password`,
        data: { currentPassword, newPassword },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        webFetchExtra: {
          mode: 'no-cors',
          cache: 'no-cache',
          credentials: 'omit'
        }
      });
      return response.status === 200;
    } catch (error) {
      console.error('Password change failed:', error);
      throw error;
    }
  }

  /**
   * Refreshes the access token using the stored refresh token
   * @returns {Promise<boolean>} True if refresh successful, false otherwise
   */
  async refreshToken(): Promise<boolean> {
    try {
      const username = await this.storage.get('Login');
      const refreshToken = await this.storage.get('RefreshToken');

      if (!username || !refreshToken) {
        return false;
      }

      const response = await CapacitorHttp.post({
        url: `${this.apiUrl}/authentication/refreshtoken`,
        data: {
          Username: username,
          Token: refreshToken
        },
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        webFetchExtra: {
          mode: 'cors',
          cache: 'no-cache',
          credentials: 'omit'
        }
      });

      if (response.status === 200 && response.data) {
        await this.setTokens(response.data, username);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      return false;
    }
  }

  /**
   * Logs out the current user and clears stored tokens
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    try {
      const refreshToken = await this.storage.get('RefreshToken');
      if (refreshToken) {
        await CapacitorHttp.post({
          url: `${this.apiUrl}/authentication/logout`,
          data: { refreshToken },
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          webFetchExtra: {
            mode: 'no-cors',
            cache: 'no-cache',
            credentials: 'omit'
          }
        });
      }
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      await this.clearTokens();
    }
  }

  /**
   * Retrieves the current access token
   * @returns {Promise<string | null>} Current access token or null if not found
   */
  async getAccessToken(): Promise<string | null> {
    return await this.storage.get('AccessToken');
  }

  /**
   * Stores authentication tokens and username
   * @param {TokenResponse} tokens - Token response from server
   * @param {string} username - User's email address
   * @returns {Promise<void>}
   */
  private async setTokens(tokens: TokenResponse, username: string): Promise<void> {
    await this.storage.set('Login', username);
    await this.storage.set('AccessToken', tokens.AccessToken);
    await this.storage.set('RefreshToken', tokens.RefreshToken);
  }

  /**
   * Clears all stored authentication data
   * @returns {Promise<void>}
   */
  private async clearTokens(): Promise<void> {
    await this.storage.remove('Login');
    await this.storage.remove('AccessToken');
    await this.storage.remove('RefreshToken');
  }

  /**
   * Checks if the user is currently authenticated
   * @returns {Promise<boolean>} True if user is authenticated, false otherwise
   */
  async isAuthenticated(): Promise<boolean> {
    const token = await this.getAccessToken();
    return !!token;
  }

  /**
   * Attempts to restore the session, either by refreshing the token or using stored tokens
   * @returns {Promise<boolean>} True if session was restored, false otherwise
   */
  async restoreSession(): Promise<boolean> {
    const isOnline = await this.ping();

    if (isOnline) {
      const result = await this.refreshToken();
      return result;
    } else {
      const token = await this.getAccessToken();
      return !!token;
    }
  }
}

