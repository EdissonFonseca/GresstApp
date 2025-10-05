import { Injectable, signal } from '@angular/core';
import { Geolocation } from '@capacitor/geolocation';
import { Proceso } from '@app/domain/entities/proceso.entity';
import { GEOLOCATION, CRUD_OPERATIONS, STATUS, SERVICES, STORAGE, DATA_TYPE } from '@app/core/constants';
import { Utils } from '@app/core/utils';
import { RequestsService } from './requests.repository';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { WorkflowService } from '@app/infrastructure/services/workflow.service';

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
export class ProcessesService {
  /** Signal containing the list of processes */
  public processes = signal<Proceso[]>([]);
  public transaction$ = this.workflowService.transaction$;

  constructor(
    private requestsService: RequestsService,
    private readonly logger: LoggerService,
    private workflowService: WorkflowService
  ) {
    this.loadTransaction();
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
   * Loads the current transaction from storage
   * @private
   */
  private async loadTransaction() {
    try {
      await this.workflowService.loadTransaction();
      const transaction = this.workflowService.getTransaction();
      if (transaction?.Procesos) {
        const processes = transaction.Procesos.map(proceso => {
          const servicio = SERVICES.find(s => s.serviceId === proceso.IdServicio);
          return {
            ...proceso,
            Icono: servicio?.Icon || '',
            Accion: servicio?.Action || ''
          };
        });
        this.processes.set(processes);
      } else {
        this.processes.set([]);
      }
    } catch (error) {
      this.logger.error('Error loading transaction', error);
      this.processes.set([]);
    }
  }

  /**
   * Saves the current transaction to storage
   * @private
   * @throws Error if saving fails
   */
  private async saveTransaction() {
    try {
      const transaction = this.workflowService.getTransaction();
      if (transaction) {
        transaction.Procesos = this.processes();
        this.workflowService.setTransaction(transaction);
        await this.workflowService.saveTransaction();
      }
    } catch (error) {
      this.logger.error('Error saving transaction', error);
      throw error;
    }
  }

  /**
   * Lists all processes in the current transaction
   * @returns Promise<Proceso[]> Array of processes with service information
   * @throws Error if listing fails
   */
  async list(): Promise<Proceso[]> {
    try {
      const transaction = this.workflowService.getTransaction();

      if (!transaction?.Procesos) {
        return [];
      }

      const processes = transaction.Procesos.map(proceso => {
        const servicio = SERVICES.find(s => s.serviceId === proceso.IdServicio);
        return {
          ...proceso,
          Icono: servicio?.Icon || '',
          Accion: servicio?.Action || ''
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
   * @param idActividad - The ID of the process to retrieve
   * @returns Promise<Proceso | undefined> The process if found, undefined otherwise
   * @throws Error if retrieval fails
   */
  async get(idActividad: string): Promise<Proceso | undefined> {
    try {
      const transaction = this.workflowService.getTransaction();
      if (!transaction?.Procesos) return undefined;

      const proceso = transaction.Procesos.find(item => item.IdProceso === idActividad);
      if (!proceso) return undefined;

      const servicio = SERVICES.find(s => s.serviceId === proceso.IdServicio);
      return {
        ...proceso,
        Icono: servicio?.Icon || '',
        Accion: servicio?.Action || ''
      };
    } catch (error) {
      this.logger.error('Error getting process', { idActividad, error });
      throw error;
    }
  }

  /**
   * Gets a process by service and resource IDs
   * @param idServicio - The service ID
   * @param idRecurso - The resource ID
   * @returns Promise<Proceso | undefined> The process if found, undefined otherwise
   * @throws Error if retrieval fails
   */
  async getByServiceAndResource(idServicio: string, idRecurso: string): Promise<Proceso | undefined> {
    try {
      const transaction = this.workflowService.getTransaction();
      if (!transaction?.Procesos) return undefined;

      return transaction.Procesos.find(
        item => item.IdServicio === idServicio && item.IdRecurso === idRecurso
      );
    } catch (error) {
      this.logger.error('Error getting process by service', { idServicio, idRecurso, error });
      throw error;
    }
  }

  /**
   * Gets the summary of a process
   * @param process - The process to get the summary of
   * @returns Promise<string> The summary of the process
   */
  getSummary(process: Proceso): string {
    let summary: string = '';
    if ((process.quantity ?? 0) > 0) {
      summary = `${process.quantity} ${Utils.quantityUnit}`;
    }
    if ((process.weight ?? 0) > 0) {
      if (summary !== '')
        summary += `/${process.weight} ${Utils.weightUnit}`;
      else
        summary = `${process.weight} ${Utils.weightUnit}`;
    }
    if ((process.volume ?? 0) > 0) {
      if (summary !== '')
        summary += `/${process.volume} ${Utils.volumeUnit}`;
      else
        summary = `${process.volume} ${Utils.volumeUnit}`;
    }
    return summary;
  }


  /**
   * Creates a new process
   * @param proceso - The process to create
   * @returns Promise<boolean> True if creation was successful
   * @throws Error if creation fails
   */
  async create(proceso: Proceso): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const [latitud, longitud] = await this.getCurrentPosition();
      const transaction = this.workflowService.getTransaction();

      if (!transaction) {
        return false;
      }

      proceso.FechaInicial = now;
      proceso.LatitudInicial = latitud;
      proceso.LongitudInicial = longitud;

      //Set process summary properties
      proceso.pending = 0;
      proceso.approved = 0;
      proceso.rejected = 0;
      proceso.quantity = 0;
      proceso.weight = 0;
      proceso.volume = 0;

      transaction.Procesos.push(proceso);
      this.processes.set(transaction.Procesos);
      this.workflowService.setTransaction(transaction);
      await this.saveTransaction();
      await this.requestsService.create(DATA_TYPE.PROCESS, CRUD_OPERATIONS.CREATE, proceso);

      this.logger.info('Process created successfully', { processId: proceso.IdProceso });
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
  async update(proceso: Proceso): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const [latitud, longitud] = await this.getCurrentPosition();
      const transaction = this.workflowService.getTransaction();

      if (!transaction) {
        return false;
      }

      const existingProcess = transaction.Procesos.find(item => item.IdProceso === proceso.IdProceso);
      if (!existingProcess) {
        this.logger.warn('Process not found for update', { processId: proceso.IdProceso });
        return false;
      }

      proceso.FechaFinal = now;
      proceso.LatitudFinal = latitud;
      proceso.LongitudFinal = longitud;

      // Update the process in the transaction
      const index = transaction.Procesos.findIndex(item => item.IdProceso === proceso.IdProceso);
      if (index !== -1) {
        transaction.Procesos[index] = proceso;
        this.processes.set(transaction.Procesos);
        this.workflowService.setTransaction(transaction);
        await this.saveTransaction();
        await this.requestsService.create(DATA_TYPE.PROCESS, CRUD_OPERATIONS.UPDATE, proceso);

        this.logger.info('Process updated successfully', { processId: proceso.IdProceso });
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
  async updateStart(proceso: Proceso): Promise<boolean> {
    console.log('updateStart', proceso);
    try {
      const now = new Date().toISOString();
      const [latitud, longitud] = await this.getCurrentPosition();
      const transaction = this.workflowService.getTransaction();

      if (!transaction) {
        return false;
      }

      const existingProcess = transaction.Procesos.find(item => item.IdProceso === proceso.IdProceso);
      if (!existingProcess) {
        this.logger.warn('Process not found for start update', { processId: proceso.IdProceso });
        return false;
      }

      proceso.FechaInicial = now;
      proceso.LatitudInicial = latitud;
      proceso.LongitudInicial = longitud;

      // Update the process in the transaction
      const index = transaction.Procesos.findIndex(item => item.IdProceso === proceso.IdProceso);
      if (index !== -1) {
        transaction.Procesos[index] = proceso;
        this.processes.set(transaction.Procesos);
        this.workflowService.setTransaction(transaction);
        await this.saveTransaction();
        await this.requestsService.create(DATA_TYPE.START_ACTIVITY, CRUD_OPERATIONS.UPDATE, proceso);

        this.logger.info('Process start updated successfully', { processId: proceso.IdProceso });
        return true;
      }

      return false;
    } catch (error) {
      this.logger.error('Error updating process start', { proceso, error });
      throw error;
    }
  }
}
