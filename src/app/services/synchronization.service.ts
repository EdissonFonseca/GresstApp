import { Injectable } from '@angular/core';
import { Actividad } from '../interfaces/actividad.interface';
import { StorageService } from './storage.service';
import { MasterDataService } from './masterdata.service';
import { CRUDOperacion } from './constants.service';
import { AuthorizationService } from './authorization.service';
import { TransactionsService } from './transactions.service';
import { Embalaje } from '../interfaces/embalaje.interface';
import { Insumo } from '../interfaces/insumo.interface';
import { Material } from '../interfaces/material.interface';
import { Punto } from '../interfaces/punto.interface';
import { Servicio } from '../interfaces/servicio.interface';
import { Tercero } from '../interfaces/tercero.interface';
import { Tratamiento } from '../interfaces/tratamiento.interface';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import { Residuo } from '../interfaces/residuo.interface';
import { InventoryService } from './inventory.service';
import { Cuenta } from '../interfaces/cuenta.interface';
import { Globales } from './globales.service';

@Injectable({
  providedIn: 'root',
})
export class SynchronizationService {
  constructor(
    private storage: StorageService,
    private globales: Globales,
    private authorizationService: AuthorizationService,
    private inventoryService: InventoryService,
    private masterdataService: MasterDataService,
    private transactionsService: TransactionsService,
  ) {}

  async reload()
  {
    try {
      await this.storage.remove('Cuenta');
      await this.storage.remove('Actividades');
      await this.storage.remove('Inventario');
      await this.storage.remove('Embalajes');
      await this.storage.remove('Insumos');
      await this.storage.remove('Materiales');
      await this.storage.remove('Puntos');
      await this.storage.remove('Servicios');
      await this.storage.remove('Terceros');
      await this.storage.remove('Tratamientos');
      await this.storage.remove('Vehiculos');

      var cuenta = await this.authorizationService.get();
      await this.storage.set('Cuenta', cuenta);
      this.globales.unidadCantidad = cuenta.UnidadCantidad;
      this.globales.unidadPeso = cuenta.UnidadPeso;
      this.globales.unidadVolumen = cuenta.UnidadVolumen;
      this.globales.mostrarIntroduccion = cuenta.mostrarIntroduccion;

      //await this.uploadMasterData();
      //await this.uploadTransactions();

      //var materiales = await this.storage.get('Materiales');
      //if (!materiales) {
        this.downloadMasterData();
        this.downloadTransactions();
      //}
    } catch {}
  }

  async refresh() {
    try {
      //this.uploadMasterData();
      //this.uploadTransactions();
      this.downloadMasterData();
      this.downloadTransactions();
    } catch (error){
      throw (error);
    }
  }

  async downloadMasterData() {
    try {
      var embalajes : Embalaje[] = await this.masterdataService.getEmbalajes();
      await this.storage.set('Embalajes', embalajes);

      var insumos : Insumo[] = await this.masterdataService.getInsumos();
      await this.storage.set('Insumos', insumos);

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

    }
  }

  async uploadMasterData() {
    let embalajes: Embalaje[] = await this.storage.get('Embalajes');
    let insumos: Insumo[] = await this.storage.get('Insumos');
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

      if (insumos) {
        const insumosCrear = insumos.filter(x => x.CRUD == CRUDOperacion.Create);
        insumosCrear.forEach(async(insumo) => {
          await this.masterdataService.postInsumo(insumo);
          insumo.CRUD = null;
          insumo.CRUDDate = null;
        });
      }

      if (tratamientos) {
        const tratamientosCrear = tratamientos.filter(x => x.CRUD == CRUDOperacion.Create);
        tratamientosCrear.forEach(async(tratamiento) => {
          //await this.integration.postTratamiento(tratamiento);
          tratamiento.CRUD = null;
          tratamiento.CRUDDate = null;
        });
      }

      if (materiales) {
        const materialesCrear = materiales.filter(x => x.CRUD == CRUDOperacion.Create);
        materialesCrear.forEach(async(material) => {
          await this.masterdataService.postMaterial(material);
          material.CRUD = null;
          material.CRUDDate = null;
        });
      }

      if (terceros) {
        const tercerosCrear = terceros.filter(x => x.CRUD == CRUDOperacion.Create);
        tercerosCrear.forEach(async(tercero) => {
          await this.masterdataService.postTercero(tercero);
          tercero.CRUD = null;
          tercero.CRUDDate = null;
        });
      }

      if (puntos) {
        const puntosCrear = puntos.filter(x => x.CRUD == CRUDOperacion.Create);
        puntosCrear.forEach(async(punto) => {
          //await this.integration.postPunto(punto);
          punto.CRUD = null;
          punto.CRUDDate = null;
        });
      }
    } catch (error) {}

  }

  async downloadTransactions() {
    var actividades : Actividad[] = await this.transactionsService.get();
    await this.storage.set('Actividades', actividades);

  }

  async uploadTransactions() {
    let actividades: Actividad[] = await this.storage.get('Actividades');

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
        }
      }
      this.storage.set('Actividades', actividades);
    } catch (error) {

    }
  }

  async downloadInventory() {
    var inventarios : Residuo[] = await this.inventoryService.get();
    await this.
    storage.set('Inventario', inventarios);

  }


}
