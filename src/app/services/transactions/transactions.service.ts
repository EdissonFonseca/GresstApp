import { Injectable, signal } from '@angular/core';
import { StorageService } from '../core/storage.service';
import { Transaccion } from '../../interfaces/transaccion.interface';
import { CRUD_OPERATIONS, DATA_TYPE, INPUT_OUTPUT, STATUS, STORAGE } from '@app/constants/constants';
import { PointsService } from '@app/services/masterdata/points.service';
import { ThirdpartiesService } from '@app/services/masterdata/thirdparties.service';
import { Transaction } from '../../interfaces/transaction.interface';
import { Utils } from '@app/utils/utils';
import { RequestsService } from '../core/requests.service';
import { SynchronizationService } from '../core/synchronization.service';
import { LoggerService } from '@app/services/core/logger.service';

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
  /** Signal containing the current transaction */
  private transaction = signal<Transaction | null>(null);
  public transaction$ = this.transaction.asReadonly();

  /** Signal containing the list of transactions for the current activity */
  public transactions = signal<Transaccion[]>([]);

  constructor(
    private storage: StorageService,
    private pointsService: PointsService,
    private thirdpartiesService: ThirdpartiesService,
    private requestsService: RequestsService,
    private synchronizationService: SynchronizationService,
    private readonly logger: LoggerService
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
      const transaction = await this.storage.get(STORAGE.TRANSACTION) as Transaction;
      this.transaction.set(transaction);
    } catch (error) {
      this.logger.error('Error loading transaction', error);
      this.transaction.set(null);
    }
  }

  /**
   * Saves the current transaction to storage
   * Updates the transaction signal with the saved data
   * @throws {Error} If saving fails
   */
  private async saveTransaction() {
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
      const currentTransaction = this.transaction();
      if (!currentTransaction) return [];

      // Filter transactions by activity ID
      const transacciones = currentTransaction.Transacciones.filter(x => x.IdActividad === idActividad);

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
      const currentTransaction = this.transaction();
      if (!currentTransaction) return undefined;

      const transaccion = currentTransaction.Transacciones.find(
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
      const currentTransaction = this.transaction();
      if (!currentTransaction) return undefined;

      return currentTransaction.Transacciones.find(
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
      const currentTransaction = this.transaction();
      if (!currentTransaction) return undefined;

      return currentTransaction.Transacciones.find(
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
      const currentTransaction = this.transaction();

      if (currentTransaction) {
        transaccion.FechaInicial = now;
        currentTransaction.Transacciones.push(transaccion);
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
   * Also updates associated pending tasks to rejected status
   *
   * @param transaccion - The transaction to update
   * @throws {Error} If update fails
   */
  async update(transaccion: Transaccion): Promise<void> {
    try {
      const now = new Date().toISOString();
      const currentTransaction = this.transaction();

      if (currentTransaction) {
        const current = currentTransaction.Transacciones.find(
          (trx) => trx.IdActividad === transaccion.IdActividad && trx.IdTransaccion === transaccion.IdTransaccion
        );

        if (current) {
          // Update transaction fields
          current.IdEstado = transaccion.IdEstado;
          if (current.FechaInicial == null) current.FechaInicial = now;
          current.FechaFinal = now;
          current.ResponsableCargo = transaccion.ResponsableCargo;
          current.ResponsableFirma = transaccion.ResponsableFirma;
          current.ResponsableIdentificacion = transaccion.ResponsableIdentificacion;
          current.ResponsableNombre = transaccion.ResponsableNombre;
          current.ResponsableObservaciones = transaccion.ResponsableObservaciones;
          current.CantidadCombustible = transaccion.CantidadCombustible;
          current.CostoCombustible = transaccion.CostoCombustible;
          current.Kilometraje = transaccion.Kilometraje;

          // Update associated pending tasks to rejected
          const tareas = currentTransaction.Tareas.filter(
            x => x.IdActividad === transaccion.IdActividad &&
                 x.IdTransaccion === transaccion.IdTransaccion &&
                 x.IdEstado === STATUS.PENDING
          );

          tareas.forEach(x => {
            x.IdEstado = STATUS.REJECTED;
            x.FechaEjecucion = now;
          });

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
   * Loads transactions for a specific activity and updates the transactions signal
   *
   * @param idActividad - The activity ID to load transactions for
   * @throws {Error} If loading fails
   */
  async loadTransactions(idActividad: string): Promise<void> {
    try {
      const transactions = await this.list(idActividad);
      this.transactions.set(transactions);
    } catch (error) {
      this.logger.error('Error loading transactions', { idActividad, error });
      this.transactions.set([]);
    }
  }
}
