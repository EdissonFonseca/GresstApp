import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { MasterDataApiService } from './masterdataApi.service';
import { AuthorizationApiService } from './authorizationApi.service';
import { OperationsApiService } from './operationsApi.service';
import { Package } from '../../domain/entities/package.entity';
import { Material } from '../../domain/entities/material.entity';
import { Facility } from '../../domain/entities/facility.entity';
import { Service } from '../../domain/entities/service.entity';
import { Vehicle } from '../../domain/entities/vehicle.entity';
import { environment } from '../../../environments/environment';
import { CRUD_OPERATIONS, DATA_TYPE, STATUS, STORAGE } from '@app/core/constants';
import { LoggerService } from './logger.service';
import { Inventario, InventoryApiService } from './inventoryApi.service';
import { Process } from '@app/domain/entities/process.entity';
import { Task } from '@app/domain/entities/task.entity';
import { Subprocess } from '@app/domain/entities/subprocess.entity';
import { Message } from '@app/domain/entities/message.entity';
import { Operation } from '@app/domain/entities/operation.entity';
import { Party } from '@app/domain/entities/party.entity';

/**
 * Service responsible for managing data synchronization between local storage and server.
 * Handles data download, upload, and transaction management for offline-first functionality.
 */
@Injectable({
  providedIn: 'root',
})
export class SynchronizationService {
  private readonly apiUrl = environment.apiUrl;
  pendingTransactions = signal<number>(0);

  constructor(
    private storage: StorageService,
    private authorizationService: AuthorizationApiService,
    private inventoryService: InventoryApiService,
    private masterdataService: MasterDataApiService,
    private operationsService: OperationsApiService,
    private readonly logger: LoggerService
  ) {}

  /**
   * Downloads and stores authorization data from the server
   * @throws {Error} If the download fails
   */
  async downloadAuthorizations(): Promise<void> {
    try {
      const permissions = await this.authorizationService.get();
      await this.storage.set(STORAGE.ACCOUNT, permissions);
    } catch (error) {
      this.logger.error('Error downloading authorizations', error);
      throw error;
    }
  }

  /**
   * Downloads and stores inventory data from the server
   * @throws {Error} If the download fails
   */
  async downloadInventory(): Promise<void> {
    try {
      const response = await this.inventoryService.get();
      await this.storage.set(STORAGE.INVENTORY, response);
    } catch (error) {
      this.logger.error('Error downloading inventory', error);
      throw error;
    }
  }

  /**
   * Downloads and stores all master data from the server
   * Includes: packaging, materials, points, services, third parties, treatments, and vehicles
   * @throws {Error} If the download fails
   */
  async downloadMasterData(): Promise<void> {
    try {
      const points: Facility[] = await this.masterdataService.getFacilities();
      await this.storage.set(STORAGE.FACILITIES, points);

      const materials: Material[] = await this.masterdataService.getMaterials();
      await this.storage.set(STORAGE.MATERIALS, materials);

      const packaging: Package[] = await this.masterdataService.getPackages();
      await this.storage.set(STORAGE.PACKAGES, packaging);

      const parties: Party[] = await this.masterdataService.getParties();
      await this.storage.set(STORAGE.PARTIES, parties);

      const services: Service[] = await this.masterdataService.getServices();
      await this.storage.set(STORAGE.SERVICES, services);

      const vehicles: Vehicle[] = await this.masterdataService.getVehicles();
      await this.storage.set(STORAGE.VEHICLES, vehicles);

    } catch (error) {
      this.logger.error('Error downloading master data', error);
      throw error;
    }
  }

  /**
   * Downloads and flattens hierarchical operation data from the server
   * Structure: Process -> Subprocess -> Task
   * Result: flat lists of Processes, Subprocesses, and Tasks preserving relationships
   * @throws {Error} If the download fails
   */
  async downloadOperation(): Promise<void> {
    try {
      const hierarchicalProcesses: Process[] = await this.operationsService.get();

      const allProcesses: Process[] = [];
      const allSubprocesses: Subprocess[] = [];
      const allTasks: Task[] = [];

      if (Array.isArray(hierarchicalProcesses)) {
        hierarchicalProcesses.forEach((process) => {
          const processId = process.ProcessId;

          // ✅ Extract process-level tasks
          process.Tasks?.forEach((task) => {
            allTasks.push({
              ...task,
              ProcessId: processId,
              SubprocessId: undefined
            });
          });

          // ✅ Extract subprocesses and their tasks
          process.Subprocesses?.forEach((subprocess: any) => {
            // API returns "SubProcessId" (capital P) but entity expects "SubprocessId" (lowercase p)
            const subprocessId = subprocess.SubProcessId || subprocess.SubprocessId;

            // Subprocess-level tasks
            subprocess.Tasks?.forEach((task: any) => {
              allTasks.push({
                ...task,
                ProcessId: processId,
                SubprocessId: subprocessId
              });
            });

            // Add subprocess without Tasks and SubProcessId, preserving ProcessId and normalized SubprocessId
            const { Tasks, SubProcessId, ...subprocessClean } = subprocess;
            allSubprocesses.push({
              ...subprocessClean,
              ProcessId: processId,
              SubprocessId: subprocessId
            });
          });

          // ✅ Add process without Subprocesses or Tasks
          const { Subprocesses, Tasks, ...processClean } = process;
          allProcesses.push({
            ...processClean,
            ProcessId: processId
          });
        });
      }

      const flattenedOperation: Operation = {
        Processes: allProcesses,
        Subprocesses: allSubprocesses,
        Tasks: allTasks
      };

      await this.storage.set(STORAGE.OPERATION, flattenedOperation);
      this.logger.info('Operation data downloaded and flattened successfully.');

    } catch (error) {
      this.logger.error('Error downloading transactions', error);
      throw error;
    }
  }

  /**
   * Uploads pending API requests in chronological order
   * Processes each request based on its type and CRUD operation
   * Stops processing if any request fails
   * @returns {Promise<boolean>} True if all requests were processed successfully
   */
  async uploadData(): Promise<boolean> {
    try {
      // Get and sort requests by CRUDDate
      const requests: Message[] = await this.storage.get(STORAGE.MESSAGES) || [];
      requests.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

      for (const request of requests) {
        try {
          let success = false;
          this.logger.debug('Processing request:', request);

          // Process request based on object type and CRUD operation
          switch (request.Object) {
            case DATA_TYPE.PROCESS:
              const process = request.Data as Process;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.operationsService.createProcess(process);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.operationsService.updateProcess(process);
              }
              break;
            case DATA_TYPE.INVENTORY:
              const inventory = request.Data as Inventario;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.inventoryService.create(inventory);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.inventoryService.update(inventory);
              }
              break;
            case DATA_TYPE.START_ACTIVITY:
              const startActivity = request.Data as Process;
              if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.operationsService.updateProcessStart(startActivity);
              }
              break;
            case DATA_TYPE.TASK:
              const task = request.Data as Task;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.operationsService.createTask(task);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.operationsService.updateTask(task);
              }
              break;
            case DATA_TYPE.TRANSACTION:
              const transaction = request.Data as Subprocess;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.operationsService.createSubprocess(transaction);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.operationsService.updateSubprocess(transaction);
              }
              break;
            default:
              this.logger.warn('Unknown object type in request', { request });
              continue;
          }
          if (success) {
            // Remove processed request from storage
            const updatedRequests = requests.filter(r => r !== request);
            this.logger.debug('Updated requests:', updatedRequests);
            await this.storage.set(STORAGE.MESSAGES, updatedRequests);
          } else {
            this.logger.error('Failed to process request', { request });
            return false;
          }
        } catch (error) {
          this.logger.error('Error processing request', { request, error });
          return false;
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Error in uploadData', error);
      return false;
    }
  }

}
