import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Actividad } from '../interfaces/actividad.interface';
import { Punto } from '../interfaces/punto.interface';
import { MasterData } from '../interfaces/masterdata.interface';
import { Estado } from './constants.service';

@Injectable({
  providedIn: 'root',
})
export class PuntosService {
  constructor(
    private storage: StorageService,
  ) {}

  async get(idPunto: string): Promise<Punto | undefined> {
    const master: MasterData = await this.storage.get('MasterData');

    if (master && master.Puntos) {
      const punto = master.Puntos.find((punto) => punto.IdPunto === idPunto);
      return punto || undefined;
    }

    return undefined;
  }

  async list(): Promise<Punto[]> {
    const master: MasterData = await this.storage.get('MasterData');

    return master.Puntos;
  }

  async getPuntosFromTareas(idActividad: string){
    let puntos: Punto[] = [];
    const master: MasterData = await this.storage.get('MasterData');
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad.Tareas)
    {
      const tareasPuntos = actividad.Tareas.filter((x) => x.IdPunto != null);
      const idsPuntos: string[] = tareasPuntos.map((tarea) => tarea.IdPunto ?? '');
      puntos = master.Puntos.filter((punto) => idsPuntos.includes(punto.IdPunto));
    }
    return puntos;
  }

  async getPuntosFromTareasPendientes(idActividad: string){
    let puntos: Punto[] = [];
    const master: MasterData = await this.storage.get('MasterData');
    const actividades: Actividad[] = await this.storage.get('Actividades');
    const actividad: Actividad = actividades.find((item) => item.IdActividad == idActividad)!;
    if (actividad.Tareas)
    {
      const tareasPuntos = actividad.Tareas.filter((x) => x.IdPunto != null && x.IdEstado == Estado.Pendiente);
      const idsPuntos: string[] = tareasPuntos.map((tarea) => tarea.IdPunto ?? '');
      puntos = master.Puntos.filter((punto) => idsPuntos.includes(punto.IdPunto));
    }
    return puntos;
  }

}
