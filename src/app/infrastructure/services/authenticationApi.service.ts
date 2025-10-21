import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { HttpService } from './http.service';
import { StorageService } from './storage.service';
import { LoggerService } from './logger.service';
import { STORAGE } from '@app/core/constants';
import { Session } from '@app/domain/entities/session.entity';
import { Account } from '@app/domain/entities/account.entity';
import { User } from '@app/domain/entities/user.entity';
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

      const session: Session = {
        AccessToken: response.data.AccessToken,
        RefreshToken: response.data.RefreshToken,
        UserName: username,
        StartDate: new Date().toISOString(),
      };
      await this.storage.set(STORAGE.SESSION, session);

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
      const session = await this.storage.get(STORAGE.SESSION);

      if (!session.RefreshToken || !session.UserName) {
        this.logger.error('No refresh token or username found during validation', { session });
        return false;
      }
      const response = await this.http.post<boolean>('/authentication/isvalidrefreshtoken', {
        RefreshToken: session.RefreshToken,
        Username: session.UserName
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
      const session = await this.storage.get(STORAGE.SESSION);

      if (!session.RefreshToken || !session.UserName) {
        this.logger.error('No refresh token or username found during refresh', { session });
        return false;
      }

      const response = await this.http.post<TokenResponse>('/authentication/refreshtoken', {
        RefreshToken: session.RefreshToken,
        Username: session.UserName
      });

      if (!response.data.AccessToken || !response.data.RefreshToken) {
        this.logger.error('Invalid refresh token response', { response });
        return false;
      }

      await this.storage.set(STORAGE.SESSION, {
        AccessToken: response.data.AccessToken,
        RefreshToken: response.data.RefreshToken,
        UserName: session.UserName
      });
      return true;
    } catch (error) {
      this.logger.error('Error refreshing token', error);
      await this.logout();
      return false;
    }
  }
  /// <summary>
  /// Gets the user account from the authentication server
  /// </summary>
  /// <returns>The user account</returns>
  async getAccount(): Promise<Account> {
    try {
      const response = await this.http.get<Account>('/authentication/getaccount');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting user account', error);
      throw error;
    }
  }
  /// <summary>
  /// Gets the user data from the authentication server
  /// </summary>
  /// <returns>The user data</returns>
  async getUser(): Promise<User> {
    try {
      const response = await this.http.get<User>('/authentication/getuser');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting user data', error);
      throw error;
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

