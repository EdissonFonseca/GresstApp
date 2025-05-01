import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';
import { TokenService } from './token.service';

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

  constructor(
    private http: HttpService,
    private tokenService: TokenService
  ) {}

  /**
   * Checks if an endpoint should be excluded from authentication
   * @param {string} url - The URL to check
   * @returns {boolean} True if the endpoint should be excluded from authentication
   */
  public isPublicEndpoint(url: string): boolean {
    const publicEndpoints = ['/authentication/login', '/authentication/refresh', '/authentication/ping'];
    return publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Checks if the server is reachable
   * @returns {Promise<boolean>} True if server is reachable, false otherwise
   */
  async ping(): Promise<boolean> {
    try {
      const response = await this.http.get<boolean>('/authentication/ping');
      return response;
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
    const response = await this.http.post<{ access_token: string; refresh_token: string }>('/authentication/login', {
      Username: username,
      Password: password
    });

    await this.tokenService.setToken(response.access_token, response.refresh_token);
    return true;
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
      const response = await this.http.post<boolean>('/authentication/register', { email, name, password });
      return response;
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
      const response = await this.http.post<boolean>('/authentication/exist', { email });
      return response;
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
      const response = await this.http.post<boolean>('/authentication/change-name', { currentPassword, newName });
      return response;
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
      const response = await this.http.post<boolean>('/authentication/change-password', { currentPassword, newPassword });
      return response;
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
    if (!await this.tokenService.hasRefreshToken()) {
      return false;
    }

    try {
      const refreshToken = await this.tokenService.getRefreshToken();
      const response = await this.http.post<{ access_token: string; refresh_token: string }>('/authentication/refresh', {
        refresh_token: refreshToken
      });

      await this.tokenService.setToken(response.access_token, response.refresh_token);
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      await this.logout();
      return false;
    }
  }

  /**
   * Logs out the current user and clears stored tokens
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    await this.tokenService.clearTokens();
  }

  /**
   * Retrieves the current access token
   * @returns {Promise<string | null>} Current access token or null if not found
   */
  async getAccessToken(): Promise<string | null> {
    return this.tokenService.getToken();
  }

  /**
   * Checks if the user is currently authenticated
   * @returns {Promise<boolean>} True if user is authenticated, false otherwise
   */
  async isAuthenticated(): Promise<boolean> {
    return this.tokenService.hasValidToken();
  }

  /**
   * Attempts to restore the session, either by refreshing the token or using stored tokens
   * @returns {Promise<boolean>} True if session was restored, false otherwise
   */
  async restoreSession(): Promise<boolean> {
    const isOnline = await this.ping();

    if (isOnline) {
      // Si tenemos un token válido, no necesitamos refrescarlo
      if (await this.tokenService.hasValidToken()) {
        return true;
      }

      // Si tenemos un refresh token, intentamos refrescar
      if (await this.tokenService.hasRefreshToken()) {
        return await this.refreshToken();
      }
    }

    // Si estamos offline, verificamos si tenemos un token válido
    return await this.tokenService.hasValidToken();
  }
}

