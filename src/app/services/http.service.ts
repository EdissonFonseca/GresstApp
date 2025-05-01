import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { TokenService } from './token.service';

@Injectable({
  providedIn: 'root'
})
export class HttpService {
  private readonly apiUrl = environment.apiUrl;
  private readonly publicEndpoints = ['/authentication/login', '/authentication/refresh', '/authentication/ping'];

  constructor(private tokenService: TokenService) {}

  private isPublicEndpoint(url: string): boolean {
    return this.publicEndpoints.some(endpoint => url.includes(endpoint));
  }

  private async getHeaders(url: string): Promise<Record<string, string>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    };

    if (!this.isPublicEndpoint(url)) {
      const token = await this.tokenService.getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async get<T>(endpoint: string): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = await this.getHeaders(url);

    const response = await CapacitorHttp.get({
      url,
      headers
    });

    if (response.status >= 400) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  }

  async post<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = await this.getHeaders(url);

    const response = await CapacitorHttp.post({
      url,
      data,
      headers
    });

    if (response.status >= 400) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  }

  async patch<T>(endpoint: string, data: any): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = await this.getHeaders(url);

    const response = await CapacitorHttp.patch({
      url,
      data,
      headers
    });

    if (response.status >= 400) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  }

  async delete<T>(endpoint: string): Promise<T> {
    const url = `${this.apiUrl}${endpoint}`;
    const headers = await this.getHeaders(url);

    const response = await CapacitorHttp.delete({
      url,
      headers
    });

    if (response.status >= 400) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return response.data;
  }
}
