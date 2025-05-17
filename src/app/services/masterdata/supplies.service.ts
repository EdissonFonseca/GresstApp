import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { CRUD_OPERATIONS } from '@app/constants/constants';
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
    const insumos: Insumo[] = await this.storage.get('Insumos');

    return insumos;
  }

  async create(insumo: Insumo): Promise<boolean> {
    try{
      const posted = await this.masterdataService.createSupply(insumo);
      if (!posted) {
        insumo.CRUD = CRUD_OPERATIONS.CREATE;
        insumo.CRUDDate = new Date();
      }
    } catch {
      insumo.CRUD = CRUD_OPERATIONS.CREATE;
      insumo.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const insumos: Insumo[] = await this.storage.get('Insumos');
      insumos.push(insumo);
      await this.storage.set('Insumos', insumo);
    }
    return true;
  }
}
