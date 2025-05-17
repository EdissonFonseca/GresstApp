import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { Servicio } from '@app/interfaces/servicio.interface';
import { SERVICIOS } from '@app/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  constructor(
    private storage: StorageService,
  ) {}

  async get(idServicio: string): Promise<Servicio | undefined> {
    const servicios: Servicio[] = await this.storage.get('Servicios');

    if (servicios) {
      const servicio = servicios.find((servicio) => servicio.IdServicio === idServicio);
      return servicio || undefined;
    }

    return undefined;
  }

  async list(): Promise<Servicio[]> {
    const servicios: Servicio[] = await this.storage.get('Servicios');

    return servicios;
  }

  async create(idServicio: string) {
    const servicios: Servicio[] = await this.storage.get('Servicios');

    const selectedServicio = SERVICIOS.find(x => x.IdServicio == idServicio);
    if (selectedServicio != null)
    {
      const servicio: Servicio = { IdServicio: idServicio, Nombre: selectedServicio.Nombre, CRUDDate: new Date() };
      servicios.push(servicio);
      await this.storage.set('Servicios', servicios);
    }
  }

  // #endregion

  async delete(idServicio: string) {
    let servicios: Servicio[] = await this.storage.get('Servicios');

    servicios = servicios.filter(x=> x.IdServicio !== idServicio);
    await this.storage.set('Servicios', servicios);
  }

}
