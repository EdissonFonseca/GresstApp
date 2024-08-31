import { Injectable } from '@angular/core';
import { Actividad } from '../interfaces/actividad.interface';
import { StorageService } from './storage.service';
import { MasterDataService } from './masterdata.service';
import { Residuo } from '../interfaces/residuo.interface';
import { CRUDOperacion } from './constants.service';
import { MasterData } from '../interfaces/masterdata.interface';
import { AuthorizationService } from './authorization.service';
import { TransactionsService } from './transactions.service';

@Injectable({
  providedIn: 'root',
})
export class SynchronizationService {
  constructor(
    private storage: StorageService,
    private authorizationService: AuthorizationService,
    private masterdataService: MasterDataService,
    private transactionsService: TransactionsService,
  ) {}

  async reload()
  {
    try {
      var cuenta = this.authorizationService.get();
      await this.storage.set('Cuenta', cuenta);

      var masterdata = await this.storage.get('MasterData');
      if (!masterdata) {
        masterdata = await this.masterdataService.get();
        await this.storage.set('MasterData', masterdata);
      }

      await this.uploadTransactions();
      var actividades = await this.transactionsService.get();
      await this.storage.set('Actividades', actividades);

    } catch {}
  }

  async refresh() {
    let actividades: Actividad[] = await this.storage.get('Actividades');
    let inventario: Residuo[] = await this.storage.get('Inventario');

    try {
      var cuenta = this.authorizationService.get();
      await this.storage.set('Cuenta', cuenta);

    } catch (error){
      throw (error);
    }
  }

  async uploadMasterData() {
    let masterdata: MasterData = await this.storage.get('MasterData');

    try {
      if (masterdata.Insumos) {
        const insumosCrear = masterdata.Insumos.filter(x => x.CRUD == CRUDOperacion.Create);
        insumosCrear.forEach(async(insumo) => {
          await this.masterdataService.postInsumo(insumo);
          insumo.CRUD = null;
          insumo.CRUDDate = null;
        });
      }

      if (masterdata.Embalajes) {
        const embalajesCrear = masterdata.Embalajes.filter(x => x.CRUD == CRUDOperacion.Create);
        embalajesCrear.forEach(async(embalaje) => {
          await this.masterdataService.postEmbalaje(embalaje);
          embalaje.CRUD = null;
          embalaje.CRUDDate = null;
        });
      }

      if (masterdata.Tratamientos) {
        const tratamientosCrear = masterdata.Tratamientos.filter(x => x.CRUD == CRUDOperacion.Create);
        tratamientosCrear.forEach(async(tratamiento) => {
          //await this.integration.postTratamiento(tratamiento);
          tratamiento.CRUD = null;
          tratamiento.CRUDDate = null;
        });
      }

      if (masterdata.Materiales) {
        const materialesCrear = masterdata.Materiales.filter(x => x.CRUD == CRUDOperacion.Create);
        materialesCrear.forEach(async(material) => {
          await this.masterdataService.postMaterial(material);
          material.CRUD = null;
          material.CRUDDate = null;
        });
      }

      if (masterdata.Terceros) {
        const tercerosCrear = masterdata.Terceros.filter(x => x.CRUD == CRUDOperacion.Create);
        tercerosCrear.forEach(async(tercero) => {
          await this.masterdataService.postTercero(tercero);
          tercero.CRUD = null;
          tercero.CRUDDate = null;
        });
      }

      if (masterdata.Puntos) {
        const puntosCrear = masterdata.Puntos.filter(x => x.CRUD == CRUDOperacion.Create);
        puntosCrear.forEach(async(punto) => {
          //await this.integration.postPunto(punto);
          punto.CRUD = null;
          punto.CRUDDate = null;
        });
      }
    } catch (error) {}

  }

  async uploadTransactions() {
    let actividades: Actividad[] = await this.storage.get('Actividades');

    try {
      if (actividades) {
        actividades.forEach(async(actividad) => {
          actividad.Tareas.filter((tarea) => tarea.CRUD != null).forEach(async (tarea) => {
            if (tarea.CRUD == CRUDOperacion.Create) {
              if (await this.transactionsService.postTarea(tarea)) {
                await this.transactionsService.uploadFotosTarea(tarea);
              }
            } else {
              if (await (this.transactionsService.patchTarea(tarea))){
                await this.transactionsService.uploadFotosTarea(tarea);
              }
            }
          });
        });

        actividades.forEach(async(actividad) => {
          actividad.Transacciones.filter((transaccion) => transaccion.CRUD != null).forEach(async (transaccion) => {
            if (transaccion.CRUD == CRUDOperacion.Create) {
            } else {
            }
          });
        });
      }
      this.storage.set('Actividades', actividades);
    } catch (error) {

    }
  }

}
