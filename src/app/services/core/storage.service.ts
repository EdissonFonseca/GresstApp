import { Storage } from "@ionic/storage-angular";
import { Injectable } from "@angular/core";

/**
 * Service for handling local storage in the application
 * Uses @ionic/storage-angular for data persistence
 */
@Injectable({
  providedIn: 'root',
})
export class StorageService {
  private storageCreated = false;

  constructor(
    private storage: Storage
  ) {}

  /**
   * Initializes the storage service.
   * This method should be called once during application bootstrap in app.module.ts.
   * It creates the storage instance and ensures it's ready for use.
   *
   * @returns {Promise<void>} A promise that resolves when the storage is initialized
   * @throws {Error} If the storage fails to initialize
   */
  async init(): Promise<void> {
      await this.storage.create();
  }

  /**
   * Saves a value in storage
   * @param key Key to store the value
   * @param value Value to store
   * @throws Error if there's a problem saving the value
   */
  async set(key: string, value: any) {
    try {
      await this.storage.set(key, value);
    } catch (error: any) {
      console.error(`Error saving value for key: ${key}`, error);
      throw new Error(`Could not save value for key ${key}: ${error.message}`);
    }
  }

  /**
   * Gets a value from storage
   * @param key Key of the value to retrieve
   * @returns Promise<any> Stored value or null if it doesn't exist
   * @throws Error if there's a problem retrieving the value
   */
  async get(key: string): Promise<any> {
    try {
      return await this.storage.get(key);
    } catch (error: any) {
      console.error(`Error getting value for key: ${key}`, error);
      throw new Error(`Could not get value for key ${key}: ${error.message}`);
    }
  }

  /**
   * Removes a value from storage
   * @param key Key of the value to remove
   * @throws Error if there's a problem removing the value
   */
  async remove(key: string) {
    try {
      return await this.storage.remove(key);
    } catch (error: any) {
      console.error(`Error removing value for key: ${key}`, error);
      throw new Error(`Could not remove value for key ${key}: ${error.message}`);
    }
  }

  /**
   * Clears all storage
   * @throws Error if there's a problem clearing the storage
   */
  async clear() {
    try {
      await this.storage.clear();
    } catch (error: any) {
      console.error('Error clearing storage', error);
      throw new Error('Could not clear storage: ' + error.message);
    }
  }
}
