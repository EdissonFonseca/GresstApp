import { computed, Injectable, Signal, signal } from '@angular/core';
import { Process } from '@app/domain/entities/process.entity';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { Task } from '@app/domain/entities/task.entity';
import { Subprocess } from '@app/domain/entities/subprocess.entity';
import { STATUS, SERVICES } from '@app/core/constants';
import { Utils } from '@app/core/utils';
import { OperationRepository } from '@app/infrastructure/repositories/operation.repository';
import { LoggerService } from '@app/infrastructure/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(
    private operationRepository: OperationRepository,
    private logger: LoggerService
  ) {}

  private allCards = signal<Card[]>([]);
  public allCards$ = this.allCards.asReadonly();

  /** Computed signal that returns processes sorted by status (PENDING first) */
  public processes = computed(() => {
    const processCards = this.allCards().filter(card => card.type === 'process');
    // Sort processes: PENDING first, then others
    return processCards.sort((a: Card, b: Card) => {
      if (a.status === STATUS.PENDING && b.status !== STATUS.PENDING) return -1;
      if (a.status !== STATUS.PENDING && b.status === STATUS.PENDING) return 1;
      return 0;
    });
  });

  public getSubprocessesByProcess = (processId: string) => computed(() =>
    this.allCards().filter(c => c.type === 'subprocess' && c.parentId === processId)
  );

  public getTasksBySubprocess = (subprocessId: string) => computed(() =>
    this.allCards().filter(c => c.type === 'task' && c.parentId === subprocessId)
  );

  async loadAllHierarchy() {
    try {
      // 1. Cargar Operation completa desde storage (contiene los 3 arrays)
      const operation = await this.operationRepository.get();

      if (!operation) {
        this.logger.warn('No operation data found in storage');
        this.allCards.set([]);
        return;
      }

      // 2. Mapear cada array a Cards
      const processCards = this.mapProcesses(operation.Processes || []);
      const subprocessCards = this.mapSubprocesses(operation.Subprocesses || []);
      const taskCards = this.mapTasks(operation.Tasks || []);

      // 3. Combinar todo en un solo array
      const allCards = [
        ...processCards,
        ...subprocessCards,
        ...taskCards
      ];

      // 4. Actualizar el signal único
      this.allCards.set(allCards);

      this.logger.debug('Cards loaded', {
        processes: processCards.length,
        subprocesses: subprocessCards.length,
        tasks: taskCards.length,
        total: allCards.length
      });
    } catch (error) {
      this.logger.error('Error loading hierarchy', error);
      throw error;
    }
  }

  addCard(card: Card) {
    this.allCards.update(cards => [...cards, card]);
  }

  updateCard(cardId: string, updates: Partial<Card>) {
    const cards = this.allCards();
    const index = cards.findIndex(c => c.id === cardId);
    if (index !== -1) {
      const updatedCards = [...cards];
      updatedCards[index] = { ...updatedCards[index], ...updates };
      this.allCards.set(updatedCards);
    }
  }

  removeCard(cardId: string) {
    this.allCards.update(cards => cards.filter(c => c.id !== cardId));
  }

  getCardStats(parentId: string | null) {
    const children = this.allCards().filter(c => c.parentId === parentId);
    return {
      total: children.length,
      pending: children.filter(c => c.status === STATUS.PENDING).length,
      approved: children.filter(c => c.status === STATUS.APPROVED).length,
      rejected: children.filter(c => c.status === STATUS.REJECTED).length,
    };
  }

  mapProcesses(actividades: Process[]): Card[] {
    return actividades.map(actividad => {
      // Find service info to get Icon and Action
      const service = SERVICES.find(s => s.serviceId === actividad.ServiceId);

      const card: Card = {
        id: actividad.ProcessId,
        title: actividad.Title,
        status: actividad.StatusId,
        type: 'process',
        level: 0,

        actionName: service?.Action || actividad.Action,
        description: '',
        iconName: undefined,
        iconSource: service?.Icon || actividad.Icon,
        parentId: null,
      };
      this.updateVisibleProperties(card);
      return card;
    });
  }

  mapSubprocesses(transacciones: Subprocess[]): Card[] {
    return transacciones.map(transaccion => {
      const card: Card = {
        id: transaccion.SubprocessId,
        title: transaccion.Title,
        status: transaccion.StatusId,
        type: 'subprocess',
        level: 1,

        actionName: transaccion.Action,
        description: transaccion.FacilityName,
        iconName: transaccion.Icon,
        iconSource: undefined,
        parentId: transaccion.ProcessId,
        summary: this.buildSubprocessSummary(transaccion),
      };
      this.updateVisibleProperties(card);
      return card;
    });
  }

  /**
   * Build summary for subprocess card
   * @param subprocess - The subprocess entity
   * @returns Summary string
   */
  private buildSubprocessSummary(subprocess: Subprocess): string {
    const parts: string[] = [];

    if (subprocess.PartyName) {
      parts.push(subprocess.PartyName);
    }

    if (subprocess.FacilityName) {
      parts.push(subprocess.FacilityName);
    }

    return parts.join(' - ');
  }

  mapTasks(tareas: Task[]): Card[] {
    return tareas.map(tarea => {
      const card: Card = {
        id: tarea.TaskId,
        title: tarea.MaterialId ?? '',
        status: tarea.StatusId,
        type: 'task',
        level: 2,
        iconName: 'trash-bin-outline',
        iconSource: undefined,
        parentId: tarea.SubprocessId,
        pendingItems: null,
        rejectedItems: null,
        successItems: null,
        quantity: tarea.Quantity,
        weight: tarea.Weight,
        volume: tarea.Volume,
        summary: this.buildTaskSummary(tarea),
      };
      this.updateVisibleProperties(card);
      return card;
    });
  }

  /**
   * Build summary for task card
   * @param task - The task entity
   * @returns Summary string
   */
  private buildTaskSummary(task: Task): string {
    const parts: string[] = [];

    if (task.Quantity) {
      parts.push(`${task.Quantity} unidades`);
    }

    if (task.Weight) {
      parts.push(`${task.Weight} kg`);
    }

    if (task.Volume) {
      parts.push(`${task.Volume} m³`);
    }

    return parts.join(' - ');
  }

  updateVisibleProperties(card: Card) {
    card.color = Utils.getStateColor(card.status);
    card.showReject = card.type !== 'task' && card.status === STATUS.PENDING && card.successItems === 0;
    card.showApprove = card.type !== 'task' && card.status === STATUS.PENDING && (card.successItems ?? 0) > 0;
    card.showItems = card.type !== 'task';
    card.showSummary = card.status !== STATUS.REJECTED;
    if (card.status !== STATUS.PENDING)
      card.actionName = "Ver";
  }
}
