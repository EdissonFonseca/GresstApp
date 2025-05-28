import { Injectable, signal } from '@angular/core';
import { StorageService } from './storage.service';
import { Transaction } from '@app/interfaces/transaction.interface';
import { STORAGE } from '@app/constants/constants';
import { LoggerService } from './logger.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionService {
  private transaction = signal<Transaction | null>(null);
  public transaction$ = this.transaction.asReadonly();

  constructor(
    private storage: StorageService,
    private readonly logger: LoggerService
  ) {
    this.loadTransaction();
  }

  async loadTransaction(): Promise<void> {
    try {
      const transaction = await this.storage.get(STORAGE.TRANSACTION) as Transaction;
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

  getTransaction(): Transaction | null {
    return this.transaction();
  }

  setTransaction(transaction: Transaction): void {
    this.transaction.set(transaction);
  }
}
