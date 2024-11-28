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

@Injectable({
  providedIn: 'root',
})
export class SynchronizationService {
  pendingTransactions = signal<number>(0);

  constructor(
    private storage: StorageService,
    private globales: GlobalesService,
    private authenticationService: AuthenticationService,
    private authorizationService: AuthorizationService,
    private inventoryService: InventoryService,
    private masterdataService: MasterDataService,
    private transactionsService: TransactionsService,
  ) {}

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
   * Download authorizations from the server and store them in the device.
   */
  async downloadAuthorizations() {
    try {
      var data = await this.authorizationService.get();
      await this.storage.set('Cuenta', data);

    } catch (error) {
      throw (error);
    }
  }

  /**
   * Download inventory from the server and store it in the device.
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
   * Download master data from the server and store it in the device.
   */
  async downloadMasterData() {
    try {
      var embalajes : Embalaje[] = await this.masterdataService.getEmbalajes();
      await this.storage.set('Embalajes', embalajes);

      //var insumos : Insumo[] = await this.masterdataService.getInsumos();
      //await this.storage.set('Insumos', insumos);

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
   * Download transactions from the server and store them in the device.
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
   * Upload master data to the server.
   * @returns true if the operation was successful, false otherwise.
   */
  async uploadMasterData(): Promise<boolean> {
    let embalajes: Embalaje[] = await this.storage.get('Embalajes');
    //let insumos: Insumo[] = await this.storage.get('Insumos');
    let materiales: Material[] = await this.storage.get('Materiales');
    let puntos: Punto[] = await this.storage.get('Puntos');
    let terceros: Tercero[] = await this.storage.get('Terceros');
    let tratamientos: Tratamiento[] = await this.storage.get('Tratamientos');

    try {
      if (embalajes) {
        const embalajesCrear = embalajes.filter(x => x.CRUD == CRUDOperacion.Create);
        embalajesCrear.forEach(async(embalaje) => {
          await this.masterdataService.postEmbalaje(embalaje);
          embalaje.CRUD = null;
          embalaje.CRUDDate = null;
        });
      }

      // if (insumos) {
      //   const insumosCrear = insumos.filter(x => x.CRUD == CRUDOperacion.Create);
      //   insumosCrear.forEach(async(insumo) => {
      //     console.log(insumo);
      //     await this.masterdataService.postInsumo(insumo);
      //     insumo.CRUD = null;
      //     insumo.CRUDDate = null;
      //   });
      // }

      if (tratamientos) {
        const tratamientosCrear = tratamientos.filter(x => x.CRUD == CRUDOperacion.Create);
        tratamientosCrear.forEach(async(tratamiento) => {
          console.log(tratamiento);
          //await this.integration.postTratamiento(tratamiento);
          tratamiento.CRUD = null;
          tratamiento.CRUDDate = null;
        });
      }

      if (materiales) {
        const materialesCrear = materiales.filter(x => x.CRUD == CRUDOperacion.Create);
        materialesCrear.forEach(async(material) => {
          console.log(material);
          await this.masterdataService.postMaterial(material);
          material.CRUD = null;
          material.CRUDDate = null;
        });
      }

      if (terceros) {
        const tercerosCrear = terceros.filter(x => x.CRUD == CRUDOperacion.Create);
        tercerosCrear.forEach(async(tercero) => {
          console.log(tercero);
          await this.masterdataService.postTercero(tercero);
          tercero.CRUD = null;
          tercero.CRUDDate = null;
        });
      }

      if (puntos) {
        const puntosCrear = puntos.filter(x => x.CRUD == CRUDOperacion.Create);
        puntosCrear.forEach(async(punto) => {
          console.log(punto);
          //await this.integration.postPunto(punto);
          punto.CRUD = null;
          punto.CRUDDate = null;
        });
      }
      return true;

    } catch (error) {
      console.log(error);
      throw (error);
    }
  }

  /**
   * Upload transactions to the server.
   * @returns true if the operation was successful, false otherwise.
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

  async load(){
    console.log('Cargando ...');
    try {
      this.storage.clear();

      console.log('Descargando autorizaciones ...');
      await this.downloadAuthorizations();

      console.log('Descargando datos maestros ...');
      await this.downloadMasterData();

      console.log('Descargando inventario ...');
      await this.downloadInventory();

      console.log('Descargando transacciones ...');
      await this.downloadTransactions();

    } catch (error){
      throw (error);
    }
  }

  async refresh(): Promise<boolean> {
    console.log('Refrescando ...');

    try {
      console.log('Subiendo datos maestros ...');
      if (await this.uploadMasterData())
      {
        console.log('Subiendo transacciones ...');
        if (await this.uploadTransactions()) {
          this.load();
        }
      }
      return true;
    } catch (error){
      //throw (error);
      return false;
    }
  }

  async close(): Promise<boolean> {
    console.log('Cerrando ...');

    if (!this.authenticationService.ping()) return false;

    if (!this.authenticationService.validateToken())
      this.globales.token = await this.authenticationService.reconnect();

    if (!this.globales.token) return false;

    try
    {
      //Online
      console.log('Subiendo datos maestros ...');
      if (await this.uploadMasterData())
      {
        console.log('Subiendo transacciones ...');
        if (await this.uploadTransactions()) {
          await this.storage.clear();
        } else {
          return false;
        }
      } else {
        return false;
      }
      return true;
    } catch {
      return false;
    }
  }

  async forceQuit(): Promise<boolean> {
    console.log('Forzando salida ...');
    let transaction: Transaction = await this.storage.get('Transaction');

    try {
      await this.transactionsService.postBackup(transaction);
      await this.storage.clear();
      return true;

    } catch (error) {
      return false;
      //throw (error);
    }
  }
}
