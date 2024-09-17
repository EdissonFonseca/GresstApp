import { Storage } from "@ionic/storage-angular";
import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class StorageService {

  constructor(
    private storage: Storage
  ) {
    this.storage.create();
  }

  async set (key: string, value: any){
    await this.storage.set(key, value);
  }
  async get (key: string): Promise<any> {
    return await this.storage.get(key);
  }
  async remove (key: string) {
    return await this.storage.remove(key);
  }
  async clear() {
    await this.storage.clear();
  }

}
