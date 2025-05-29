import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Tarea } from '../../interfaces/tarea.interface';
import { Transaccion } from '../../interfaces/transaccion.interface';
import { Actividad } from '../../interfaces/actividad.interface';
import { Transaction } from '@app/interfaces/transaction.interface';
import { StorageService } from '../core/storage.service';
import { LoggerService } from '../core/logger.service';
import { HttpService } from './http.service';

interface TaskResponse {
  IdTarea: string;
}

interface TransactionResponse {
  IdTransaccion: string;
}

interface ActivityResponse {
  IdActividad: string;
}

@Injectable({
  providedIn: 'root',
})
export class TransactionsApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private http: HttpService,
    private storage: StorageService,
    private logger: LoggerService
  ) {}

  /**
   * Gets all transactions
   * @returns {Promise<Transaction>} Transaction data
   */
  async get(): Promise<Transaction> {
    try {
      const response = await this.http.get<Transaction>('/apptransactions/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting transactions', error);
      throw error;
    }
  }

  /**
   * Creates a new task
   * @param {Tarea} task - Task to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createTask(task: Tarea): Promise<boolean> {
    try {
      this.logger.debug('createTask task', task);
      const response = await this.http.post<TaskResponse>('/apptransactions/createtarea', task);
      if (response.status === 201 && response.data) {
        task.IdTarea = response.data.IdTarea;
        this.logger.info('Task created successfully', { taskId: task.IdTarea });
        return true;
      }
      this.logger.debug('createTask response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error creating task', { task, error });
      throw error;
    }
  }

  /**
   * Updates an existing task
   * @param {Tarea} task - Task to update
   * @returns {Promise<boolean>} True if update successful
   */
  async updateTask(task: Tarea): Promise<boolean> {
    try {
      this.logger.debug('updateTask task', task);
      const response = await this.http.post('/apptransactions/updatetarea', task);
      if (response.status === 200) {
        this.logger.info('Task updated successfully', { taskId: task.IdTarea });
        return true;
      }
      this.logger.debug('updateTask response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error updating task', { task, error });
      throw error;
    }
  }

  /**
   * Creates a new transaction
   * @param {Transaccion} transaction - Transaction to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createTransaction(transaction: Transaccion): Promise<boolean> {
    try {
      this.logger.debug('createTransaction transaction', transaction);
      const response = await this.http.post<TransactionResponse>('/apptransactions/createtransaccion', transaction);
      if (response.status === 201 && response.data) {
        transaction.IdTransaccion = response.data.IdTransaccion;
        this.logger.info('Transaction created successfully', { transactionId: transaction.IdTransaccion });
        return true;
      }
      this.logger.debug('createTransaction response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error creating transaction', { transaction, error });
      throw error;
    }
  }

  /**
   * Updates an existing transaction
   * @param {Transaccion} transaction - Transaction to update
   * @returns {Promise<boolean>} True if update successful
   */
  async updateTransaction(transaction: Transaccion): Promise<boolean> {
    try {
      this.logger.debug('updateTransaction transaction', transaction);
      const response = await this.http.post('/apptransactions/updatetransaccion', transaction);
      if (response.status === 200) {
        this.logger.info('Transaction updated successfully', { transactionId: transaction.IdTransaccion });
        return true;
      }
      this.logger.debug('updateTransaction response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error updating transaction', { transaction, error });
      throw error;
    }
  }

  /**
   * Emits a certificate for a transaction
   * @param {Transaccion} transaction - Transaction to emit certificate for
   * @returns {Promise<boolean>} True if emission successful
   */
  async emitCertificate(transaction: Transaccion): Promise<boolean> {
    try {
      this.logger.debug('emitCertificate transaction', transaction);
      const response = await this.http.post('/apptransactions/emitcertificate', transaction);
      if (response.status === 200) {
        this.logger.info('Certificate emitted successfully', { transactionId: transaction.IdTransaccion });
        return true;
      }
      this.logger.debug('emitCertificate response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error emitting certificate', { transaction, error });
      throw error;
    }
  }

  /**
   * Creates a new activity
   * @param {Actividad} activity - Activity to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createActivity(activity: Actividad): Promise<boolean> {
    try {
      this.logger.debug('createActivity activity', activity);
      const response = await this.http.post<ActivityResponse>('/apptransactions/createactividad', activity);
      if (response.status === 201 && response.data) {
        activity.IdActividad = response.data.IdActividad;
        this.logger.info('Activity created successfully', { activityId: activity.IdActividad });
        return true;
      }
      this.logger.debug('createActivity response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error creating activity', { activity, error });
      throw error;
    }
  }

  /**
   * Updates an existing activity
   * @param {Actividad} activity - Activity to update
   * @returns {Promise<boolean>} True if update successful
   */
  async updateActivity(activity: Actividad): Promise<boolean> {
    try {
      this.logger.debug('updateActivity activity', activity);
      const response = await this.http.post('/apptransactions/updateactividad', activity);
      if (response.status === 200) {
        this.logger.info('Activity updated successfully', { activityId: activity.IdActividad });
        return true;
      }
      this.logger.debug('updateActivity response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error updating activity', { activity, error });
      throw error;
    }
  }

  /**
   * Creates an initial activity
   * @param {Actividad} activity - Initial activity to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async updateInitialActivity(activity: Actividad): Promise<boolean> {
    try {
      this.logger.debug('updateInitialActivity activity', activity);
      const response = await this.http.post<ActivityResponse>('/apptransactions/updateactividadInicio', activity);
      if ((response.status === 200 || response.status === 201)) {
        this.logger.info('Initial activity created successfully', { activityId: activity.IdActividad });
        return true;
      }
      this.logger.debug('updateInitialActivity response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error creating initial activity', { activity, error });
      throw error;
    }
  }
}
