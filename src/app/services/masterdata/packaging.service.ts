import { Injectable } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { CRUD_OPERATIONS, STORAGE } from '@app/constants/constants';
import { Embalaje } from '@app/interfaces/embalaje.interface';
import { MasterDataApiService } from '@app/services/api/masterdataApi.service';
import { LoggerService } from '@app/services/core/logger.service';

@Injectable({
  providedIn: 'root',
})
export class PackagingService {
  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService,
    private readonly logger: LoggerService
  ) {}

  async get(idEmbalaje: string): Promise<Embalaje | undefined> {
    try {
      if (!idEmbalaje) {
        throw new Error('ID de embalaje no proporcionado');
      }

      const embalajes: Embalaje[] = await this.storage.get(STORAGE.PACKAGES);
      if (!embalajes) {
        return undefined;
      }

      const embalaje = embalajes.find((embalaje) => embalaje.IdEmbalaje === idEmbalaje);
      return embalaje || undefined;
    } catch (error) {
      this.logger.error('Error getting packaging', { idEmbalaje, error });
      throw error;
    }
  }

  async list(): Promise<Embalaje[]> {
    try {
      const master: Embalaje[] = await this.storage.get(STORAGE.PACKAGES);
      if (!master) {
        return [];
      }
      return master.sort((a, b) => a.Nombre.localeCompare(b.Nombre));
    } catch (error) {
      this.logger.error('Error listing packaging', error);
      throw error;
    }
  }

  async create(embalaje: Embalaje): Promise<boolean> {
    try {
      if (!embalaje) {
        throw new Error('Embalaje no proporcionado');
      }

      const posted = await this.masterdataService.createPackage(embalaje);
      if (!posted) {
      }

      const embalajes: Embalaje[] = await this.storage.get(STORAGE.PACKAGES) || [];
      embalajes.push(embalaje);
      await this.storage.set(STORAGE.PACKAGES, embalajes);
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
      }

      const embalajes: Embalaje[] = await this.storage.get(STORAGE.PACKAGES) || [];
      const index = embalajes.findIndex(e => e.IdEmbalaje === embalaje.IdEmbalaje);
      if (index !== -1) {
        embalajes[index] = embalaje;
        await this.storage.set(STORAGE.PACKAGES, embalajes);
      }
      return true;
    } catch (error) {
      this.logger.error('Error updating packaging', { embalaje, error });
      throw error;
    }
  }
}
