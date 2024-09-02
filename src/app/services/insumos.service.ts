import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { CRUDOperacion, Estado } from './constants.service';
import { Insumo } from '../interfaces/insumo.interface';
import { MasterDataService } from './masterdata.service';

@Injectable({
  providedIn: 'root',
})
export class InsumosService {
  constructor(
    private storage: StorageService,
    private masterdataService:MasterDataService
  ) {}

  async list(): Promise<Insumo[]> {
    const insumos: Insumo[] = await this.storage.get('Insumos');

    return insumos;
  }

  async create(insumo: Insumo): Promise<boolean> {
    try{
      const posted = await this.masterdataService.postInsumo(insumo);
      if (!posted) {
        insumo.CRUD = CRUDOperacion.Create;
        insumo.CRUDDate = new Date();
      }
    } catch {
      insumo.CRUD = CRUDOperacion.Create;
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
