import { Injectable, signal } from '@angular/core';
import { StorageService } from '../repositories/api/storage.repository';
import { MasterDataApiService } from '../repositories/api/masterdataApi.repository';
import { AuthorizationApiService } from '../repositories/api/authorizationApi.repository';
import { OperationsApiService } from '../repositories/api/operationsApi.repository';
import { Embalaje } from '../../domain/entities/embalaje.entity';
import { Material } from '../../domain/entities/material.entity';
import { Punto } from '../../domain/entities/punto.entity';
import { Servicio } from '../../domain/entities/servicio.entity';
import { Tercero } from '../../domain/entities/tercero.entity';
import { Tratamiento } from '../../domain/entities/tratamiento.entity';
import { Vehiculo } from '../../domain/entities/vehiculo.entity';
import { Operacion } from '../../domain/entities/operacion.entity';
import { environment } from '../../../environments/environment';
import { CRUD_OPERATIONS, DATA_TYPE, STATUS, STORAGE } from '@app/core/constants';
import { LoggerService } from './logger.service';
import { Inventario, InventoryApiService } from '../repositories/api/inventoryApi.repository';
import { APIRequest } from '@app/domain/entities/APIRequest.entity';
import { Proceso } from '@app/domain/entities/proceso.entity';
import { Insumo } from '@app/domain/entities/insumo.entity';
import { Tarea } from '@app/domain/entities/tarea.entity';
import { Transaccion } from '@app/domain/entities/transaccion.entity';

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
      const packaging: Embalaje[] = await this.masterdataService.getPackaging();
      await this.storage.set(STORAGE.PACKAGES, packaging);

      const materials: Material[] = await this.masterdataService.getMaterials();
      await this.storage.set(STORAGE.MATERIALS, materials);

      const points: Punto[] = await this.masterdataService.getPoints();
      await this.storage.set(STORAGE.POINTS, points);

      const services: Servicio[] = await this.masterdataService.getServices();
      await this.storage.set(STORAGE.SERVICES, services);

      const thirdParties: Tercero[] = await this.masterdataService.getThirdParties();
      await this.storage.set(STORAGE.THIRD_PARTIES, thirdParties);

      const treatments: Tratamiento[] = await this.masterdataService.getTreatments();
      await this.storage.set(STORAGE.TREATMENTS, treatments);

      const vehicles: Vehiculo[] = await this.masterdataService.getVehicles();
      await this.storage.set(STORAGE.VEHICLES, vehicles);
    } catch (error) {
      this.logger.error('Error downloading master data', error);
      throw error;
    }
  }

  /**
   * Downloads and stores transaction data from the server
   * @throws {Error} If the download fails
   */
  async downloadTransactions(): Promise<void> {
    try {
      const transaction: Operacion = await this.operationsService.get();

      //Calculate task summary properties
      transaction.Tareas.forEach(task => {
        task.pending = task.IdEstado === STATUS.PENDING ? 1 : 0;
        task.approved = task.IdEstado === STATUS.APPROVED ? 1 : 0;
        task.rejected = task.IdEstado === STATUS.REJECTED ? 1 : 0;
        task.quantity = task.IdEstado === STATUS.APPROVED ? task.Cantidad ?? 0 : 0;
        task.weight = task.IdEstado === STATUS.APPROVED ? task.Peso ?? 0 : 0;
        task.volume = task.IdEstado === STATUS.APPROVED ? task.Volumen ?? 0 : 0;
      });

      //Calculate transaction summary properties
      transaction.Transacciones.forEach(transaccion => {
        // Filter tasks of this transaction from the main array
        const transactionTasks = transaction.Tareas.filter((task: Tarea) => task.IdTransaccion === transaccion.IdTransaccion);
        const totals = transactionTasks.reduce((acc: { pending: number; approved: number; rejected: number; quantity: number; weight: number; volume: number }, task: Tarea) => {
          acc.pending += task.IdEstado === STATUS.PENDING ? 1 : 0;
          acc.approved += task.IdEstado === STATUS.APPROVED ? 1 : 0;
          acc.rejected += task.IdEstado === STATUS.REJECTED ? 1 : 0;
          acc.quantity += task.IdEstado === STATUS.APPROVED ? task.Cantidad ?? 0 : 0;
          acc.weight += task.IdEstado === STATUS.APPROVED ? task.Peso ?? 0 : 0;
          acc.volume += task.IdEstado === STATUS.APPROVED ? task.Volumen ?? 0 : 0;
          return acc;
        }, { pending: 0, approved: 0, rejected: 0, quantity: 0, weight: 0, volume: 0 });

        // Assign totals to the transaction
        transaccion.pending = totals.pending;
        transaccion.approved = totals.approved;
        transaccion.rejected = totals.rejected;
        transaccion.quantity = totals.quantity;
        transaccion.weight = totals.weight;
        transaccion.volume = totals.volume;
      });

      //Calculate activity summary properties
      transaction.Procesos.forEach(actividad => {
        // Filter tasks of this transaction from the main array
        const transactionTasks = transaction.Tareas.filter((task: Tarea) => task.IdProceso === actividad.IdProceso);
        const totals = transactionTasks.reduce((acc: { pending: number; approved: number; rejected: number; quantity: number; weight: number; volume: number }, task: Tarea) => {
          acc.pending += task.IdEstado === STATUS.PENDING ? 1 : 0;
          acc.approved += task.IdEstado === STATUS.APPROVED ? 1 : 0;
          acc.rejected += task.IdEstado === STATUS.REJECTED ? 1 : 0;
          acc.quantity += task.IdEstado === STATUS.APPROVED ? task.Cantidad ?? 0 : 0;
          acc.weight += task.IdEstado === STATUS.APPROVED ? task.Peso ?? 0 : 0;
          acc.volume += task.IdEstado === STATUS.APPROVED ? task.Volumen ?? 0 : 0;
          return acc;
        }, { pending: 0, approved: 0, rejected: 0, quantity: 0, weight: 0, volume: 0 });

        // Assign totals to the transaction
        actividad.pending = totals.pending;
        actividad.approved = totals.approved;
        actividad.rejected = totals.rejected;
        actividad.quantity = totals.quantity;
        actividad.weight = totals.weight;
        actividad.volume = totals.volume;
      });

      await this.storage.set(STORAGE.TRANSACTION, transaction);
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
      const requests: APIRequest[] = await this.storage.get(STORAGE.REQUESTS) || [];
      requests.sort((a, b) => new Date(a.Date).getTime() - new Date(b.Date).getTime());

      for (const request of requests) {
        try {
          let success = false;
          this.logger.debug('Processing request:', request);

          // Process request based on object type and CRUD operation
          switch (request.Object) {
            case DATA_TYPE.PROCESS:
              const activity = request.Data as Proceso;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.operationsService.createProcess(activity);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.operationsService.updateProceso(activity);
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
            case DATA_TYPE.MATERIAL:
              const material = request.Data as Material;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.masterdataService.createMaterial(material);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.masterdataService.updateMaterial(material);
              }
              break;
            case DATA_TYPE.PACKAGE:
              const packaging = request.Data as Embalaje;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.masterdataService.createPackage(packaging);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.masterdataService.updatePackage(packaging);
              }
              break;
            case DATA_TYPE.POINT:
              const point = request.Data as Punto;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.masterdataService.createPoint(point);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.masterdataService.updatePoint(point);
              }
              break;
              case DATA_TYPE.START_ACTIVITY:
                const startActivity = request.Data as Proceso;
                if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                  success = await this.operationsService.updateInitialProcess(startActivity);
                }
                break;
              case DATA_TYPE.SUPPLY:
              const supply = request.Data as Insumo;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.masterdataService.createSupply(supply);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.masterdataService.updateSupply(supply);
              }
              break;
            case DATA_TYPE.TASK:
              const task = request.Data as Tarea;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.operationsService.createTask(task);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.operationsService.updateTask(task);
              }
              break;
            case DATA_TYPE.THIRD_PARTY:
              const thirdParty = request.Data as Tercero;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.masterdataService.createThirdParty(thirdParty);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.masterdataService.updateThirdParty(thirdParty);
              }
              break;
            case DATA_TYPE.TRANSACTION:
              const transaction = request.Data as Transaccion;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.operationsService.createTransaction(transaction);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.operationsService.updateTransaction(transaction);
              }
              break;
            case DATA_TYPE.TREATMENT:
              const treatment = request.Data as Tratamiento;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.masterdataService.createTreatment(treatment);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.masterdataService.updateTreatment(treatment);
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
            await this.storage.set(STORAGE.REQUESTS, updatedRequests);
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
