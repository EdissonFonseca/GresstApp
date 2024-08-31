import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { CRUDOperacion, Estado } from './constants.service';
import { Material } from '../interfaces/material.interface';
import { MasterData } from '../interfaces/masterdata.interface';
import { MasterDataService } from './masterdata.service';

@Injectable({
  providedIn: 'root',
})
export class MaterialesService {
  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataService
  ) {}

  async get(idMaterial: string): Promise<Material | undefined> {
    const master: MasterData = await this.storage.get('MasterData');

    if (master && master.Materiales) {
      const material = master.Materiales.find((material) => material.IdMaterial === idMaterial);
      return material || undefined;
    }

    return undefined;
  }

  async list(): Promise<Material[]> {
    const master: MasterData = await this.storage.get('MasterData');

    return master.Materiales;
  }

  async create(material: Material): Promise<boolean> {
    try{
      const posted = await this.masterdataService.postMaterial(material);
      if (!posted) {
        material.CRUD = CRUDOperacion.Create;
        material.CRUDDate = new Date();
      }
    } catch {
      material.CRUD = CRUDOperacion.Create;
      material.CRUDDate = new Date();
    }
    finally
    {
      //Add to array
      const master: MasterData = await this.storage.get('MasterData');
      master.Materiales.push(material);
      await this.storage.set('MasterData', master);
    }
    return true;
  }
}
