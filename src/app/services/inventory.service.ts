import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { Globales } from './globales.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private bancoUrl = `${environment.apiUrl}/appbanco`;
  private inventoryUrl = `${environment.apiUrl}/appinventory`;

  constructor(
    private globales: Globales,
  ) {}

  async getBanco(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.bancoUrl}/get`, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Request error');
      }
    } catch {
    }
  }

  async get(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.inventoryUrl}/get`, headers };

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
