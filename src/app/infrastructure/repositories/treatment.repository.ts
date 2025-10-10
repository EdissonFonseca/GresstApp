import { Injectable, signal } from '@angular/core';
import { Treatment } from '@app/domain/entities/treatment.entity';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { STORAGE } from '@app/core/constants';
import { Package } from '@app/domain/entities/package.entity';

@Injectable({
  providedIn: 'root'
})
export class TreatmentRepository {

  constructor(private storage: StorageService) {
  }

  async get(treatmentId: string): Promise<Treatment | undefined> {
    if (!treatmentId) {
      return undefined;
    }
    const treatments = await this.storage.get(STORAGE.PACKAGES) as Treatment[];
    return treatments.find(x => x.Id === treatmentId);
  }

  async getAll(): Promise<Treatment[]> {
    const treatments = await this.storage.get(STORAGE.PACKAGES) as Treatment[];
    return treatments;
  }
}
