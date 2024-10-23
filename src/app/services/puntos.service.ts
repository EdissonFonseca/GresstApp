import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Punto } from '../interfaces/punto.interface';
import { Estado } from './constants.service';
import { Transaction } from '../interfaces/transaction.interface';
import { Tarea } from '../interfaces/tarea.interface';

@Injectable({
  providedIn: 'root',
})
export class PuntosService {
  constructor(
    private storage: StorageService,
  ) {}

  async get(idPunto: string): Promise<Punto | undefined> {
    const puntos: Punto[] = await this.storage.get('Puntos');

    if (puntos) {
      const punto = puntos.find((punto) => punto.IdDeposito === idPunto);
      return punto || undefined;
    }

    return undefined;
  }

  async list(): Promise<Punto[]> {
    const puntos: Punto[] = await this.storage.get('Puntos');

    return puntos;
  }

  async getPuntosFromTareas(idActividad: string){
    let puntos: Punto[] = await this.storage.get('Puntos');
    const transaction: Transaction = await this.storage.get('Transaction');
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
    let puntos: Punto[] = await this.storage.get('Puntos');
    const transaction: Transaction = await this.storage.get('Transaction');
    const tareas: Tarea[] = transaction.Tareas.filter((item) => item.IdActividad == idActividad)!;

    if (transaction && tareas)
    {
      const tareasPuntos = tareas.filter((x) => x.IdDeposito != null && x.IdEstado == Estado.Pendiente);
      const idsPuntos: string[] = tareasPuntos.map((tarea) => tarea.IdDeposito ?? '');
      puntos = puntos.filter((punto) => idsPuntos.includes(punto.IdDeposito));
    }
    return puntos;
  }

}
