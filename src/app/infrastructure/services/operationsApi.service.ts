import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Task } from '../../domain/entities/task.entity';
import { Subprocess } from '../../domain/entities/subprocess.entity';
import { Process } from '@app/domain/entities/process.entity';
import { Operation } from '@app/domain/entities/operation.entity';
import { StorageService } from './storage.service';
import { LoggerService } from './logger.service';
import { HttpService } from './http.service';

interface TaskResponse {
  IdTarea: string;
}

interface TransactionResponse {
  IdTransaccion: string;
}

interface ActivityResponse {
  IdProceso: string;
}

@Injectable({
  providedIn: 'root',
})
export class OperationsApiService {
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
  async get(): Promise<Process[]> {
    try {
      const response = await this.http.get<Process[]>('/apptransactions/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting transactions', error);
      throw error;
    }
  }

  /**
   * Creates a new task
   * @param {Task} task - Task to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createTask(task: Task): Promise<boolean> {
    try {
      this.logger.debug('createTask task', task);
      const response = await this.http.post<TaskResponse>('/appoperations/createtarea', task);
      if (response.status === 201 && response.data) {
        task.TaskId = response.data.IdTarea;
        this.logger.info('Task created successfully', { taskId: task.TaskId });
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
   * @param {Task} task - Task to update
   * @returns {Promise<boolean>} True if update successful
   */
  async updateTask(task: Task): Promise<boolean> {
    try {
      this.logger.debug('updateTask task', task);
      const response = await this.http.post('/appoperations/updatetarea', task);
      if (response.status === 200) {
        this.logger.info('Task updated successfully', { taskId: task.TaskId });
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
   * @param {Subprocess} transaction - Transaction to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createTransaction(transaction: Subprocess): Promise<boolean> {
    try {
      this.logger.debug('createTransaction transaction', transaction);
      const response = await this.http.post<TransactionResponse>('/appoperations/createtransaccion', transaction);
      if (response.status === 201 && response.data) {
        transaction.SubprocessId = response.data.IdTransaccion;
        this.logger.info('Transaction created successfully', { transactionId: transaction.SubprocessId });
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
   * @param {Subprocess} transaction - Transaction to update
   * @returns {Promise<boolean>} True if update successful
   */
  async updateTransaction(transaction: Subprocess): Promise<boolean> {
    try {
      this.logger.debug('updateTransaction transaction', transaction);
      const response = await this.http.post('/appoperations/updatetransaccion', transaction);
      if (response.status === 200) {
        this.logger.info('Transaction updated successfully', { transactionId: transaction.SubprocessId });
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
   * @param {Subprocess} transaction - Transaction to emit certificate for
   * @returns {Promise<boolean>} True if emission successful
   */
  async emitCertificate(transaction: Subprocess): Promise<boolean> {
    try {
      this.logger.debug('emitCertificate transaction', transaction);
      const response = await this.http.post('/appoperations/emitcertificate', transaction);
      if (response.status === 200) {
        this.logger.info('Certificate emitted successfully', { transactionId: transaction.SubprocessId });
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
   * @param {Process} activity - Activity to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createProcess(activity: Process): Promise<boolean> {
    try {
      this.logger.debug('createActivity activity', activity);
      const response = await this.http.post<ActivityResponse>('/appoperations/createproceso', activity);
      if (response.status === 201 && response.data) {
        activity.ProcessId = response.data.IdProceso;
        this.logger.info('Activity created successfully', { activityId: activity.ProcessId });
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
   * @param {Process} activity - Activity to update
   * @returns {Promise<boolean>} True if update successful
   */
  async updateProceso(activity: Process): Promise<boolean> {
    try {
      this.logger.debug('updateActivity activity', activity);
      const response = await this.http.post('/appoperations/updateactividad', activity);
      if (response.status === 200) {
        this.logger.info('Activity updated successfully', { activityId: activity.ProcessId });
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
   * @param {Process} activity - Initial activity to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async updateInitialProcess(activity: Process): Promise<boolean> {
    try {
      this.logger.debug('updateInitialActivity activity', activity);
      const response = await this.http.post<ActivityResponse>('/appoperations/updateactividadInicio', activity);
      if ((response.status === 200 || response.status === 201)) {
        this.logger.info('Initial activity created successfully', { activityId: activity.ProcessId });
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
