import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { STORAGE } from '@app/core/constants';
import { Supply } from '@app/domain/entities/supply.entity';

@Injectable({
  providedIn: 'root',
})
export class SupplyRepository {
  constructor(
    private storage: StorageService,
  ) {
  }

  async get(supplyId: string): Promise<Supply | undefined> {
    if (!supplyId) {
      return undefined;
    }
    const supplies = await this.storage.get(STORAGE.SUPPLIES) as Supply[];
    return supplies.find(x => x.Id === supplyId);
  }

  async getAll(): Promise<Supply[]> {
    const supplies = await this.storage.get(STORAGE.SUPPLIES) as Supply[];
    return supplies;
  }

}
