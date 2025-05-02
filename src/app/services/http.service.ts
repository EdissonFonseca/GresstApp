import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

/**
 * Custom error class for HTTP related errors
 */
export class HttpError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: any
  ) {
    super(message);
    this.name = 'HttpError';
  }
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
 * Service responsible for handling HTTP requests using CapacitorHttp
 * Includes authentication token management and error handling
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  /** Base URL for API endpoints */
  private readonly apiUrl = environment.apiUrl;
  /** List of endpoints that don't require authentication */
  private readonly publicEndpoints = [
    '/authentication/login',
    '/authentication/refresh',
    '/authentication/ping',
    '/authentication/register',
    '/authentication/exist',
    '/api/sync/initial',
    '/api/sync/refresh'
  ];

  constructor(private tokenService: TokenService) {}

  /**
   * Checks if an endpoint should be excluded from authentication
   * @param {string} url - The URL to check
   * @returns {boolean} True if the endpoint should be excluded from authentication
   */
  private isPublicEndpoint(url: string): boolean {
    return this.publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Handles HTTP errors and throws appropriate custom errors
   * @param {any} error - The error to handle
   * @returns {never} Throws a custom error
   */
  private handleError(error: any): never {
    // Log the full error for debugging
    console.error('🔍 [HTTP] Error Details:', {
      error,
      stack: error?.stack,
      message: error?.message,
      status: error?.status,
      data: error?.data,
      response: error?.response,
      url: error?.url || error?.config?.url
    });

    // Handle FIDO2 specific errors
    if (error instanceof Error && error.name === 'FallbackRequestedError') {
      throw new FidoError('FIDO2 authentication fallback requested');
    }

    // If it's already our custom error, just rethrow it
    if (error instanceof HttpError) {
      throw error;
    }

    // Extract error details safely
    const errorMessage = error?.message || 'An unknown error occurred';
    const status = error?.status || error?.response?.status;
    const data = error?.data || error?.response?.data;
    const url = error?.url || error?.config?.url;

    // Log structured error information
    console.error('❌ [HTTP] Error:', {
      message: errorMessage,
      status,
      data,
      url,
      errorType: error?.constructor?.name,
      stack: error?.stack
    });

    // Create and throw a new HttpError with the extracted information
    throw new HttpError(
      `Request failed: ${errorMessage}${url ? ` (${url})` : ''}`,
      status,
      data
    );
  }

  /**
   * Makes a GET request to the specified endpoint
   * @param {string} endpoint - The API endpoint to call
   * @param {any} [data] - Optional data to send in the request body
   * @returns {Promise<T>} The response data
   * @throws {HttpError} If the request fails
   */
  async get<T>(endpoint: string, data?: any): Promise<T> {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (!this.isPublicEndpoint(endpoint)) {
        const token = await this.tokenService.getToken();
        if (!token) {
          throw new HttpError('No authentication token available');
        }
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await CapacitorHttp.get({
        url,
        headers,
        data
      });

      if (response.status >= 400) {
        throw new HttpError('Request failed', response.status, response.data);
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Makes a POST request to the specified endpoint
   * @param {string} endpoint - The API endpoint to call
   * @param {any} data - The data to send in the request body
   * @returns {Promise<T>} The response data
   * @throws {HttpError} If the request fails
   */
  async post<T>(endpoint: string, data: any): Promise<T> {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (!this.isPublicEndpoint(endpoint)) {
        const token = await this.tokenService.getToken();
        if (!token) {
          throw new HttpError('No authentication token available');
        }
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await CapacitorHttp.post({
        url,
        headers,
        data
      });

      if (response.status >= 400) {
        throw new HttpError('Request failed', response.status, response.data);
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Makes a PATCH request to the specified endpoint
   * @param {string} endpoint - The API endpoint to call
   * @param {any} data - The data to send in the request body
   * @returns {Promise<T>} The response data
   * @throws {HttpError} If the request fails
   */
  async patch<T>(endpoint: string, data: any): Promise<T> {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (!this.isPublicEndpoint(endpoint)) {
        const token = await this.tokenService.getToken();
        if (!token) {
          throw new HttpError('No authentication token available');
        }
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await CapacitorHttp.patch({
        url,
        headers,
        data
      });

      if (response.status >= 400) {
        throw new HttpError('Request failed', response.status, response.data);
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }

  /**
   * Makes a DELETE request to the specified endpoint
   * @param {string} endpoint - The API endpoint to call
   * @returns {Promise<T>} The response data
   * @throws {HttpError} If the request fails
   */
  async delete<T>(endpoint: string): Promise<T> {
    try {
      const url = `${this.apiUrl}${endpoint}`;
      const headers: Record<string, string> = {
        'Content-Type': 'application/json'
      };

      if (!this.isPublicEndpoint(endpoint)) {
        const token = await this.tokenService.getToken();
        if (!token) {
          throw new HttpError('No authentication token available');
        }
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await CapacitorHttp.delete({
        url,
        headers
      });

      if (response.status >= 400) {
        throw new HttpError('Request failed', response.status, response.data);
      }

      return response.data;
    } catch (error) {
      return this.handleError(error);
    }
  }
}
