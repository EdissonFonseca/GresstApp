import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { HttpService } from './http.service';
import { TokenService } from './token.service';
import { SynchronizationService } from './synchronization.service';
import { LoggerService } from './logger.service';

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
 * Custom error class for FIDO2 related errors
 */
export class FidoError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'FidoError';
  }
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
  private isInitialized = false;

  constructor(
    private http: HttpService,
    private tokenService: TokenService,
    private syncService: SynchronizationService,
    private logger: LoggerService
  ) {
    this.initialize();
  }

  /**
   * Initialize the authentication service
   */
  private async initialize(): Promise<void> {
    try {
      await this.restoreSession();
      this.isInitialized = true;
    } catch (error) {
      this.logger.error('Authentication service initialization failed', error);
      this.isInitialized = true;
    }
  }

  /**
   * Restores the user session if a valid token exists
   * @returns {Promise<boolean>} True if session was restored successfully
   */
  async restoreSession(): Promise<boolean> {
    try {
      const username = await this.tokenService.getUsername();
      if (!username) {
        this.logger.info('No stored username found');
        return false;
      }

      this.logger.info('Found stored username', { username });

      // Verificar si hay conexión
      const isOnline = await this.ping();

      if (isOnline) {
        this.logger.info('Device is online, attempting to sync data');
        try {
          // Intentar sincronizar datos
          await this.syncService.refresh();
          this.logger.info('Data sync completed successfully');
          return true;
        } catch (error) {
          this.logger.error('Data sync failed', error);
          // Si falla la sincronización, continuar con el usuario offline
          return true;
        }
      } else {
        this.logger.info('Device is offline, continuing with stored user');
        return true;
      }
    } catch (error) {
      this.logger.error('Error restoring session', error);
      return false;
    }
  }

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
        this.logger.error('Ping failed', {
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
      const response = await this.http.post<TokenResponse>('/authentication/login', {
        Username: username,
        Password: password
      });

      if (!response.AccessToken || !response.RefreshToken) {
        this.logger.error('Invalid login response', { response });
        throw new Error('Respuesta de login inválida');
      }

      await this.tokenService.setToken(response.AccessToken, response.RefreshToken, username);

      const token = await this.tokenService.getToken();
      if (!token) {
        this.logger.error('Token not available after saving', { username });
        throw new Error('Token no disponible después de guardar');
      }

      // Intentar sincronizar datos después del login exitoso
      try {
        await this.syncService.refresh();
        this.logger.info('Initial data sync completed successfully');
      } catch (error) {
        this.logger.error('Initial data sync failed', error);
        // Continuar aunque falle la sincronización
      }

      return true;
    } catch (error) {
      this.logger.error('Login failed', error);
      if (error instanceof Error && error.name === 'FallbackRequestedError') {
        throw new FidoError('FIDO2 authentication fallback requested');
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
      const response = await this.http.post<boolean>('/authentication/register', { email, name, password });
      return response;
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
      return response;
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
      return response;
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
      return response;
    } catch (error) {
      this.logger.error('Password change failed', error);
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
      const username = await this.tokenService.getUsername();

      if (!username) {
        this.logger.error('No username found during refresh token', { refreshToken });
        return false;
      }

      const response = await this.http.post<{ access_token: string; refresh_token: string }>('/authentication/refreshtoken', {
        refresh_token: refreshToken
      });

      await this.tokenService.setToken(response.access_token, response.refresh_token, username);
      return true;
    } catch (error) {
      this.logger.error('Error in refresh token', error);
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
    if (!this.isInitialized) {
      await this.initialize();
    }
    return await this.tokenService.hasValidToken();
  }
}

