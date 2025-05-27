import { Injectable, signal } from '@angular/core';
import { Network } from '@capacitor/network';
import { SynchronizationService } from './synchronization.service';
import { STORAGE } from '../../constants/constants';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { LoggerService } from './logger.service';
import { environment } from '../../../environments/environment';
import { StorageService } from './storage.service';
import { APIRequest } from '@app/interfaces/APIRequest.interface';
import { AuthenticationApiService } from '../api/authenticationApi.service';

/**
 * Interface representing the structure of backup data
 * Contains all essential data that needs to be backed up during force quit
 */
interface BackupData {
  timestamp: string;      // ISO timestamp of when the backup was created
  requests: any[];    // Array of pending transactions
}

/**
 * Service responsible for managing user session state and synchronization.
 * Handles session initialization, refresh, and cleanup operations.
 * Manages online/offline state and data synchronization between local storage and server.
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly apiUrl = environment.apiUrl;
  pendingRequests = signal<number>(0);

  constructor(
    private storage: StorageService,
    private syncService: SynchronizationService,
    private readonly authenticationApi: AuthenticationApiService,
    private readonly logger: LoggerService
  ) { }

  /**
   * Checks if the application is online and can reach the API
   * Uses Capacitor's Network plugin to determine connectivity status
   * @returns {Promise<boolean>} True if the device has network connectivity
   */
  async isOnline(): Promise<boolean> {
    const status = await Network.getStatus();
    return status.connected;
  }

  /**
   * Verifies if a user is currently logged in
   * Checks for the presence of a username in local storage
   * @returns {Promise<boolean>} True if a username exists in storage
   */
  async isLoggedIn(): Promise<boolean> {
    const username = await this.storage.get(STORAGE.USERNAME);
    return username !== null;
  }

  /**
   * Verifies if the user's token is valid in API
   * Checks for the presence of a token in local storage
   * @returns {Promise<boolean>} True if a token exists in storage
   */
  async isRefreshTokenValid(): Promise<boolean> {
    return this.authenticationApi.isRefreshTokenValid();
  }

  /**
   * Verifies if there are pending transactions in local storage
   * @returns {Promise<boolean>} True if there are pending transactions
   */
  async hasPendingRequests(): Promise<boolean> {
    const requests = await this.storage.get(STORAGE.REQUESTS);
    return requests && requests.length > 0;
  }

  /**
   * Counts and updates the number of pending transactions in local storage
   * @returns {Promise<void>}
   */
  async countPendingRequests(): Promise<void> {
    const requests: APIRequest[] = await this.storage.get(STORAGE.REQUESTS) || [];
    this.pendingRequests.set(requests.length);
  }

  /**
   * Initializes the application session
   * Downloads all necessary data from the server including authorizations,
   * inventory, master data, and transactions
   * @returns {Promise<boolean>} True if initialization was successful
   */
  async start(): Promise<boolean> {
    try {
      await this.syncService.downloadAuthorizations();
      await this.syncService.downloadInventory();
      await this.syncService.downloadMasterData();
      await this.syncService.downloadTransactions();
      await this.storage.set(STORAGE.REQUESTS, []);
      await this.storage.set(STORAGE.START_DATE, new Date().toISOString());
    } catch (error) {
      this.logger.error('Error loading initial data', error);
      return false;
    }

    return true;
  }

  /**
   * Synchronizes local data with the server
   * First uploads any pending data, then downloads fresh data from server
   * Only proceeds if device is online
   * @returns {Promise<boolean>} True if synchronization was successful
   */
  async synchronize(): Promise<boolean> {
    try {
      const isOnline = await this.isOnline();
      if (isOnline) {
        console.log('isOnline', isOnline);
        if (await this.uploadData()) {
          await this.syncService.downloadAuthorizations();
          await this.syncService.downloadInventory();
          await this.syncService.downloadMasterData();
          await this.syncService.downloadTransactions();
          return true;
        }
        return false;
      }
      return false;
    } catch (error) {
      this.logger.error('Error synchronizing data', error);
      return false;
    }
  }

  /**
   * Uploads pending data to the server
   * @returns {Promise<boolean>} True if upload was successful
   */
  async uploadData(): Promise<boolean> {
    return this.syncService.uploadData();
  }

  /**
   * Attempts to close the session by uploading pending transactions
   * Clears local storage if upload is successful
   * @returns {Promise<boolean>} True if session was closed successfully
   */
  async end(): Promise<boolean> {
    try {
      const uploadSuccess = await this.syncService.uploadData();
      if (uploadSuccess) {
        await this.storage.clear();
        return true;
      }
      this.logger.warn('Failed to upload pending data');
      return false;
    } catch (error) {
      this.logger.error('Error closing session', error);
      return false;
    }
  }

  /**
   * Forces application exit by creating a backup of current transactions
   * Creates both local and server backups before clearing storage
   * Local backup is stored in the device's documents directory
   * Server backup is attempted but not required for successful exit
   * @returns {Promise<void>}
   * @throws {Error} If backup creation fails
   */
  async forceQuit(): Promise<void> {
    try {
      // Get data from storage
      const requests = await this.storage.get(STORAGE.REQUESTS);

      // Create backup data object
      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        requests: requests
      };

      // Convert to JSON
      const jsonData = JSON.stringify(backupData, null, 2);

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `gresst-backup-${timestamp}.json`;

      console.log('Backup data: ' + jsonData);
      console.log('Backup to: ' + fileName);

      // Convert string to base64
      const base64Data = btoa(jsonData);

      // Save file to documents directory
      await Filesystem.writeFile({
        path: fileName,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true
      });

      this.logger.info('Local backup created successfully', { fileName });

      // In browser environment, create a downloadable link
      if (typeof window !== 'undefined') {
        const blob = new Blob([jsonData], { type: 'application/json' });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }

      // Clear storage
      await this.storage.clear();
      this.logger.info('Storage cleared successfully');
    } catch (error) {
      console.log('Error in forceQuit', error);
      this.logger.error('Error in forceQuit', error);
      throw error;
    }
  }
}

