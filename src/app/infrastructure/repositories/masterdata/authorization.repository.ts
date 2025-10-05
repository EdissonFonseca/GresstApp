import { Injectable } from '@angular/core';
import { Platform } from '@ionic/angular';
import { StorageService } from '../api/storage.repository';
import { STORAGE, PERMISSIONS, CRUD_OPERATIONS } from '@app/core/constants';

@Injectable({
  providedIn: 'root'
})
export class AuthorizationService {
  constructor(
    private platform: Platform,
    private storage: StorageService,
  ) {
  }


  /**
   * Gets the permission string for a given permission name
   * @param permissionName The name of the permission to check
   * @returns The permission string or empty string if not found
   */
  async getPermission(permissionName: string): Promise<string> {
    const account = await this.storage.get(STORAGE.ACCOUNT);
    if (account?.permisos) {
      return account.permisos[permissionName] || '';
    }
    return '';
  }

  /**
   * Gets the current user's person ID from the account
   * @returns The person ID or undefined if not found
   */
  async getPersonId(): Promise<string | undefined> {
    const account = await this.storage.get(STORAGE.ACCOUNT);
    return account?.IdPersonaCuenta;
  }

  /**
   * Get the account from storage
   * @returns The account object
   */
  async getAccount(): Promise<any> {
    return await this.storage.get(STORAGE.ACCOUNT);
  }

  /**
   * Check if a service is allowed
   * @param serviceId The service ID to check
   * @returns True if the service is allowed
   */
  async allowService(serviceId: string): Promise<boolean> {
    const account = await this.storage.get(STORAGE.ACCOUNT);
    return account?.servicios?.includes(serviceId) ?? false;
  }

  /**
   * Check if the user has permission to add activities
   * @returns True if the user has permission to add activities
   */
  async allowAddActivity(): Promise<boolean> {
    const acopio = (await this.getPermission(PERMISSIONS.APP_COLLECTION))?.includes(CRUD_OPERATIONS.CREATE);
    const transporte = (await this.getPermission(PERMISSIONS.APP_TRANSPORT))?.includes(CRUD_OPERATIONS.CREATE);
    return acopio || transporte;
  }
}
