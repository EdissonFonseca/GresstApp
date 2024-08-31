import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private authorizationUrl = `${environment.apiUrl}/authorization`;

  constructor(
    private storage: StorageService
  ) {}

  async get(): Promise<any>{
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: `${this.authorizationUrl}/get/app`, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Request error');
      }
    } catch (error){
      throw(error);
    }
  }
}
