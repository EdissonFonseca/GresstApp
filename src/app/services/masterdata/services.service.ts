import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { Servicio } from '@app/interfaces/servicio.interface';
import { SERVICES, STORAGE } from '@app/constants/constants';

@Injectable({
  providedIn: 'root',
})
export class ServicesService {
  private services = signal<Servicio[]>([]);
  public services$ = this.services.asReadonly();

  constructor(
    private storage: StorageService,
  ) {
    this.loadServices();
  }

  private async loadServices() {
    const servicios = await this.storage.get(STORAGE.SERVICES) as Servicio[];
    this.services.set(servicios || []);
  }

  private async saveServices() {
    const currentServices = this.services();
    await this.storage.set(STORAGE.SERVICES, currentServices);
  }

  async get(idServicio: string): Promise<Servicio | undefined> {
    return this.services().find(servicio => servicio.IdServicio === idServicio);
  }

  async list(): Promise<Servicio[]> {
    return this.services();
  }

  async create(idServicio: string) {
    const selectedServicio = SERVICES.find(x => x.serviceId === idServicio);
    if (selectedServicio) {
      const servicio: Servicio = {
        IdServicio: idServicio,
        Nombre: selectedServicio.Name
      };

      const currentServices = this.services();
      currentServices.push(servicio);
      this.services.set(currentServices);
      await this.saveServices();
    }
  }

  async delete(idServicio: string) {
    const currentServices = this.services();
    const filteredServices = currentServices.filter(x => x.IdServicio !== idServicio);
    this.services.set(filteredServices);
    await this.saveServices();
  }
}
