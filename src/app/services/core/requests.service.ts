import { inject, Injectable } from "@angular/core";
import { StorageService } from "./storage.service";
import { AuthorizationApiService } from "../api/authorizationApi.service";
import { InventoryApiService } from "../api/inventoryApi.service";
import { MasterDataApiService } from "../api/masterdataApi.service";
import { TransactionsApiService } from "../api/transactionsApi.service";
import { LoggerService } from "./logger.service";
import { STORAGE } from "@app/constants/constants";
import { APIRequest } from "@app/interfaces/APIRequest.interface";
@Injectable({
  providedIn: 'root',
})
export class RequestsService {
  constructor(
    private storage: StorageService,
    private authorizationService: AuthorizationApiService,
    private inventoryService: InventoryApiService,
    private masterdataService: MasterDataApiService,
    private transactionsService: TransactionsApiService,
    private readonly logger: LoggerService
  ) {}

  async init(): Promise<void> {
    await this.storage.set(STORAGE.REQUESTS, []);
  }

  async get(): Promise<APIRequest[]> {
    return this.storage.get(STORAGE.REQUESTS);
  }

  async create(objectType:string, CRUD:string, payload: any): Promise<void> {
    const requests = await this.storage.get(STORAGE.REQUESTS);
    requests.push({
      Object: objectType,
      CRUD: CRUD,
      Data: payload,
      Date: new Date(),
      Id: payload.Id,
    });
    await this.storage.set(STORAGE.REQUESTS, requests);
  }

  async add(request: APIRequest): Promise<void> {
    const requests = await this.storage.get(STORAGE.REQUESTS);
    requests.push(request);
    await this.storage.set(STORAGE.REQUESTS, requests);
  }

  async remove(request: APIRequest): Promise<void> {
    const requests = await this.storage.get(STORAGE.REQUESTS);
    requests.splice(requests.indexOf(request), 1);
    await this.storage.set(STORAGE.REQUESTS, requests);
  }

  async clear(): Promise<void> {
    await this.storage.set(STORAGE.REQUESTS, []);
  }

}
