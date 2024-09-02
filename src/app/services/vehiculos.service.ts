import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Vehiculo } from '../interfaces/vehiculo.interface';

@Injectable({
  providedIn: 'root',
})
export class VehiculosService {
  constructor(
    private storage: StorageService,
  ) {}

  async list(): Promise<Vehiculo[]> {
    const vehiculos: Vehiculo[] = await this.storage.get('Vehiculos');

    return vehiculos;
  }
}
