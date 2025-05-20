import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { Tercero } from '@app/interfaces/tercero.interface';
import { CRUD_OPERATIONS, STORAGE } from '@app/constants/constants';
import { MasterDataApiService } from '@app/services/api/masterdataApi.service';
import { Punto } from '@app/interfaces/punto.interface';

@Injectable({
  providedIn: 'root',
})
export class ThirdpartiesService {
  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService
  ) {}

  async get(idTercero: string): Promise<Tercero | undefined> {
    const terceros: Tercero[] = await this.storage.get(STORAGE.THIRD_PARTIES);

    if (terceros) {
      const tercero = terceros.find((tercero) => tercero.IdPersona === idTercero);
      return tercero || undefined;
    }

    return undefined;
  }

  async list(): Promise<Tercero[]> {
    const terceros: Tercero[] = await this.storage.get(STORAGE.THIRD_PARTIES);

    return terceros;
  }

  async getTercerosConPuntos(): Promise<Tercero[]> {
    const terceros: Tercero[] = await this.storage.get(STORAGE.THIRD_PARTIES);
    const puntos: Punto[] = await this.storage.get(STORAGE.POINTS);

    const idTerceros: string[] = puntos.map(x => x.IdPersona ?? '');

    return terceros.filter(tercero => idTerceros.includes(tercero.IdPersona));
  }

  async create(tercero: Tercero): Promise<boolean> {
    try{
      const posted = await this.masterdataService.createThirdParty(tercero);
      if (!posted) {
      }
    } catch {
    }
    finally
    {
      //Add to array
      const terceros: Tercero[] = await this.storage.get(STORAGE.THIRD_PARTIES);
      terceros.push(tercero);
      await this.storage.set(STORAGE.THIRD_PARTIES, terceros);
    }
    return true;
  }
}
