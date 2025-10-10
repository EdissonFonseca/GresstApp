import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { Service } from '@app/domain/entities/service.entity';
import { STORAGE } from '@app/core/constants';

@Injectable({
  providedIn: 'root',
})
export class ServiceRepository {
  private services = signal<Service[]>([]);
  public services$ = this.services.asReadonly();

  constructor(
    private storage: StorageService,
  ) {
  }

  async get(serviceId: string): Promise<Service | undefined> {
    if (!serviceId) {
      return undefined;
    }
    const services = await this.storage.get(STORAGE.SERVICES) as Service[];
    return services.find(x => x.Id === serviceId);
  }

  async getAll(): Promise<Service[]> {
    const services = await this.storage.get(STORAGE.SERVICES) as Service[];
    return services;
  }

}
