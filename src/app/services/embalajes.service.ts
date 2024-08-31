import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { CRUDOperacion } from './constants.service';
import { Embalaje } from '../interfaces/embalaje.interface';
import { MasterData } from '../interfaces/masterdata.interface';
import { MasterDataService } from './masterdata.service';

@Injectable({
  providedIn: 'root',
})
export class EmbalajesService {
  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataService
  ) {}

  async get(idEmbalaje: string): Promise<Embalaje | undefined> {
    const master: MasterData | null = await this.storage.get('MasterData');

    if (master && master.Embalajes) {
      const embalaje = master.Embalajes.find((embalaje) => embalaje.IdEmbalaje === idEmbalaje);
      return embalaje || undefined;
    }

    return undefined;
  }

  async list(): Promise<Embalaje[]> {
    const master: MasterData = await this.storage.get('MasterData');
    const embalajes = master.Embalajes.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
    return embalajes;
  }

  async create(embalaje: Embalaje): Promise<boolean> {
    try{
      const posted = await this.masterdataService.postEmbalaje(embalaje);
      if (!posted) {
        embalaje.CRUD = CRUDOperacion.Create;
        embalaje.CRUDDate = new Date();
      }
    } catch {
      embalaje.CRUD = CRUDOperacion.Create;
      embalaje.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const master: MasterData = await this.storage.get('MasterData');
      master.Embalajes.push(embalaje);
      await this.storage.set('MasterData', master);
    }
    return true;
  }
}
