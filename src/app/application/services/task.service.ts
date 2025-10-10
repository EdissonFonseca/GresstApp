import { Injectable } from '@angular/core';
import { Task } from '@app/domain/entities/task.entity';
import { CRUD_OPERATIONS, DATA_TYPE } from '@app/core/constants';
import { Utils } from '@app/core/utils';
import { MessageRepository } from '../../infrastructure/repositories/message.repository';
import { SynchronizationService } from '../../infrastructure/services/synchronization.service';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { OperationRepository } from '@app/infrastructure/repositories/operation.repository';

/**
 * TaskRepository
 *
 * Pure CRUD repository for managing task persistence.
 * This is a simple data access layer without business logic.
 * Business logic, data enrichment, and totals calculation should be handled in the presentation layer (CardService).
 *
 * Responsibilities:
 * - CRUD operations on tasks
 * - Data persistence
 * - Synchronization requests
 */
@Injectable({
  providedIn: 'root',
})
export class TaskService {
  constructor(
    private messageRepository: MessageRepository,
    private synchronizationService: SynchronizationService,
    private readonly logger: LoggerService,
    private operationRepository: OperationRepository
  ) {}

  /**
   * Create a new task
   * @param task - The task to create
   * @returns Promise<void>
   * @throws Error if task cannot be created
   */
  async create(task: Task): Promise<void> {
    try {
      if (!task) {
        throw new Error('Task cannot be null or undefined');
      }

      const operation = await this.operationRepository.get();

      // Add task to operation
      operation.Tasks.push(task);

      // Save to storage
      await this.operationRepository.update(operation);

      // Queue for synchronization
      await this.messageRepository.create(DATA_TYPE.TASK, CRUD_OPERATIONS.CREATE, task);
      await this.synchronizationService.uploadData();

      this.logger.debug('Task created successfully', { taskId: task.TaskId });
    } catch (error) {
      this.logger.error('Error creating task', error);
      throw error;
    }
  }

  /**
   * Get all tasks
   * @returns Promise<Task[]> Array of all tasks
   * @throws Error if retrieval fails
   */
  async list(): Promise<Task[]> {
    try {
      const operation = await this.operationRepository.get();
      return operation.Tasks || [];
    } catch (error) {
      this.logger.error('Error listing tasks', error);
      throw error;
    }
  }

  /**
   * Get tasks by process ID
   * @param processId - The process ID to filter by
   * @returns Promise<Task[]> Array of tasks for the process
   * @throws Error if retrieval fails
   */
  async listByProcess(processId: string): Promise<Task[]> {
    try {
      const operation = await this.operationRepository.get();
      return operation.Tasks.filter(x => x.ProcessId === processId);
    } catch (error) {
      this.logger.error('Error listing tasks by process', { processId, error });
      throw error;
    }
  }

  /**
   * Get tasks by subprocess ID
   * @param subprocessId - The subprocess ID to filter by
   * @returns Promise<Task[]> Array of tasks for the subprocess
   * @throws Error if retrieval fails
   */
  async listBySubprocess(subprocessId: string): Promise<Task[]> {
    try {
      const operation = await this.operationRepository.get();
      return operation.Tasks.filter(x => x.SubprocessId === subprocessId);
    } catch (error) {
      this.logger.error('Error listing tasks by subprocess', { subprocessId, error });
      throw error;
    }
  }

  /**
   * Get tasks by process and subprocess IDs
   * @param processId - The process ID
   * @param subprocessId - Optional subprocess ID
   * @returns Promise<Task[]> Array of tasks
   * @throws Error if retrieval fails
   */
  async listByProcessAndSubprocess(processId: string, subprocessId?: string): Promise<Task[]> {
    try {
      const operation = await this.operationRepository.get();

      if (subprocessId) {
        return operation.Tasks.filter(x => x.ProcessId === processId && x.SubprocessId === subprocessId);
      }

      return operation.Tasks.filter(x => x.ProcessId === processId);
    } catch (error) {
      this.logger.error('Error listing tasks by process and subprocess', { processId, subprocessId, error });
      throw error;
    }
  }

  /**
   * Get a specific task by ID
   * @param taskId - The task ID
   * @returns Promise<Task | undefined> The task if found
   * @throws Error if retrieval fails
   */
  async get(taskId: string): Promise<Task | undefined> {
    try {
      const operation = await this.operationRepository.get();
      return operation.Tasks.find(item => item.TaskId === taskId);
    } catch (error) {
      this.logger.error('Error getting task', { taskId, error });
      throw error;
    }
  }

  /**
   * Update an existing task
   * @param task - The task to update
   * @returns Promise<void>
   * @throws Error if update fails
   */
  async update(task: Task): Promise<void> {
    try {
      if (!task) {
        throw new Error('Task cannot be null or undefined');
      }

      const operation = await this.operationRepository.get();

      const taskIndex = operation.Tasks.findIndex(item => item.TaskId === task.TaskId);

      if (taskIndex === -1) {
        throw new Error(`Task not found: ${task.TaskId}`);
      }

      // Update task
      operation.Tasks[taskIndex] = task;

      // Save to storage
      await this.operationRepository.update(operation);

      // Queue for synchronization
      await this.messageRepository.create(DATA_TYPE.TASK, CRUD_OPERATIONS.UPDATE, task);
      await this.synchronizationService.uploadData();

      this.logger.debug('Task updated successfully', { taskId: task.TaskId });
    } catch (error) {
      this.logger.error('Error updating task', error);
      throw error;
    }
  }

  /**
   * Delete a task
   * @param taskId - The task ID
   * @returns Promise<void>
   * @throws Error if deletion fails
   */
  async delete(taskId: string): Promise<void> {
    try {
      const operation = await this.operationRepository.get();

      const taskIndex = operation.Tasks.findIndex(item => item.TaskId === taskId);

      if (taskIndex === -1) {
        this.logger.warn('Task not found for deletion', { taskId });
        return;
      }

      const task = operation.Tasks[taskIndex];

      // Remove task
      operation.Tasks.splice(taskIndex, 1);

      // Save to storage
      await this.operationRepository.update(operation);

      // Queue for synchronization
      await this.messageRepository.create(DATA_TYPE.TASK, CRUD_OPERATIONS.DELETE, task);
      await this.synchronizationService.uploadData();

      this.logger.debug('Task deleted successfully', { taskId });
    } catch (error) {
      this.logger.error('Error deleting task', error);
      throw error;
    }
  }

  /**
   * Get summary information for a task
   * @param task - The task to get summary for
   * @returns string Summary text
   */
  getSummary(task: Task): string {
    const parts = [];

    if ((task.Quantity ?? 0) > 0) {
      parts.push(`${task.Quantity} ${Utils.quantityUnit}`);
    }

    if ((task.Weight ?? 0) > 0) {
      parts.push(`${task.Weight} ${Utils.weightUnit}`);
    }

    if ((task.Volume ?? 0) > 0) {
      parts.push(`${task.Volume} ${Utils.volumeUnit}`);
    }

    return parts.join(' / ') || '';
  }
}
