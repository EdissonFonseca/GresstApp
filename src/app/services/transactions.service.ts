import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Tarea } from '../interfaces/tarea.interface';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { Transaction } from '@app/interfaces/transaction.interface';
import { StorageService } from './storage.service';
import { HttpService } from './http.service';

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
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpService,
    private storage: StorageService,
  ) {}

  async get(): Promise<Transaction> {
    return this.http.get<Transaction>('/apptransactions/get');
  }

  async postTarea(tarea: Tarea): Promise<boolean> {
    const response = await this.http.post<{ IdTarea: string }>('/apptransactions/createtarea', tarea);
    tarea.IdTarea = response.IdTarea;
    return true;
  }

  async patchTarea(tarea: Tarea): Promise<boolean> {
    try {
      await this.http.post('/apptransactions/updatetarea', tarea);
      return true;
    } catch (error) {
      console.error('Error updating task:', error);
      return false;
    }
  }

  async postTransaccion(transaccion: Transaccion): Promise<boolean> {
    const response = await this.http.post<{ IdTransaccion: string }>('/apptransactions/createtransaccion', transaccion);
    transaccion.IdTransaccion = response.IdTransaccion;
    return true;
  }

  async patchTransaccion(transaccion: Transaccion): Promise<boolean> {
    await this.http.post('/apptransactions/updatetransaccion', transaccion);
    return true;
  }

  async emitCertificate(transaccion: Transaccion): Promise<boolean> {
    await this.http.post('/apptransactions/emitcertificate', transaccion);
    return true;
  }

  async postActividad(actividad: Actividad): Promise<boolean> {
    const response = await this.http.post<{ IdActividad: string }>('/apptransactions/createactividad', actividad);
    actividad.IdActividad = response.IdActividad;
    return true;
  }

  async patchActividad(actividad: Actividad): Promise<boolean> {
    await this.http.post('/apptransactions/updateactividad', actividad);
    return true;
  }

  async postActividadInicio(actividad: Actividad): Promise<boolean> {
    const response = await this.http.post<{ IdActividad: string }>('/apptransactions/createactividadinicio', actividad);
    actividad.IdActividad = response.IdActividad;
    return true;
  }

  async postBackup(data: any): Promise<boolean> {
    await this.http.post('/apptransactions/backup', data);
    return true;
  }
}
