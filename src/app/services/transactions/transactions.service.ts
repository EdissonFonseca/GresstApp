import { Injectable, signal } from '@angular/core';
import { Transaccion } from '../../interfaces/transaccion.interface';
import { CRUD_OPERATIONS, DATA_TYPE, INPUT_OUTPUT, STATUS, STORAGE } from '@app/constants/constants';
import { PointsService } from '@app/services/masterdata/points.service';
import { ThirdpartiesService } from '@app/services/masterdata/thirdparties.service';
import { Utils } from '@app/utils/utils';
import { RequestsService } from '../core/requests.service';
import { SynchronizationService } from '../core/synchronization.service';
import { LoggerService } from '@app/services/core/logger.service';
import { TransactionService } from '@app/services/core/transaction.service';

/**
 * TransactionsService
 *
 * Service responsible for managing transactions in the application.
 * Handles CRUD operations for transactions, including:
 * - Transaction creation and updates
 * - Transaction listing and filtering
 * - Transaction synchronization
 * - Transaction status management
 * - Transaction point and third party associations
 */
@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  /** Signal containing the list of transactions for the current activity */
  public transactions = signal<Transaccion[]>([]);
  public transaction$ = this.transactionService.transaction$;

  constructor(
    private pointsService: PointsService,
    private thirdpartiesService: ThirdpartiesService,
    private requestsService: RequestsService,
    private synchronizationService: SynchronizationService,
    private readonly logger: LoggerService,
    private transactionService: TransactionService
  ) {
    this.loadTransaction();
  }

  /**
   * Loads the current transaction from storage
   * Updates the transaction signal with the loaded data
   * @throws {Error} If loading fails
   */
  private async loadTransaction() {
    try {
      await this.transactionService.loadTransaction();
      const transaction = this.transactionService.getTransaction();
      if (transaction?.Transacciones) {
        this.transactions.set(transaction.Transacciones);
      } else {
        this.transactions.set([]);
      }
    } catch (error) {
      this.logger.error('Error loading transaction', error);
      this.transactions.set([]);
    }
  }

  /**
   * Saves the current transaction to storage
   * Updates the transaction signal with the saved data
   * @throws {Error} If saving fails
   */
  private async saveTransaction() {
    try {
      const transaction = this.transactionService.getTransaction();
      if (transaction) {
        transaction.Transacciones = this.transactions();
        this.transactionService.setTransaction(transaction);
        await this.transactionService.saveTransaction();
      }
    } catch (error) {
      this.logger.error('Error saving transaction', error);
      throw error;
    }
  }

  /**
   * Lists transactions for a specific activity
   * Enriches transaction data with point and third party information
   *
   * @param idActividad - The activity ID to list transactions for
   * @returns Promise<Transaccion[]> - Array of transactions with enriched data
   * @throws {Error} If listing fails
   */
  async list(idActividad: string): Promise<Transaccion[]> {
    try {
      const transaction = this.transactionService.getTransaction();
      if (!transaction) return [];

      // Filter transactions by activity ID
      const transacciones = transaction.Transacciones.filter(x => x.IdActividad === idActividad);

      // Get points and third parties for enrichment
      const puntos = await this.pointsService.list();
      const terceros = await this.thirdpartiesService.list();

      // Enrich transaction data with point and third party information
      return transacciones.map(transaccion => {
        let operacion = transaccion.EntradaSalida;
        let nombre = '';
        let ubicacion = '';

        // Handle point-based transactions
        if (transaccion.IdDeposito != null) {
          transaccion.Icono = 'location-outline';
          const punto = puntos.find(x => x.IdDeposito === transaccion.IdDeposito);
          if (punto) {
            transaccion.Punto = punto.Nombre;
            const tercero = terceros.find(x => x.IdPersona === punto.IdPersona);
            if (tercero) {
              transaccion.Tercero = `${tercero.Nombre} - ${nombre}`;
            }

            // Build location string
            if (punto.Localizacion) {
              ubicacion = punto.Direccion
                ? `${punto.Localizacion}-${punto.Direccion}`
                : punto.Localizacion;
            } else if (punto.Direccion) {
              ubicacion = punto.Direccion;
            }

            transaccion.Ubicacion = ubicacion;
            // Set operation type based on input/output
            if (transaccion.EntradaSalida === INPUT_OUTPUT.TRANSFERENCE)
              operacion = INPUT_OUTPUT.TRANSFERENCE;
            else if (transaccion.EntradaSalida === INPUT_OUTPUT.INPUT)
              operacion = INPUT_OUTPUT.INPUT;
            else if (transaccion.EntradaSalida === INPUT_OUTPUT.OUTPUT)
              operacion = INPUT_OUTPUT.OUTPUT;
          }
        }
        // Handle third party-based transactions
        else if (transaccion.IdTercero != null) {
          const tercero = terceros.find(x => x.IdPersona === transaccion.IdTercero);
          if (tercero) {
            transaccion.Tercero = tercero.Nombre;
            transaccion.Icono = 'person';
          }
        }

        // Set action and title
        transaccion.Accion = Utils.getInputOutputAction(operacion ?? '');
        transaccion.Titulo = `${transaccion.Solicitudes}-${transaccion.Tercero}-${transaccion.Punto ?? ''}`;

        return transaccion;
      });
    } catch (error) {
      this.logger.error('Error listing transactions', { idActividad, error });
      throw error;
    }
  }

  /**
   * Gets a specific transaction by activity and transaction IDs
   *
   * @param idActividad - The activity ID
   * @param idTransaccion - The transaction ID
   * @returns Promise<Transaccion | undefined> - The transaction if found
   * @throws {Error} If retrieval fails
   */
  async get(idActividad: string, idTransaccion: string): Promise<Transaccion | undefined> {
    try {
      const transaction = this.transactionService.getTransaction();
      if (!transaction) return undefined;

      const transaccion = transaction.Transacciones.find(
        x => x.IdActividad === idActividad && x.IdTransaccion === idTransaccion
      );

      // Set default title if not present
      if (transaccion && (!transaccion.Titulo || transaccion.Titulo === '')) {
        transaccion.Titulo = `${transaccion.Tercero}-${transaccion.Punto ?? ''}`;
      }

      return transaccion;
    } catch (error) {
      this.logger.error('Error getting transaction', { idActividad, idTransaccion, error });
      throw error;
    }
  }

  /**
   * Gets a transaction by activity and point IDs
   *
   * @param idActividad - The activity ID
   * @param idPunto - The point ID
   * @returns Promise<Transaccion | undefined> - The transaction if found
   * @throws {Error} If retrieval fails
   */
  async getByPoint(idActividad: string, idPunto: string): Promise<Transaccion | undefined> {
    try {
      const transaction = this.transactionService.getTransaction();
      if (!transaction) return undefined;

      return transaction.Transacciones.find(
        x => x.IdActividad === idActividad && x.IdDeposito === idPunto
      );
    } catch (error) {
      this.logger.error('Error getting transaction by point', { idActividad, idPunto, error });
      throw error;
    }
  }

  /**
   * Gets a transaction by activity and third party IDs
   *
   * @param idActividad - The activity ID
   * @param idTercero - The third party ID
   * @returns Promise<Transaccion | undefined> - The transaction if found
   * @throws {Error} If retrieval fails
   */
  async getByThirdParty(idActividad: string, idTercero: string): Promise<Transaccion | undefined> {
    try {
      const transaction = this.transactionService.getTransaction();
      if (!transaction) return undefined;

      return transaction.Transacciones.find(
        x => x.IdActividad === idActividad && x.IdTercero === idTercero
      );
    } catch (error) {
      this.logger.error('Error getting transaction by third party', { idActividad, idTercero, error });
      throw error;
    }
  }

  /**
   * Creates a new transaction
   *
   * @param transaccion - The transaction to create
   * @throws {Error} If creation fails
   */
  async create(transaccion: Transaccion): Promise<void> {
    try {
      const now = new Date().toISOString();
      const transaction = this.transactionService.getTransaction();

      if (transaction) {
        transaccion.FechaInicial = now;
        transaction.Transacciones.push(transaccion);
        this.transactions.set(transaction.Transacciones);
        this.transactionService.setTransaction(transaction);
        await this.saveTransaction();
        await this.requestsService.create(DATA_TYPE.TRANSACTION, CRUD_OPERATIONS.CREATE, transaccion);
        await this.synchronizationService.uploadData();
      }
    } catch (error) {
      this.logger.error('Error creating transaction', { transaccion, error });
      throw error;
    }
  }

  /**
   * Updates an existing transaction
   *
   * @param transaccion - The transaction to update
   * @throws {Error} If update fails
   */
  async update(transaccion: Transaccion): Promise<void> {
    try {
      const now = new Date().toISOString();
      const transaction = this.transactionService.getTransaction();

      if (transaction) {
        const index = transaction.Transacciones.findIndex(
          x => x.IdActividad === transaccion.IdActividad && x.IdTransaccion === transaccion.IdTransaccion
        );

        if (index !== -1) {
          transaction.Transacciones[index] = {
            ...transaction.Transacciones[index],
            FechaFinal: now,
            IdEstado: transaccion.IdEstado,
            Cantidad: transaccion.Cantidad,
            Peso: transaccion.Peso,
            Volumen: transaccion.Volumen,
            Observaciones: transaccion.Observaciones
          };

          this.transactions.set(transaction.Transacciones);
          this.transactionService.setTransaction(transaction);
          await this.saveTransaction();
          await this.requestsService.create(DATA_TYPE.TRANSACTION, CRUD_OPERATIONS.UPDATE, transaccion);
          await this.synchronizationService.uploadData();
        }
      }
    } catch (error) {
      this.logger.error('Error updating transaction', { transaccion, error });
      throw error;
    }
  }

  /**
   * Loads transactions for a specific activity
   *
   * @param idActividad - The activity ID to load transactions for
   * @throws {Error} If loading fails
   */
  async load(idActividad: string): Promise<void> {
    try {
      const transactions = await this.list(idActividad);
      this.transactions.set(transactions);
    } catch (error) {
      this.logger.error('Error loading transactions', { idActividad, error });
      this.transactions.set([]);
    }
  }
}
