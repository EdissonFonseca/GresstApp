import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpOptions, HttpResponse } from '@capacitor/core';
import { LoggerService } from '../core/logger.service';
import { environment } from '../../../environments/environment';
import { Storage } from '@ionic/storage-angular';
import { jwtDecode } from 'jwt-decode';
import { STORAGE } from '@app/constants/constants';

interface RetryConfig {
  maxRetries: number;
  initialDelay: number;
  maxDelay: number;
  backoffFactor: number;
  retryableStatusCodes: number[];
}

/**
 * Service responsible for handling HTTP requests using Capacitor's HTTP client.
 * Provides methods for making HTTP requests with authentication and error handling.
 */
@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private isRefreshing = false;
  private readonly apiUrl = environment.apiUrl;
  private readonly noAuthEndpoints = [
    '/authentication/ping',
    '/authentication/login',
    '/authentication/register',
    '/authentication/existuser',
    '/authentication/reset-password',
    '/authentication/refreshtoken'
  ];

  private readonly retryConfig: RetryConfig = {
    maxRetries: 3,
    initialDelay: 1000, // 1 second
    maxDelay: 10000, // 10 seconds
    backoffFactor: 2,
    retryableStatusCodes: [408, 429, 500, 502, 503, 504] // Timeout, Too Many Requests, Server Errors
  };

  constructor(
    private storage: Storage,
    private logger: LoggerService
  ) {}

  /**
   * Checks if the given URL requires authentication
   * @param {string} url - The URL to check
   * @returns {boolean} True if the URL requires authentication
   */
  private needsAuth(url: string): boolean {
    return !this.noAuthEndpoints.some(endpoint => url.includes(endpoint));
  }

  /**
   * Checks if a JWT token is expired
   * @param {string} token - The JWT token to check
   * @returns {boolean} True if the token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      return (decoded as any).exp < currentTime;
    } catch (error) {
      this.logger.error('Error decoding token', error);
      return true;
    }
  }

  /**
   * Gets the headers for the HTTP request
   * @param {string} url - The URL for the request
   * @returns {Promise<Record<string, string>>} The headers for the request
   */
  private async getHeaders(url: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (this.needsAuth(url)) {
      const token = await this.storage.get(STORAGE.ACCESS_TOKEN);

      if (token) {
        // Check if token is expired before using it
        if (this.isTokenExpired(token)) {
          this.logger.info('Token expired, refreshing before request');
          await this.refreshToken();
          const newToken = await this.storage.get(STORAGE.ACCESS_TOKEN);
          if (newToken) {
            headers['Authorization'] = `Bearer ${newToken}`;
          }
        } else {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }
    }

    return headers;
  }

  /**
   * Refreshes the access token
   * @returns {Promise<void>}
   */
  private async refreshToken(): Promise<void> {
    if (this.isRefreshing) {
      return;
    }

    this.isRefreshing = true;
    try {
      const refreshToken = await this.storage.get(STORAGE.REFRESH_TOKEN);
      const username = await this.storage.get(STORAGE.USERNAME);

      if (!refreshToken || !username) {
        throw new Error('No refresh token or username found');
      }

      const response = await CapacitorHttp.request({
        url: `${this.apiUrl}/authentication/refreshtoken`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        data: {
          RefreshToken: refreshToken,
          Username: username
        }
      });

      if (response.status === 200 && response.data) {
        await this.storage.set(STORAGE.ACCESS_TOKEN, response.data.AccessToken);
        await this.storage.set(STORAGE.REFRESH_TOKEN, response.data.RefreshToken);
      } else {
        throw new Error('Failed to refresh token');
      }
    } catch (error) {
      this.logger.error('Error refreshing token', error);
      throw error;
    } finally {
      this.isRefreshing = false;
    }
  }

  /**
   * Calculates the delay for the next retry using exponential backoff
   * @param {number} retryCount - The current retry attempt number
   * @returns {number} The delay in milliseconds
   */
  private calculateRetryDelay(retryCount: number): number {
    const delay = Math.min(
      this.retryConfig.initialDelay * Math.pow(this.retryConfig.backoffFactor, retryCount),
      this.retryConfig.maxDelay
    );
    // Add some jitter to prevent all retries from happening at the same time
    return delay + Math.random() * 1000;
  }

  /**
   * Checks if the error should trigger a retry
   * @param {any} error - The error to check
   * @returns {boolean} True if the error should trigger a retry
   */
  private shouldRetry(error: any): boolean {
    return (
      this.retryConfig.retryableStatusCodes.includes(error?.status) ||
      error?.message?.includes('timeout') ||
      error?.message?.includes('network')
    );
  }

  /**
   * Makes an HTTP request with the given method, URL and data
   * @template T - The type of data expected in the response
   * @param {('GET'|'POST'|'PUT'|'DELETE')} method - The HTTP method to use
   * @param {string} url - The URL to request
   * @param {any} [data] - Optional data to send with the request
   * @returns {Promise<{status: number, data: T}>} The response with status and data
   * @throws {Error} If the request fails
   */
  private async request<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any
  ): Promise<{ status: number; data: T }> {
    const fullUrl = `${this.apiUrl}${url}`;
    let retryCount = 0;

    while (true) {
      try {
        const headers = await this.getHeaders(url);
        const options: HttpOptions = {
          url: fullUrl,
          headers,
          data,
          method
        };

        const response: HttpResponse = await CapacitorHttp.request(options);
        return {
          status: response.status,
          data: response.data as T
        };
      } catch (error: any) {
        // Handle 401 errors separately
        if (error?.status === 401 && this.needsAuth(url) && !this.isRefreshing) {
          const retryResponse = await this.handle401<T>(method, url, data);
          return retryResponse;
        }

        // Check if we should retry
        if (retryCount < this.retryConfig.maxRetries && this.shouldRetry(error)) {
          retryCount++;
          const delay = this.calculateRetryDelay(retryCount);

          this.logger.warn('Retrying request', {
            url,
            method,
            retryCount,
            delay,
            error: error?.message || error
          });

          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }

        // If we've exhausted retries or shouldn't retry, throw the error
        this.logger.error('HTTP Error', {
          url,
          method,
          status: error?.status,
          message: error?.message || error,
          retryCount
        });

        throw error;
      }
    }
  }

  /**
   * Handles 401 Unauthorized errors by refreshing the token and retrying the request
   * @template T - The type of data expected in the response
   * @param {('GET'|'POST'|'PUT'|'DELETE')} method - The HTTP method to use
   * @param {string} url - The URL to request
   * @param {any} [data] - Optional data to send with the request
   * @returns {Promise<{status: number, data: T}>} The response with status and data
   * @throws {Error} If the token refresh fails
   */
  private async handle401<T>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE',
    url: string,
    data?: any
  ): Promise<{ status: number; data: T }> {
    this.isRefreshing = true;
    try {
      await this.refreshToken();
      const response = await CapacitorHttp.request({
        url: `${this.apiUrl}${url}`,
        headers: await this.getHeaders(url),
        data,
        method
      });
      return {
        status: response.status,
        data: response.data as T
      };
    } catch (refreshError) {
      this.isRefreshing = false;
      this.logger.error('Could not refresh token', refreshError);
      throw refreshError;
    }
  }

  /**
   * Makes a GET request
   * @template T - The type of data expected in the response
   * @param {string} url - The URL to request
   * @returns {Promise<{status: number, data: T}>} The response with status and data
   */
  get<T>(url: string): Promise<{ status: number; data: T }> {
    return this.request<T>('GET', url);
  }

  /**
   * Makes a POST request
   * @template T - The type of data expected in the response
   * @param {string} url - The URL to request
   * @param {any} data - The data to send with the request
   * @returns {Promise<{status: number, data: T}>} The response with status and data
   */
  post<T>(url: string, data: any): Promise<{ status: number; data: T }> {
    return this.request<T>('POST', url, data);
  }

  /**
   * Makes a PUT request
   * @template T - The type of data expected in the response
   * @param {string} url - The URL to request
   * @param {any} data - The data to send with the request
   * @returns {Promise<{status: number, data: T}>} The response with status and data
   */
  put<T>(url: string, data: any): Promise<{ status: number; data: T }> {
    return this.request<T>('PUT', url, data);
  }

  /**
   * Makes a DELETE request
   * @template T - The type of data expected in the response
   * @param {string} url - The URL to request
   * @returns {Promise<{status: number, data: T}>} The response with status and data
   */
  delete<T>(url: string): Promise<{ status: number; data: T }> {
    return this.request<T>('DELETE', url);
  }
}
