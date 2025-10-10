import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { STORAGE } from '@app/core/constants';
import { Package } from '@app/domain/entities/package.entity';
import { MasterDataApiService } from '@app/infrastructure/services/masterdataApi.service';
import { LoggerService } from '@app/infrastructure/services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class PackageRepository {
  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService,
    private readonly logger: LoggerService
  ) {
  }

  async get(packageId: string): Promise<Package | undefined> {
    if (!packageId) {
      return undefined;
    }
    const packages = await this.storage.get(STORAGE.PACKAGES) as Package[];
    return packages.find(x => x.Id === packageId);
  }

  async getAll(): Promise<Package[]> {
    const packages = await this.storage.get(STORAGE.PACKAGES) as Package[];
    return packages;
  }
}
