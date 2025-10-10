import { Injectable } from '@angular/core';
import { Subprocess } from '../../domain/entities/subprocess.entity';
import { CRUD_OPERATIONS, DATA_TYPE } from '@app/core/constants';
import { MessageRepository } from '../../infrastructure/repositories/message.repository';
import { SynchronizationService } from '../../infrastructure/services/synchronization.service';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { OperationRepository } from '@app/infrastructure/repositories/operation.repository';

/**
 * SubprocessesRepository
 *
 * Pure CRUD repository for managing subprocess persistence.
 * This is a simple data access layer without business logic.
 * Business logic and data enrichment should be handled in the presentation layer (CardService).
 *
 * Responsibilities:
 * - CRUD operations on subprocesses
 * - Data persistence
 * - Synchronization requests
 */
@Injectable({
  providedIn: 'root',
})
export class SubprocessService {

  constructor(
    private messageRepository: MessageRepository,
    private synchronizationService: SynchronizationService,
    private readonly logger: LoggerService,
    private operationRepository: OperationRepository
  ) {}

  /**
   * Create a new subprocess
   * @param subprocess - The subprocess to create
   * @returns Promise<void>
   * @throws Error if subprocess cannot be created
   */
  async create(subprocess: Subprocess): Promise<void> {
    try {
      if (!subprocess) {
        throw new Error('Subprocess cannot be null or undefined');
      }

      const operation = await this.operationRepository.get();

      // Set timestamps
      subprocess.StartDate = new Date().toISOString();

      // Add subprocess to operation
      operation.Subprocesses.push(subprocess);

      // Save to storage
      await this.operationRepository.update(operation);

      // Queue for synchronization
      await this.messageRepository.create(DATA_TYPE.TRANSACTION, CRUD_OPERATIONS.CREATE, subprocess);
      await this.synchronizationService.uploadData();

      this.logger.debug('Subprocess created successfully', { subprocessId: subprocess.SubprocessId });
    } catch (error) {
      this.logger.error('Error creating subprocess', error);
      throw error;
    }
  }

  /**
   * Get all subprocesses
   * @returns Promise<Subprocess[]> Array of all subprocesses
   * @throws Error if retrieval fails
   */
  async list(): Promise<Subprocess[]> {
    try {
      const operation = await this.operationRepository.get();
      return operation.Subprocesses || [];
    } catch (error) {
      this.logger.error('Error listing subprocesses', error);
      throw error;
    }
  }

  /**
   * Get subprocesses by process ID
   * @param processId - The process ID to filter by
   * @returns Promise<Subprocess[]> Array of subprocesses for the process
   * @throws Error if retrieval fails
   */
  async listByProcess(processId: string): Promise<Subprocess[]> {
    try {
      const operation = await this.operationRepository.get();
      return operation.Subprocesses.filter(x => x.ProcessId === processId);
    } catch (error) {
      this.logger.error('Error listing subprocesses by process', { processId, error });
      throw error;
    }
  }

  /**
   * Get a specific subprocess by IDs
   * @param processId - The process ID
   * @param subprocessId - The subprocess ID
   * @returns Promise<Subprocess | undefined> The subprocess if found
   * @throws Error if retrieval fails
   */
  async get(processId: string, subprocessId: string): Promise<Subprocess | undefined> {
    try {
      const operation = await this.operationRepository.get();
      return operation.Subprocesses.find(
        x => x.ProcessId === processId && x.SubprocessId === subprocessId
      );
    } catch (error) {
      this.logger.error('Error getting subprocess', { processId, subprocessId, error });
      throw error;
    }
  }

  /**
   * Get a subprocess by process and point IDs
   * @param processId - The process ID
   * @param pointId - The point ID
   * @returns Promise<Subprocess | undefined> The subprocess if found
   * @throws Error if retrieval fails
   */
  async getByPoint(processId: string, facilityId: string): Promise<Subprocess | undefined> {
    try {
      const operation = await this.operationRepository.get();
      return operation.Subprocesses.find(
        x => x.ProcessId === processId && x.FacilityId === facilityId
      );
    } catch (error) {
      this.logger.error('Error getting subprocess by point', { processId, facilityId, error });
      throw error;
    }
  }

  /**
   * Get a subprocess by process and third party IDs
   * @param processId - The process ID
   * @param thirdPartyId - The third party ID
   * @returns Promise<Subprocess | undefined> The subprocess if found
   * @throws Error if retrieval fails
   */
  async getByThirdParty(processId: string, partyId: string): Promise<Subprocess | undefined> {
    try {
      const operation = await this.operationRepository.get();
      return operation.Subprocesses.find(
        x => x.ProcessId === processId && x.PartyId === partyId
      );
    } catch (error) {
      this.logger.error('Error getting subprocess by third party', { processId, partyId, error });
      throw error;
    }
  }

  /**
   * Update an existing subprocess
   * @param subprocess - The subprocess to update
   * @returns Promise<void>
   * @throws Error if update fails
   */
  async update(subprocess: Subprocess): Promise<void> {
    try {
      if (!subprocess) {
        throw new Error('Subprocess cannot be null or undefined');
      }

      const operation = await this.operationRepository.get();

      const index = operation.Subprocesses.findIndex(
        x => x.ProcessId === subprocess.ProcessId && x.SubprocessId === subprocess.SubprocessId
      );

      if (index === -1) {
        throw new Error(`Subprocess not found: ${subprocess.SubprocessId}`);
      }

      // Set end date
      subprocess.EndDate = new Date().toISOString();

      // Update subprocess
      operation.Subprocesses[index] = subprocess;

      // Save to storage
      await this.operationRepository.update(operation);

      // Queue for synchronization
      await this.messageRepository.create(DATA_TYPE.TRANSACTION, CRUD_OPERATIONS.UPDATE, subprocess);
      await this.synchronizationService.uploadData();

      this.logger.debug('Subprocess updated successfully', { subprocessId: subprocess.SubprocessId });
    } catch (error) {
      this.logger.error('Error updating subprocess', error);
      throw error;
    }
  }

  /**
   * Delete a subprocess
   * @param processId - The process ID
   * @param subprocessId - The subprocess ID
   * @returns Promise<void>
   * @throws Error if deletion fails
   */
  async delete(processId: string, subprocessId: string): Promise<void> {
    try {
      const operation = await this.operationRepository.get();

      const index = operation.Subprocesses.findIndex(
        x => x.ProcessId === processId && x.SubprocessId === subprocessId
      );

      if (index === -1) {
        this.logger.warn('Subprocess not found for deletion', { processId, subprocessId });
        return;
      }

      const subprocess = operation.Subprocesses[index];

      // Remove subprocess
      operation.Subprocesses.splice(index, 1);

      // Save to storage
      await this.operationRepository.update(operation);

      // Queue for synchronization
      await this.messageRepository.create(DATA_TYPE.TRANSACTION, CRUD_OPERATIONS.DELETE, subprocess);
      await this.synchronizationService.uploadData();

      this.logger.debug('Subprocess deleted successfully', { subprocessId });
    } catch (error) {
      this.logger.error('Error deleting subprocess', error);
      throw error;
    }
  }

  /**
   * Get summary information for a subprocess
   * @param subprocess - The subprocess to get summary for
   * @returns string Summary text
   */
  getSummary(subprocess: Subprocess): string {
    const parts = [];

    if (subprocess.Quantity && subprocess.Quantity > 0) {
      parts.push(`${subprocess.Quantity} items`);
    }

    if (subprocess.Weight && subprocess.Weight > 0) {
      parts.push(`${subprocess.Weight} kg`);
    }

    if (subprocess.Volume && subprocess.Volume > 0) {
      parts.push(`${subprocess.Volume} m³`);
    }

    return parts.join(' / ') || '';
  }
}

