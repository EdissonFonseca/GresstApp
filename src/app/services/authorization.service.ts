import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private authorizationUrl = `${environment.apiUrl}/authorization`;

  constructor(private authService: AuthenticationService) {}

  async get(): Promise<any> {
    const token = await this.authService.getAccessToken();
    if (!token) {
      throw new Error('No access token available');
    }

    const options = {
      url: `${this.authorizationUrl}/get/app`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      webFetchExtra: {
        mode: 'cors' as RequestMode,
        cache: 'no-cache' as RequestCache,
        credentials: 'omit' as RequestCredentials
      }
    };

    try {
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request error');
    } catch (error) {
      throw error;
    }
  }
}
