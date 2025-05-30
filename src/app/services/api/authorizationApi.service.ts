import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { HttpService } from './http.service';
import { LoggerService } from '../core/logger.service';
import { environment } from '../../../environments/environment';
import { STORAGE } from '@app/constants/constants';
import { jwtDecode } from 'jwt-decode';

interface JwtPayload {
  exp: number;
  [key: string]: any;
}

interface Permission {
  id: number;
  name: string;
  description: string;
}

interface Role {
  id: number;
  name: string;
  description: string;
  permissions: Permission[];
}

export interface UserPermissions {
  roles: Role[];
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
  async get(): Promise<UserPermissions> {
    try {
      const response = await this.http.get<UserPermissions>('/authorization/get/app');
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
      const token = await this.storage.get(STORAGE.ACCESS_TOKEN);
      if (!token) {
        return false;
      }

      const decoded = jwtDecode<JwtPayload>(token);
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
      const permissions = await this.get();
      return permissions.permissions.some(p => p.name === permissionName);
    } catch (error) {
      this.logger.error('Error checking permission', { permissionName, error });
      return false;
    }
  }

  /**
   * Checks if the user has a specific role
   * @param {string} roleName - Name of the role to check
   * @returns {Promise<boolean>} True if the user has the role
   */
  async hasRole(roleName: string): Promise<boolean> {
    try {
      const permissions = await this.get();
      return permissions.roles.some(r => r.name === roleName);
    } catch (error) {
      this.logger.error('Error checking role', { roleName, error });
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
      const permissions = await this.get();
      return permissions.permissions.some(p => permissionNames.includes(p.name));
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
      const permissions = await this.get();
      return permissionNames.every(name =>
        permissions.permissions.some(p => p.name === name)
      );
    } catch (error) {
      this.logger.error('Error checking permissions', { permissionNames, error });
      return false;
    }
  }

  /**
   * Checks if the user has any of the specified roles
   * @param {string[]} roleNames - Array of role names to check
   * @returns {Promise<boolean>} True if the user has any of the roles
   */
  async hasAnyRole(roleNames: string[]): Promise<boolean> {
    try {
      const permissions = await this.get();
      return permissions.roles.some(r => roleNames.includes(r.name));
    } catch (error) {
      this.logger.error('Error checking roles', { roleNames, error });
      return false;
    }
  }

  /**
   * Checks if the user has all of the specified roles
   * @param {string[]} roleNames - Array of role names to check
   * @returns {Promise<boolean>} True if the user has all of the roles
   */
  async hasAllRoles(roleNames: string[]): Promise<boolean> {
    try {
      const permissions = await this.get();
      return roleNames.every(name =>
        permissions.roles.some(r => r.name === name)
      );
    } catch (error) {
      this.logger.error('Error checking roles', { roleNames, error });
      return false;
    }
  }
}
