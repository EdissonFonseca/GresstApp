import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { Vehicle } from '@app/domain/entities/vehicle.entity';
import { STORAGE } from '@app/core/constants';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { Service } from '@app/domain/entities/service.entity';

@Injectable({
  providedIn: 'root',
})
export class VehicleRepository {
  constructor(
    private storage: StorageService,
    private readonly logger: LoggerService
  ) {
  }

  async get(vehicleId: string): Promise<Vehicle | undefined> {
    if (!vehicleId) {
      return undefined;
    }
    const vehicles = await this.storage.get(STORAGE.VEHICLES) as Vehicle[];
    return vehicles.find(x => x.Id === vehicleId);
  }

  async getAll(): Promise<Vehicle[]> {
    const services = await this.storage.get(STORAGE.SERVICES) as Service[];
    return services;
  }

}
