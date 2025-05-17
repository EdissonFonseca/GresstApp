import { Injectable } from '@angular/core';
import { Actividad } from '@app/interfaces/actividad.interface';
import { StorageService } from '@app/services/core/storage.service';
import { CRUD_OPERATIONS, STATUS, SERVICES } from '@app/constants/constants';
import { Transaction } from '@app/interfaces/transaction.interface';
import { TasksService } from '@app/services/transactions/tasks.service';
import { Utils } from '@app/utils/utils';

@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {
  constructor(
    private storage: StorageService,
    private tasksService: TasksService,
  ) {}

  async getSummary(idActividad: string): Promise<{ aprobados: number; pendientes: number; rechazados: number; cantidad: number; peso:number; volumen:number; }> {
    const tareas = await this.tasksService.list(idActividad);

    const resultado = tareas.reduce(
      (acumulador, tarea) => {
        if (tarea.IdEstado === STATUS.APPROVED) {
          acumulador.aprobados += 1;
          acumulador.cantidad += tarea.Cantidad ?? 0;
          acumulador.peso += tarea.Peso ?? 0;
          acumulador.volumen += tarea.Volumen ?? 0;
        } else if (tarea.IdEstado === STATUS.PENDING) {
          acumulador.pendientes += 1;
        } else if (tarea.IdEstado === STATUS.REJECTED) {
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
      const servicio = SERVICES.find(s => s.serviceId === actividad.IdServicio);

      actividad.Icono = servicio?.Icon || '';
      actividad.Accion = servicio?.Action || '';    });

    return actividades;
  }

  async get(idActividad: string): Promise<Actividad> {
    const transaction: Transaction = await this.storage.get('Transaction');
    let actividades: Actividad[] = [];

    actividades = transaction.Actividades;
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;

    const servicio = SERVICES.find(s => s.serviceId === actividad.IdServicio);

    actividad.Icono = servicio?.Icon || '';
    actividad.Accion = servicio?.Action || '';

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
    const [latitud, longitud] = await Utils.getCurrentPosition();
    const transaction: Transaction = await this.storage.get('Transaction');

    actividad.CRUD = CRUD_OPERATIONS.CREATE;
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
      current.CRUD = CRUD_OPERATIONS.UPDATE;
      current.FechaFinal = now;
      current.IdEstado = actividad.IdEstado;
      current.CantidadCombustibleFinal = actividad.CantidadCombustibleFinal;
      current.KilometrajeFinal = actividad.KilometrajeFinal;
      current.ResponsableCargo = actividad.ResponsableCargo;
      current.ResponsableFirma = actividad.ResponsableFirma;
      current.ResponsableIdentificacion = actividad.ResponsableIdentificacion;
      current.ResponsableNombre = actividad.ResponsableNombre;
      current.ResponsableObservaciones = actividad.ResponsableObservaciones;

      const tareas = transaction.Tareas.filter(x => x.IdActividad == actividad.IdActividad && x.IdEstado == STATUS.PENDING && x.CRUD == null);
      tareas.forEach(x => {
        x.IdEstado = STATUS.REJECTED,
        x.CRUD = CRUD_OPERATIONS.UPDATE
      });

      const transacciones = transaction.Transacciones.filter(x => x.IdActividad == actividad.IdActividad && x.IdEstado == STATUS.PENDING && x.CRUD == null);
      transacciones.forEach(x => {
        x.FechaInicial = now,
        x.IdEstado = STATUS.REJECTED,
        x.CRUD = CRUD_OPERATIONS.UPDATE
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
      current.CRUD = CRUD_OPERATIONS.READ;
      current.FechaInicial = now;
      current.IdEstado = actividad.IdEstado;
      current.KilometrajeInicial = actividad.KilometrajeInicial;
      current.CantidadCombustibleInicial = actividad.CantidadCombustibleInicial;

      await this.storage.set("Transaction", transaction);
    }
  }
}
