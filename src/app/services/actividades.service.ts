import { Injectable } from '@angular/core';
import { Actividad } from '../interfaces/actividad.interface';
import { StorageService } from './storage.service';
import { EntradaSalida, Estado } from './constants.service';
import { Cuenta } from '../interfaces/cuenta.interface';
import { Globales } from './globales.service';
import { TransaccionesService } from './transacciones.service';
import { TransactionsService } from './transactions.service';
import { SynchronizationService } from './synchronization.service';

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
    const cuenta: Cuenta = await this.storage.get('Cuenta');

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
    await this.synchronizationService.uploadTransactions();
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
      await this.storage.set("Actividades", actividades);
      await this.synchronizationService.uploadTransactions();
    }
  }
}
