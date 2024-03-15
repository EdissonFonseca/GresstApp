import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class IntegrationService {
  private actividadesUrl = `${environment.apiUrl}/appactividades/get`;
  private configuracionUrl = `${environment.apiUrl}/appconfiguracion/get`;
  private inventarioUrl = `${environment.apiUrl}/appinventario/get`;
  private bancoUrl = `${environment.apiUrl}/appbanco/get`;
  private interlocutoresUrl = `${environment.apiUrl}/appmensaje/listinterlocutores`;
  private mensajesUrl = `${environment.apiUrl}/appmensaje/listmensajes`;

  constructor() {}

  async getActividades(token: string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: this.actividadesUrl, headers };

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

  async getBanco(token: string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: this.bancoUrl, headers };

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

  async getConfiguracion(token: string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: this.configuracionUrl, headers };

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

  async getInterlocutores(token: string, idResiduo:string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: `${this.interlocutoresUrl}/${idResiduo}`, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Request error');
      }
    } catch{
    }
  }

  async getInventario(token: string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: this.inventarioUrl, headers };

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

  async getMensajes(token: string, idResiduo:string, idInterlocutor: string): Promise<any>{
    const data = {IdUsuario: idInterlocutor, IdResiduo: idResiduo};
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: this.mensajesUrl, data: data, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Request error');
      }
    } catch {
    }
  }
}
