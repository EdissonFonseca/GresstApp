import { Injectable, signal } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Process } from '@app/domain/entities/process.entity';
import { GEOLOCATION, CRUD_OPERATIONS, SERVICES, DATA_TYPE } from '@app/core/constants';
import { MessageRepository } from '../../infrastructure/repositories/message.repository';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { OperationRepository } from '@app/infrastructure/repositories/operation.repository';

/**
 * ProcessesService
 *
 * Service responsible for managing processes in the system.
 * Handles CRUD operations for processes, including:
 * - Creating new processes
 * - Updating existing processes
 * - Retrieving process information
 * - Managing process states
 * - Synchronizing process data
 */
@Injectable({
  providedIn: 'root',
})
export class ProcessService {

  constructor(
    private messageRepository: MessageRepository,
    private readonly logger: LoggerService,
    private operationRepository: OperationRepository
  ) {
  }

  /**
   * Gets the current position using the device's GPS
   * @returns {Promise<[number, number]>} Tuple containing [latitude, longitude]
   * @throws {Error} If geolocation fails
   */
  private async getCurrentPosition(): Promise<[number, number]> {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: GEOLOCATION.ENABLE_HIGH_ACCURACY,
        timeout: GEOLOCATION.TIMEOUT,
        maximumAge: GEOLOCATION.MAXIMUM_AGE,
      });

      return [position.coords.latitude, position.coords.longitude];
    } catch (error) {
      throw new Error("Error getting current position");
    }
  }


  /**
   * Lists all processes in the current transaction
   * @returns Promise<Process[]> Array of processes with service information
   * @throws Error if listing fails
   */
  async getAll(): Promise<Process[]> {
    try {
      const operation = await this.operationRepository.get();

      if (!operation?.Processes) {
        return [];
      }

      const processes = operation.Processes.map(process => {
        const servicio = SERVICES.find(s => s.serviceId === process.ServiceId);
        return {
          ...process,
          Icon: servicio?.Icon || '',
          Action: servicio?.Action || ''
        };
      });

      return processes;
    } catch (error) {
      this.logger.error('Error listing processes', error);
      throw error;
    }
  }

  /**
   * Gets a specific process by ID
   * @param processId - The ID of the process to retrieve
   * @returns Promise<Process | undefined> The process if found, undefined otherwise
   * @throws Error if retrieval fails
   */
  async get(processId: string): Promise<Process | undefined> {
    try {
      const transaction = await this.operationRepository.get();
      if (!transaction?.Processes) return undefined;

      const process = transaction.Processes.find(item => item.ProcessId === processId);
      if (!process) return undefined;

      const servicio = SERVICES.find(s => s.serviceId === process.ServiceId);
      return {
        ...process,
        Icon: servicio?.Icon || '',
        Action: servicio?.Action || ''
      };
    } catch (error) {
      this.logger.error('Error getting process', { processId, error });
      throw error;
    }
  }

  /**
   * Creates a new process
   * @param proceso - The process to create
   * @returns Promise<boolean> True if creation was successful
   * @throws Error if creation fails
   */
  async create(proceso: Process): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const [latitud, longitud] = await this.getCurrentPosition();
      const operation = await this.operationRepository.get();

      if (!operation) {
        return false;
      }

      proceso.StartDate = now;
      proceso.InitialLatitude = latitud;
      proceso.InitialLongitude = longitud;

      operation.Processes.push(proceso);
      await this.operationRepository.update(operation);
      await this.messageRepository.create(DATA_TYPE.PROCESS, CRUD_OPERATIONS.CREATE, proceso);

      this.logger.info('Process created successfully', { processId: proceso.ProcessId });
      return true;
    } catch (error) {
      this.logger.error('Error creating process', { proceso, error });
      throw error;
    }
  }

  /**
   * Updates an existing process
   * @param proceso - The process to update
   * @returns Promise<boolean> True if update was successful
   * @throws Error if update fails
   */
  async update(proceso: Process): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const [latitud, longitud] = await this.getCurrentPosition();
      const operation = await this.operationRepository.get();

      if (!operation) {
        return false;
      }

      const existingProcess = operation.Processes.find(item => item.ProcessId === proceso.ProcessId);
      if (!existingProcess) {
        this.logger.warn('Process not found for update', { processId: proceso.ProcessId });
        return false;
      }

      proceso.EndDate = now;
      proceso.FinalLatitude = latitud;
      proceso.FinalLongitude = longitud;

      // Update the process in the transaction
      const index = operation.Processes.findIndex(item => item.ProcessId === proceso.ProcessId);
      if (index !== -1) {
        operation.Processes[index] = proceso;
        await this.operationRepository.update(operation);
        await this.messageRepository.create(DATA_TYPE.PROCESS, CRUD_OPERATIONS.UPDATE, proceso);

        this.logger.info('Process updated successfully', { processId: proceso.ProcessId });
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error updating process', { proceso, error });
      throw error;
    }
  }

  /**
   * Updates the start of a process
   * @param proceso - The process to update the start of
   * @returns Promise<boolean> True if update was successful
   * @throws Error if update fails
   */
  async updateStart(proceso: Process): Promise<boolean> {
    console.log('updateStart', proceso);
    try {
      const now = new Date().toISOString();
      const [latitud, longitud] = await this.getCurrentPosition();
      const operation = await this.operationRepository.get();

      if (!operation) {
        return false;
      }

      const existingProcess = operation.Processes.find(item => item.ProcessId === proceso.ProcessId);
      if (!existingProcess) {
        this.logger.warn('Process not found for start update', { processId: proceso.ProcessId });
        return false;
      }

      proceso.StartDate = now;
      proceso.InitialLatitude = latitud;
      proceso.InitialLongitude = longitud;

      // Update the process in the transaction
        const index = operation.Processes.findIndex(item => item.ProcessId === proceso.ProcessId);
      if (index !== -1) {
        operation.Processes[index] = proceso;
        await this.operationRepository.update(operation);
        await this.messageRepository.create(DATA_TYPE.START_ACTIVITY, CRUD_OPERATIONS.UPDATE, proceso);

        this.logger.info('Process start updated successfully', { processId: proceso.ProcessId });
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error updating process start', { proceso, error });
      throw error;
    }
  }
}
