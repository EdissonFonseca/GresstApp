import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Task } from '../../domain/entities/task.entity';
import { Subprocess } from '../../domain/entities/subprocess.entity';
import { Process } from '@app/domain/entities/process.entity';
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
      const response = await this.http.get<Process[]>('/operations/get');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting transactions', error);
      throw error;
    }
  }

  /**
   * Creates a new process
   * @param {Process} process - Process to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createProcess(process: Process): Promise<boolean> {
    try {
      this.logger.debug('createProcess process', process);
      const response = await this.http.post<ActivityResponse>('/operations/createprocess', process);
      if (response.status === 201 && response.data) {
        process.ProcessId = response.data.IdProceso;
        this.logger.info('Process created successfully', { processId: process.ProcessId });
        return true;
      }
      this.logger.debug('createProcess response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error creating process', { process, error });
      throw error;
    }
  }

  /**
   * Updates an existing process
   * @param {Process} process - Process to update
   * @returns {Promise<boolean>} True if update successful
   */
  async updateProcess(process: Process): Promise<boolean> {
    try {
      this.logger.debug('updateProcess process', process);
      const response = await this.http.post('/operations/updateprocess', process);
      if (response.status === 200) {
        this.logger.info('Process updated successfully', { processId: process.ProcessId });
        return true;
      }
      this.logger.debug('updateProcess response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error updating process', { process, error });
      throw error;
    }
  }

  /**
   * Updates the start of a process
   * @param {Process} process - Process to update
   * @returns {Promise<boolean>} True if creation successful
   */
  async updateProcessStart(process: Process): Promise<boolean> {
    try {
        this.logger.debug('updateProcessStart process', process);
      const response = await this.http.post<ActivityResponse>('/operations/updatesprocessstart', process);
      if ((response.status === 200 || response.status === 201)) {
        this.logger.info('Process start updated successfully', { processId: process.ProcessId });
        return true;
      }
      this.logger.debug('updateProcessStart response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error updating process start', { process, error });
      throw error;
    }
  }

  /**
   * Creates a new subprocess
   * @param {Subprocess} subprocess - Transaction to create
   * @returns {Promise<boolean>} True if creation successful
   */
  async createSubprocess(subprocess: Subprocess): Promise<boolean> {
    try {
      this.logger.debug('createSubprocess subprocess', subprocess);
      const response = await this.http.post<TransactionResponse>('/operations/createsubprocess', subprocess);
      if (response.status === 201 && response.data) {
        subprocess.SubprocessId = response.data.IdTransaccion;
        this.logger.info('Subprocess created successfully', { subprocessId: subprocess.SubprocessId });
        return true;
      }
      this.logger.debug('createSubprocess response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error creating subprocess', { subprocess, error });
      throw error;
    }
  }

  /**
   * Updates an existing transaction
   * @param {Subprocess} subprocess - Transaction to update
   * @returns {Promise<boolean>} True if update successful
   */
  async updateSubprocess(subprocess: Subprocess): Promise<boolean> {
    try {
      this.logger.debug('updateSubprocess subprocess', subprocess);
      const response = await this.http.post('/operations/updatesubprocess', subprocess);
      if (response.status === 200) {
        this.logger.info('Subprocess updated successfully', { subprocessId: subprocess.SubprocessId });
        return true;
      }
      this.logger.debug('updateSubprocess response status', response.status);
      return false;
    } catch (error) {
      this.logger.error('Error updating subprocess', { subprocess, error });
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
      const response = await this.http.post<TaskResponse>('/operations/createtask', task);
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
      const response = await this.http.post('/operations/updatetask', task);
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
   * Emits a certificate for a transaction
   * @param {Subprocess} transaction - Transaction to emit certificate for
   * @returns {Promise<boolean>} True if emission successful
   */
  async emitCertificate(transaction: Subprocess): Promise<boolean> {
    try {
      this.logger.debug('emitCertificate transaction', transaction);
      const response = await this.http.post('/operations/emitcertificate', transaction);
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


}
