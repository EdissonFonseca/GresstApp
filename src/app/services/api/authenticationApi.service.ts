import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpService } from './http.service';
import { StorageService } from '../core/storage.service';
import { LoggerService } from '../core/logger.service';
import { STORAGE } from '@app/constants/constants';
import { fakeAsync } from '@angular/core/testing';

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
export class AuthenticationApiService {
  /** Base URL for API endpoints */
  private readonly apiUrl = environment.apiUrl;
  private isInitialized = false;

  constructor(
    private http: HttpService,
    private storage: StorageService,
    private logger: LoggerService
  ) {
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
      const response = await this.http.post<TokenResponse>('/authentication/login', {
        Username: username,
        Password: password
      });

      if (response.status !== 200 || !response.data.AccessToken || !response.data.RefreshToken) {
        return false;
      }

      await this.storage.set(STORAGE.ACCESS_TOKEN, response.data.AccessToken);
      await this.storage.set(STORAGE.REFRESH_TOKEN, response.data.RefreshToken);
      await this.storage.set(STORAGE.USERNAME, username);

      return true;
    } catch (error) {
      this.logger.error('Login failed', error);
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
      const response = await this.http.post<boolean>('/authentication/register', { email, name, password });
      return response.data;
    } catch (error) {
      this.logger.error('Registration failed', error);
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
      return response.data;
    } catch (error) {
      this.logger.error('User existence check failed', error);
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
      return response.data;
    } catch (error) {
      this.logger.error('Name change failed', error);
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
      return response.data;
    } catch (error) {
      this.logger.error('Password change failed', error);
      throw error;
    }
  }

  async isRefreshTokenValid(): Promise<boolean> {
    try {
      const refreshToken = await this.storage.get(STORAGE.REFRESH_TOKEN);
      const username = await this.storage.get(STORAGE.USERNAME);

      if (!refreshToken || !username) {
        this.logger.error('No refresh token or username found during validation', { refreshToken, username });
        return false;
      }
      const response = await this.http.post<boolean>('/authentication/isvalidrefreshtoken', {
        RefreshToken: refreshToken,
        Username: username
      });

      return (response.status === 200);
    } catch (error) {
      this.logger.error('Error validating token', error);
      return false;
    }  }

  /**
   * Refreshes the access token using the stored refresh token
   * @returns {Promise<boolean>} True if refresh successful, false otherwise
   */
  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = await this.storage.get(STORAGE.REFRESH_TOKEN);
      const username = await this.storage.get(STORAGE.USERNAME);

      if (!refreshToken || !username) {
        this.logger.error('No refresh token or username found during refresh', { refreshToken, username });
        return false;
      }

      const response = await this.http.post<TokenResponse>('/authentication/refreshtoken', {
        RefreshToken: refreshToken,
        Username: username
      });

      if (!response.data.AccessToken || !response.data.RefreshToken) {
        this.logger.error('Invalid refresh token response', { response });
        return false;
      }

      await this.storage.set(STORAGE.ACCESS_TOKEN, response.data.AccessToken);
      await this.storage.set(STORAGE.REFRESH_TOKEN, response.data.RefreshToken);
      return true;
    } catch (error) {
      this.logger.error('Error refreshing token', error);
      await this.logout();
      return false;
    }
  }

  /**
   * Logs out the current user and clears stored tokens
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    await this.storage.clear();
  }
}

