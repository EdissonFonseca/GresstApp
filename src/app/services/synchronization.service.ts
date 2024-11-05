import { Injectable } from '@angular/core';
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
  constructor(
    private storage: StorageService,
    private globales: GlobalesService,
    private authenticationService: AuthenticationService,
    private authorizationService: AuthorizationService,
    private inventoryService: InventoryService,
    private masterdataService: MasterDataService,
    private transactionsService: TransactionsService,
  ) {}

  async downloadAuthorizations() {
    try {
      if (!await this.authenticationService.validateToken())
        await this.authenticationService.reconnect();

      await this.storage.remove('Cuenta');

      var data = await this.authorizationService.get();
      await this.storage.set('Cuenta', data);
    } catch (error) {
      console.log(error);
      throw (error);
    }
  }

  async downloadInventory() {
    try {
      if (!await this.authenticationService.validateToken())
        await this.authenticationService.reconnect();

      var inventarios : Residuo[] = await this.inventoryService.get();
      await this.storage.set('Inventario', inventarios);
    } catch (error)  {
      console.log(error);
      throw (error);
    }
  }

  async downloadMasterData() {
    try {
      if (!await this.authenticationService.validateToken())
        await this.authenticationService.reconnect();

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
      console.log(error);
      throw (error);
    }
  }

  async downloadTransactions() {
    try {
      if (!await this.authenticationService.validateToken())
        await this.authenticationService.reconnect();

      var transaction: Transaction = await this.transactionsService.get();
      await this.storage.set('Transaction', transaction);

    } catch(error) {
      console.log(error);
      throw (error);
    }
  }

  async uploadMasterData(): Promise<boolean> {
    let embalajes: Embalaje[] = await this.storage.get('Embalajes');
    //let insumos: Insumo[] = await this.storage.get('Insumos');
    let materiales: Material[] = await this.storage.get('Materiales');
    let puntos: Punto[] = await this.storage.get('Puntos');
    let terceros: Tercero[] = await this.storage.get('Terceros');
    let tratamientos: Tratamiento[] = await this.storage.get('Tratamientos');

    if (!await this.authenticationService.ping()) return false;

    if (!await this.authenticationService.validateToken())
      await this.authenticationService.reconnect();

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
      return false;
    }
  }

  async uploadTransactions(): Promise<boolean> {
    let transaction: Transaction = await this.storage.get('Transaction');

    if (!await this.authenticationService.ping()) return false;

    if (!await this.authenticationService.validateToken())
      await this.authenticationService.reconnect();

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
              return false;
            }
          }

          for (const tarea of transaction.Tareas.filter((tarea) => tarea.CRUD != null)) {
            if (tarea.CRUD === CRUDOperacion.Create) {
              if (!await this.transactionsService.postTarea(tarea)) {
                await this.storage.set('Transaction', transaction);
                return false;
              }
            } else {
              if (!await this.transactionsService.patchTarea(tarea)){
                await this.storage.set('Transaction', transaction);
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
              this.storage.set('Transaction', transaction);
              return false;
            }
          }
        }
      }

      await this.storage.set('Transaction', transaction);
      return true;

    } catch (error) {
      console.log(error);
      await this.storage.set('Transaction', transaction);
      return false;
    }
  }

  async load()
  {
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
      console.log(error);
      throw (error);
    }
  }

  async reload()
  {
    const user = await this.storage.get('Login');
    const password = await this.storage.get('Password');
    const token = await this.storage.get('Token');

    try {
      console.log('Subiendo datos maestros ...');
      if (await this.uploadMasterData())
      {
        console.log('Subiendo transacciones ...');
        if (await this.uploadTransactions()) {
          this.load();
        }
      }
      await this.storage.set('Login', user);
      await this.storage.set('Password', password);
      await this.storage.set('Token', token);

    } catch (error){
      console.log(error);

      await this.storage.set('Login', user);
      await this.storage.set('Password', password);
      await this.storage.set('Token', token);

      throw (error);
    }
  }
}
