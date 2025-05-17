import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { CRUD_OPERATIONS, STORAGE } from '@app/constants/constants';
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
    const embalajes: Embalaje[] = await this.storage.get(STORAGE.PACKAGES);
    if (embalajes) {
      const embalaje = embalajes.find((embalaje) => embalaje.IdEmbalaje == idEmbalaje);
      return embalaje || undefined;
    }

    return undefined;
  }

  async list(): Promise<Embalaje[]> {
    const master: Embalaje[] = await this.storage.get(STORAGE.PACKAGES);
    const embalajes = master.sort((a,b) => a.Nombre.localeCompare(b.Nombre));
    return embalajes;
  }

  async create(embalaje: Embalaje): Promise<boolean> {
    try{
      embalaje.CRUD = CRUD_OPERATIONS.CREATE;
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
      const embalajes: Embalaje[] = await this.storage.get(STORAGE.PACKAGES);
      embalajes.push(embalaje);
      await this.storage.set(STORAGE.PACKAGES, embalajes);
    }
    return true;
  }
}
