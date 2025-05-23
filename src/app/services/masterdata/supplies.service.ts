import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { CRUD_OPERATIONS, STORAGE } from '@app/constants/constants';
import { Insumo } from '@app/interfaces/insumo.interface';
import { MasterDataApiService } from '@app/services/api/masterdataApi.service';
import { LoggerService } from '@app/services/core/logger.service';

@Injectable({
  providedIn: 'root',
})
export class SuppliesService {
  private supplies = signal<Insumo[]>([]);
  public supplies$ = this.supplies.asReadonly();

  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService,
    private readonly logger: LoggerService
  ) {
    this.loadSupplies();
  }

  private async loadSupplies() {
    try {
      const insumos = await this.storage.get(STORAGE.SUPPLIES) as Insumo[];
      this.supplies.set(insumos || []);
    } catch (error) {
      this.logger.error('Error loading supplies', error);
      this.supplies.set([]);
    }
  }

  private async saveSupplies() {
    try {
      const currentSupplies = this.supplies();
      await this.storage.set(STORAGE.SUPPLIES, currentSupplies);
    } catch (error) {
      this.logger.error('Error saving supplies', error);
      throw error;
    }
  }

  async get(idInsumo: string): Promise<Insumo | undefined> {
    return this.supplies().find(insumo => insumo.IdInsumo === idInsumo);
  }

  async list(): Promise<Insumo[]> {
    return this.supplies();
  }

  async create(insumo: Insumo): Promise<boolean> {
    try {
      const posted = await this.masterdataService.createSupply(insumo);
      if (!posted) {
        return false;
      }

      const currentSupplies = this.supplies();
      currentSupplies.push(insumo);
      this.supplies.set(currentSupplies);
      await this.saveSupplies();
      return true;
    } catch (error) {
      this.logger.error('Error creating supply', { insumo, error });
      throw error;
    }
  }

  async update(insumo: Insumo): Promise<boolean> {
    try {
      if (!insumo || !insumo.IdInsumo) {
        throw new Error('Insumo no válido para actualizar');
      }

      const posted = await this.masterdataService.updateSupply(insumo);
      if (!posted) {
        return false;
      }

      const currentSupplies = this.supplies();
      const index = currentSupplies.findIndex(i => i.IdInsumo === insumo.IdInsumo);
      if (index !== -1) {
        currentSupplies[index] = insumo;
        this.supplies.set(currentSupplies);
        await this.saveSupplies();
      }
      return true;
    } catch (error) {
      this.logger.error('Error updating supply', { insumo, error });
      throw error;
    }
  }

  async delete(idInsumo: string): Promise<boolean> {
    try {
      const currentSupplies = this.supplies();
      const filteredSupplies = currentSupplies.filter(i => i.IdInsumo !== idInsumo);
      this.supplies.set(filteredSupplies);
      await this.saveSupplies();
      return true;
    } catch (error) {
      this.logger.error('Error deleting supply', { idInsumo, error });
      throw error;
    }
  }
}
