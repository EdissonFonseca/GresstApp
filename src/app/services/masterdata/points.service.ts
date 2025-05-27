import { Injectable, signal, computed } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { Punto } from '@app/interfaces/punto.interface';
import { Transaction } from '@app/interfaces/transaction.interface';
import { Tarea } from '@app/interfaces/tarea.interface';
import { STORAGE } from '@app/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class PointsService {
  private points = signal<Punto[]>([]);
  private transaction = signal<Transaction | null>(null);

  constructor(
    private storage: StorageService,
  ) {
    this.loadPoints();
  }

  private async loadPoints() {
    const puntos = await this.storage.get(STORAGE.POINTS) as Punto[];
    this.points.set(puntos || []);
  }

  async get(idPunto: string): Promise<Punto | undefined> {
    return this.points().find(punto => punto.IdDeposito === idPunto);
  }

  async list(): Promise<Punto[]> {
    return this.points();
  }

  points$() {
    return this.points();
  }

  getPointsFromTasks$(idActividad: string) {
    return computed(() => {
      const currentTransaction = this.transaction();
      const puntos = this.points();

      if (!currentTransaction) return puntos;

      const tareas = currentTransaction.Tareas.filter(item => item.IdActividad === idActividad);
      if (!tareas.length) return puntos;

      const tareasPuntos = tareas.filter(x => x.IdDeposito != null);
      const idsPuntos = tareasPuntos.map(tarea => tarea.IdDeposito ?? '');

      return puntos.filter(punto => idsPuntos.includes(punto.IdDeposito));
    });
  }

  getPointsFromPendingTasks$(idActividad: string) {
    return computed(() => {
      const currentTransaction = this.transaction();
      const puntos = this.points();

      if (!currentTransaction) return puntos;

      const tareas = currentTransaction.Tareas.filter(item => item.IdActividad === idActividad);
      if (!tareas.length) return puntos;

      const tareasPuntos = tareas.filter(x => x.IdDeposito != null);
      const idsPuntos = tareasPuntos.map(tarea => tarea.IdDeposito ?? '');

      return puntos.filter(punto => idsPuntos.includes(punto.IdDeposito));
    });
  }
}
