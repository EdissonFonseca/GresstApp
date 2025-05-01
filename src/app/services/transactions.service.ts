import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { Tarea } from '../interfaces/tarea.interface';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { Transaction } from '@app/interfaces/transaction.interface';
import { StorageService } from './storage.service';
import { HttpClient } from '@angular/common/http';

interface TareaResponse {
  IdSolicitud: number;
  Item: number;
}

interface TransaccionResponse {
  IdOrden: string;
}

interface ActividadResponse {
  IdOrden: string;
  Orden: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private transactionsUrl = `${environment.apiUrl}/apptransactions`;

  constructor(
    private readonly http: HttpClient,
    private storage: StorageService,
  ) {}

  async get(): Promise<Transaction> {
    try {
      const options = { url: `${this.transactionsUrl}/get` };
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status === 200) {
        return response.data;
      }
      throw new Error('Request failed');
    } catch (error) {
      throw error;
    }
  }

  async postTarea(tarea: Tarea): Promise<boolean> {
    try {
      const options = {
        url: `${this.transactionsUrl}/createtarea`,
        data: tarea,
        headers: { 'Content-Type': 'application/json' }
      };
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 200 || response.status === 201) {
        tarea.CRUD = null;
        tarea.IdSolicitud = response.data.IdSolicitud;
        tarea.Item = response.data.Item;
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async patchTarea(tarea: Tarea): Promise<boolean> {
    try {
      const options = {
        url: `${this.transactionsUrl}/updatetarea`,
        data: tarea,
        headers: { 'Content-Type': 'application/json' }
      };
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 200) {
        tarea.CRUD = null;
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async postTransaccion(transaccion: Transaccion): Promise<boolean> {
    try {
      const options = {
        url: `${this.transactionsUrl}/createtransaccion`,
        data: transaccion,
        headers: { 'Content-Type': 'application/json' }
      };
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 200 || response.status === 201) {
        transaccion.IdOrden = response.data.IdOrden;
        transaccion.CRUD = null;
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async patchTransaccion(transaccion: Transaccion): Promise<boolean> {
    try {
      const options = {
        url: `${this.transactionsUrl}/updatetransaccion`,
        data: transaccion,
        headers: { 'Content-Type': 'application/json' }
      };
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 200) {
        transaccion.CRUD = null;
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async emitCertificate(transaccion: Transaccion): Promise<boolean> {
    try {
      const options = {
        url: `${this.transactionsUrl}/emitircertificado`,
        data: transaccion,
        headers: { 'Content-Type': 'application/json' }
      };
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 200) {
        transaccion.CRUD = null;
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async postActividad(actividad: Actividad): Promise<boolean> {
    try {
      const options = {
        url: `${this.transactionsUrl}/createactividad`,
        data: actividad,
        headers: { 'Content-Type': 'application/json' }
      };
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 200 || response.status === 201) {
        actividad.CRUD = null;
        actividad.IdOrden = response.data.IdOrden;
        actividad.Orden = response.data.Orden;
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async patchActividad(actividad: Actividad): Promise<boolean> {
    try {
      const options = {
        url: `${this.transactionsUrl}/updateactividad`,
        data: actividad,
        headers: { 'Content-Type': 'application/json' }
      };
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 200) {
        actividad.CRUD = null;
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async postActividadInicio(actividad: Actividad): Promise<boolean> {
    try {
      const options = {
        url: `${this.transactionsUrl}/updateactividadinicio`,
        data: actividad,
        headers: { 'Content-Type': 'application/json' }
      };
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status === 200) {
        actividad.CRUD = null;
        return true;
      }
      return false;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async postBackup(transaction: Transaction): Promise<boolean> {
    try {
      const options = {
        url: `${this.transactionsUrl}/backup`,
        data: transaction,
        headers: { 'Content-Type': 'application/json' }
      };
      const response: HttpResponse = await CapacitorHttp.post(options);
      return response.status === 200;
    } catch (error) {
      return false;
    }
  }
}
