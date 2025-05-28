import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { Tarea } from '@app/interfaces/tarea.interface';
import { Actividad } from '../../interfaces/actividad.interface';
import { INPUT_OUTPUT, STATUS, SERVICE_TYPES, STORAGE, CRUD_OPERATIONS, DATA_TYPE } from '@app/constants/constants';
import { Transaction } from '@app/interfaces/transaction.interface';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { TreatmentsService } from '@app/services/masterdata/treatments.service';
import { PackagingService } from '@app/services/masterdata/packaging.service';
import { PointsService } from '@app/services/masterdata/points.service';
import { ThirdpartiesService } from '@app/services/masterdata/thirdparties.service';
import { Utils } from '@app/utils/utils';
import { RequestsService } from '../core/requests.service';
import { SynchronizationService } from '../core/synchronization.service';
import { LoggerService } from '@app/services/core/logger.service';
import { TransactionService } from '@app/services/core/transaction.service';

/**
 * TasksService
 *
 * Service responsible for managing tasks in the application.
 * Handles CRUD operations for tasks, including:
 * - Task creation and updates
 * - Task listing and filtering
 * - Task synchronization
 * - Task status management
 * - Task suggestions generation
 */
@Injectable({
  providedIn: 'root',
})
export class TasksService {
  /** Signal containing the list of tasks */
  private tasks = signal<Tarea[]>([]);
  public tasks$ = this.tasks.asReadonly();
  public transaction$ = this.transactionService.transaction$;

  constructor(
    private storage: StorageService,
    private materialsService: MaterialsService,
    private treatmentsService: TreatmentsService,
    private packagingService: PackagingService,
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
   */
  private async loadTransaction() {
    try {
      await this.transactionService.loadTransaction();
      const transaction = this.transactionService.getTransaction();
      this.tasks.set(transaction?.Tareas || []);
    } catch (error) {
      this.logger.error('Error loading transaction', error);
      this.tasks.set([]);
    }
  }

  /**
   * Saves the current transaction to storage
   * Updates the transaction signal with the saved data
   */
  private async saveTransaction() {
    try {
      const transaction = this.transactionService.getTransaction();
      if (transaction) {
        transaction.Tareas = this.tasks();
        this.transactionService.setTransaction(transaction);
        await this.transactionService.saveTransaction();
      }
    } catch (error) {
      this.logger.error('Error saving transaction', error);
      throw error;
    }
  }

  /**
   * Loads tasks for a specific activity and updates the tasks signal
   * @param activityId - The activity ID to load tasks for
   * @param transactionId - Optional transaction ID to filter tasks
   */
  async load(activityId: string, transactionId?: string): Promise<void> {
    try {
      const tasks = await this.list(activityId, transactionId);
      this.tasks.set(tasks);
    } catch (error) {
      this.logger.error('Error loading tasks', { activityId, transactionId, error });
      this.tasks.set([]);
    }
  }

  /**
   * Get summary of tasks for a specific activity
   * Calculates totals for different task statuses and their associated quantities
   *
   * @param activityId - The ID of the activity to filter tasks
   * @param transactionId - Optional transaction ID to further filter tasks
   * @returns {Object} Summary object containing:
   *   - total: Total number of tasks
   *   - pending: Number of pending tasks
   *   - completed: Number of completed tasks
   *   - approved: Number of approved tasks
   *   - rejected: Number of rejected tasks
   *   - quantity: Total quantity from completed and approved tasks
   *   - weight: Total weight from completed and approved tasks
   *   - volume: Total volume from completed and approved tasks
   */
  getSummary(activityId: string, transactionId?: string) {
    // Get all tasks from the signal
    const tasks = this.tasks();

    // Filter tasks by activity ID
    let filteredTasks = tasks.filter((task: Tarea) => task.IdActividad === activityId);

    // Apply additional filter by transaction ID if provided
    if (transactionId) {
      filteredTasks = filteredTasks.filter((task: Tarea) => task.IdTransaccion === transactionId);
    }

    // Calculate summary using reduce to accumulate totals
    const summary = filteredTasks.reduce(
      (accumulator, task: Tarea) => {
        // Handle completed tasks
        if (task.IdEstado === STATUS.FINISHED) {
          accumulator.completed += 1;
          accumulator.quantity += task.Cantidad ?? 0;
          accumulator.weight += task.Peso ?? 0;
          accumulator.volume += task.Volumen ?? 0;
        }
        // Handle pending tasks
        else if (task.IdEstado === STATUS.PENDING) {
          accumulator.pending += 1;
        }
        // Handle approved tasks
        else if (task.IdEstado === STATUS.APPROVED) {
          accumulator.approved += 1;
          accumulator.quantity += task.Cantidad ?? 0;
          accumulator.weight += task.Peso ?? 0;
          accumulator.volume += task.Volumen ?? 0;
        }
        // Handle rejected tasks
        else if (task.IdEstado === STATUS.REJECTED) {
          accumulator.rejected += 1;
        }
        return accumulator;
      },
      {
        total: filteredTasks.length,
        pending: 0,
        completed: 0,
        approved: 0,
        rejected: 0,
        quantity: 0,
        weight: 0,
        volume: 0
      }
    );

    return summary;
  }

  /**
   * Lists suggested tasks for an activity
   * Generates task suggestions based on activity and transaction data
   * @param activityId - The ID of the activity
   * @param transactionId - Optional transaction ID
   */
  async list(activityId: string, transactionId?: string | null): Promise<Tarea[]> {
    try {
      let tareas: Tarea[] = [];
      let embalaje: string;
      let accion: string;
      const now = new Date().toISOString();
      const transaction: Transaction = await this.storage.get(STORAGE.TRANSACTION);
      const actividad: Actividad | undefined = transaction.Actividades.find((item) => item.IdActividad == activityId);

      if (!actividad) {
        return [];
      }

      const materials = await this.materialsService.list();
      const treatments = await this.treatmentsService.list();
      const embalajes = await this.packagingService.list();
      const puntos = await this.pointsService.list();
      const terceros = await this.thirdpartiesService.list();

      if (transaction) {
        if (transactionId)
          tareas = transaction.Tareas.filter(x => x.IdActividad == activityId && x.IdTransaccion == transactionId);
        else
          tareas = transaction.Tareas.filter(x => x.IdActividad == activityId);

        if (tareas.length > 0) {
          tareas.filter(x => x.EntradaSalida == INPUT_OUTPUT.INPUT || x.IdResiduo)?.forEach(async (tarea) => {
            tarea.IdServicio = actividad.IdServicio;
            const material = materials.find((x) => x.IdMaterial == tarea.IdMaterial);
            accion = 'Ver';

            if (material) {
              tarea.Material = material.Nombre;
              if (tarea.IdTratamiento != null) {
                const tratamientoItem = treatments.find((x) => x.IdTratamiento == tarea.IdTratamiento);
                if (tratamientoItem)
                  tarea.Tratamiento = tratamientoItem.Nombre;
              }
              if (tarea.IdEmbalaje) {
                const embalajeData = embalajes.find((x) => x.IdEmbalaje == tarea.IdEmbalaje);
                if (embalajeData)
                  embalaje = `- (${tarea.Cantidad ?? ''} ${embalajeData.Nombre}`;
              }
              if (tarea.IdDepositoDestino) {
                const deposito = puntos.find((x) => x.IdDeposito == tarea.IdDepositoDestino);
                if (deposito) {
                  if (deposito.IdPersona != null) {
                    const tercero = terceros.find((x) => x.IdPersona == deposito.IdPersona);
                    tarea.DepositoDestino = `${tercero?.Nombre} - ${deposito.Nombre}`;
                  } else {
                    tarea.DepositoDestino = `${deposito.Nombre}`;
                  }
                }
              }

              if (tarea.IdEstado == STATUS.PENDING) {
                switch (tarea.IdServicio) {
                  case SERVICE_TYPES.STORAGE:
                    accion = 'Almacenar';
                    break;
                  case SERVICE_TYPES.DISPOSAL:
                    accion = tarea.Tratamiento ?? 'Disponer';
                    break;
                  case SERVICE_TYPES.RECEPTION:
                    accion = 'Recibir';
                    break;
                  case SERVICE_TYPES.GENERATION:
                    accion = 'Generar';
                    break;
                  case SERVICE_TYPES.COLLECTION:
                  case SERVICE_TYPES.TRANSPORT:
                    if (tarea.EntradaSalida == 'E') {
                      accion = 'Recoger';
                    } else {
                      accion = 'Entregar';
                    }
                    break;
                  case SERVICE_TYPES.DELIVERY:
                    accion = 'Entregar';
                    break;
                  case SERVICE_TYPES.TREATMENT:
                    accion = tarea.Tratamiento ?? 'Transformar';
                    break;
                }
              }
              tarea.Accion = accion;
              tarea.Embalaje = embalaje;
            }
          });
        }
        if ((actividad.IdServicio == SERVICE_TYPES.COLLECTION || actividad.IdServicio == SERVICE_TYPES.TRANSPORT) && transactionId) {
          const puntos = await this.pointsService.list();
          var transaccion = transaction.Transacciones.find(x => x.IdActividad == activityId && x.IdTransaccion == transactionId);
          if (transaccion && transaccion.IdDeposito) {
            var punto = await this.pointsService.get(transaccion.IdDeposito);
            if (punto) {
              punto.IdMateriales?.forEach((idMaterial: string) => {
                const tareaMaterial = tareas.find(x => x.IdMaterial == idMaterial);
                if (!tareaMaterial) {
                  const material = materials.find((x) => x.IdMaterial == idMaterial);

                  if (material) {
                    const tarea: Tarea = {
                      IdActividad: activityId,
                      IdTransaccion: transactionId,
                      IdTarea: Utils.generateId(),
                      IdMaterial: material.IdMaterial,
                      Accion: 'Recoger',
                      FechaEjecucion: now,
                      IdRecurso: actividad.IdRecurso,
                      IdServicio: actividad.IdServicio,
                      IdEstado: STATUS.INACTIVE,
                      EntradaSalida: INPUT_OUTPUT.OUTPUT,
                      Material: material.Nombre,
                      Fotos: []
                    };
                    tareas.push(tarea);
                  }
                }
              });
            }
          }
        }
      }
      return tareas;
    } catch (error) {
      this.logger.error('Error listing tasks', { activityId, transactionId, error });
      throw error;
    }
  }

  /**
   * Gets a specific task by ID
   * @param idTarea - The ID of the task to retrieve
   * @returns Promise<Tarea | undefined> - The task if found, undefined otherwise
   */
  async get(taskId: string): Promise<Tarea | undefined> {
    try {
      const currentTransaction = this.transactionService.getTransaction();
      if (!currentTransaction) return undefined;

      return currentTransaction.Tareas.find(item => item.IdTarea === taskId);
    } catch (error) {
      this.logger.error('Error getting task', { taskId, error });
      throw error;
    }
  }

  /**
   * Creates a new task
   * @param tarea - The task to create
   * @returns Promise<boolean> - True if creation was successful
   */
  async create(task: Tarea): Promise<boolean> {
    try {
      const currentTransaction = this.transactionService.getTransaction();
      if (!currentTransaction) {
        return false;
      }

      currentTransaction.Tareas.push(task);
      this.tasks.set(currentTransaction.Tareas);
      this.transactionService.setTransaction(currentTransaction);
      await this.saveTransaction();
      console.log('currentTransaction', currentTransaction);
      console.log('task', task);
      await this.requestsService.create(DATA_TYPE.TASK, CRUD_OPERATIONS.CREATE, task);
      console.log('requestsService');
      console.log('synchronizationService');
      await this.synchronizationService.uploadData();
      console.log('uploadData');
      return true;
    } catch (error) {
      this.logger.error('Error creating task', { task, error });
      throw error;
    }
  }

  /**
   * Updates an existing task
   * @param tarea - The task to update
   * @returns Promise<boolean> - True if update was successful
   */
  async update(task: Tarea): Promise<boolean> {
    try {
      const currentTransaction = this.transactionService.getTransaction();
      if (!currentTransaction) {
        return false;
      }

      const taskIndex = currentTransaction.Tareas.findIndex(
        item => item.IdTarea === task.IdTarea
      );

      if (taskIndex === -1) {
        return false;
      }

      currentTransaction.Tareas[taskIndex] = {
        ...currentTransaction.Tareas[taskIndex],
        IdEstado: task.IdEstado,
        Cantidad: task.Cantidad,
        Peso: task.Peso,
        Volumen: task.Volumen,
        Valor: task.Valor,
        FechaEjecucion: task.FechaEjecucion,
        Fotos: task.Fotos,
        Observaciones: task.Observaciones
      };

      this.tasks.set(currentTransaction.Tareas);
      await this.saveTransaction();
      await this.requestsService.create(DATA_TYPE.TASK, CRUD_OPERATIONS.UPDATE, task);
      await this.synchronizationService.uploadData();
      return true;
    } catch (error) {
      this.logger.error('Error updating task', { task, error });
      throw error;
    }
  }
}
