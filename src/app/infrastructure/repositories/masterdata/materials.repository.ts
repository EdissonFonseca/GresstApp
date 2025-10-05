import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/infrastructure/repositories/api/storage.repository';
import { STORAGE } from '@app/core/constants';
import { Material } from '@app/domain/entities/material.entity';
import { MasterDataApiService } from '@app/infrastructure/repositories/api/masterdataApi.repository';

@Injectable({
  providedIn: 'root',
})
export class MaterialsService {
  private materials = signal<Material[]>([]);
  public materials$ = this.materials.asReadonly();

  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService
  ) {
    this.loadMaterials();
  }

  private async loadMaterials() {
    const materials = await this.storage.get(STORAGE.MATERIALS);
    this.materials.set(materials || []);
  }

  private async saveMaterials() {
    const materials = await this.storage.get(STORAGE.MATERIALS);
    if (materials) {
      await this.storage.set(STORAGE.MATERIALS, materials);
    }
  }

  async get(id: string): Promise<Material | undefined> {
    return this.materials().find(m => m.IdMaterial === id);
  }

  async list(): Promise<Material[]> {
    return this.materials();
  }

  async create(material: Material): Promise<boolean> {
    try {
      const currentMaterials = this.materials();
      currentMaterials.push(material);
      this.materials.set(currentMaterials);
      await this.saveMaterials();
      return true;
    } catch (error) {
      console.error('Error creating material:', error);
      return false;
    }
  }

  async update(material: Material): Promise<void> {
    const currentMaterials = this.materials();
    const index = currentMaterials.findIndex(m => m.IdMaterial === material.IdMaterial);
    if (index !== -1) {
      currentMaterials[index] = material;
      this.materials.set(currentMaterials);
      await this.saveMaterials();
    }
  }

  async delete(id: string): Promise<void> {
    const currentMaterials = this.materials();
    const filteredMaterials = currentMaterials.filter(m => m.IdMaterial !== id);
    this.materials.set(filteredMaterials);
    await this.saveMaterials();
  }
}
