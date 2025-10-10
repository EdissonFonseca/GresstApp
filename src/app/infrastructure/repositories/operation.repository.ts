import { Injectable } from '@angular/core';
import { StorageService } from '../services/storage.service';
import { Operation } from '@app/domain/entities/operation.entity';
import { STORAGE } from '@app/core/constants';
import { LoggerService } from '../services/logger.service';

/**
 * OperationsService
 *
 * Repository for managing operation persistence.
 * This is a simple data access layer without reactivity.
 * Reactivity is handled in the presentation layer (CardService).
 */
@Injectable({
  providedIn: 'root',
})
export class OperationRepository {
  constructor(
    private storage: StorageService,
    private readonly logger: LoggerService
  ) {}

  /**
   * Initialize storage with an empty operation structure
   * @returns Promise<void>
   */
  async init(): Promise<void> {
    try {
      const existingOperation = await this.storage.get(STORAGE.OPERATION);
      if (!existingOperation) {
        const emptyOperation: Operation = {
          Processes: [],
          Subprocesses: [],
          Tasks: []
        };
        await this.storage.set(STORAGE.OPERATION, emptyOperation);
        this.logger.debug('Operation storage initialized');
      }
    } catch (error) {
      this.logger.error('Error initializing operation storage', error);
      throw error;
    }
  }

  /**
   * Create a new operation in storage
   * @param operation - The operation to create
   * @returns Promise<void>
   * @throws Error if operation cannot be created
   */
  async create(operation: Operation): Promise<void> {
    try {
      // Validate operation structure
      if (!operation) {
        throw new Error('Operation cannot be null or undefined');
      }

      if (!operation.Processes || !operation.Subprocesses || !operation.Tasks) {
        throw new Error('Operation must have Processes, Subprocesses, and Tasks arrays');
      }

      // Check if operation already exists
      const existingOperation = await this.storage.get(STORAGE.OPERATION);
      if (existingOperation) {
        throw new Error('Operation already exists. Use update() to modify it.');
      }

      await this.storage.set(STORAGE.OPERATION, operation);
      this.logger.debug('Operation created successfully');
    } catch (error) {
      this.logger.error('Error creating operation', error);
      throw error;
    }
  }

  /**
   * Get the current operation from storage
   * @returns Promise<Operation> The current operation
   * @throws Error if operation cannot be loaded
   */
  async get(): Promise<Operation> {
    try {
      const operation = await this.storage.get(STORAGE.OPERATION) as Operation;

      if (!operation) {
        // Return empty operation structure if none exists
        return {
          Processes: [],
          Subprocesses: [],
          Tasks: []
        };
      }

      return operation;
    } catch (error) {
      this.logger.error('Error loading operation', error);
      throw error;
    }
  }

  /**
   * Update the operation in storage
   * @param operation - The operation to save
   * @returns Promise<void>
   * @throws Error if operation cannot be saved
   */
  async update(operation: Operation): Promise<void> {
    try {
      // Validate operation structure
      if (!operation) {
        throw new Error('Operation cannot be null or undefined');
      }

      if (!operation.Processes || !operation.Subprocesses || !operation.Tasks) {
        throw new Error('Operation must have Processes, Subprocesses, and Tasks arrays');
      }

      await this.storage.set(STORAGE.OPERATION, operation);
      this.logger.debug('Operation updated successfully');
    } catch (error) {
      this.logger.error('Error saving operation', error);
      throw error;
    }
  }

  /**
   * Delete the operation from storage
   * @returns Promise<void>
   * @throws Error if operation cannot be deleted
   */
  async delete(): Promise<void> {
    try {
      const operation = await this.storage.get(STORAGE.OPERATION);
      if (!operation) {
        this.logger.warn('No operation to delete');
        return;
      }

      await this.storage.remove(STORAGE.OPERATION);
      this.logger.debug('Operation deleted successfully');
    } catch (error) {
      this.logger.error('Error deleting operation', error);
      throw error;
    }
  }

  /**
   * Clear the operation from storage (sets empty structure)
   * @returns Promise<void>
   */
  async clear(): Promise<void> {
    try {
      const emptyOperation: Operation = {
        Processes: [],
        Subprocesses: [],
        Tasks: []
      };
      await this.storage.set(STORAGE.OPERATION, emptyOperation);
      this.logger.debug('Operation cleared');
    } catch (error) {
      this.logger.error('Error clearing operation', error);
      throw error;
    }
  }
}
