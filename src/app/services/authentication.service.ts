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
    private tokenService: TokenService
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
      console.error('Authentication service initialization failed:', error);
      // Don't throw here, just log the error
      this.isInitialized = true;
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
      console.log('🔐 [Auth] Iniciando proceso de login para usuario:', username);

      const response = await this.http.post<TokenResponse>('/authentication/login', {
        Username: username,
        Password: password
      });

      console.log('✅ [Auth] Login exitoso, respuesta:', response);

      if (!response.AccessToken || !response.RefreshToken) {
        console.error('❌ [Auth] Respuesta de login inválida:', response);
        throw new Error('Respuesta de login inválida');
      }

      console.log('🔑 [Auth] Guardando tokens...');
      await this.tokenService.setToken(response.AccessToken, response.RefreshToken, username);
      console.log('✅ [Auth] Tokens guardados exitosamente');

      // Verificar que el token esté disponible
      const token = await this.tokenService.getToken();
      console.log('🔍 [Auth] Token después de guardar:', token ? 'Disponible' : 'No disponible');

      if (!token) {
        console.error('❌ [Auth] Token no disponible después de guardar');
        throw new Error('Token no disponible después de guardar');
      }

      return true;
    } catch (error) {
      console.error('❌ [Auth] Error en login:', error);
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
    console.log('🔄 [Auth] Iniciando refresh token...');

    if (!await this.tokenService.hasRefreshToken()) {
      console.log('❌ [Auth] No hay refresh token disponible');
      return false;
    }

    try {
      const refreshToken = await this.tokenService.getRefreshToken();
      const username = await this.tokenService.getUsername();

      if (!username) {
        console.error('❌ [Auth] No se encontró username durante refresh token');
        return false;
      }

      console.log('🔄 [Auth] Enviando solicitud de refresh token...');
      const response = await this.http.post<{ access_token: string; refresh_token: string }>('/authentication/refresh', {
        refresh_token: refreshToken
      });

      console.log('✅ [Auth] Refresh token exitoso, actualizando tokens...');
      await this.tokenService.setToken(response.access_token, response.refresh_token, username);
      console.log('✅ [Auth] Tokens actualizados exitosamente');

      return true;
    } catch (error) {
      console.error('❌ [Auth] Error en refresh token:', error);
      await this.logout();
      return false;
    }
  }

  /**
   * Logs out the current user and clears stored tokens
   * @returns {Promise<void>}
   */
  async logout(): Promise<void> {
    console.log('🚪 [Auth] Iniciando logout...');
    await this.tokenService.clearTokens();
    console.log('✅ [Auth] Logout completado');
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
      console.log('🔄 [Auth] Servicio no inicializado, iniciando...');
      await this.initialize();
    }
    const isAuth = await this.tokenService.hasValidToken();
    console.log('🔍 [Auth] Estado de autenticación:', isAuth);
    return isAuth;
  }

  /**
   * Attempts to restore the session, either by refreshing the token or using stored tokens
   * @returns {Promise<boolean>} True if session was restored, false otherwise
   */
  async restoreSession(): Promise<boolean> {
    console.log('🔄 [Auth] Intentando restaurar sesión...');
    try {
      const isOnline = await this.ping();
      console.log('🌐 [Auth] Estado de conexión:', isOnline);

      if (isOnline) {
        // If we have a valid token, no need to refresh
        if (await this.tokenService.hasValidToken()) {
          console.log('✅ [Auth] Token válido encontrado');
          return true;
        }

        // If we have a refresh token, try to refresh
        if (await this.tokenService.hasRefreshToken()) {
          console.log('🔄 [Auth] Intentando refresh token...');
          return await this.refreshToken();
        }
      }

      // If we're offline, check if we have a valid token
      const hasValidToken = await this.tokenService.hasValidToken();
      console.log('🔍 [Auth] Estado de token offline:', hasValidToken);
      return hasValidToken;
    } catch (error) {
      console.error('❌ [Auth] Error restaurando sesión:', error);
      return false;
    }
  }
}

