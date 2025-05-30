import { Injectable, signal } from '@angular/core';
import { Actividad } from '@app/interfaces/actividad.interface';
import { CRUD_OPERATIONS, STATUS, SERVICES, STORAGE, DATA_TYPE } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';
import { RequestsService } from '../core/requests.service';
import { SynchronizationService } from '../core/synchronization.service';
import { LoggerService } from '@app/services/core/logger.service';
import { WorkflowService } from '@app/services/core/workflow.service';
import { Transaccion } from '@app/interfaces/transaccion.interface';

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
  public transaction$ = this.workflowService.transaction$;

  constructor(
    private requestsService: RequestsService,
    private synchronizationService: SynchronizationService,
    private readonly logger: LoggerService,
    private workflowService: WorkflowService
  ) {
    this.loadTransaction();
  }

  /**
   * Loads the current transaction from storage
   * @private
   */
  private async loadTransaction() {
    try {
      await this.workflowService.loadTransaction();
      const transaction = this.workflowService.getTransaction();
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
      const transaction = this.workflowService.getTransaction();
      if (transaction) {
        transaction.Actividades = this.activities();
        this.workflowService.setTransaction(transaction);
        await this.workflowService.saveTransaction();
      }
    } catch (error) {
      this.logger.error('Error saving transaction', error);
      throw error;
    }
  }

  /**
   * Lists all activities in the current transaction
   * @returns Promise<Actividad[]> Array of activities with service information
   * @throws Error if listing fails
   */
  async list(): Promise<Actividad[]> {
    try {
      const transaction = this.workflowService.getTransaction();

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
      const transaction = this.workflowService.getTransaction();
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
      const transaction = this.workflowService.getTransaction();
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
   * Gets the summary of an activity
   * @param activity - The activity to get the summary of
   * @returns Promise<string> The summary of the activity
   */
  getSummary(activity: Actividad): string {
    let summary: string = '';
    if ((activity.quantity ?? 0) > 0) {
      summary = `${activity.quantity} ${Utils.quantityUnit}`;
    }
    if ((activity.weight ?? 0) > 0) {
      if (summary !== '')
        summary += `/${activity.weight} ${Utils.weightUnit}`;
      else
        summary = `${activity.weight} ${Utils.weightUnit}`;
    }
    if ((activity.volume ?? 0) > 0) {
      if (summary !== '')
        summary += `/${activity.volume} ${Utils.volumeUnit}`;
      else
        summary = `${activity.volume} ${Utils.volumeUnit}`;
    }
    return summary;
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
      const transaction = this.workflowService.getTransaction();

      if (!transaction) {
        return false;
      }

      actividad.FechaInicial = now;
      actividad.LatitudInicial = latitud;
      actividad.LatitudInicial = longitud;

      //Set activity summary properties
      actividad.pending = 0;
      actividad.approved = 0;
      actividad.rejected = 0;
      actividad.quantity = 0;
      actividad.weight = 0;
      actividad.volume = 0;

      transaction.Actividades.push(actividad);
      this.activities.set(transaction.Actividades);
      this.workflowService.setTransaction(transaction);
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
      const transaction = this.workflowService.getTransaction();

      if (!transaction) {
        return false;
      }

      const activityIndex = transaction.Actividades.findIndex(
        item => item.IdActividad === actividad.IdActividad
      );

      if (activityIndex === -1) {
        return false;
      }

      // Find all pending tasks for this activity and mark them as rejected
      const pendingTasks = transaction.Tareas.filter(
        task => task.IdActividad === actividad.IdActividad && task.IdEstado === STATUS.PENDING
      );

      // Update each pending task to rejected status
      pendingTasks.forEach(task => {
        task.IdEstado = STATUS.REJECTED;
        // Update task summary properties
        task.pending = 0;
        task.approved = 0;
        task.rejected = 1;
        task.quantity = 0;
        task.weight = 0;
        task.volume = 0;
      });

      // Find all pending transactions for this activity and mark them as rejected
      const pendingTransactions = transaction.Transacciones.filter(
        trans => trans.IdActividad === actividad.IdActividad && trans.IdEstado === STATUS.PENDING
      );

      // Update each pending transaction to rejected status
      pendingTransactions.forEach(trans => {
        trans.IdEstado = STATUS.APPROVED;
        trans.FechaFinal = now;
      });

      // Calculate activity summary from all tasks
      const allTasks = transaction.Tareas.filter(task => task.IdActividad === actividad.IdActividad);
      const summary = allTasks.reduce((acc, task) => {
        if (task.IdEstado === STATUS.PENDING) {
          acc.pending += 1;
        } else if (task.IdEstado === STATUS.APPROVED) {
          acc.approved += 1;
          acc.quantity += task.Cantidad ?? 0;
          acc.weight += task.Peso ?? 0;
          acc.volume += task.Volumen ?? 0;
        } else if (task.IdEstado === STATUS.REJECTED) {
          acc.rejected += 1;
        }
        return acc;
      }, { pending: 0, approved: 0, rejected: 0, quantity: 0, weight: 0, volume: 0 });

      // Update activity with new values and calculated summary
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
        ResponsableObservaciones: actividad.ResponsableObservaciones,
        // Update activity summary properties from tasks
        pending: summary.pending,
        approved: summary.approved,
        rejected: summary.rejected,
        quantity: summary.quantity,
        weight: summary.weight,
        volume: summary.volume
      };

      this.activities.set(transaction.Actividades);
      this.workflowService.setTransaction(transaction);
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
    console.log('updateStart', actividad);
    try {
      const now = new Date().toISOString();
      const transaction = this.workflowService.getTransaction();

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

      this.activities.set(transaction.Actividades);
      this.workflowService.setTransaction(transaction);
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
