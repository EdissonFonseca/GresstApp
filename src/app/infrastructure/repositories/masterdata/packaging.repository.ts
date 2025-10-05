import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/infrastructure/repositories/api/storage.repository';
import { STORAGE } from '@app/core/constants';
import { Embalaje } from '@app/domain/entities/embalaje.entity';
import { MasterDataApiService } from '@app/infrastructure/repositories/api/masterdataApi.repository';
import { LoggerService } from '@app/infrastructure/services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class PackagingService {
  private packages = signal<Embalaje[]>([]);
  public packages$ = this.packages.asReadonly();

  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService,
    private readonly logger: LoggerService
  ) {
    this.loadPackages();
  }

  private async loadPackages() {
    try {
      const embalajes = await this.storage.get(STORAGE.PACKAGES) as Embalaje[];
      this.packages.set(embalajes || []);
    } catch (error) {
      this.logger.error('Error loading packages', error);
      this.packages.set([]);
    }
  }

  private async savePackages() {
    try {
      const currentPackages = this.packages();
      await this.storage.set(STORAGE.PACKAGES, currentPackages);
    } catch (error) {
      this.logger.error('Error saving packages', error);
      throw error;
    }
  }

  async get(idEmbalaje: string): Promise<Embalaje | undefined> {
    if (!idEmbalaje) {
      return undefined;
    }
    const idEmbalajeNum = Number(idEmbalaje);
    return this.packages().find(embalaje => Number(embalaje.IdEmbalaje) === idEmbalajeNum);
  }

  async list(): Promise<Embalaje[]> {
    return [...this.packages()].sort((a, b) => a.Nombre.localeCompare(b.Nombre));
  }

  async create(embalaje: Embalaje): Promise<boolean> {
    try {
      if (!embalaje) {
        throw new Error('Embalaje no proporcionado');
      }

      const posted = await this.masterdataService.createPackage(embalaje);
      if (!posted) {
        return false;
      }

      const currentPackages = this.packages();
      currentPackages.push(embalaje);
      this.packages.set(currentPackages);
      await this.savePackages();
      return true;
    } catch (error) {
      this.logger.error('Error creating packaging', { embalaje, error });
      throw error;
    }
  }

  async update(embalaje: Embalaje): Promise<boolean> {
    try {
      if (!embalaje || !embalaje.IdEmbalaje) {
        throw new Error('Embalaje no válido para actualizar');
      }

      const posted = await this.masterdataService.updatePackage(embalaje);
      if (!posted) {
        return false;
      }

      const currentPackages = this.packages();
      const index = currentPackages.findIndex(e => e.IdEmbalaje === embalaje.IdEmbalaje);
      if (index !== -1) {
        currentPackages[index] = embalaje;
        this.packages.set(currentPackages);
        await this.savePackages();
      }
      return true;
    } catch (error) {
      this.logger.error('Error updating packaging', { embalaje, error });
      throw error;
    }
  }
}
