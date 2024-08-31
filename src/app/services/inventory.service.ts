import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class InventoryService {
  private bancoUrl = `${environment.apiUrl}/appbanco`;
  private inventoryUrl = `${environment.apiUrl}/appinventory`;

  constructor(
    private storage: StorageService
  ) {}

  async getBanco(): Promise<any>{
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}` };
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

  async getInventario(): Promise<any>{
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}` };
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
