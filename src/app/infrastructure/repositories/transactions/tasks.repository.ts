import { Injectable, signal } from '@angular/core';
import { StorageService } from '@app/infrastructure/repositories/api/storage.repository';
import { Tarea } from '@app/domain/entities/tarea.entity';
import { Proceso } from '@app/domain/entities/proceso.entity';
import { INPUT_OUTPUT, STATUS, SERVICE_TYPES, STORAGE, CRUD_OPERATIONS, DATA_TYPE } from '@app/core/constants';
import { Operacion } from '@app/domain/entities/operacion.entity';
import { MaterialsService } from '@app/infrastructure/repositories/masterdata/materials.repository';
import { TreatmentsService } from '@app/infrastructure/repositories/masterdata/treatments.repository';
import { PackagingService } from '@app/infrastructure/repositories/masterdata/packaging.repository';
import { PointsService } from '@app/infrastructure/repositories/masterdata/points.repository';
import { ThirdpartiesService } from '@app/infrastructure/repositories/masterdata/thirdparties.repository';
import { Utils } from '@app/core/utils';
import { RequestsService } from './requests.repository';
import { SynchronizationService } from '../../services/synchronization.service';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { WorkflowService } from '@app/infrastructure/services/workflow.service';

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
    private workflowService: WorkflowService
  ) {
    this.loadTasks();
  }

  /**
   * Loads the current transaction from storage
   * Updates the transaction signal with the loaded data
   */
  private async loadTasks() {
    try {
      await this.workflowService.loadTransaction();
      const transaction = this.workflowService.getTransaction();
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
      const transaction = this.workflowService.getTransaction();
      if (transaction) {
        transaction.Tareas = this.tasks();
        this.workflowService.setTransaction(transaction);
        await this.workflowService.saveTransaction();
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
  async list(activityId: string, transactionId?: string): Promise<void> {
    try {
      const tasks = await this.listByActivityAndTransaction(activityId, transactionId);
      this.tasks.set(tasks);
    } catch (error) {
      this.logger.error('Error loading tasks', { activityId, transactionId, error });
      this.tasks.set([]);
    }
  }

  /**
   * Lists suggested tasks for an activity
   * Generates task suggestions based on activity and transaction data
   * @param activityId - The ID of the activity
   * @param transactionId - Optional transaction ID
   */
  async listByActivityAndTransaction(activityId: string, transactionId?: string | null): Promise<Tarea[]> {
    try {
      let tareas: Tarea[] = [];
      let embalaje: string;
      let accion: string;
      const now = new Date().toISOString();
      const transaction: Operacion = await this.storage.get(STORAGE.TRANSACTION);
      const actividad: Proceso | undefined = transaction.Procesos.find((item) => item.IdProceso == activityId);

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
          tareas = transaction.Tareas.filter(x => x.IdProceso == activityId && x.IdTransaccion == transactionId);
        else
          tareas = transaction.Tareas.filter(x => x.IdProceso == activityId);

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
          var transaccion = transaction.Transacciones.find(x => x.IdProceso == activityId && x.IdTransaccion == transactionId);
          if (transaccion && transaccion.IdDeposito) {
            var punto = await this.pointsService.get(transaccion.IdDeposito);
            if (punto) {
              punto.IdMateriales?.forEach((idMaterial: string) => {
                const tareaMaterial = tareas.find(x => x.IdMaterial == idMaterial);
                if (!tareaMaterial) {
                  const material = materials.find((x) => x.IdMaterial == idMaterial);

                  if (material) {
                    const tarea: Tarea = {
                      IdProceso: activityId,
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
      const currentTransaction = this.workflowService.getTransaction();
      if (!currentTransaction) return undefined;

      return currentTransaction.Tareas.find(item => item.IdTarea === taskId);
    } catch (error) {
      this.logger.error('Error getting task', { taskId, error });
      throw error;
    }
  }

  /**
   * Gets the summary of a task
   * @param task - The task to get the summary of
   * @returns Promise<string> The summary of the task
   */
  getSummary(task: Tarea): string {
    let summary: string = '';
    if ((task.quantity ?? 0) > 0) {
      summary = `${task.quantity} ${Utils.quantityUnit}`;
    }
    if ((task.weight ?? 0) > 0) {
      if (summary !== '')
        summary += `/${task.weight} ${Utils.weightUnit}`;
      else
        summary = `${task.weight} ${Utils.weightUnit}`;
    }
    if ((task.volume ?? 0) > 0) {
      if (summary !== '')
        summary += `/${task.volume} ${Utils.volumeUnit}`;
      else
        summary = `${task.volume} ${Utils.volumeUnit}`;
    }
    return summary;
  }

  /**
   * Creates a new task
   * @param tarea - The task to create
   * @returns Promise<boolean> - True if creation was successful
   */
  async create(task: Tarea): Promise<boolean> {
    try {
      const currentTransaction = this.workflowService.getTransaction();
      if (!currentTransaction) {
        return false;
      }

      //Set task summary properties
      task.pending = 0;
      task.approved = 1;
      task.rejected = 0;
      task.quantity = task.Cantidad;
      task.weight = task.Peso ?? 0;
      task.volume = task.Volumen ?? 0;

      // If the task has a transaction associated, update its totals
      if (task.IdTransaccion) {
        const transaccion = currentTransaction.Transacciones.find(t => t.IdTransaccion === task.IdTransaccion);
        if (transaccion) {
          // Update the totals of the transaction
          transaccion.approved = (transaccion.approved ?? 0) + 1;
          transaccion.quantity = (transaccion.quantity ?? 0) + (task.Cantidad ?? 0);
          transaccion.weight = (transaccion.weight ?? 0) + (task.Peso ?? 0);
          transaccion.volume = (transaccion.volume ?? 0) + (task.Volumen ?? 0);
        }
      }
      const activity = currentTransaction.Procesos.find(t => t.IdProceso === task.IdProceso);
      if (activity) {
        // Update the totals of the activity
        activity.approved = (activity.approved ?? 0) + 1;
        activity.quantity = (activity.quantity ?? 0) + (task.Cantidad ?? 0);
        activity.weight = (activity.weight ?? 0) + (task.Peso ?? 0);
        activity.volume = (activity.volume ?? 0) + (task.Volumen ?? 0);
      }

      currentTransaction.Tareas.push(task);
      this.tasks.set(currentTransaction.Tareas);
      this.workflowService.setTransaction(currentTransaction);
      await this.saveTransaction();

      await this.requestsService.create(DATA_TYPE.TASK, CRUD_OPERATIONS.CREATE, task);
      await this.synchronizationService.uploadData();

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
      const currentTransaction = this.workflowService.getTransaction();
      if (!currentTransaction) {
        return false;
      }

      const taskIndex = currentTransaction.Tareas.findIndex(
        item => item.IdTarea === task.IdTarea
      );

      if (taskIndex === -1) {
        return false;
      }

      // If the task has a transaction associated, update its totals
      if (task.IdTransaccion) {
        const transaction = currentTransaction.Transacciones.find(t => t.IdTransaccion === task.IdTransaccion);
        if (transaction) {
          // Add the values of the new task
          if (task.IdEstado === STATUS.APPROVED) {
            transaction.pending = (transaction.pending ?? 0) - 1;
            transaction.approved = (transaction.approved ?? 0) + 1;
            transaction.quantity = (transaction.quantity ?? 0) + (task.Cantidad ?? 0);
            transaction.weight = (transaction.weight ?? 0) + (task.Peso ?? 0);
            transaction.volume = (transaction.volume ?? 0) + (task.Volumen ?? 0);
          } else if (task.IdEstado === STATUS.REJECTED) {
            transaction.pending = (transaction.pending ?? 0) - 1;
            transaction.rejected = (transaction.rejected ?? 0) + 1;
          }
        }
      }

      // Update the totals of the activity
      const activity = currentTransaction.Procesos.find(t => t.IdProceso === task.IdProceso);
      if (activity) {
        // Add the values of the new task
        if (task.IdEstado === STATUS.APPROVED) {
          activity.pending = (activity.pending ?? 0) - 1;
          activity.approved = (activity.approved ?? 0) + 1;
          activity.quantity = (activity.quantity ?? 0) + (task.Cantidad ?? 0);
          activity.weight = (activity.weight ?? 0) + (task.Peso ?? 0);
          activity.volume = (activity.volume ?? 0) + (task.Volumen ?? 0);
        } else if (task.IdEstado === STATUS.REJECTED) {
          activity.pending = (activity.pending ?? 0) - 1;
          activity.rejected = (activity.rejected ?? 0) + 1;
        }
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
        Observaciones: task.Observaciones,
        // Update task summary properties
        pending: task.IdEstado === STATUS.PENDING ? 1 : 0,
        approved: task.IdEstado === STATUS.APPROVED ? 1 : 0,
        rejected: task.IdEstado === STATUS.REJECTED ? 1 : 0,
        quantity: task.IdEstado === STATUS.APPROVED ? task.Cantidad ?? 0 : 0,
        weight: task.IdEstado === STATUS.APPROVED ? task.Peso ?? 0 : 0,
        volume: task.IdEstado === STATUS.APPROVED ? task.Volumen ?? 0 : 0
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
