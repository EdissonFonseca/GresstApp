import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { Tercero } from '@app/interfaces/tercero.interface';
import { CRUDOperacion } from '@app/constants/constants';
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
    const terceros: Tercero[] = await this.storage.get('Terceros');

    if (terceros) {
      const tercero = terceros.find((tercero) => tercero.IdPersona === idTercero);
      return tercero || undefined;
    }

    return undefined;
  }

  async list(): Promise<Tercero[]> {
    const terceros: Tercero[] = await this.storage.get('Terceros');

    return terceros;
  }

  async getTercerosConPuntos(): Promise<Tercero[]> {
    const terceros: Tercero[] = await this.storage.get('Terceros');
    const puntos: Punto[] = await this.storage.get('Puntos');

    const idTerceros: string[] = puntos.map(x => x.IdPersona ?? '');

    return terceros.filter(tercero => idTerceros.includes(tercero.IdPersona));
  }

  async create(tercero: Tercero): Promise<boolean> {
    try{
      const posted = await this.masterdataService.createThirdParty(tercero);
      if (!posted) {
        tercero.CRUD = CRUDOperacion.Create;
        tercero.CRUDDate = new Date();
      }
    } catch {
      tercero.CRUD = CRUDOperacion.Create;
      tercero.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const terceros: Tercero[] = await this.storage.get('Terceros');
      terceros.push(tercero);
      await this.storage.set('Terceros', terceros);
    }
    return true;
  }
}
