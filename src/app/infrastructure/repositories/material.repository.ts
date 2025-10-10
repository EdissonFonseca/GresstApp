import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { STORAGE } from '@app/core/constants';
import { Material } from '@app/domain/entities/material.entity';
import { MasterDataApiService } from '@app/infrastructure/services/masterdataApi.service';
import { Package } from '@app/domain/entities/package.entity';

@Injectable({
  providedIn: 'root',
})
export class MaterialRepository {
  private materials = signal<Material[]>([]);
  public materials$ = this.materials.asReadonly();

  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService
  ) {
  }

  async get(materialId: string): Promise<Material | undefined> {
    if (!materialId) {
      return undefined;
    }
    const materials = await this.storage.get(STORAGE.MATERIALS) as Material[];
    return materials.find(x => x.Id === materialId);
  }

  async getAll(): Promise<Material[]> {
    const materials = await this.storage.get(STORAGE.MATERIALS) as Material[];
    return materials;
  }
}
