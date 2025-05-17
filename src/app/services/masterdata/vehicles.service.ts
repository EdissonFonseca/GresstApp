import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { Vehiculo } from '@app/interfaces/vehiculo.interface';

@Injectable({
  providedIn: 'root',
})
export class VehiclesService {
  constructor(
    private storage: StorageService,
  ) {}

  async list(): Promise<Vehiculo[]> {
    const vehiculos: Vehiculo[] = await this.storage.get('Vehiculos');

    return vehiculos;
  }
}
