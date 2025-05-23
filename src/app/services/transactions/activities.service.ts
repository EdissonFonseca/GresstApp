import { Injectable, signal } from '@angular/core';
import { Actividad } from '@app/interfaces/actividad.interface';
import { StorageService } from '@app/services/core/storage.service';
import { CRUD_OPERATIONS, STATUS, SERVICES, STORAGE, DATA_TYPE } from '@app/constants/constants';
import { Transaction } from '@app/interfaces/transaction.interface';
import { Utils } from '@app/utils/utils';
import { RequestsService } from '../core/requests.service';
import { SynchronizationService } from '../core/synchronization.service';
import { LoggerService } from '@app/services/core/logger.service';

/**
 * ActivitiesService
 *
 * Service responsible for managing activities in the system.
 * Handles CRUD operations for activities, including:
 * - Creating new activities
 * - Updating existing activities
 * - Retrieving activity information
 * - Managing activity states
 * - Synchronizing activity data
 */
@Injectable({
  providedIn: 'root',
})
export class ActivitiesService {
  /** Signal containing the current transaction */
  private transaction = signal<Transaction | null>(null);
  /** Readonly signal for external access to transaction */
  public transaction$ = this.transaction.asReadonly();

  /** Signal containing the list of activities */
  public activities = signal<Actividad[]>([]);

  constructor(
    private storage: StorageService,
    private requestsService: RequestsService,
    private synchronizationService: SynchronizationService,
    private readonly logger: LoggerService
  ) {
    this.loadTransaction();
  }

  /**
   * Loads the current transaction from storage
   * @private
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
   * @private
   * @throws Error if saving fails
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
   * Loads activities from the transaction and updates the activities signal
   * @returns Promise<void>
   */
  async load(): Promise<void> {
    try {
      const activities = await this.list();
      this.activities.set(activities);
    } catch (error) {
      this.logger.error('Error loading activities', error);
      this.activities.set([]);
    }
  }

  /**
   * Lists all activities in the current transaction
   * @returns Promise<Actividad[]> Array of activities with service information
   * @throws Error if listing fails
   */
  async list(): Promise<Actividad[]> {
    try {
      const currentTransaction = this.transaction();
      if (!currentTransaction?.Actividades) return [];

      return currentTransaction.Actividades.map(actividad => {
        const servicio = SERVICES.find(s => s.serviceId === actividad.IdServicio);
        return {
          ...actividad,
          Icono: servicio?.Icon || '',
          Accion: servicio?.Action || ''
        };
      });
    } catch (error) {
      this.logger.error('Error listing activities', error);
      throw error;
    }
  }

  /**
   * Gets a specific activity by ID
   * @param idActividad - The ID of the activity to retrieve
   * @returns Promise<Actividad | undefined> The activity if found, undefined otherwise
   * @throws Error if retrieval fails
   */
  async get(idActividad: string): Promise<Actividad | undefined> {
    try {
      const currentTransaction = this.transaction();
      if (!currentTransaction?.Actividades) return undefined;

      const actividad = currentTransaction.Actividades.find(item => item.IdActividad === idActividad);
      if (!actividad) return undefined;

      const servicio = SERVICES.find(s => s.serviceId === actividad.IdServicio);
      return {
        ...actividad,
        Icono: servicio?.Icon || '',
        Accion: servicio?.Action || ''
      };
    } catch (error) {
      this.logger.error('Error getting activity', { idActividad, error });
      throw error;
    }
  }

  /**
   * Gets an activity by service and resource IDs
   * @param idServicio - The service ID
   * @param idRecurso - The resource ID
   * @returns Promise<Actividad | undefined> The activity if found, undefined otherwise
   * @throws Error if retrieval fails
   */
  async getByServiceAndResource(idServicio: string, idRecurso: string): Promise<Actividad | undefined> {
    try {
      const currentTransaction = this.transaction();
      if (!currentTransaction?.Actividades) return undefined;

      return currentTransaction.Actividades.find(
        item => item.IdServicio === idServicio && item.IdRecurso === idRecurso
      );
    } catch (error) {
      this.logger.error('Error getting activity by service', { idServicio, idRecurso, error });
      throw error;
    }
  }

  /**
   * Creates a new activity
   * @param actividad - The activity to create
   * @returns Promise<boolean> True if creation was successful
   * @throws Error if creation fails
   */
  async create(actividad: Actividad): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const [latitud, longitud] = await Utils.getCurrentPosition();
      const currentTransaction = this.transaction();

      if (!currentTransaction) {
        return false;
      }

      actividad.FechaInicial = now;
      actividad.LatitudInicial = latitud;
      actividad.LatitudInicial = longitud;

      currentTransaction.Actividades.push(actividad);
      await this.saveTransaction();
      await this.requestsService.create(DATA_TYPE.ACTIVITY, CRUD_OPERATIONS.CREATE, actividad);
      await this.synchronizationService.uploadData();
      return true;
    } catch (error) {
      this.logger.error('Error creating activity', { actividad, error });
      throw error;
    }
  }

  /**
   * Updates an existing activity
   * @param actividad - The activity to update
   * @returns Promise<boolean> True if update was successful
   * @throws Error if update fails
   */
  async update(actividad: Actividad): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const currentTransaction = this.transaction();

      if (!currentTransaction) {
        return false;
      }

      const current = currentTransaction.Actividades.find(
        item => item.IdActividad === actividad.IdActividad
      );

      if (!current) {
        return false;
      }

      current.FechaFinal = now;
      current.IdEstado = actividad.IdEstado;
      current.CantidadCombustibleFinal = actividad.CantidadCombustibleFinal;
      current.KilometrajeFinal = actividad.KilometrajeFinal;
      current.ResponsableCargo = actividad.ResponsableCargo;
      current.ResponsableFirma = actividad.ResponsableFirma;
      current.ResponsableIdentificacion = actividad.ResponsableIdentificacion;
      current.ResponsableNombre = actividad.ResponsableNombre;
      current.ResponsableObservaciones = actividad.ResponsableObservaciones;

      const tareas = currentTransaction.Tareas.filter(
        x => x.IdActividad === actividad.IdActividad && x.IdEstado === STATUS.PENDING
      );
      tareas.forEach(x => { x.IdEstado = STATUS.REJECTED });

      const transacciones = currentTransaction.Transacciones.filter(
        x => x.IdActividad === actividad.IdActividad && x.IdEstado === STATUS.PENDING
      );
      transacciones.forEach(x => {
        x.FechaInicial = now;
        x.IdEstado = STATUS.REJECTED;
      });

      await this.saveTransaction();
      await this.requestsService.create(DATA_TYPE.ACTIVITY, CRUD_OPERATIONS.UPDATE, actividad);
      await this.synchronizationService.uploadData();
      return true;
    } catch (error) {
      this.logger.error('Error updating activity', { actividad, error });
      throw error;
    }
  }

  /**
   * Updates the start information of an activity
   * @param actividad - The activity to update
   * @returns Promise<boolean> True if update was successful
   * @throws Error if update fails
   */
  async updateStart(actividad: Actividad): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const currentTransaction = this.transaction();

      if (!currentTransaction) {
        return false;
      }

      const current = currentTransaction.Actividades.find(
        item => item.IdActividad === actividad.IdActividad
      );

      if (!current) {
        return false;
      }

      current.FechaInicial = now;
      current.IdEstado = actividad.IdEstado;
      current.KilometrajeInicial = actividad.KilometrajeInicial;
      current.CantidadCombustibleInicial = actividad.CantidadCombustibleInicial;

      await this.saveTransaction();
      await this.requestsService.create(DATA_TYPE.START_ACTIVITY, CRUD_OPERATIONS.UPDATE, actividad);
      await this.synchronizationService.uploadData();
      return true;
    } catch (error) {
      this.logger.error('Error updating activity start', { actividad, error });
      throw error;
    }
  }
}
