import { Injectable } from '@angular/core';
import { Actividad } from '../interfaces/actividad.interface';
import { StorageService } from './storage.service';
import { GlobalesService } from './globales.service';
import { CRUDOperacion, Estado } from './constants.service';
import { Transaction } from '../interfaces/transaction.interface';
import { TareasService } from './tareas.service';

@Injectable({
  providedIn: 'root',
})
export class ActividadesService {
  constructor(
    private storage: StorageService,
    private globales: GlobalesService,
    private tareasService: TareasService,
  ) {}

  async getSummary(idActividad: string): Promise<{ aprobados: number; pendientes: number; rechazados: number; cantidad: number; peso:number; volumen:number; }> {
    const tareas = await this.tareasService.list(idActividad);

    const resultado = tareas.reduce(
      (acumulador, tarea) => {
        if (tarea.IdEstado === Estado.Aprobado) {
          acumulador.aprobados += 1;
          acumulador.cantidad += tarea.Cantidad ?? 0;
          acumulador.peso += tarea.Peso ?? 0;
          acumulador.volumen += tarea.Volumen ?? 0;
        } else if (tarea.IdEstado === Estado.Pendiente) {
          acumulador.pendientes += 1;
        } else if (tarea.IdEstado === Estado.Rechazado) {
          acumulador.rechazados += 1;
        }
        return acumulador;
      },
      { aprobados: 0, pendientes: 0, rechazados: 0, cantidad: 0, peso: 0, volumen: 0 }
    );

    return resultado;
  }

  async list(): Promise<Actividad[]> {
    const transaction: Transaction = await this.storage.get('Transaction');
    let actividades: Actividad[] = [];

    if (!transaction?.Actividades) return actividades;

    actividades = transaction.Actividades;
    actividades.forEach((actividad) => {
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
  }

  async update(actividad: Actividad) {
    const now = new Date().toISOString();
    const transaction: Transaction = await this.storage.get('Transaction');

    const current: Actividad = transaction.Actividades.find((item) => item.IdActividad == actividad.IdActividad)!;
    if (current)
    {
      current.CRUD = CRUDOperacion.Update;
      current.FechaFinal = now;
      current.IdEstado = actividad.IdEstado;
      current.CantidadCombustibleFinal = actividad.CantidadCombustibleFinal;
      current.KilometrajeFinal = actividad.KilometrajeFinal;
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
    }
  }

  async updateInicio(actividad: Actividad) {
    const now = new Date().toISOString();
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

      await this.storage.set("Transaction", transaction);
    }
  }
}
