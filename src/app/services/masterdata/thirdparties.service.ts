import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { Tercero } from '@app/interfaces/tercero.interface';
import { CRUD_OPERATIONS, STORAGE } from '@app/constants/constants';
import { MasterDataApiService } from '@app/services/api/masterdataApi.service';
import { Punto } from '@app/interfaces/punto.interface';
import { LoggerService } from '@app/services/core/logger.service';

@Injectable({
  providedIn: 'root',
})
export class ThirdpartiesService {
  private thirdparties = signal<Tercero[]>([]);
  private points = signal<Punto[]>([]);
  public thirdparties$ = this.thirdparties.asReadonly();
  public points$ = this.points.asReadonly();

  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService,
    private readonly logger: LoggerService
  ) {
    this.loadThirdparties();
    this.loadPoints();
  }

  private async loadThirdparties() {
    try {
      const terceros = await this.storage.get(STORAGE.THIRD_PARTIES) as Tercero[];
      this.thirdparties.set(terceros || []);
    } catch (error) {
      this.logger.error('Error loading third parties', error);
      this.thirdparties.set([]);
    }
  }

  private async loadPoints() {
    try {
      const puntos = await this.storage.get(STORAGE.POINTS) as Punto[];
      this.points.set(puntos || []);
    } catch (error) {
      this.logger.error('Error loading points', error);
      this.points.set([]);
    }
  }

  private async saveThirdparties() {
    try {
      const currentThirdparties = this.thirdparties();
      await this.storage.set(STORAGE.THIRD_PARTIES, currentThirdparties);
    } catch (error) {
      this.logger.error('Error saving third parties', error);
      throw error;
    }
  }

  async get(idTercero: string): Promise<Tercero | undefined> {
    try {
      return this.thirdparties().find(tercero => tercero.IdPersona === idTercero);
    } catch (error) {
      this.logger.error('Error getting third party', { idTercero, error });
      throw error;
    }
  }

  async list(): Promise<Tercero[]> {
    try {
      return this.thirdparties();
    } catch (error) {
      this.logger.error('Error listing third parties', error);
      throw error;
    }
  }

  async getThirdpartiesWithPoints(): Promise<Tercero[]> {
    try {
      const terceros = this.thirdparties();
      const puntos = this.points();
      const idTerceros = puntos.map(x => x.IdPersona ?? '');
      return terceros.filter(tercero => idTerceros.includes(tercero.IdPersona));
    } catch (error) {
      this.logger.error('Error getting third parties with points', error);
      throw error;
    }
  }

  async create(tercero: Tercero): Promise<boolean> {
    try {
      const posted = await this.masterdataService.createThirdParty(tercero);
      if (!posted) {
        return false;
      }

      const currentThirdparties = this.thirdparties();
      currentThirdparties.push(tercero);
      this.thirdparties.set(currentThirdparties);
      await this.saveThirdparties();
      return true;
    } catch (error) {
      this.logger.error('Error creating third party', { tercero, error });
      throw error;
    }
  }

  async update(tercero: Tercero): Promise<boolean> {
    try {
      const posted = await this.masterdataService.updateThirdParty(tercero);
      if (!posted) {
        return false;
      }

      const currentThirdparties = this.thirdparties();
      const index = currentThirdparties.findIndex(t => t.IdPersona === tercero.IdPersona);
      if (index !== -1) {
        currentThirdparties[index] = tercero;
        this.thirdparties.set(currentThirdparties);
        await this.saveThirdparties();
      }
      return true;
    } catch (error) {
      this.logger.error('Error updating third party', { tercero, error });
      throw error;
    }
  }

  async delete(idTercero: string): Promise<boolean> {
    try {
      const currentThirdparties = this.thirdparties();
      const filteredThirdparties = currentThirdparties.filter(t => t.IdPersona !== idTercero);
      this.thirdparties.set(filteredThirdparties);
      await this.saveThirdparties();
      return true;
    } catch (error) {
      this.logger.error('Error deleting third party', { idTercero, error });
      throw error;
    }
  }
}
