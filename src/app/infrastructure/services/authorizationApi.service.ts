import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpService } from './http.service';
import { LoggerService } from './logger.service';
import { environment } from '../../../environments/environment';
import { STORAGE } from '@app/core/constants';
import { jwtDecode } from 'jwt-decode';
import { Permission } from '@app/domain/entities/permission.entity';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

/**
 * Service responsible for managing user authorization and permissions.
 * Handles JWT token validation, permission checks, and role management.
 */
@Injectable({
  providedIn: 'root'
})
export class AuthorizationApiService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private storage: Storage,
    private readonly http: HttpService,
    private readonly logger: LoggerService
  ) { }

  /**
   * Retrieves user permissions from the server
   * @returns {Promise<UserPermissions>} User permissions including roles and permissions
   * @throws {Error} If the request fails
   */
  async getPermissions(): Promise<Permission[]> {
    try {
      const response = await this.http.get<Permission[]>('/authorization/getpermissions');
      return response.data;
    } catch (error) {
      this.logger.error('Error getting user permissions', error);
      throw error;
    }
  }

  /**
   * Checks if the current JWT token is valid and not expired
   * @returns {Promise<boolean>} True if the token is valid
   */
  async isTokenValid(): Promise<boolean> {
    try {
      const session = await this.storage.get(STORAGE.SESSION);
      if (!session.AccessToken) {
        return false;
      }

      const decoded = jwtDecode<JwtPayload>(session.AccessToken);
      const currentTime = Date.now() / 1000;
      return decoded.exp > currentTime;
    } catch (error) {
      this.logger.error('Error validating token', error);
      return false;
    }
  }

  /**
   * Checks if the user has a specific permission
   * @param {string} permissionName - Name of the permission to check
   * @returns {Promise<boolean>} True if the user has the permission
   */
  async hasPermission(permissionName: string): Promise<boolean> {
    try {
      const permissions = await this.getPermissions();
      return permissions.some(p => p.Name === permissionName);
    } catch (error) {
      this.logger.error('Error checking permission', { permissionName, error });
      return false;
    }
  }

  /**
   * Checks if the user has any of the specified permissions
   * @param {string[]} permissionNames - Array of permission names to check
   * @returns {Promise<boolean>} True if the user has any of the permissions
   */
  async hasAnyPermission(permissionNames: string[]): Promise<boolean> {
    try {
      const permissions = await this.getPermissions();
      return permissions.some(p => permissionNames.includes(p.Name));
    } catch (error) {
      this.logger.error('Error checking permissions', { permissionNames, error });
      return false;
    }
  }

  /**
   * Checks if the user has all of the specified permissions
   * @param {string[]} permissionNames - Array of permission names to check
   * @returns {Promise<boolean>} True if the user has all of the permissions
   */
  async hasAllPermissions(permissionNames: string[]): Promise<boolean> {
    try {
      const permissions = await this.getPermissions();
      return permissionNames.every(name =>
        permissions.some(p => p.Name === name)
      );
    } catch (error) {
      this.logger.error('Error checking permissions', { permissionNames, error });
      return false;
    }
  }
}
