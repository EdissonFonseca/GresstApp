import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { MasterDataApiService } from '../api/masterdataApi.service';
import { AuthorizationApiService } from '../api/authorizationApi.service';
import { TransactionsApiService } from '../api/transactionsApi.service';
import { Embalaje } from '../../interfaces/embalaje.interface';
import { Material } from '../../interfaces/material.interface';
import { Punto } from '../../interfaces/punto.interface';
import { Servicio } from '../../interfaces/servicio.interface';
import { Tercero } from '../../interfaces/tercero.interface';
import { Tratamiento } from '../../interfaces/tratamiento.interface';
import { Vehiculo } from '../../interfaces/vehiculo.interface';
import { Transaction } from '../../interfaces/transaction.interface';
import { environment } from '../../../environments/environment';
import { CRUD_OPERATIONS, DATA_TYPE, STORAGE } from '@app/constants/constants';
import { LoggerService } from './logger.service';
import { Inventario, InventoryApiService } from '../api/inventoryApi.service';
import { APIRequest } from '@app/interfaces/APIRequest.interface';
import { Actividad } from '@app/interfaces/actividad.interface';
import { Insumo } from '@app/interfaces/insumo.interface';
import { Tarea } from '@app/interfaces/tarea.interface';
import { Transaccion } from '@app/interfaces/transaccion.interface';

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
    private transactionsService: TransactionsApiService,
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
      const transaction: Transaction = await this.transactionsService.get();
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
            case DATA_TYPE.ACTIVITY:
              const activity = request.Data as Actividad;
              if (request.CRUD === CRUD_OPERATIONS.CREATE) {
                success = await this.transactionsService.createActivity(activity);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.transactionsService.updateActivity(activity);
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
                const startActivity = request.Data as Actividad;
                if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                  success = await this.transactionsService.updateInitialActivity(startActivity);
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
                success = await this.transactionsService.createTask(task);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.transactionsService.updateTask(task);
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
                success = await this.transactionsService.createTransaction(transaction);
              } else if (request.CRUD === CRUD_OPERATIONS.UPDATE) {
                success = await this.transactionsService.updateTransaction(transaction);
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
