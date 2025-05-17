import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { CRUD_OPERATIONS } from '@app/constants/constants';
import { Material } from '@app/interfaces/material.interface';
import { MasterDataApiService } from '@app/services/api/masterdataApi.service';

@Injectable({
  providedIn: 'root',
})
export class MaterialsService {
  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService
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
      const posted = await this.masterdataService.createMaterial(material);
      if (!posted) {
        material.CRUD = CRUD_OPERATIONS.CREATE;
        material.CRUDDate = new Date();
      }
    } catch {
      material.CRUD = CRUD_OPERATIONS.CREATE;
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
