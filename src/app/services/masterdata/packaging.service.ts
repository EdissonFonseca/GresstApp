import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { CRUDOperacion } from '@app/constants/constants';
import { Embalaje } from '@app/interfaces/embalaje.interface';
import { MasterDataApiService } from '@app/services/api/masterdataApi.service';

@Injectable({
  providedIn: 'root',
})
export class PackagingService {
  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService
  ) {}

  async get(idEmbalaje: string): Promise<Embalaje | undefined> {
    const embalajes: Embalaje[] = await this.storage.get('Embalajes');
    if (embalajes) {
      const embalaje = embalajes.find((embalaje) => embalaje.IdEmbalaje == idEmbalaje);
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
      embalaje.CRUD = CRUDOperacion.Create;
      embalaje.CRUDDate = new Date();
      const posted = await this.masterdataService.createPackaging(embalaje);
      if (posted) {
        embalaje.CRUD = null;
        embalaje.CRUDDate = null;
      }
    } catch {
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
