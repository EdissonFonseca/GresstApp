import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Tratamiento } from '../interfaces/tratamiento.interface';

@Injectable({
  providedIn: 'root',
})
export class TratamientosService {
  constructor(
    private storage: StorageService,
  ) {}


  async get(idTratamiento: string): Promise<Tratamiento | undefined> {
    const tratamientos: Tratamiento[] = await this.storage.get('Tratamientos');

    if (tratamientos) {
      const tratamiento = tratamientos.find((tratamiento) => tratamiento.IdTratamiento === idTratamiento);
      return tratamiento || undefined;
    }

    return undefined;
  }

  async list(): Promise<Tratamiento[]> {
    const tratamientos: Tratamiento[] = await this.storage.get('Tratamientos');

    return tratamientos;
  }
}
