import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Tratamiento } from '../interfaces/tratamiento.interface';
import { MasterData } from '../interfaces/masterdata.interface';

@Injectable({
  providedIn: 'root',
})
export class TratamientosService {
  constructor(
    private storage: StorageService,
  ) {}


  async get(idTratamiento: string): Promise<Tratamiento | undefined> {
    const master: MasterData = await this.storage.get('MasterData');

    if (master && master.Tratamientos) {
      const tratamiento = master.Tratamientos.find((tratamiento) => tratamiento.IdTratamiento === idTratamiento);
      return tratamiento || undefined;
    }

    return undefined;
  }

  async list(): Promise<Tratamiento[]> {
    const master: MasterData = await this.storage.get('MasterData');

    return master.Tratamientos;
  }
}
