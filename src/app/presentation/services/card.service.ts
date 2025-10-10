import { computed, Injectable, Signal, signal } from '@angular/core';
import { Process } from '@app/domain/entities/process.entity';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { Task } from '@app/domain/entities/task.entity';
import { Subprocess } from '@app/domain/entities/subprocess.entity';
import { ProcessService } from '@app/application/services/process.service';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { STATUS } from '@app/core/constants';
import { Utils } from '@app/core/utils';
import { TaskService } from '@app/application/services/task.service';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(
    private processService: ProcessService,
    private subprocessService: SubprocessService,
    private taskService: TaskService
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

  public getTransactionsByProcess = (processId: string) => computed(() =>
    this.allCards().filter(c => c.level === 1 && c.parentId === processId)
  );

  public getTasksByTransaction = (transactionId: string) => computed(() =>
    this.allCards().filter(c => c.level === 2 && c.parentId === transactionId)
  );

  async loadAllHierarchy() {
    // 1. Cargar todos los procesos
    const processes = await this.processService.getAll();
    const processCards = await this.mapActividades(processes);

    // 2. Cargar todas las transacciones
    const subprocesses = await this.subprocessService.list();
    const subprocessCards = await this.mapTransacciones(subprocesses);

    // 3. Cargar todas las tareas
    const tasks = await this.taskService.list();
    const taskCards = await this.mapTareas(tasks);

    // 4. Combinar todo en un solo array
    const allCards = [
      ...processCards,
      ...subprocessCards,
      ...taskCards
    ];

    // 5. Actualizar el signal único
    this.allCards.set(allCards);
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

  async mapActividades(actividades: Process[]): Promise<Card[]> {
    const cards = await Promise.all(actividades.map(async actividad => {
      const card: Card = {
        id: actividad.ProcessId,
        title: actividad.Title,
        status: actividad.StatusId,
        type: 'activity',

        actionName: actividad.Action,
        description: '',
        iconName: undefined,
        iconSource: actividad.Icon,
        parentId: null,
      };
      this.updateVisibleProperties(card);
      return card;
    }));

    return cards;
  }

  async mapActividad(actividad: Process): Promise<Card> {
    const card: Card = {
      id: actividad.ProcessId,
      title: actividad.Title,
      status: actividad.StatusId,
      type: 'activity',

      actionName: actividad.Action,
      description: '',
      iconName: undefined,
      iconSource: actividad.Icon,
      parentId: null,
    };
    this.updateVisibleProperties(card);

    return card;
  }

  async mapTransacciones(transacciones: Subprocess[]): Promise<Card[]> {
    return Promise.all(transacciones.map(async transaccion => {
      const card: Card = {
        id: transaccion.SubprocessId,
        title: transaccion.Title,
        status: transaccion.StatusId,
        type: 'transaction',

        actionName: transaccion.Action,
        description: transaccion.FacilityName,
        iconName: transaccion.Icon,
        iconSource: undefined,
        parentId: transaccion.ProcessId,
        summary: this.subprocessService.getSummary(transaccion),
      };
      this.updateVisibleProperties(card);
      return card;
    }));
  }

  async mapTransaccion(transaccion: Subprocess): Promise<Card> {
    const card: Card = {
      id: transaccion.SubprocessId,
      title: transaccion.Title,
      status: transaccion.StatusId,
      type: 'transaction',

      actionName: transaccion.Action,
      description: transaccion.FacilityName,
      iconName: transaccion.Icon,
      iconSource: undefined,
      parentId: transaccion.ProcessId,
      summary: this.subprocessService.getSummary(transaccion),
    };
    this.updateVisibleProperties(card);
    return card;
  }

  mapTareas(tareas: Task[]): Card[] {
    let tasks: Card[] = tareas.map(tarea => {
      const card: Card = {
        id: tarea.TaskId,
        title: tarea.MaterialId ?? '',
        status: tarea.StatusId,
        type: 'task',
        //actionName: tarea.Action,
        //description: tarea.DestinationPoint,
        iconName: 'trash-bin-outline',
        iconSource: undefined,
        parentId: tarea.SubprocessId,
        pendingItems: null,
        rejectedItems: null,
        successItems: null,
        quantity: tarea.Quantity,
        weight: tarea.Weight,
        volume: tarea.Volume,
        summary: this.taskService.getSummary(tarea),
      };
      this.updateVisibleProperties(card);
      return card;
    });

    return tasks;
  }

  mapTarea(tarea: Task): Card {
    const card: Card = {
      id: tarea.TaskId,
      title: tarea.MaterialId ?? '',
      status: tarea.StatusId,
      type: 'task',
      //actionName: tarea.Action,
      //description: tarea.DestinationPoint,
      iconName: 'trash-bin-outline',
      iconSource: '',
      parentId: tarea.SubprocessId,
      pendingItems: null,
      rejectedItems: null,
      successItems: null,
      quantity: tarea.Quantity,
      weight: tarea.Weight,
      volume: tarea.Volume,
      summary: this.taskService.getSummary(tarea),
    };
    this.updateVisibleProperties(card);
    return card;
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
