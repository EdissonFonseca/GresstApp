import { Injectable } from '@angular/core';
import { Cuenta } from '../interfaces/cuenta.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { StorageService } from './storage.service';
import { IntegrationService } from './integration.service';
import { Globales } from './globales.service';
import { Residuo } from '../interfaces/residuo.interface';
import { ActividadesService } from './actividades.service';

@Injectable({
  providedIn: 'root',
})
export class SynchronizationService {

  constructor(
    private storage: StorageService,
    private integration: IntegrationService,
    private actividadesService: ActividadesService,
    private globales: Globales
  ) {}

  async sincronizar() {
    let cuenta: Cuenta = await this.storage.get('Cuenta');
    let actividades: Actividad[] = await this.storage.get('Actividades');
    let inventario: Residuo[] = await this.storage.get('Inventario');

    try {
      // //TODO -> Faltan modificaciones y borrados de insumose
      // const insumosCrear = cuenta.Insumos.filter(x => x.CRUD == CRUDOperacion.Create);
      // insumosCrear.forEach(async(insumo) => {
      //   await this.integration.postInsumo(insumo);
      //   insumo.CRUD = null;
      //   insumo.CRUDDate = null;
      // });

      // const embalajesCrear = cuenta.Embalajes.filter(x => x.CRUD == CRUDOperacion.Create);
      // embalajesCrear.forEach(async(embalaje) => {
      //   await this.integration.postEmbalaje(embalaje);
      //   embalaje.CRUD = null;
      //   embalaje.CRUDDate = null;
      // });

      // const tratamientosCrear = cuenta.Tratamientos.filter(x => x.CRUD == CRUDOperacion.Create);
      // tratamientosCrear.forEach(async(tratamiento) => {
      //   await this.integration.postTratamiento(tratamiento);
      //   tratamiento.CRUD = null;
      //   tratamiento.CRUDDate = null;
      // });

      // const materialesCrear = cuenta.Materiales.filter(x => x.CRUD == CRUDOperacion.Create);
      // materialesCrear.forEach(async(material) => {
      //   await this.integration.postMaterial(material);
      //   material.CRUD = null;
      //   material.CRUDDate = null;
      // });

      // const tercerosCrear = cuenta.Terceros.filter(x => x.CRUD == CRUDOperacion.Create);
      // tercerosCrear.forEach(async(tercero) => {
      //   await this.integration.postTercero(tercero);
      //   tercero.CRUD = null;
      //   tercero.CRUDDate = null;
      // });

      // const puntosCrear = cuenta.Puntos.filter(x => x.CRUD == CRUDOperacion.Create);
      // puntosCrear.forEach(async(punto) => {
      //   await this.integration.postPunto(punto);
      //   punto.CRUD = null;
      //   punto.CRUDDate = null;
      // });

      try
      {
        if (actividades)
        {
          const actividadesPendientes = actividades.filter(x => x.CRUD != null);
          actividadesPendientes.forEach(async(actividad) => {
            await this.actividadesService.update(actividad);
          });
        }
      } catch {}

      cuenta = await this.integration.getConfiguracion();
      await this.storage.set('Cuenta', cuenta);

      actividades = await this.integration.getActividades();
      await this.storage.set('Actividades', actividades);

      inventario = await this.integration.getInventario();
      await this.storage.set('Inventario', inventario);

    } catch (error){
      throw (error);
    }
  }

}
