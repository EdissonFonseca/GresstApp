import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { CRUDOperacion } from './constants.service';
import { Embalaje } from '../interfaces/embalaje.interface';
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
    const embalajes: Embalaje[] = await this.storage.get('Embalajes');

    if (embalajes) {
      const embalaje = embalajes.find((embalaje) => embalaje.IdEmbalaje === idEmbalaje);
      return embalaje || undefined;
    }

    return undefined;
  }

  async list(): Promise<Embalaje[]> {
    const master: Embalaje[] = await this.storage.get('Embalajes');
    const embalajes = master.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
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
      const embalajes: Embalaje[] = await this.storage.get('Embalajes');
      embalajes.push(embalaje);
      await this.storage.set('Embalajes', embalajes);
    }
    return true;
  }
}
