import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { StorageService } from './storage.service';
import { Tarea } from '../interfaces/tarea.interface';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Actividad } from '../interfaces/actividad.interface';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private transactionsUrl = `${environment.apiUrl}/apptransactions`;

  constructor(
    private storage: StorageService
  ) {}

  async get(): Promise<any>{
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: `${this.transactionsUrl}/get`, headers };

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

  async postTarea(tarea: Tarea): Promise<boolean> {
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/createtarea`, data:tarea, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 201) { //Created
        return response.data;
      } else {
        throw false;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async patchTarea(tarea: Tarea): Promise<boolean> {
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/updatetarea`, data:tarea, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) { //Ok
        if (response.data != null)
          tarea.IdResiduo = response.data;
        tarea.CRUD = null;
        tarea.CRUDDate = null;
        return true;
      } else {
        return false;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async uploadFotosTarea(tarea: Tarea): Promise<boolean> {
    if (tarea.Fotos && tarea.Fotos.length > 0) {
      const token: string = await this.storage.get('Token');
      const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };

      const formData = new FormData();
      formData.append('IdSolicitud', (tarea.IdDocumento ?? "").toString());
      formData.append('Item', (tarea.Item ?? "").toString());

      for (const [index, photo] of tarea.Fotos.entries()) {
        if (photo.webPath) {
            try {
                const response = await fetch(photo.webPath);
                if (response.ok) {
                    const blob = await response.blob();
                    formData.append(`photos`, blob, `photo${index + 1}.jpg`);
                }
            } catch {
            }
        }
      }
      const options = { url: `${this.transactionsUrl}/uploadfotostarea`, data:formData, headers };
      try{
        const response: HttpResponse = await CapacitorHttp.post(options);
        if (response.status == 200) { //Ok
          return true;
        } else {
          return false;
        }
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Request error: ${error.message}`);
        } else {
          throw new Error(`Unknown error: ${error}`);
        }
      }
    } else {
      return true;
    }
  }

  async patchTransaccion(transaccion: Transaccion): Promise<boolean> {
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/updatetransaccion`, data:transaccion, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) { //Ok
        transaccion.CRUD = undefined;
        transaccion.CRUDDate = undefined;
        return true;
      } else {
        throw false;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async uploadFirmaTransaccion(transaccion: Transaccion): Promise<boolean> {
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };

    if (transaccion.Firma)
    {
      const formData = new FormData();
      formData.append('IdServicio', (transaccion.IdServicio ?? "").toString());
      formData.append('IdRecurso', (transaccion.IdRecurso ?? "").toString());
      formData.append('IdTercero', (transaccion.IdTercero ?? "").toString());
      formData.append('IdPunto', (transaccion.IdDeposito ?? "").toString());
      formData.append('Fecha', (transaccion.FechaProgramada ?? "").toString());
      formData.append('Signature', transaccion.Firma, 'signature.png');
      const options = { url: `${this.transactionsUrl}/uploadfirmatransaccion`, data:formData, headers };
      try{
        const response: HttpResponse = await CapacitorHttp.post(options);
        if (response.status == 200) { //Ok
          return true;
        } else {
          return false;
        }
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Request error: ${error.message}`);
        } else {
          throw new Error(`Unknown error: ${error}`);
        }
      }
    } else {
      return false;
    }
  }

  async patchActividad(actividad: Actividad): Promise<boolean> {
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/updateactividad`, data:actividad, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) { //Ok
        actividad.CRUD = null;
        actividad.CRUDDate = null;
        return true;
      } else {
        throw false;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async uploadFirmaActividad(actividad: Actividad): Promise<boolean> {
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };

    if (actividad.Firma)
    {
      const formData = new FormData();
      formData.append('IdServicio', (actividad.IdServicio ?? "").toString());
      formData.append('IdRecurso', (actividad.IdRecurso ?? "").toString());
      formData.append('Fecha', (actividad.FechaInicio ?? "").toString());
      formData.append('Signature', actividad.Firma, 'signature.png');
      const options = { url: `${this.transactionsUrl}/uploadfirmaactividad`, data:formData, headers };
      try{
        const response: HttpResponse = await CapacitorHttp.post(options);
        if (response.status == 200) { //Ok
          return true;
        } else {
          return false;
        }
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Request error: ${error.message}`);
        } else {
          throw new Error(`Unknown error: ${error}`);
        }
      }
    } else {
      return false;
    }
  }
}
