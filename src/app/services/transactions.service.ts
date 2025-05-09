import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { Tarea } from '../interfaces/tarea.interface';
import { Transaccion } from '../interfaces/transaccion.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { Transaction } from '@app/interfaces/transaction.interface';
import { StorageService } from './storage.service';
import { HttpService } from './http.service';
import { LoggerService } from './logger.service';

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
    private logger: LoggerService
  ) {}

  async get(): Promise<Transaction> {
    try {
      return await this.http.get<Transaction>('/apptransactions/get');
    } catch (error) {
      this.logger.error('Error getting transactions', error);
      throw error;
    }
  }

  async postTarea(tarea: Tarea): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdTarea: string }>('/apptransactions/createtarea', tarea);
      tarea.IdTarea = response.IdTarea;
      this.logger.info('Task created successfully', { taskId: tarea.IdTarea });
      return true;
    } catch (error) {
      this.logger.error('Error creating task', error);
      return false;
    }
  }

  async patchTarea(tarea: Tarea): Promise<boolean> {
    try {
      await this.http.post('/apptransactions/updatetarea', tarea);
      this.logger.info('Task updated successfully', { taskId: tarea.IdTarea });
      return true;
    } catch (error) {
      this.logger.error('Error updating task', error);
      return false;
    }
  }

  async postTransaccion(transaccion: Transaccion): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdTransaccion: string }>('/apptransactions/createtransaccion', transaccion);
      transaccion.IdTransaccion = response.IdTransaccion;
      this.logger.info('Transaction created successfully', { transactionId: transaccion.IdTransaccion });
      return true;
    } catch (error) {
      this.logger.error('Error creating transaction', error);
      return false;
    }
  }

  async patchTransaccion(transaccion: Transaccion): Promise<boolean> {
    try {
      await this.http.post('/apptransactions/updatetransaccion', transaccion);
      this.logger.info('Transaction updated successfully', { transactionId: transaccion.IdTransaccion });
      return true;
    } catch (error) {
      this.logger.error('Error updating transaction', error);
      return false;
    }
  }

  async emitCertificate(transaccion: Transaccion): Promise<boolean> {
    try {
      await this.http.post('/apptransactions/emitcertificate', transaccion);
      this.logger.info('Certificate emitted successfully', { transactionId: transaccion.IdTransaccion });
      return true;
    } catch (error) {
      this.logger.error('Error emitting certificate', error);
      return false;
    }
  }

  async postActividad(actividad: Actividad): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdActividad: string }>('/apptransactions/createactividad', actividad);
      actividad.IdActividad = response.IdActividad;
      this.logger.info('Activity created successfully', { activityId: actividad.IdActividad });
      return true;
    } catch (error) {
      this.logger.error('Error creating activity', error);
      return false;
    }
  }

  async patchActividad(actividad: Actividad): Promise<boolean> {
    try {
      await this.http.post('/apptransactions/updateactividad', actividad);
      this.logger.info('Activity updated successfully', { activityId: actividad.IdActividad });
      return true;
    } catch (error) {
      this.logger.error('Error updating activity', error);
      return false;
    }
  }

  async postActividadInicio(actividad: Actividad): Promise<boolean> {
    try {
      const response = await this.http.post<{ IdActividad: string }>('/apptransactions/createactividad', actividad);
      actividad.IdActividad = response.IdActividad;
      this.logger.info('Initial activity created successfully', { activityId: actividad.IdActividad });
      return true;
    } catch (error) {
      this.logger.error('Error creating initial activity', error);
      return false;
    }
  }

  async postBackup(data: any): Promise<boolean> {
    try {
      await this.http.post('/apptransactions/backup', data);
      this.logger.info('Backup created successfully');
      return true;
    } catch (error) {
      this.logger.error('Error creating backup', error);
      return false;
    }
  }
}
