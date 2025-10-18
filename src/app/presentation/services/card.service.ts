import { computed, Injectable, Signal, signal } from '@angular/core';
import { Process } from '@app/domain/entities/process.entity';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { Task } from '@app/domain/entities/task.entity';
import { Subprocess } from '@app/domain/entities/subprocess.entity';
import { Material } from '@app/domain/entities/material.entity';
import { STATUS, SERVICES } from '@app/core/constants';
import { Utils } from '@app/core/utils';
import { OperationRepository } from '@app/infrastructure/repositories/operation.repository';
import { MaterialRepository } from '@app/infrastructure/repositories/material.repository';
import { LoggerService } from '@app/infrastructure/services/logger.service';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(
    private operationRepository: OperationRepository,
    private materialRepository: MaterialRepository,
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

      // 2. Cargar materials desde storage para obtener nombres
      const materials = await this.materialRepository.getAll();

      // 3. Mapear cada array a Cards
      const taskCards = this.mapTasks(operation.Tasks || [], materials);
      const subprocessCards = this.mapSubprocesses(operation.Subprocesses || []);
      const processCards = this.mapProcesses(operation.Processes || []);

      // 4. Combinar todo en un solo array
      let allCards = [
        ...taskCards,
        ...subprocessCards,
        ...processCards
      ];

      // 5. Calcular sumatorias jerárquicas (de abajo hacia arriba)
      allCards = this.calculateHierarchicalSummaries(allCards);

      // 6. Actualizar el signal único
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

  /**
   * Calculate hierarchical summaries for all cards
   * Calculates totals from bottom-up: Tasks → Subprocesses → Processes
   *
   * Rules:
   * - quantity/weight/volume: Sum from children (only APPROVED values)
   * - Subprocess counters: Count TASKS by status (pending/approved/rejected)
   * - Process counters: Count SUBPROCESSES by status (pending/approved/rejected)
   *
   * @param cards - Array of all cards
   * @returns Array of cards with calculated summaries
   */
  private calculateHierarchicalSummaries(cards: Card[]): Card[] {
    // First pass: Calculate totals for subprocesses from their tasks
    cards.filter(c => c.type === 'subprocess').forEach(subprocessCard => {
      const tasks = cards.filter(c => c.type === 'task' && c.parentId === subprocessCard.id);

      // Sum quantities, weights, and volumes (already filtered by APPROVED in mapTasks)
      subprocessCard.quantity = tasks.reduce((sum, task) => sum + (task.quantity || 0), 0);
      subprocessCard.weight = tasks.reduce((sum, task) => sum + (task.weight || 0), 0);
      subprocessCard.volume = tasks.reduce((sum, task) => sum + (task.volume || 0), 0);

      // Count TASKS by their status (tasks already have 1 or 0 based on their status)
      subprocessCard.pendingItems = tasks.reduce((sum, t) => sum + (t.pendingItems || 0), 0);
      subprocessCard.successItems = tasks.reduce((sum, t) => sum + (t.successItems || 0), 0);
      subprocessCard.rejectedItems = tasks.reduce((sum, t) => sum + (t.rejectedItems || 0), 0);

      // Build summary with calculated totals
      subprocessCard.summary = this.buildNumericSummary(
        subprocessCard.quantity,
        subprocessCard.weight,
        subprocessCard.volume
      );

      // Update visible properties after calculating summaries
      this.updateVisibleProperties(subprocessCard);
    });

    // Second pass: Calculate totals for processes from their subprocesses
    cards.filter(c => c.type === 'process').forEach(processCard => {
      const subprocesses = cards.filter(c => c.type === 'subprocess' && c.parentId === processCard.id);

      // Sum quantities, weights, and volumes from subprocesses (only approved values)
      processCard.quantity = subprocesses.reduce((sum, sp) => sum + (sp.quantity || 0), 0);
      processCard.weight = subprocesses.reduce((sum, sp) => sum + (sp.weight || 0), 0);
      processCard.volume = subprocesses.reduce((sum, sp) => sum + (sp.volume || 0), 0);

      // Count SUBPROCESSES by their status (not sum of task counts)
      processCard.pendingItems = subprocesses.filter(sp => sp.status === STATUS.PENDING).length;
      processCard.successItems = subprocesses.filter(sp => sp.status === STATUS.APPROVED).length;
      processCard.rejectedItems = subprocesses.filter(sp => sp.status === STATUS.REJECTED).length;

      // Build summary with calculated totals
      processCard.summary = this.buildNumericSummary(
        processCard.quantity,
        processCard.weight,
        processCard.volume
      );

      // Update visible properties after calculating summaries
      this.updateVisibleProperties(processCard);
    });

    return cards;
  }

  /**
   * Build numeric summary from quantity, weight, and volume
   * @param quantity - Quantity value
   * @param weight - Weight value
   * @param volume - Volume value
   * @returns Formatted summary string
   */
  private buildNumericSummary(quantity?: number | null, weight?: number | null, volume?: number | null): string {
    const parts: string[] = [];

    if (quantity && quantity > 0) {
      parts.push(`${quantity} un`);
    }

    if (weight && weight > 0) {
      parts.push(`${weight} kg`);
    }

    if (volume && volume > 0) {
      parts.push(`${volume} m³`);
    }

    return parts.join(' - ');
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

        // Initialize summary values (will be calculated later)
        quantity: 0,
        weight: 0,
        volume: 0,
        pendingItems: 0,
        successItems: 0,
        rejectedItems: 0,
        summary: '', // Will be built after hierarchical calculations
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

        // Initialize summary values (will be calculated later)
        quantity: 0,
        weight: 0,
        volume: 0,
        pendingItems: 0,
        successItems: 0,
        rejectedItems: 0,
      };
      this.updateVisibleProperties(card);
      return card;
    });
  }

  /**
   * Build summary for subprocess card
   * Note: This is a placeholder. The actual summary (quantity/weight/volume)
   * will be calculated in calculateHierarchicalSummaries() and built dynamically in the UI
   * @param subprocess - The subprocess entity
   * @returns Summary string (empty for now, will be built from calculated values)
   */
  private buildSubprocessSummary(subprocess: Subprocess): string {
    // Summary will be built from quantity/weight/volume after hierarchical calculation
    return '';
  }

  mapTasks(tareas: Task[], materials: Material[] = []): Card[] {
    return tareas.map(tarea => {
      // Get material name from storage if MaterialId is present
      let title = tarea.MaterialId ?? '';
      if (tarea.MaterialId && materials.length > 0) {
        const material = materials.find(m => m.Id === tarea.MaterialId);
        if (material) {
          title = material.Name;
        }
      }

      const card: Card = {
        id: tarea.TaskId,
        title: title,
        status: tarea.StatusId,
        type: 'task',
        level: 2,
        iconName: 'trash-bin-outline',
        iconSource: undefined,
        parentId: tarea.SubprocessId,
        materialId: tarea.MaterialId,

        // Tasks have their own values (only count if APPROVED)
        quantity: tarea.StatusId === STATUS.APPROVED ? (tarea.Quantity || 0) : 0,
        weight: tarea.StatusId === STATUS.APPROVED ? (tarea.Weight || 0) : 0,
        volume: tarea.StatusId === STATUS.APPROVED ? (tarea.Volume || 0) : 0,

        // Count this task as 1 in the appropriate status
        pendingItems: tarea.StatusId === STATUS.PENDING ? 1 : 0,
        successItems: tarea.StatusId === STATUS.APPROVED ? 1 : 0,
        rejectedItems: tarea.StatusId === STATUS.REJECTED ? 1 : 0,

        summary: this.buildTaskSummary(tarea),
      };
      this.updateVisibleProperties(card);
      return card;
    });
  }

  /**
   * Build summary for task card using original values from entity
   * Note: This uses original values, not the calculated ones (which are 0 if not APPROVED)
   * @param task - The task entity
   * @returns Summary string
   */
  private buildTaskSummary(task: Task): string {
    return this.buildNumericSummary(task.Quantity, task.Weight, task.Volume);
  }

  updateVisibleProperties(card: Card) {
    card.color = Utils.getStateColor(card.status);
    card.showItems = card.type !== 'task';
    card.showSummary = card.status !== STATUS.REJECTED;
    card.showEdit = card.type === 'task';

    // Lógica de botones según el tipo de card
    if (card.type === 'subprocess') {
      // Subprocess: Solo si está PENDING y basado en tasks aprobadas
      card.showApprove = card.status === STATUS.PENDING && (card.successItems ?? 0) > 0;
      card.showReject = card.status === STATUS.PENDING && (card.successItems === 0 || card.successItems === null || card.successItems === undefined);
    } else if (card.type === 'process') {
      // Process: Solo si está PENDING y basado en si hay AL MENOS 1 task aprobada (quantity > 0 indica que hay tasks aprobadas)
      card.showApprove = card.status === STATUS.PENDING && (card.quantity ?? 0) > 0;
      card.showReject = card.status === STATUS.PENDING && (card.quantity === 0 || card.quantity === null || card.quantity === undefined);
    } else {
      // Tasks no tienen botones de aprobar/rechazar
      card.showApprove = false;
      card.showReject = false;
    }

    if (card.status !== STATUS.PENDING)
      card.actionName = "Ver";
  }
}
