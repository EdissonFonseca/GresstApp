import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { GlobalesService } from './globales.service';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private authorizationUrl = `${environment.apiUrl}/authorization`;

  constructor(
    private globales: GlobalesService
  ) {}

  async get(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}`, 'Content-Type': 'application/json' };
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
