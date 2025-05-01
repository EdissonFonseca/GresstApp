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
    return this.http.get<Transaction>('/transactions/get');
  }

  async postTarea(tarea: Tarea): Promise<boolean> {
    const response = await this.http.post<{ IdTarea: string }>('/transactions/posttarea', tarea);
    tarea.IdTarea = response.IdTarea;
    return true;
  }

  async patchTarea(tarea: Tarea): Promise<boolean> {
    await this.http.patch('/transactions/patchtarea', tarea);
    return true;
  }

  async postTransaccion(transaccion: Transaccion): Promise<boolean> {
    const response = await this.http.post<{ IdTransaccion: string }>('/transactions/posttransaccion', transaccion);
    transaccion.IdTransaccion = response.IdTransaccion;
    return true;
  }

  async patchTransaccion(transaccion: Transaccion): Promise<boolean> {
    await this.http.patch('/transactions/patchtransaccion', transaccion);
    return true;
  }

  async emitCertificate(transaccion: Transaccion): Promise<boolean> {
    await this.http.post('/transactions/emitcertificate', transaccion);
    return true;
  }

  async postActividad(actividad: Actividad): Promise<boolean> {
    const response = await this.http.post<{ IdActividad: string }>('/transactions/postactividad', actividad);
    actividad.IdActividad = response.IdActividad;
    return true;
  }

  async patchActividad(actividad: Actividad): Promise<boolean> {
    await this.http.patch('/transactions/patchactividad', actividad);
    return true;
  }

  async postActividadInicio(actividad: Actividad): Promise<boolean> {
    const response = await this.http.post<{ IdActividad: string }>('/transactions/postactividadinicio', actividad);
    actividad.IdActividad = response.IdActividad;
    return true;
  }

  async postBackup(data: any): Promise<boolean> {
    await this.http.post('/transactions/backup', data);
    return true;
  }
}
