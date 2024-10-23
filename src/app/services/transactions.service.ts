import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { Tarea } from '../interfaces/tarea.interface';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { GlobalesService } from './globales.service';
import { AppConfig } from './constants.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private transactionsUrl = `${environment.apiUrl}/apptransactions`;

  constructor(
    private globales: GlobalesService
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
    const options = { url: `${this.transactionsUrl}/createtarea`, data:tarea, headers, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200 || response.status == 201) { //Created
        tarea.CRUD = null;
        tarea.IdSolicitud =  response.data.IdSolicitud;
        tarea.Item = response.data.Item;
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

  async patchTarea(tarea: Tarea): Promise<boolean> {
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/updatetarea`, data:tarea, headers, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) { //Ok
        tarea.CRUD = null;
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

  async postTransaccion(transaccion: Transaccion): Promise<boolean> {
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/createtransaccion`, data:transaccion, headers, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 201 || response.status == 200) { //Ok
        transaccion.IdTransaccion =  response.data.IdTransaccion;
        transaccion.IdOrden = response.data.IdOrden;
        transaccion.CRUD = null;
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

  async patchTransaccion(transaccion: Transaccion): Promise<boolean> {
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/updatetransaccion`, data:transaccion, headers, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) { //Ok
        transaccion.CRUD = null;
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

  async postActividad(actividad: Actividad): Promise<boolean> {
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/createactividad`, data:actividad, headers, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout };

    console.log('PostActividad');
    console.log(actividad);
    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200 || response.status == 201) { //Ok
        actividad.CRUD = null;
        actividad.IdOrden = response.data.IdOrden;
        actividad.IdActividad = response.data.IdActividad;
        actividad.Orden = response.data.Orden;
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

  async patchActividad(actividad: Actividad): Promise<boolean> {
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/updateactividad`, data:actividad, headers, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout };

    console.log('PatchActividad');
    console.log(actividad);
    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) { //Ok
        actividad.CRUD = null;
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

  async postActividadInicio(actividad: Actividad): Promise<boolean> {
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.transactionsUrl}/updateactividadInicio`, data:actividad, headers, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) { //Ok
        actividad.CRUD = null;
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

}
