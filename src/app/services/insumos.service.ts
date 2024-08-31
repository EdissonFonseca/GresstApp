import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { CRUDOperacion, Estado } from './constants.service';
import { Insumo } from '../interfaces/insumo.interface';
import { MasterDataService } from './masterdata.service';
import { MasterData } from '../interfaces/masterdata.interface';

@Injectable({
  providedIn: 'root',
})
export class InsumosService {
  constructor(
    private storage: StorageService,
    private masterdataService:MasterDataService
  ) {}

  async list(): Promise<Insumo[]> {
    const master: MasterData = await this.storage.get('MasterData');

    return master.Insumos;
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
      const master: MasterData = await this.storage.get('MasterData');
      master.Insumos.push(insumo);
      await this.storage.set('MasterData', master);
    }
    return true;
  }
}
