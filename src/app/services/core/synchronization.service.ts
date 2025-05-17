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
import { CRUD_OPERATIONS } from '@app/constants/constants';
import { LoggerService } from './logger.service';
import { InventoryApiService } from '../api/inventoryApi.service';
import { Utils } from '@app/utils/utils';

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
   * Counts and updates the number of pending transactions in local storage
   * @returns {Promise<void>}
   */
  async countPendingTransactions(): Promise<void> {
    this.pendingTransactions.set(0);
    try {
      const transaction: Transaction = await this.storage.get('Transaction');
      if (transaction) {
        this.pendingTransactions.set(
          transaction.Actividades.filter((actividad) => actividad.CRUD != null).length +
          transaction.Transacciones.filter((transaccion) => transaccion.CRUD != null).length +
          transaction.Tareas.filter((tarea) => tarea.CRUD != null).length
        );
      }
    } catch (error) {
      this.logger.error('Error counting pending transactions', error);
      this.pendingTransactions.set(0);
    }
  }

  /**
   * Downloads and stores authorization data from the server
   * @throws {Error} If the download fails
   */
  async downloadAuthorizations(): Promise<void> {
    try {
      const permissions = await this.authorizationService.get();
      await this.storage.set('Cuenta', permissions);
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
      await this.storage.set('Inventario', response);
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
      await this.storage.set('Embalajes', packaging);

      const materials: Material[] = await this.masterdataService.getMaterials();
      await this.storage.set('Materiales', materials);

      const points: Punto[] = await this.masterdataService.getPoints();
      await this.storage.set('Puntos', points);

      const services: Servicio[] = await this.masterdataService.getServices();
      await this.storage.set('Servicios', services);

      const thirdParties: Tercero[] = await this.masterdataService.getThirdParties();
      await this.storage.set('Terceros', thirdParties);

      const treatments: Tratamiento[] = await this.masterdataService.getTreatments();
      await this.storage.set('Tratamientos', treatments);

      const vehicles: Vehiculo[] = await this.masterdataService.getVehicles();
      await this.storage.set('Vehiculos', vehicles);
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
      await this.storage.set('Transaction', transaction);
    } catch (error) {
      this.logger.error('Error downloading transactions', error);
      throw error;
    }
  }

  /**
   * Uploads new master data records to the server
   * @returns {Promise<boolean>} True if upload was successful
   * @throws {Error} If the upload fails
   */
  async uploadMasterData(): Promise<boolean> {
    try {
      const packaging: Embalaje[] = await this.storage.get('Embalajes');
      const materials: Material[] = await this.storage.get('Materiales');
      const points: Punto[] = await this.storage.get('Puntos');
      const thirdParties: Tercero[] = await this.storage.get('Terceros');
      const treatments: Tratamiento[] = await this.storage.get('Tratamientos');

      if (packaging) {
        const newPackaging = packaging.filter(x => x.CRUD === CRUD_OPERATIONS.CREATE);
        for (const item of newPackaging) {
          await this.masterdataService.createPackaging(item);
          item.CRUD = undefined;
          item.CRUDDate = undefined;
        }
      }

      if (treatments) {
        const newTreatments = treatments.filter(x => x.CRUD === CRUD_OPERATIONS.CREATE);
        for (const item of newTreatments) {
          item.CRUD = undefined;
          item.CRUDDate = undefined;
        }
      }

      if (materials) {
        const newMaterials = materials.filter(x => x.CRUD === CRUD_OPERATIONS.CREATE);
        for (const item of newMaterials) {
          await this.masterdataService.createMaterial(item);
          item.CRUD = undefined;
          item.CRUDDate = undefined;
        }
      }

      if (thirdParties) {
        const newThirdParties = thirdParties.filter(x => x.CRUD === CRUD_OPERATIONS.CREATE);
        for (const item of newThirdParties) {
          await this.masterdataService.createThirdParty(item);
          item.CRUD = undefined;
          item.CRUDDate = undefined;
        }
      }

      if (points) {
        const newPoints = points.filter(x => x.CRUD === CRUD_OPERATIONS.CREATE);
        for (const item of newPoints) {
          item.CRUD = undefined;
          item.CRUDDate = undefined;
        }
      }

      return true;
    } catch (error) {
      this.logger.error('Error uploading master data', error);
      throw error;
    }
  }

  /**
   * Uploads pending transactions to the server
   * @returns {Promise<boolean>} True if upload was successful
   * @throws {Error} If the upload fails
   */
  async uploadTransactions(): Promise<boolean> {
    try {
      const transaction: Transaction = await this.storage.get('Transaction');

      if (transaction) {
        // Process activities
        for (const activity of transaction.Actividades) {
          if (activity.CRUD === CRUD_OPERATIONS.READ) {
            if (activity.LongitudInicial) {
              const [latitude, longitude] = await Utils.getCurrentPosition();
              activity.LatitudInicial = latitude;
              activity.LongitudInicial = longitude;
            }
            if (!await this.transactionsService.createInitialActivity(activity)) {
              await this.storage.set('Transaction', transaction);
              await this.countPendingTransactions();
              return false;
            }
          }

          if (activity.CRUD === CRUD_OPERATIONS.CREATE) {
            if (activity.LongitudInicial) {
              const [latitude, longitude] = await Utils.getCurrentPosition();
              activity.LatitudInicial = latitude;
              activity.LongitudInicial = longitude;
            }
            if (!await this.transactionsService.createActivity(activity)) {
              await this.storage.set('Transaction', transaction);
              await this.countPendingTransactions();
              return false;
            }
          }
        }

        // Process transactions
        for (const trans of transaction.Transacciones.filter((t: any) => t.CRUD === CRUD_OPERATIONS.CREATE)) {
          if (trans.Latitud) {
            const [latitude, longitude] = await Utils.getCurrentPosition();
            trans.Latitud = latitude;
            trans.Longitud = longitude;
          }
          if (!await this.transactionsService.createTransaction(trans)) {
            await this.storage.set('Transaction', transaction);
            await this.countPendingTransactions();
            return false;
          }
        }

        // Process tasks
        for (const task of transaction.Tareas.filter((t: any) => t.CRUD != null)) {
          if (task.CRUD === CRUD_OPERATIONS.CREATE) {
            if (!await this.transactionsService.createTask(task)) {
              await this.storage.set('Transaction', transaction);
              await this.countPendingTransactions();
              return false;
            }
          } else if (task.CRUD === CRUD_OPERATIONS.UPDATE) {
            if (!await this.transactionsService.updateTask(task)) {
              await this.storage.set('Transaction', transaction);
              await this.countPendingTransactions();
              return false;
            }
          }
        }

        await this.storage.set('Transaction', transaction);
        await this.countPendingTransactions();
      }

      return true;
    } catch (error) {
      this.logger.error('Error uploading transactions', error);
      throw error;
    }
  }
}
