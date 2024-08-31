import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Globales } from './globales.service';
import { Vehiculo } from '../interfaces/vehiculo.interface';
import { MasterData } from '../interfaces/masterdata.interface';

@Injectable({
  providedIn: 'root',
})
export class VehiculosService {
  constructor(
    private storage: StorageService,
  ) {}

  async list(): Promise<Vehiculo[]> {
    const master: MasterData = await this.storage.get('MasterData');

    return master.Vehiculos;
  }
}
