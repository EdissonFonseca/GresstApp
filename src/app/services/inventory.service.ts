import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private bancoUrl = `${environment.apiUrl}/appbanco`;
  private inventoryUrl = `${environment.apiUrl}/appinventory`;

  constructor() {}

  async getBanco(): Promise<any> {
    const options = {
      url: `${this.bancoUrl}/get`,
      headers: { 'Content-Type': 'application/json' }
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

  async get(): Promise<any> {
    const options = {
      url: `${this.inventoryUrl}/get`,
      headers: { 'Content-Type': 'application/json' }
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
