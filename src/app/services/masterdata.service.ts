import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { IntegrationService } from './integration.service';
import { Globales } from './globales.service';
import { Tercero } from '../interfaces/tercero.interface';
import { CRUDOperacion, Estado } from './constants.service';
import { Cuenta } from '../interfaces/cuenta.interface';
import { Servicio } from '../interfaces/servicio.interface';
import { Embalaje } from '../interfaces/embalaje.interface';
import { Material } from '../interfaces/material.interface';
import { Insumo } from '../interfaces/insumo.interface';
import { Actividad } from '../interfaces/actividad.interface';
import { Punto } from '../interfaces/punto.interface';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import { Tratamiento } from '../interfaces/tratamiento.interface';

@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  constructor(
    private storage: StorageService,
    private globales: Globales,
    private integration: IntegrationService,
  ) {}

  async getEmbalaje(idEmbalaje: string): Promise<Embalaje | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Embalajes) {
      const embalaje = cuenta.Embalajes.find((embalaje) => embalaje.IdEmbalaje === idEmbalaje);
      return embalaje || undefined;
    }

    return undefined;
  }

  async getEmbalajes(): Promise<Embalaje[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');
    const embalajes = cuenta.Embalajes.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
    return embalajes;
  }

  async getInsumos(): Promise<Insumo[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Insumos;
  }

  async getMaterial(idMaterial: string): Promise<Material | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Materiales) {
      const material = cuenta.Materiales.find((material) => material.IdMaterial === idMaterial);
      return material || undefined;
    }

    return undefined;
  }

  async getMateriales(): Promise<Material[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Materiales;
  }

  async getPunto(idPunto: string): Promise<Punto | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Puntos) {
      const punto = cuenta.Puntos.find((punto) => punto.IdPunto === idPunto);
      return punto || undefined;
    }

    return undefined;
  }

  async getPuntos(): Promise<Punto[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Puntos;
  }

  async getPuntosFromTareas(idActividad: string){
    let puntos: Punto[] = [];
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad.Tareas)
    {
      const tareasPuntos = actividad.Tareas.filter((x) => x.IdPunto != null);
      const idsPuntos: string[] = tareasPuntos.map((tarea) => tarea.IdPunto ?? '');
      puntos = cuenta.Puntos.filter((punto) => idsPuntos.includes(punto.IdPunto));
    }
    return puntos;
  }

  async getPuntosFromTareasPendientes(idActividad: string){
    let puntos: Punto[] = [];
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad.Tareas)
    {
      const tareasPuntos = actividad.Tareas.filter((x) => x.IdPunto != null && x.IdEstado == Estado.Pendiente);
      const idsPuntos: string[] = tareasPuntos.map((tarea) => tarea.IdPunto ?? '');
      puntos = cuenta.Puntos.filter((punto) => idsPuntos.includes(punto.IdPunto));
    }
    return puntos;
  }

  async getServicio(idServicio: string): Promise<Servicio | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Servicios) {
      const servicio = cuenta.Servicios.find((servicio) => servicio.IdServicio === idServicio);
      return servicio || undefined;
    }

    return undefined;
  }

  async getServicios(): Promise<Servicio[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Servicios;
  }

  async getTercero(idTercero: string): Promise<Tercero | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Terceros) {
      const tercero = cuenta.Terceros.find((tercero) => tercero.IdTercero === idTercero);
      return tercero || undefined;
    }

    return undefined;
  }

  async getTerceros(): Promise<Tercero[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Terceros;
  }

  async getTercerosConPuntos(): Promise<Tercero[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    const idTerceros: string[] = cuenta.Puntos.map(x => x.IdTercero ?? '');

    return cuenta.Terceros.filter(x=> idTerceros.includes(x.IdTercero));
  }

  async getTratamiento(idTratamiento: string): Promise<Tratamiento | undefined> {
    const cuenta: Cuenta | null = await this.storage.get('Cuenta');

    if (cuenta && cuenta.Tratamientos) {
      const tratamiento = cuenta.Tratamientos.find((tratamiento) => tratamiento.IdTratamiento === idTratamiento);
      return tratamiento || undefined;
    }

    return undefined;
  }

  async getTratamientos(): Promise<Tratamiento[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Tratamientos;
  }

  async getVehiculos(): Promise<Vehiculo[]> {
    const cuenta: Cuenta  = await this.storage.get('Cuenta');

    return cuenta.Vehiculos;
  }

  async addServicio(idServicio: string) {
    const cuenta: Cuenta = await this.storage.get('Cuenta');

    const selectedServicio = this.globales.servicios.find(x => x.IdServicio == idServicio);
    if (selectedServicio != null)
    {
      const servicio: Servicio = { IdServicio: idServicio, Nombre: selectedServicio.Nombre, CRUDDate: new Date() };
      cuenta.Servicios.push(servicio);
      await this.storage.set('Cuenta', cuenta);
    }
  }

  async createEmbalaje(embalaje: Embalaje): Promise<boolean> {
    try{
      const posted = await this.integration.postEmbalaje(embalaje);
      if (!posted) {
        embalaje.CRUD = CRUDOperacion.Create;
        embalaje.CRUDDate = new Date();
      }
    } catch {
      embalaje.CRUD = CRUDOperacion.Create;
      embalaje.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const cuenta: Cuenta = await this.storage.get('Cuenta');
      cuenta.Embalajes.push(embalaje);
      await this.storage.set('Cuenta', cuenta);
    }
    return true;
  }

  async createInsumo(insumo: Insumo): Promise<boolean> {
    try{
      const posted = await this.integration.postInsumo(insumo);
      if (!posted) {
        insumo.CRUD = CRUDOperacion.Create;
        insumo.CRUDDate = new Date();
      }
    } catch {
      insumo.CRUD = CRUDOperacion.Create;
      insumo.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const cuenta: Cuenta = await this.storage.get('Cuenta');
      cuenta.Insumos.push(insumo);
      await this.storage.set('Cuenta', cuenta);
    }
    return true;
  }

  async createMaterial(material: Material): Promise<boolean> {
    try{
      const posted = await this.integration.postMaterial(material);
      if (!posted) {
        material.CRUD = CRUDOperacion.Create;
        material.CRUDDate = new Date();
      }
    } catch {
      material.CRUD = CRUDOperacion.Create;
      material.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const cuenta: Cuenta = await this.storage.get('Cuenta');
      cuenta.Materiales.push(material);
      await this.storage.set('Cuenta', cuenta);
    }
    return true;
  }

  async createTercero(tercero: Tercero): Promise<boolean> {
    try{
      const posted = await this.integration.postTercero(tercero);
      if (!posted) {
        tercero.CRUD = CRUDOperacion.Create;
        tercero.CRUDDate = new Date();
      }
    } catch {
      tercero.CRUD = CRUDOperacion.Create;
      tercero.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const cuenta: Cuenta = await this.storage.get('Cuenta');
      cuenta.Terceros.push(tercero);
      await this.storage.set('Cuenta', cuenta);
    }
    return true;
  }


  // #endregion

  async deleteServicio(idServicio: string) {
    const cuenta: Cuenta = await this.storage.get('Cuenta');

    const servicios = cuenta.Servicios.filter(x=> x.IdServicio !== idServicio);
    cuenta.Servicios = servicios;
    await this.storage.set('Cuenta', cuenta);
  }

}
