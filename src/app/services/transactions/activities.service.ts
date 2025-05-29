import { Injectable, signal } from '@angular/core';
import { Actividad } from '@app/interfaces/actividad.interface';
import { StorageService } from '@app/services/core/storage.service';
import { CRUD_OPERATIONS, STATUS, SERVICES, STORAGE, DATA_TYPE } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';
import { RequestsService } from '../core/requests.service';
import { SynchronizationService } from '../core/synchronization.service';
import { LoggerService } from '@app/services/core/logger.service';
import { TransactionService } from '@app/services/core/transaction.service';

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
  /** Signal containing the list of activities */
  public activities = signal<Actividad[]>([]);
  public transaction$ = this.transactionService.transaction$;

  constructor(
    private requestsService: RequestsService,
    private synchronizationService: SynchronizationService,
    private readonly logger: LoggerService,
    private transactionService: TransactionService
  ) {
    this.loadTransaction();
  }

  /**
   * Loads the current transaction from storage
   * @private
   */
  private async loadTransaction() {
    try {
      await this.transactionService.loadTransaction();
      const transaction = this.transactionService.getTransaction();
      if (transaction?.Actividades) {
        const activities = transaction.Actividades.map(actividad => {
          const servicio = SERVICES.find(s => s.serviceId === actividad.IdServicio);
          return {
            ...actividad,
            Icono: servicio?.Icon || '',
            Accion: servicio?.Action || ''
          };
        });
        this.activities.set(activities);
      } else {
        this.activities.set([]);
      }
    } catch (error) {
      this.logger.error('Error loading transaction', error);
      this.activities.set([]);
    }
  }

  /**
   * Saves the current transaction to storage
   * @private
   * @throws Error if saving fails
   */
  private async saveTransaction() {
    try {
      const transaction = this.transactionService.getTransaction();
      if (transaction) {
        transaction.Actividades = this.activities();
        this.transactionService.setTransaction(transaction);
        await this.transactionService.saveTransaction();
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
      const transaction = this.transactionService.getTransaction();

      if (!transaction?.Actividades) {
        this.activities.set([]);
        return;
      }

      const activities = transaction.Actividades.map(actividad => {
        const servicio = SERVICES.find(s => s.serviceId === actividad.IdServicio);
        return {
          ...actividad,
          Icono: servicio?.Icon || '',
          Accion: servicio?.Action || ''
        };
      });

      this.activities.set(activities);
    } catch (error) {
      console.error('Error loading activities:', error);
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
      const transaction = this.transactionService.getTransaction();

      if (!transaction?.Actividades) {
        return [];
      }

      const activities = transaction.Actividades.map(actividad => {
        const servicio = SERVICES.find(s => s.serviceId === actividad.IdServicio);
        return {
          ...actividad,
          Icono: servicio?.Icon || '',
          Accion: servicio?.Action || ''
        };
      });

      return activities;
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
      const transaction = this.transactionService.getTransaction();
      if (!transaction?.Actividades) return undefined;

      const actividad = transaction.Actividades.find(item => item.IdActividad === idActividad);
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
      const transaction = this.transactionService.getTransaction();
      if (!transaction?.Actividades) return undefined;

      return transaction.Actividades.find(
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
      const transaction = this.transactionService.getTransaction();

      if (!transaction) {
        return false;
      }

      actividad.FechaInicial = now;
      actividad.LatitudInicial = latitud;
      actividad.LatitudInicial = longitud;

      transaction.Actividades.push(actividad);
      this.activities.set(transaction.Actividades);
      this.transactionService.setTransaction(transaction);
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
      const transaction = this.transactionService.getTransaction();

      if (!transaction) {
        return false;
      }

      const activityIndex = transaction.Actividades.findIndex(
        item => item.IdActividad === actividad.IdActividad
      );

      if (activityIndex === -1) {
        return false;
      }

      transaction.Actividades[activityIndex] = {
        ...transaction.Actividades[activityIndex],
        FechaFinal: now,
        IdEstado: actividad.IdEstado,
        CantidadCombustibleFinal: actividad.CantidadCombustibleFinal,
        KilometrajeFinal: actividad.KilometrajeFinal,
        ResponsableCargo: actividad.ResponsableCargo,
        ResponsableFirma: actividad.ResponsableFirma,
        ResponsableIdentificacion: actividad.ResponsableIdentificacion,
        ResponsableNombre: actividad.ResponsableNombre,
        ResponsableObservaciones: actividad.ResponsableObservaciones
      };

      const tareas = transaction.Tareas.filter(
        x => x.IdActividad === actividad.IdActividad && x.IdEstado === STATUS.PENDING
      );
      tareas.forEach(x => { x.IdEstado = STATUS.REJECTED });

      const transacciones = transaction.Transacciones.filter(
        x => x.IdActividad === actividad.IdActividad && x.IdEstado === STATUS.PENDING
      );
      transacciones.forEach(x => {
        x.FechaInicial = now;
        x.IdEstado = STATUS.REJECTED;
      });

      this.activities.set(transaction.Actividades);
      this.transactionService.setTransaction(transaction);
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
      const transaction = this.transactionService.getTransaction();

      if (!transaction) {
        return false;
      }

      const current = transaction.Actividades.find(
        item => item.IdActividad === actividad.IdActividad
      );

      if (!current) {
        return false;
      }

      current.FechaInicial = now;
      current.IdEstado = actividad.IdEstado;
      current.KilometrajeInicial = actividad.KilometrajeInicial;
      current.CantidadCombustibleInicial = actividad.CantidadCombustibleInicial;

      this.transactionService.setTransaction(transaction);
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
