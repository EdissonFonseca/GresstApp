import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Globales } from './globales.service';
import { Servicio } from '../interfaces/servicio.interface';
import { MasterData } from '../interfaces/masterdata.interface';

@Injectable({
  providedIn: 'root',
})
export class ServiciosService {
  constructor(
    private storage: StorageService,
    private globales: Globales,
  ) {}

  async get(idServicio: string): Promise<Servicio | undefined> {
    const master: MasterData = await this.storage.get('MasterData');

    if (master && master.Servicios) {
      const servicio = master.Servicios.find((servicio) => servicio.IdServicio === idServicio);
      return servicio || undefined;
    }

    return undefined;
  }

  async list(): Promise<Servicio[]> {
    const master: MasterData = await this.storage.get('MasterData');

    return master.Servicios;
  }

  async create(idServicio: string) {
    const master: MasterData = await this.storage.get('MasterData');

    const selectedServicio = this.globales.servicios.find(x => x.IdServicio == idServicio);
    if (selectedServicio != null)
    {
      const servicio: Servicio = { IdServicio: idServicio, Nombre: selectedServicio.Nombre, CRUDDate: new Date() };
      const master: MasterData = await this.storage.get('MasterData');
      await this.storage.set('MasterData', master);
    }
  }

  // #endregion

  async delete(idServicio: string) {
    const master: MasterData = await this.storage.get('MasterData');

    const servicios = master.Servicios.filter(x=> x.IdServicio !== idServicio);
    master.Servicios = servicios;
    await this.storage.set('MasterData', master);
  }

}
