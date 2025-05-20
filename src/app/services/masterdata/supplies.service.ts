import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { CRUD_OPERATIONS, STORAGE } from '@app/constants/constants';
import { Insumo } from '@app/interfaces/insumo.interface';
import { MasterDataApiService } from '@app/services/api/masterdataApi.service';

@Injectable({
  providedIn: 'root',
})
export class SuppliesService  {
  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService
  ) {}

  async list(): Promise<Insumo[]> {
    const insumos: Insumo[] = await this.storage.get(STORAGE.SUPPLIES);

    return insumos;
  }

  async create(insumo: Insumo): Promise<boolean> {
    try{
      const posted = await this.masterdataService.createSupply(insumo);
      if (!posted) {
      }
    } catch {
    }
    finally
    {
      //Add to array
      const insumos: Insumo[] = await this.storage.get(STORAGE.SUPPLIES);
      insumos.push(insumo);
      await this.storage.set(STORAGE.SUPPLIES, insumo);
    }
    return true;
  }
}
