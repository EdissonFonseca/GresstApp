import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';
import { CRUDOperacion } from './constants.service';
import { Material } from '../interfaces/material.interface';
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
    const materiales: Material[] = await this.storage.get('Materiales');

    if (materiales) {
      const material = materiales.find((material) => material.IdMaterial === idMaterial);
      return material || undefined;
    }

    return undefined;
  }

  async list(): Promise<Material[]> {
    const materiales: Material[] = await this.storage.get('Materiales');

    return materiales;
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
      const materiales: Material[] = await this.storage.get('Materiales');
      materiales.push(material);
      await this.storage.set('Materiales', materiales);
    }
    return true;
  }
}
