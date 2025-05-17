import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { Punto } from '@app/interfaces/punto.interface';
import { Transaction } from '@app/interfaces/transaction.interface';
import { Tarea } from '@app/interfaces/tarea.interface';
import { STORAGE } from '@app/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  constructor(
    private storage: StorageService,
  ) {}

  async get(idPunto: string): Promise<Punto | undefined> {
    const puntos: Punto[] = await this.storage.get(STORAGE.POINTS);

    if (puntos) {
      const punto = puntos.find((punto) => punto.IdDeposito === idPunto);
      return punto || undefined;
    }

    return undefined;
  }

  async list(): Promise<Punto[]> {
    const puntos: Punto[] = await this.storage.get(STORAGE.POINTS);

    return puntos;
  }

  async getPuntosFromTareas(idActividad: string){
    let puntos: Punto[] = await this.storage.get(STORAGE.POINTS);
    const transaction: Transaction = await this.storage.get(STORAGE.TRANSACTION);
    const tareas: Tarea[] = transaction.Tareas.filter((item) => item.IdActividad == idActividad)!;

    if (transaction && tareas)
    {
      const tareasPuntos = tareas.filter((x) => x.IdDeposito != null);
      const idsPuntos: string[] = tareasPuntos.map((tarea) => tarea.IdDeposito ?? '');
      puntos = puntos.filter((punto) => idsPuntos.includes(punto.IdDeposito));
    }
    return puntos;
  }

  async getPuntosFromTareasPendientes(idActividad: string){
    console.log('🔍 Obteniendo puntos de tareas para actividad:', idActividad);

    let puntos: Punto[] = await this.storage.get(STORAGE.POINTS);
    console.log('📦 Puntos en storage:', puntos);

    const transaction: Transaction = await this.storage.get(STORAGE.TRANSACTION);
    console.log('📄 Transaction:', transaction);

    const tareas: Tarea[] = transaction.Tareas.filter((item) => item.IdActividad == idActividad)!;
    console.log('📋 Tareas filtradas:', tareas);
    console.log('📋 Estado de las tareas:', tareas.map(t => ({ IdTarea: t.IdTarea, IdEstado: t.IdEstado, IdDeposito: t.IdDeposito })));

    if (transaction && tareas)
    {
      // Obtener todos los puntos, no solo los pendientes
      const tareasPuntos = tareas.filter((x) => x.IdDeposito != null);
      console.log('📍 Tareas con puntos:', tareasPuntos);
      console.log('📍 Estado de las tareas con puntos:', tareasPuntos.map(t => ({ IdTarea: t.IdTarea, IdEstado: t.IdEstado, IdDeposito: t.IdDeposito })));

      const idsPuntos: string[] = tareasPuntos.map((tarea) => tarea.IdDeposito ?? '');
      console.log('🔑 IDs de puntos:', idsPuntos);

      puntos = puntos.filter((punto) => idsPuntos.includes(punto.IdDeposito));
      console.log('🎯 Puntos filtrados:', puntos);
    }
    return puntos;
  }

}
