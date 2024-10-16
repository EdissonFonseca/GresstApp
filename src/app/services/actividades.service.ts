import { Injectable } from '@angular/core';
import { Actividad } from '../interfaces/actividad.interface';
import { StorageService } from './storage.service';
import { Globales } from './globales.service';
import { SynchronizationService } from './synchronization.service';
import { CRUDOperacion, Estado } from './constants.service';
import { Transaction } from '../interfaces/transaction.interface';

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
    const transaction: Transaction = await this.storage.get('Transaction');
    let actividades: Actividad[] = [];

    if (!transaction?.Actividades) return actividades;

    actividades = transaction.Actividades;
    actividades.forEach((actividad) => {

      const tareas = transaction.Tareas.filter((tarea) => tarea.IdActividad == actividad.IdActividad);
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
    const transaction: Transaction = await this.storage.get('Transaction');
    let actividades: Actividad[] = [];

    actividades = transaction.Actividades;
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;

    const tareas = transaction.Tareas.filter((tarea) => tarea.IdActividad == idActividad);
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
    const transaction: Transaction = await this.storage.get('Transaction');
    const actividades = transaction.Actividades;
    const actividad: Actividad = actividades.find((item) => item.IdServicio == idServicio && item.IdRecurso == idRecurso)!;
    return actividad;
  }

  // #region Create Methods
  async create(actividad: Actividad) {
    const now = new Date().toISOString();
    const [latitud, longitud] = await this.globales.getCurrentPosition();
    const transaction: Transaction = await this.storage.get('Transaction');

    actividad.CRUD = CRUDOperacion.Create;
    actividad.FechaInicial = now;
    actividad.LatitudInicial = latitud;
    actividad.LatitudInicial = longitud;

    transaction.Actividades.push(actividad);
    await this.storage.set('Transaction', transaction);
    await this.synchronizationService.uploadTransactions();
  }

  async update(actividad: Actividad) {
    const now = new Date().toISOString();;
    const [latitud, longitud] = await this.globales.getCurrentPosition();
    const transaction: Transaction = await this.storage.get('Transaction');

    const actividades = transaction.Actividades;
    const current: Actividad = actividades.find((item) => item.IdActividad == actividad.IdActividad)!;
    if (current)
    {
      current.CRUD = CRUDOperacion.Update;
      current.FechaFinal = now;
      current.IdEstado = actividad.IdEstado;
      current.CantidadCombustibleFinal = actividad.CantidadCombustibleFinal;
      current.KilometrajeFinal = actividad.KilometrajeFinal;
      current.LatitudFinal = latitud;
      current.LongitudFinal = longitud;
      current.ResponsableCargo = actividad.ResponsableCargo;
      current.ResponsableFirma = actividad.ResponsableFirma;
      current.ResponsableIdentificacion = actividad.ResponsableIdentificacion;
      current.ResponsableNombre = actividad.ResponsableNombre;
      current.ResponsableObservaciones = actividad.ResponsableObservaciones;

      const tareas = transaction.Tareas.filter(x => x.IdActividad == actividad.IdActividad && x.IdEstado == Estado.Pendiente && x.CRUD == null);
      tareas.forEach(x => {
        x.IdEstado = Estado.Rechazado,
        x.CRUD = CRUDOperacion.Update
      });

      const transacciones = transaction.Transacciones.filter(x => x.IdActividad == actividad.IdActividad && x.IdEstado == Estado.Pendiente && x.CRUD == null);
      transacciones.forEach(x => {
        x.FechaInicial = now,
        x.IdEstado = Estado.Rechazado,
        x.CRUD = CRUDOperacion.Update
      });

      await this.storage.set("Transaction", transaction);
      await this.synchronizationService.uploadTransactions();
    }
  }

  async updateInicio(actividad: Actividad) {
    const now = new Date().toISOString();
    const [latitud, longitud] = await this.globales.getCurrentPosition();
    const transaction: Transaction = await this.storage.get('Transaction');
    const actividades = transaction.Actividades;
    const current: Actividad = actividades.find((item) => item.IdActividad == actividad.IdActividad)!;
    if (current)
    {
      current.CRUD = CRUDOperacion.Read;
      current.FechaInicial = now;
      current.IdEstado = actividad.IdEstado;
      current.KilometrajeInicial = actividad.KilometrajeInicial;
      current.CantidadCombustibleInicial = actividad.CantidadCombustibleInicial;
      current.LatitudInicial = latitud;
      current.LongitudInicial = longitud;

      await this.storage.set("Transaction", transaction);
      await this.synchronizationService.uploadTransactions();
    }
  }
}
