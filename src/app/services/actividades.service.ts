import { Injectable } from '@angular/core';
import { Actividad } from '../interfaces/actividad.interface';
import { StorageService } from './storage.service';
import { Globales } from './globales.service';
import { SynchronizationService } from './synchronization.service';
import { CRUDOperacion, Estado } from './constants.service';

@Injectable({
  providedIn: 'root',
})
export class ActividadesService {
  constructor(
    private storage: StorageService,
    private globales: Globales,
    private synchronizationService: SynchronizationService,
  ) {}

  async list(): Promise<Actividad[]> {
    const actividades: Actividad[] = await this.storage.get('Actividades');

    if (!actividades || actividades.length == 0) return actividades;

    actividades.forEach((actividad) => {
      const tareas = actividad.Tareas;
      var resumen = this.globales.getResumen(tareas);
      actividad.ItemsAprobados = resumen.aprobados;
      actividad.ItemsPendientes = resumen.pendientes;
      actividad.ItemsRechazados = resumen.rechazados;
      actividad.Cantidades = resumen.resumen;
      actividad.Icono = this.globales.servicios.find((servicio) => actividad.IdServicio == servicio.IdServicio)?.Icono ||'';
      actividad.Accion = this.globales.servicios.find((servicio) => actividad.IdServicio == servicio.IdServicio)?.Nombre || '';
    });

    return actividades;
  }

  async get(idActividad: string): Promise<Actividad> {
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    const tareas = actividad.Tareas;
    var resumen = this.globales.getResumen(tareas);
    actividad.ItemsAprobados = resumen.aprobados;
    actividad.ItemsPendientes = resumen.pendientes;
    actividad.ItemsRechazados = resumen.rechazados;
    actividad.Cantidades = resumen.resumen;
    actividad.Icono = this.globales.servicios.find((servicio) => actividad.IdServicio == servicio.IdServicio)?.Icono ||'';
    actividad.Accion = this.globales.servicios.find((servicio) => actividad.IdServicio == servicio.IdServicio)?.Nombre || '';

    return actividad;
  }

  async getByServicio(idServicio: string, idRecurso: string) : Promise<Actividad | undefined>{
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdServicio == idServicio && item.IdRecurso == idRecurso)!;
    return actividad;
  }

  // #region Create Methods
  async create(actividad: Actividad) {
    const now = new Date();
    const actividades: Actividad[] = await this.storage.get('Actividades');

    actividad.CRUD = CRUDOperacion.Create;
    actividad.CRUDDate = now;
    actividades.push(actividad);
    await this.storage.set('Actividades', actividades);
    await this.synchronizationService.uploadTransactions();
  }

  async update(actividad: Actividad) {
    const now = new Date();
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const current: Actividad = actividades.find((item) => item.IdActividad == actividad.IdActividad)!;
    if (current)
    {
      current.CRUD = CRUDOperacion.Update;
      current.CRUDDate = now;
      current.IdEstado = actividad.IdEstado;
      current.ResponsableCargo = actividad.ResponsableCargo;
      current.ResponsableFirma = actividad.ResponsableFirma;
      current.ResponsableIdentificacion = actividad.ResponsableIdentificacion;
      current.ResponsableNombre = actividad.ResponsableNombre;
      current.Observaciones = actividad.Observaciones;

      const tareas = current.Tareas.filter(x => x.IdEstado == Estado.Pendiente && x.CRUD == null);
      tareas.forEach(x => {
        x.IdEstado = Estado.Rechazado,
        x.CRUD = CRUDOperacion.Update,
        x.CRUDDate = now
      });

      const transacciones = current.Transacciones.filter(x => x.IdEstado == Estado.Pendiente && x.CRUD == null);
      transacciones.forEach(x => {
        x.IdEstado = Estado.Rechazado,
        x.CRUD = CRUDOperacion.Update,
        x.CRUDDate = now
      });

      await this.storage.set("Actividades", actividades);
      await this.synchronizationService.uploadTransactions();
    }
  }
}
