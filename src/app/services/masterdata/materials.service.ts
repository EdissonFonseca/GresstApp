import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { CRUD_OPERATIONS, STORAGE } from '@app/constants/constants';
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
    const materiales: Material[] = await this.storage.get(STORAGE.MATERIALS);

    if (materiales) {
      const material = materiales.find((material) => material.IdMaterial === idMaterial);
      return material || undefined;
    }

    return undefined;
  }

  async list(): Promise<Material[]> {
    const materiales: Material[] = await this.storage.get(STORAGE.MATERIALS);

    return materiales;
  }

  async create(material: Material): Promise<boolean> {
    try{
      const posted = await this.masterdataService.createMaterial(material);
      if (!posted) {
      }
    } catch {
    }
    finally
    {
      //Add to array
      const materiales: Material[] = await this.storage.get(STORAGE.MATERIALS);
      materiales.push(material);
      await this.storage.set(STORAGE.MATERIALS, materiales);
    }
    return true;
  }
}
