import { Injectable } from '@angular/core';
import { Actividad } from '../interfaces/actividad.interface';
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
import { Globales } from './globales.service';
import { AuthenticationService } from './authentication.service';

@Injectable({
  providedIn: 'root',
})
export class SynchronizationService {
  constructor(
    private storage: StorageService,
    private globales: Globales,
    private authenticationService: AuthenticationService,
    private authorizationService: AuthorizationService,
    private inventoryService: InventoryService,
    private masterdataService: MasterDataService,
    private transactionsService: TransactionsService,
  ) {}

  async reload()
  {
    try {
      console.log('Autorizando ...');
      await this.downloadAuthorizations();

      console.log('Subiendo datos maestros ...');
      await this.uploadMasterData();

      var materiales: Material[] = await this.storage.get('Materiales');
      if (!materiales || materiales.length == 0) {
        console.log('Descargando datos maestros ...');
        await this.downloadMasterData();
      }

      await this.refreshTransactions();

    } catch (error){
      console.log(error);
      throw (error);
    }
  }

  async refreshMasterData() {
    try {
      console.log('Subiendo datos maestros ...');
      await this.uploadMasterData();

      console.log('Borrando datos maestros locales ...');
      await this.storage.remove('Embalajes');
      await this.storage.remove('Insumos');
      await this.storage.remove('Materiales');
      await this.storage.remove('Puntos');
      await this.storage.remove('Servicios');
      await this.storage.remove('Terceros');
      await this.storage.remove('Tratamientos');
      await this.storage.remove('Vehiculos');

      console.log('Descargando autorizaciones ...');
      await this.downloadAuthorizations();
      console.log('Descargando datos maestros ...');
      await this.downloadMasterData();

    } catch (error){
      console.log(error);
      throw (error);
    }
  }

  async refreshTransactions() {
    console.log('Subiendo transacciones ...');
    await this.uploadTransactions();

    console.log('Borrando transacciones locales ...');
    await this.storage.remove('Actividades');

    console.log('Borrando inventario local ...');
    await this.storage.remove('Inventario');

    console.log('Descargando inventario ...');
    await this.downloadInventory();

    console.log('Descargando transacciones ...');
    await this.downloadTransactions();
  }

  async downloadAuthorizations() {
    try {
      if (!await this.authenticationService.validateToken())
        await this.authenticationService.reconnect();

      await this.storage.remove('Cuenta');

      var data = await this.authorizationService.get();
      await this.storage.set('Cuenta', data);
      this.globales.unidadCantidad = data.UnidadCantidad;
      this.globales.unidadPeso = data.UnidadPeso;
      this.globales.unidadVolumen = data.UnidadVolumen;
      this.globales.mostrarIntroduccion = data.mostrarIntroduccion;
      this.globales.permisos = data.Permisos;
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

      var actividades : Actividad[] = await this.transactionsService.get();
      await this.storage.set('Actividades', actividades);

    } catch(error) {
      console.log(error);
      throw (error);
    }
  }

  async uploadMasterData() {
    let embalajes: Embalaje[] = await this.storage.get('Embalajes');
    //let insumos: Insumo[] = await this.storage.get('Insumos');
    let materiales: Material[] = await this.storage.get('Materiales');
    let puntos: Punto[] = await this.storage.get('Puntos');
    let terceros: Tercero[] = await this.storage.get('Terceros');
    let tratamientos: Tratamiento[] = await this.storage.get('Tratamientos');

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
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

  async uploadTransactions() {
    let actividades: Actividad[] = await this.storage.get('Actividades');

    if (!await this.authenticationService.validateToken())
      await this.authenticationService.reconnect();

    try {
      if (actividades) {
        for (const actividad of actividades) {
          for (const tarea of actividad.Tareas.filter((tarea) => tarea.CRUD != null)) {
            if (tarea.CRUD === CRUDOperacion.Create) {
              if (await this.transactionsService.postTarea(tarea)) {
                tarea.CRUD = null;
                tarea.CRUDDate = null;
                await this.transactionsService.uploadFotosTarea(tarea);
              }
            } else {
              if (await this.transactionsService.patchTarea(tarea)) {
                tarea.CRUD = null;
                tarea.CRUDDate = null;
                await this.transactionsService.uploadFotosTarea(tarea);
              }
            }
          }

          for (const transaccion of actividad.Transacciones.filter((transaccion) => transaccion.CRUD != null)) {
            if (transaccion.CRUD === CRUDOperacion.Update) {
              console.log(transaccion);
              if (await this.transactionsService.patchTransaccion(transaccion)) {
                transaccion.CRUD = null;
                transaccion.CRUDDate = null;
                await this.transactionsService.uploadFirmaTransaccion(transaccion);
              }
            }
          }

          if (actividad.CRUD == CRUDOperacion.Create) {
            console.log(actividad);
            if (await this.transactionsService.createActividad(actividad)) {
              actividad.CRUD = null;
              actividad.CRUDDate = null;
            }
          } else if (actividad.CRUD == CRUDOperacion.Update) {
            if (await this.transactionsService.patchActividad(actividad)) {
              actividad.CRUD = null;
              actividad.CRUDDate = null;
              await this.transactionsService.uploadFirmaActividad(actividad);
            }
          }
        }
      }
      this.storage.set('Actividades', actividades);
    } catch (error) {
      console.log(error);
      throw(error);
    }
  }

}
