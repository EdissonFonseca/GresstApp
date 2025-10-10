import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { Party } from '@app/domain/entities/party.entity';
import { STORAGE } from '@app/core/constants';
import { MasterDataApiService } from '@app/infrastructure/services/masterdataApi.service';
import { LoggerService } from '@app/infrastructure/services/logger.service';

@Injectable({
  providedIn: 'root',
})
export class PartyRepository {
  constructor(
    private storage: StorageService,
    private masterdataService: MasterDataApiService,
    private readonly logger: LoggerService
  ) {
  }

  async get(partyId: string): Promise<Party | undefined> {
    if (!partyId) {
      return undefined;
    }
    const parties = await this.storage.get(STORAGE.PARTIES) as Party[];
    return parties.find(x => x.Id === partyId);
  }

  async getAll(): Promise<Party[]> {
    const parties = await this.storage.get(STORAGE.PARTIES) as Party[];
    return parties;
  }

}
