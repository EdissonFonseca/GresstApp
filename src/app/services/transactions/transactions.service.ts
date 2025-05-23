import { Injectable, signal } from '@angular/core';
import { StorageService } from '../core/storage.service';
import { Transaccion } from '../../interfaces/transaccion.interface';
import { TasksService } from './tasks.service';
import { CRUD_OPERATIONS, DATA_TYPE, INPUT_OUTPUT, STATUS, STORAGE } from '@app/constants/constants';
import { PointsService } from '@app/services/masterdata/points.service';
import { ThirdpartiesService } from '@app/services/masterdata/thirdparties.service';
import { Transaction } from '../../interfaces/transaction.interface';
import { Utils } from '@app/utils/utils';
import { RequestsService } from '../core/requests.service';
import { SynchronizationService } from '../core/synchronization.service';
import { LoggerService } from '@app/services/core/logger.service';

@Injectable({
  providedIn: 'root',
})
export class TransactionsService {
  private transaction = signal<Transaction | null>(null);
  public transaction$ = this.transaction.asReadonly();

  /** Signal containing the list of transactions for the current activity */
  public transactions = signal<Transaccion[]>([]);

  constructor(
    private storage: StorageService,
    private tasksService: TasksService,
    private pointsService: PointsService,
    private thirdpartiesService: ThirdpartiesService,
    private requestsService: RequestsService,
    private synchronizationService: SynchronizationService,
    private readonly logger: LoggerService
  ) {
    this.loadTransaction();
  }

  private async loadTransaction() {
    try {
      const transaction = await this.storage.get(STORAGE.TRANSACTION) as Transaction;
      this.transaction.set(transaction);
    } catch (error) {
      this.logger.error('Error loading transaction', error);
      this.transaction.set(null);
    }
  }

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

  async getSummary(idActividad: string, idTransaccion: string): Promise<{ aprobados: number; pendientes: number; rechazados: number; cantidad: number; peso: number; volumen: number }> {
    try {
      const tareas = await this.tasksService.list(idActividad, idTransaccion);

      const resultado = tareas.reduce(
        (acumulador, tarea) => {
          if (tarea.IdEstado === STATUS.APPROVED) {
            acumulador.aprobados += 1;
            acumulador.cantidad += tarea.Cantidad ?? 0;
            acumulador.peso += tarea.Peso ?? 0;
            acumulador.volumen += tarea.Volumen ?? 0;
          } else if (tarea.IdEstado === STATUS.PENDING) {
            acumulador.pendientes += 1;
          } else if (tarea.IdEstado === STATUS.REJECTED) {
            acumulador.rechazados += 1;
          }
          return acumulador;
        },
        { aprobados: 0, pendientes: 0, rechazados: 0, cantidad: 0, peso: 0, volumen: 0 }
      );

      return resultado;
    } catch (error) {
      this.logger.error('Error getting transaction summary', { idActividad, idTransaccion, error });
      throw error;
    }
  }

  async list(idActividad: string): Promise<Transaccion[]> {
    try {
      const currentTransaction = this.transaction();
      if (!currentTransaction) return [];

      const transacciones = currentTransaction.Transacciones.filter(x => x.IdActividad === idActividad);
      const puntos = await this.pointsService.list();
      const terceros = await this.thirdpartiesService.list();
      const tareas = await this.tasksService.list(idActividad);

      return transacciones.map(transaccion => {
        let operacion = transaccion.EntradaSalida;
        let nombre = '';
        let ubicacion = '';

        const tareasTransaccion = tareas.filter(x => x.IdTransaccion === transaccion.IdTransaccion);

        if (transaccion.IdDeposito != null) {
          transaccion.Icono = 'location-outline';
          const punto = puntos.find(x => x.IdDeposito === transaccion.IdDeposito);
          if (punto) {
            transaccion.Punto = punto.Nombre;
            const tercero = terceros.find(x => x.IdPersona === punto.IdPersona);
            if (tercero) {
              transaccion.Tercero = `${tercero.Nombre} - ${nombre}`;
            }

            if (punto.Localizacion) {
              ubicacion = punto.Direccion
                ? `${punto.Localizacion}-${punto.Direccion}`
                : punto.Localizacion;
            } else if (punto.Direccion) {
              ubicacion = punto.Direccion;
            }

            transaccion.Ubicacion = ubicacion;
            if (transaccion.EntradaSalida === INPUT_OUTPUT.TRANSFERENCE)
              operacion = INPUT_OUTPUT.TRANSFERENCE;
            else if (transaccion.EntradaSalida === INPUT_OUTPUT.INPUT)
              operacion = INPUT_OUTPUT.INPUT;
            else if (transaccion.EntradaSalida === INPUT_OUTPUT.OUTPUT)
              operacion = INPUT_OUTPUT.OUTPUT;
          }
        } else if (transaccion.IdTercero != null) {
          const tercero = terceros.find(x => x.IdPersona === transaccion.IdTercero);
          if (tercero) {
            transaccion.Tercero = tercero.Nombre;
            transaccion.Icono = 'person';
          }
        }

        transaccion.Accion = Utils.getInputOutputAction(operacion ?? '');
        transaccion.Titulo = `${transaccion.Solicitudes}-${transaccion.Tercero}-${transaccion.Punto ?? ''}`;

        return transaccion;
      });
    } catch (error) {
      this.logger.error('Error listing transactions', { idActividad, error });
      throw error;
    }
  }

  async get(idActividad: string, idTransaccion: string): Promise<Transaccion | undefined> {
    try {
      const currentTransaction = this.transaction();
      if (!currentTransaction) return undefined;

      const transaccion = currentTransaction.Transacciones.find(
        x => x.IdActividad === idActividad && x.IdTransaccion === idTransaccion
      );

      if (transaccion && (!transaccion.Titulo || transaccion.Titulo === '')) {
        transaccion.Titulo = `${transaccion.Tercero}-${transaccion.Punto ?? ''}`;
      }

      return transaccion;
    } catch (error) {
      this.logger.error('Error getting transaction', { idActividad, idTransaccion, error });
      throw error;
    }
  }

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

  async update(transaccion: Transaccion): Promise<void> {
    try {
      const now = new Date().toISOString();
      const currentTransaction = this.transaction();

      if (currentTransaction) {
        const current = currentTransaction.Transacciones.find(
          (trx) => trx.IdActividad === transaccion.IdActividad && trx.IdTransaccion === transaccion.IdTransaccion
        );

        if (current) {
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
   * Load transactions for a specific activity and update the transactions signal
   * @param idActividad - The activity ID to load transactions for
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
