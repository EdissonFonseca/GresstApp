import { Injectable, signal } from '@angular/core';
import { Network } from '@capacitor/network';
import { SynchronizationService } from '@app/infrastructure/services/synchronization.service';
import { STORAGE } from '../../core/constants';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { environment } from '../../../environments/environment';
import { StorageService } from '@app/infrastructure/services/storage.service';
import { Message } from '@app/domain/entities/message.entity';
import { AuthenticationApiService } from '@app/infrastructure/services/authenticationApi.service';

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
    const session = await this.storage.get(STORAGE.SESSION);
    return session.AccessToken !== null;
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
    const requests = await this.storage.get(STORAGE.MESSAGES);
    return requests && requests.length > 0;
  }

  /**
   * Counts and updates the number of pending transactions in local storage
   * @returns {Promise<void>}
   */
  async countPendingRequests(): Promise<void> {
    const requests: Message[] = await this.storage.get(STORAGE.MESSAGES) || [];
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
      await this.syncService.downloadPermissions();
      await this.syncService.downloadInventory();
      await this.syncService.downloadMasterData();
      await this.syncService.downloadOperation();
      await this.storage.set(STORAGE.MESSAGES, []);
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
   * @returns {Promise<boolean>} True if synchronization was successful (upload AND download succeeded)
   */
  async synchronize(): Promise<boolean> {
    try {
      const isOnline = await this.isOnline();
      if (!isOnline) {
        this.logger.warn('Device is offline, cannot synchronize');
        return false;
      }

      // Try to upload pending data
      const uploadSuccess = await this.uploadData();
      if (!uploadSuccess) {
        this.logger.warn('Failed to upload pending data to server');
        return false;
      }

      // Try to download fresh data from server
      try {
        await this.syncService.downloadPermissions();
        await this.syncService.downloadInventory();
        await this.syncService.downloadMasterData();
        await this.syncService.downloadOperation();
        this.logger.info('Synchronization completed successfully');
        return true;
      } catch (downloadError) {
        this.logger.error('Error downloading data from server', downloadError);
        return false;
      }
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
   * Forces application exit by clearing all storage
   * Should be called after exporting pending data
   * @returns {Promise<void>}
   */
  async forceQuit(): Promise<void> {
    try {
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

