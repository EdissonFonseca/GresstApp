import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage-angular';
import { Network } from '@capacitor/network';
import { AuthenticationApiService } from '../api/authenticationApi.service';
import { SynchronizationService } from './synchronization.service';
import { STORAGE } from '../../constants/constants';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { HttpService } from '../api/http.service';
import { LoggerService } from './logger.service';
import { environment } from '../../../environments/environment';

interface BackupData {
  timestamp: string;
  transactions: any[];
  masterData: any[];
  inventory: any[];
  authorizations: any[];
}

/**
 * Service responsible for managing user session state and synchronization.
 * Handles session initialization, refresh, and cleanup operations.
 */
@Injectable({
  providedIn: 'root'
})
export class SessionService {
  private readonly apiUrl = environment.apiUrl;

  constructor(
    private storage: Storage,
    private authService: AuthenticationApiService,
    private syncService: SynchronizationService,
    private readonly http: HttpService,
    private readonly logger: LoggerService
  ) { }

  /**
   * Checks if there is an active session
   * @returns {Promise<boolean>} True if there is an active session
   */
  async isActive(): Promise<boolean> {
    try {
      const username = await this.storage.get(STORAGE.USERNAME);
      return username !== null;
    } catch (error) {
      this.logger.error('Error checking session status', error);
      return false;
    }
  }

  /**
   * Checks if the application is online and can reach the API
   * @returns {Promise<boolean>} True if the API is available
   */
  async isOnline(): Promise<boolean> {
    try {
      const status = await Network.getStatus();
      return status.connected;
    } catch (error) {
      this.logger.error('Error checking online status', error);
      return false;
    }
  }

  /**
   * Loads initial data after login
   * Downloads authorizations, inventory, master data and transactions
   * @returns {Promise<boolean>} True if load was successful
   */
  async load(): Promise<boolean> {
    try {
      await this.syncService.downloadAuthorizations();
      await this.syncService.downloadInventory();
      await this.syncService.downloadMasterData();
      await this.syncService.downloadTransactions();
      await this.syncService.countPendingTransactions();

      return true;
    } catch (error) {
      this.logger.error('Error loading initial data', error);
      return false;
    }
  }

  /**
   * Refreshes data for an existing session
   * Downloads latest authorizations, inventory, master data and transactions
   * @returns {Promise<boolean>} True if refresh was successful
   */
  async refresh(): Promise<boolean> {
    try {
      await this.syncService.downloadAuthorizations();
      await this.syncService.downloadInventory();
      await this.syncService.downloadMasterData();
      await this.syncService.downloadTransactions();
      await this.syncService.countPendingTransactions();

      return true;
    } catch (error) {
      this.logger.error('Error refreshing session data', error);
      return false;
    }
  }

  /**
   * Attempts to close the session by uploading pending transactions
   * Clears local storage if upload is successful
   * @returns {Promise<boolean>} True if close was successful
   */
  async close(): Promise<boolean> {
    try {
      const uploadSuccess = await this.syncService.uploadData();
      if (uploadSuccess) {
        await this.storage.clear();
        return true;
      }

      this.logger.warn('Failed to upload pending transactions');
      return false;
    } catch (error) {
      this.logger.error('Error closing session', error);
      return false;
    }
  }

  /**
   * Forces application exit by creating a backup of current transactions
   * Creates both local and server backups before clearing storage
   * @returns {Promise<void>}
   * @throws {Error} If backup creation fails
   */
  async forceQuit(): Promise<void> {
    try {
      // Get data from storage
      const transactions = await this.storage.get(STORAGE.TRANSACTION) || [];
      const masterData = await this.storage.get(STORAGE.PACKAGES) || [];
      const inventory = await this.storage.get(STORAGE.INVENTORY) || [];
      const authorizations = await this.storage.get(STORAGE.ACCOUNT) || [];

      // Create backup data object
      const backupData: BackupData = {
        timestamp: new Date().toISOString(),
        transactions,
        masterData,
        inventory,
        authorizations
      };

      // Convert to JSON
      const jsonData = JSON.stringify(backupData, null, 2);

      // Create filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `gresst-backup-${timestamp}.json`;

      // Save file to documents directory
      await Filesystem.writeFile({
        path: fileName,
        data: jsonData,
        directory: Directory.Documents,
        recursive: true
      });

      this.logger.info('Local backup created successfully', { fileName });

      // Attempt server backup
      try {
        await this.http.post('/transactions/backup', backupData);
        this.logger.info('Server backup created successfully');
      } catch (error) {
        this.logger.error('Error creating server backup', error);
        // Continue with local backup only
      }

      // Clear storage
      await this.storage.clear();
      this.logger.info('Storage cleared successfully');
    } catch (error) {
      this.logger.error('Error in forceQuit', error);
      throw error;
    }
  }
}

