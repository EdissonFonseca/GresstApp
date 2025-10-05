import { Injectable, signal } from '@angular/core';
import { StorageService } from '../repositories/api/storage.repository';
import { Operacion } from '@app/domain/entities/operacion.entity';
import { STORAGE } from '@app/core/constants';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class WorkflowService {
  private transaction = signal<Operacion | null>(null);
  public transaction$ = this.transaction.asReadonly();

  constructor(
    private storage: StorageService,
    private readonly logger: LoggerService
  ) {
    this.loadTransaction();
  }

  async loadTransaction(): Promise<void> {
    try {
      const transaction = await this.storage.get(STORAGE.TRANSACTION) as Operacion;
      this.transaction.set(transaction);
    } catch (error) {
      this.logger.error('Error loading transaction', error);
      this.transaction.set(null);
    }
  }

  async saveTransaction(): Promise<void> {
    try {
      const currentTransaction = this.transaction();
      if (currentTransaction) {
        await this.storage.set(STORAGE.TRANSACTION, currentTransaction);
        this.transaction.set(currentTransaction);
      }
    } catch (error) {
      this.logger.error('Error saving transaction', error);
      throw error;
    }
  }

  getTransaction(): Operacion | null {
    return this.transaction();
  }

  setTransaction(transaction: Operacion): void {
    this.transaction.set(transaction);
  }
}
