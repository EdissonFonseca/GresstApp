import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { MasterDataService } from './masterdata.service';
import { CRUDOperacion } from './constants.service';
import { AuthorizationService } from './authorization.service';
import { TransactionsService } from './transactions.service';
import { Embalaje } from '../interfaces/embalaje.interface';
import { Material } from '../interfaces/material.interface';
import { Punto } from '../interfaces/punto.interface';
import { Servicio } from '../interfaces/servicio.interface';
import { Tercero } from '../interfaces/tercero.interface';
import { Tratamiento } from '../interfaces/tratamiento.interface';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import { Residuo } from '../interfaces/residuo.interface';
import { InventoryService } from './inventory.service';
import { GlobalesService } from './globales.service';
import { AuthenticationService } from './authentication.service';
import { Transaction } from '../interfaces/transaction.interface';
import { HttpService } from './http.service';
import { firstValueFrom } from 'rxjs';
import { Storage } from '@ionic/storage-angular';
import { CapacitorHttp } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { environment } from '../../environments/environment';

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
    private globales: GlobalesService,
    private authenticationService: AuthenticationService,
    private authorizationService: AuthorizationService,
    private inventoryService: InventoryService,
    private masterdataService: MasterDataService,
    private transactionsService: TransactionsService,
    private readonly http: HttpService,
    private ionicStorage: Storage
  ) {}

  /**
   * Counts and updates the number of pending transactions in local storage
   * @returns {Promise<void>}
   */
  async countPendingTransactions()  {
    this.pendingTransactions.set(0);
    try {
      let transaction: Transaction = await this.storage.get('Transaction');
      if (transaction) {
        this.pendingTransactions.set(
          transaction.Actividades.filter((actividad) => actividad.CRUD != null).length +
          transaction.Transacciones.filter((transaccion) => transaccion.CRUD != null).length +
          transaction.Tareas.filter((tarea) => tarea.CRUD != null).length
        );
      }
    } catch {
      this.pendingTransactions.set(0);
    }
  }

  /**
   * Downloads and stores authorization data from the server
   * @throws {Error} If the download fails
   */
  async downloadAuthorizations() {
    try {
      const permissions = await this.authorizationService.get();
      await this.storage.set('Cuenta', permissions);
    } catch (error) {
      throw (error);
    }
  }

  /**
   * Downloads and stores inventory data from the server
   * @throws {Error} If the download fails
   */
  async downloadInventory() {
    try {
      var inventarios : Residuo[] = await this.inventoryService.get();
      await this.storage.set('Inventario', inventarios);
    } catch (error)  {
      throw (error);
    }
  }

  /**
   * Downloads and stores all master data from the server
   * Includes: packaging, materials, points, services, third parties, treatments, and vehicles
   * @throws {Error} If the download fails
   */
  async downloadMasterData() {
    try {
      var embalajes : Embalaje[] = await this.masterdataService.getEmbalajes();
      await this.storage.set('Embalajes', embalajes);

      var materiales: Material[] = await this.masterdataService.getMateriales();
      await this.storage.set('Materiales', materiales);

      var puntos: Punto[] = await this.masterdataService.getPuntos();
      await this.storage.set('Puntos', puntos);

      var servicios: Servicio[] = await this.masterdataService.getServicios();
      await this.storage.set('Servicios', servicios);

      var terceros: Tercero[] = await this.masterdataService.getTerceros();
      await this.storage.set('Terceros', terceros);

      var tratamientos: Tratamiento[] = await this.masterdataService.getTratamientos();
      await this.storage.set('Tratamientos', tratamientos);

      var vehiculos: Vehiculo[] = await this.masterdataService.getVehiculos();
      await this.storage.set('Vehiculos', vehiculos);
    } catch (error) {
      throw (error);
    }
  }

  /**
   * Downloads and stores transaction data from the server
   * @throws {Error} If the download fails
   */
  async downloadTransactions() {
    try {
      var transaction: Transaction = await this.transactionsService.get();
      await this.storage.set('Transaction', transaction);
    } catch(error) {
      throw (error);
    }
  }

  /**
   * Uploads new master data records to the server
   * @returns {Promise<boolean>} True if upload was successful
   * @throws {Error} If the upload fails
   */
  async uploadMasterData(): Promise<boolean> {
    let embalajes: Embalaje[] = await this.storage.get('Embalajes');
    let materiales: Material[] = await this.storage.get('Materiales');
    let puntos: Punto[] = await this.storage.get('Puntos');
    let terceros: Tercero[] = await this.storage.get('Terceros');
    let tratamientos: Tratamiento[] = await this.storage.get('Tratamientos');

    try {
      if (embalajes) {
        const embalajesCrear = embalajes.filter(x => x.CRUD == CRUDOperacion.Create);
        embalajesCrear.forEach(async(embalaje) => {
          await this.masterdataService.postEmbalaje(embalaje);
          embalaje.CRUD = undefined;
          embalaje.CRUDDate = undefined;
        });
      }

      if (tratamientos) {
        const tratamientosCrear = tratamientos.filter(x => x.CRUD == CRUDOperacion.Create);
        tratamientosCrear.forEach(async(tratamiento) => {
          tratamiento.CRUD = undefined;
          tratamiento.CRUDDate = undefined;
        });
      }

      if (materiales) {
        const materialesCrear = materiales.filter(x => x.CRUD == CRUDOperacion.Create);
        materialesCrear.forEach(async(material) => {
          await this.masterdataService.postMaterial(material);
          material.CRUD = undefined;
          material.CRUDDate = undefined;
        });
      }

      if (terceros) {
        const tercerosCrear = terceros.filter(x => x.CRUD == CRUDOperacion.Create);
        tercerosCrear.forEach(async(tercero) => {
          await this.masterdataService.postTercero(tercero);
          tercero.CRUD = undefined;
          tercero.CRUDDate = undefined;
        });
      }

      if (puntos) {
        const puntosCrear = puntos.filter(x => x.CRUD == CRUDOperacion.Create);
        puntosCrear.forEach(async(punto) => {
          punto.CRUD = undefined;
          punto.CRUDDate = undefined;
        });
      }
      return true;
    } catch (error) {
      console.error('Error uploading master data:', error);
      throw (error);
    }
  }

  /**
   * Uploads pending transactions to the server
   * @returns {Promise<boolean>} True if upload was successful
   * @throws {Error} If the upload fails
   */
  async uploadTransactions(): Promise<boolean> {
    let transaction: Transaction = await this.storage.get('Transaction');

    try {
      if (transaction) {
        for (const actividad of transaction.Actividades) {
          if (actividad.CRUD == CRUDOperacion.Read) {
            if (actividad.LongitudInicial){
              const [latitud, longitud] = await this.globales.getCurrentPosition();
              actividad.LatitudInicial = latitud;
              actividad.LongitudInicial = longitud;
            }
            if (!await this.transactionsService.postActividadInicio(actividad)) {
              await this.storage.set('Transaction', transaction);
              await this.countPendingTransactions();
              return false;
            }
          }

          if (actividad.CRUD == CRUDOperacion.Create) {
            if (actividad.LongitudInicial){
              const [latitud, longitud] = await this.globales.getCurrentPosition();
              actividad.LatitudInicial = latitud;
              actividad.LongitudInicial = longitud;
            }
            if (!await this.transactionsService.postActividad(actividad)) {
              await this.storage.set('Transaction', transaction);
              await this.countPendingTransactions();
              return false;
            }
          }

          for (const transaccion of transaction.Transacciones.filter((transaccion) => transaccion.CRUD == CRUDOperacion.Create)) {
            if (transaccion.Latitud){
              const [latitud, longitud] = await this.globales.getCurrentPosition();
              transaccion.Latitud = latitud;
              transaccion.Longitud = longitud;
            }
            if (!await this.transactionsService.postTransaccion(transaccion)) {
              await this.storage.set('Transaction', transaction);
              await this.countPendingTransactions();
              return false;
            }
          }

          for (const tarea of transaction.Tareas.filter((tarea) => tarea.CRUD != null)) {
            if (tarea.CRUD === CRUDOperacion.Create) {
              if (!await this.transactionsService.postTarea(tarea)) {
                await this.storage.set('Transaction', transaction);
                await this.countPendingTransactions();
                return false;
              }
            } else {
              if (!await this.transactionsService.patchTarea(tarea)){
                await this.storage.set('Transaction', transaction);
                await this.countPendingTransactions();
                return false;
              }
            }
          }

          for (const transaccion of transaction.Transacciones.filter((transaccion) => transaccion.CRUD == CRUDOperacion.Update)) {
            if (transaccion.Latitud){
              const [latitud, longitud] = await this.globales.getCurrentPosition();
              transaccion.Latitud = latitud;
              transaccion.Longitud = longitud;
            }
            if (await this.transactionsService.patchTransaccion(transaccion)) {
              await this.transactionsService.emitCertificate(transaccion);
            } else {
              await this.storage.set('Transaction', transaction);
              return false;
            }
          }

          if (actividad.CRUD == CRUDOperacion.Update) {
            if (actividad.LongitudFinal){
              const [latitud, longitud] = await this.globales.getCurrentPosition();
              actividad.LatitudFinal = latitud;
              actividad.LongitudFinal = longitud;
            }
            if (!await this.transactionsService.patchActividad(actividad)) {
              await this.countPendingTransactions();
              this.storage.set('Transaction', transaction);
              return false;
            }
          }
        }
      }

      await this.storage.set('Transaction', transaction);
      await this.countPendingTransactions();
      return true;
    } catch (error) {
      throw (error);
    }
  }

  /**
   * Loads initial data after login
   * @returns {Promise<boolean>} True if load was successful
   */
  async load(): Promise<boolean> {
    try {
      const isOnline = await this.authenticationService.ping();
      if (!isOnline) {
        return false;
      }

      await this.downloadAuthorizations();
      await this.downloadInventory();
      await this.downloadMasterData();
      await this.downloadTransactions();
      await this.countPendingTransactions();
      return true;
    } catch (error) {
      console.error('Error loading initial data:', error);
      return false;
    }
  }

  /**
   * Refreshes data for an existing session
   * @returns {Promise<boolean>} True if refresh was successful
   */
  async refresh(): Promise<boolean> {
    try {
      const isOnline = await this.authenticationService.ping();
      if (!isOnline) {
        return false;
      }

      await this.uploadMasterData();
      await this.uploadTransactions();
      await this.downloadAuthorizations();
      await this.downloadInventory();
      await this.downloadMasterData();
      await this.downloadTransactions();
      await this.countPendingTransactions();
      return true;
    } catch (error) {
      console.error('Error refreshing data:', error);
      return false;
    }
  }

  /**
   * Attempts to close the session by uploading pending transactions
   * @returns {Promise<boolean>} True if close was successful, false otherwise
   */
  async close(): Promise<boolean> {
    try {
      const isOnline = await this.authenticationService.ping();
      if (!isOnline) {
        console.log('Cannot close session without connection');
        return false;
      }

      const uploadSuccess = await this.uploadTransactions();
      if (uploadSuccess) {
        await this.storage.clear();
        return true;
      }

      console.log('Failed to upload pending transactions');
      return false;
    } catch (error) {
      console.error('Error closing session:', error);
      return false;
    }
  }

  /**
   * Forces application exit by creating a backup of current transactions
   * @returns {Promise<void>}
   */
  async forceQuit(): Promise<void> {
    try {
      // Obtener datos del storage
      const transactions = await this.storage.get('Transaction') || [];
      const masterData = await this.storage.get('Embalajes') || [];
      const inventory = await this.storage.get('Inventario') || [];
      const authorizations = await this.storage.get('Cuenta') || [];

      // Crear objeto con todos los datos
      const backupData = {
        timestamp: new Date().toISOString(),
        transactions,
        masterData,
        inventory,
        authorizations
      };

      // Convertir a JSON
      const jsonData = JSON.stringify(backupData, null, 2);

      // Crear nombre de archivo con timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `gresst-backup-${timestamp}.json`;

      // Guardar archivo en el directorio de documentos
      await Filesystem.writeFile({
        path: fileName,
        data: jsonData,
        directory: Directory.Documents,
        recursive: true
      });

      console.log('Backup local creado exitosamente:', fileName);

      // Intentar hacer backup en el servidor
      try {
        await this.http.post('/transactions/backup', backupData);
        console.log('Backup en servidor creado exitosamente');
      } catch (error) {
        console.error('Error al crear backup en servidor:', error);
      }

      // Limpiar storage
      await this.storage.clear();
      console.log('Storage limpiado exitosamente');
    } catch (error) {
      console.error('Error en forceQuit:', error);
      throw error;
    }
  }
}
