import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { Tercero } from '../interfaces/tercero.interface';
import { CRUDOperacion, Estado } from './constants.service';
import { MasterData } from '../interfaces/masterdata.interface';
import { MasterDataService } from './masterdata.service';

@Injectable({
  providedIn: 'root',
})
export class TercerosService {
  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataService
  ) {}

  async get(idTercero: string): Promise<Tercero | undefined> {
    const master: MasterData = await this.storage.get('MasterData');

    if (master && master.Terceros) {
      const tercero = master.Terceros.find((tercero) => tercero.IdTercero === idTercero);
      return tercero || undefined;
    }

    return undefined;
  }

  async list(): Promise<Tercero[]> {
    const master: MasterData = await this.storage.get('MasterData');

    return master.Terceros;
  }

  async getTercerosConPuntos(): Promise<Tercero[]> {
    const master: MasterData = await this.storage.get('MasterData');

    const idTerceros: string[] = master.Puntos.map(x => x.IdTercero ?? '');

    return master.Terceros.filter(x=> idTerceros.includes(x.IdTercero));
  }
  async create(tercero: Tercero): Promise<boolean> {
    try{
      const posted = await this.masterdataService.postTercero(tercero);
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
      const master: MasterData = await this.storage.get('MasterData');
      master.Terceros.push(tercero);
      await this.storage.set('MasterData', master);
    }
    return true;
  }
}
