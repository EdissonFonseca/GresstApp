import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { Tarea } from '../interfaces/tarea.interface';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { Globales } from './globales.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private transactionsUrl = `${environment.apiUrl}/apptransactions`;

  constructor(
    private globales: Globales
  ) {}

  async get(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
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
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/createtarea`, data:tarea, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200 || response.status == 201) { //Created
        tarea.CRUD = null;
        tarea.CRUDDate = null;
        tarea.IdSolicitud =  response.data.IdSolicitud;
        tarea.Item = response.data.Item;
        tarea.Solicitud = response.data.Solicitud;
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

  async patchTarea(tarea: Tarea): Promise<boolean> {
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/updatetarea`, data:tarea, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) { //Ok
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
      const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };

      const formData = new FormData();
      formData.append('IdSolicitud', (tarea.IdSolicitud ?? "").toString());
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

  async postTransaccion(transaccion: Transaccion): Promise<boolean> {
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/createtransaccion`, data:transaccion, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 201 || response.status == 200) { //Ok
        transaccion.IdTransaccion =  response.data.IdTransaccion;
        transaccion.IdOrden = response.data.IdOrden;
        transaccion.CRUD = null;
        transaccion.CRUDDate = null;
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

  async patchTransaccion(transaccion: Transaccion): Promise<boolean> {
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/updatetransaccion`, data:transaccion, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) { //Ok
        transaccion.CRUD = null;
        transaccion.CRUDDate = null;
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
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };

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

  async postActividad(actividad: Actividad): Promise<boolean> {
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/createactividad`, data:actividad, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200 || response.status == 201) { //Ok
        actividad.CRUD = null;
        actividad.CRUDDate = null;
        actividad.IdOrden = response.data.IdOrden;
        actividad.IdActividad = response.data.IdActividad;
        actividad.Orden = response.data.Orden;
        console.log(actividad);
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

  async patchActividad(actividad: Actividad): Promise<boolean> {
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
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
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };

    if (actividad.Firma)
    {
      const formData = new FormData();
      formData.append('IdOrden', (actividad.IdOrden ?? "").toString());
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
