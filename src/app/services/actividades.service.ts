import { Injectable } from '@angular/core';
import { Actividad } from '../interfaces/actividad.interface';
import { StorageService } from './storage.service';
import { IntegrationService } from './integration.service';
import { CRUDOperacion, EntradaSalida, Estado } from './constants.service';
import { Cuenta } from '../interfaces/cuenta.interface';
import { Globales } from './globales.service';
import { TransaccionesService } from './transacciones.service';

@Injectable({
  providedIn: 'root',
})
export class ActividadesService {
  constructor(
    private storage: StorageService,
    private globales: Globales,
    private transaccionesService: TransaccionesService,
    private integration: IntegrationService,
  ) {}

  async list(): Promise<Actividad[]> {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const cuenta: Cuenta = await this.storage.get('Cuenta');
    let cantidad: number;
    let peso: number;
    let volumen: number;
    let aprobados: number;
    let pendientes: number;
    let rechazados: number;
    let resumen: string;

    actividades.forEach((actividad) => {
      const tareas = actividad.Tareas;

      aprobados = pendientes = rechazados = peso = 0;
      resumen = '';
      aprobados = tareas.reduce((contador, tarea) => {
        if (tarea.IdEstado == Estado.Aprobado)
          return contador + 1;
        else
          return contador;
      }, 0);
      pendientes = tareas.reduce((contador, tarea) => {
        if (tarea.IdEstado == Estado.Pendiente)
          return contador + 1;
        else
          return contador;
      }, 0);
      rechazados = tareas.reduce((contador, tarea) => {
        if (tarea.IdEstado == Estado.Rechazado)
          return contador + 1;
        else
          return contador;
      }, 0);
      cantidad = tareas.reduce((cantidad, tarea) => {
        if (tarea.IdEstado == Estado.Aprobado){
          if (tarea.EntradaSalida == EntradaSalida.Entrada)
            return cantidad + (tarea.Cantidad ?? 0);
          else
            return cantidad - (tarea.Cantidad ?? 0);
        }
        else {
          return cantidad;
        }
      }, 0);
      peso = tareas.reduce((peso, tarea) => {
        if (tarea.IdEstado == Estado.Aprobado){
          if (tarea.EntradaSalida == EntradaSalida.Entrada)
            return peso + (tarea.Peso ?? 0);
          else
            return peso - (tarea.Peso ?? 0);
        } else {
          return peso;
        }
      }, 0);
      volumen = tareas.reduce((volumen, tarea) => {
        if (tarea.IdEstado == Estado.Aprobado){
          if (tarea.EntradaSalida == EntradaSalida.Entrada)
            return volumen + (tarea.Volumen ?? 0);
          else
          return volumen - (tarea.Volumen ?? 0);
        } else {
          return volumen;
        }
      }, 0);
      if (cantidad > 0){
        resumen += `${cantidad} ${cuenta.UnidadCantidad}`;
      }
      if (peso > 0){
        if (resumen != '')
          resumen += `/${peso} ${cuenta.UnidadPeso}`;
        else
          resumen = `${peso} ${cuenta.UnidadPeso}`;
      }
      if (volumen > 0){
        if (resumen != '')
          resumen += `/${volumen} ${cuenta.UnidadVolumen}`;
        else
          resumen = `${volumen} ${cuenta.UnidadVolumen}`;
      }

      actividad.ItemsAprobados = aprobados;
      actividad.ItemsPendientes = pendientes;
      actividad.ItemsRechazados = rechazados;
      actividad.Cantidades = resumen;
      actividad.Icono = this.globales.servicios.find((servicio) => actividad.IdServicio == servicio.IdServicio)?.Icono ||'';
      actividad.Accion = this.globales.servicios.find((servicio) => actividad.IdServicio == servicio.IdServicio)?.Nombre || '';
    });

    return actividades;
  }

  async get(idActividad: string): Promise<Actividad> {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    return actividad;
  }

  async getByServicio(idServicio: string, idRecurso: string) : Promise<Actividad | undefined>{
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdServicio == idServicio && item.IdRecurso == idRecurso)!;
    return actividad;
  }

  // #region Create Methods
  async create(actividad: Actividad) {
    const actividades: Actividad[] = await this.storage.get('Actividades');

    actividades.push(actividad);
    await this.storage.set('Actividades', actividades);
  }

  async update(actividad: Actividad) {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const current: Actividad = actividades.find((item) => item.IdActividad == actividad.IdActividad)!;
    if (current)
    {
      current.IdEstado = actividad.IdEstado;
      current.IdentificacionResponsable = actividad.IdentificacionResponsable;
      current.NombreResponsable = actividad.NombreResponsable;
      current.Observaciones = actividad.Observaciones;
      current.Firma = actividad.Firma;

      const transaccionesSincronizar = actividad.Transacciones.filter(x => x.CRUD != null);
      transaccionesSincronizar.forEach(async(transaccion) => {
        await this.transaccionesService.update(actividad.IdActividad, transaccion);
        transaccion.CRUD =  null;;
        transaccion.CRUDDate = null;
      });

      if (await this.integration.updateActividad(current) && current.Firma != null) {
        current.CRUD = null;
        current.CRUDDate = null;
        this.integration.uploadFirmaActividad(current);
      }
  }
    await this.storage.set("Actividades", actividades);
  }
}
