import { inject, Injectable } from "@angular/core";
import { StorageService } from "../services/storage.service";
import { AuthorizationApiService } from "../services/authorizationApi.service";
import { InventoryApiService } from "../services/inventoryApi.service";
import { MasterDataApiService } from "../services/masterdataApi.service";
import { OperationsApiService } from "../services/operationsApi.service";
import { LoggerService } from "../services/logger.service";
import { STORAGE } from "@app/core/constants";
import { Message } from "@app/domain/entities/message.entity";
@Injectable({
  providedIn: 'root',
})
export class MessageRepository {
  constructor(
    private storage: StorageService,
    private authorizationService: AuthorizationApiService,
    private inventoryService: InventoryApiService,
    private masterdataService: MasterDataApiService,
    private operationsService: OperationsApiService,
    private readonly logger: LoggerService
  ) {}

  async init(): Promise<void> {
    await this.storage.set(STORAGE.MESSAGES, []);
  }

  async get(): Promise<Message[]> {
    return this.storage.get(STORAGE.MESSAGES);
  }

  async create(objectType:string, CRUD:string, payload: any): Promise<void> {
    const requests = await this.storage.get(STORAGE.MESSAGES);
    requests.push({
      Object: objectType,
      CRUD: CRUD,
      Data: payload,
      Date: new Date(),
      Id: payload.Id,
    });
    await this.storage.set(STORAGE.MESSAGES, requests);
  }

  async add(request: Message): Promise<void> {
    const requests = await this.storage.get(STORAGE.MESSAGES);
    requests.push(request);
    await this.storage.set(STORAGE.MESSAGES, requests);
  }

  async remove(request: Message): Promise<void> {
    const requests = await this.storage.get(STORAGE.MESSAGES);
    requests.splice(requests.indexOf(request), 1);
    await this.storage.set(STORAGE.MESSAGES, requests);
  }

  async clear(): Promise<void> {
    await this.storage.set(STORAGE.MESSAGES, []);
  }

}
