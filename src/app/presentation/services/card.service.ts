import { Injectable, Signal, signal } from '@angular/core';
import { Proceso } from '@app/domain/entities/proceso.entity';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { Tarea } from '@app/domain/entities/tarea.entity';
import { Transaccion } from '@app/domain/entities/transaccion.entity';
import { ProcessesService } from '@app/infrastructure/repositories/transactions/processes.repository';
import { TransactionsService } from '@app/infrastructure/repositories/transactions/transactions.repository';
import { STATUS } from '@app/core/constants';
import { Utils } from '@app/core/utils';
import { TasksService } from '../../infrastructure/repositories/transactions/tasks.repository';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(
    private processesService: ProcessesService,
    private transactionsService: TransactionsService,
    private tasksService: TasksService
  ) {}

  async mapActividades(actividades: Proceso[]): Promise<Card[]> {
    const cards = await Promise.all(actividades.map(async actividad => {
      const card: Card = {
        id: actividad.IdProceso,
        title: actividad.Titulo,
        status: actividad.IdEstado,
        type: 'activity',

        actionName: actividad.Accion,
        description: '',
        iconName: undefined,
        iconSource: actividad.Icono,
        parentId: null,
        pendingItems: actividad.pending,
        rejectedItems: actividad.rejected,
        successItems: actividad.approved,
        quantity: actividad.quantity,
        weight: actividad.weight,
        volume: actividad.volume,
        summary: this.processesService.getSummary(actividad),
      };
      this.updateVisibleProperties(card);
      return card;
    }));

    return cards;
  }

  async mapActividad(actividad: Proceso): Promise<Card> {
    const card: Card = {
      id: actividad.IdProceso,
      title: actividad.Titulo,
      status: actividad.IdEstado,
      type: 'activity',

      actionName: actividad.Accion,
      description: '',
      iconName: undefined,
      iconSource: actividad.Icono,
      parentId: null,
      pendingItems: actividad.pending,
      rejectedItems: actividad.rejected,
      successItems: actividad.approved,
      quantity: actividad.quantity,
      weight: actividad.weight,
      volume: actividad.volume,
              summary: this.processesService.getSummary(actividad),
    };
    this.updateVisibleProperties(card);

    return card;
  }

  async mapTransacciones(transacciones: Transaccion[]): Promise<Card[]> {
    return Promise.all(transacciones.map(async transaccion => {
      const card: Card = {
        id: transaccion.IdTransaccion,
        title: transaccion.Titulo,
        status: transaccion.IdEstado,
        type: 'transaction',

        actionName: transaccion.Accion,
        description: transaccion.Ubicacion,
        iconName: transaccion.Icono,
        iconSource: undefined,
        parentId: transaccion.IdProceso,
        pendingItems: transaccion.pending,
        rejectedItems: transaccion.rejected,
        successItems: transaccion.approved,
        quantity: transaccion.quantity,
        weight: transaccion.weight,
        volume: transaccion.volume,
        summary: this.transactionsService.getSummary(transaccion),
      };
      this.updateVisibleProperties(card);
      return card;
    }));
  }

  async mapTransaccion(transaccion: Transaccion): Promise<Card> {
    const card: Card = {
      id: transaccion.IdTransaccion,
      title: transaccion.Titulo,
      status: transaccion.IdEstado,
      type: 'transaction',

      actionName: transaccion.Accion,
      description: transaccion.Ubicacion,
      iconName: transaccion.Icono,
      iconSource: undefined,
      parentId: transaccion.IdProceso,
      pendingItems: transaccion.pending,
      rejectedItems: transaccion.rejected,
      successItems: transaccion.approved,
      quantity: transaccion.quantity,
      weight: transaccion.weight,
      volume: transaccion.volume,
      summary: this.transactionsService.getSummary(transaccion),
    };
    this.updateVisibleProperties(card);
    return card;
  }

  mapTareas(tareas: Tarea[]): Card[] {
    let tasks: Card[] = tareas.map(tarea => {
      const card: Card = {
        id: tarea.IdTarea,
        title: tarea.Material ?? '',
        status: tarea.IdEstado,
        type: 'task',
        actionName: tarea.Accion,
        description: tarea.DepositoDestino,
        iconName: 'trash-bin-outline',
        iconSource: undefined,
        parentId: tarea.IdTransaccion,
        pendingItems: null,
        rejectedItems: null,
        successItems: null,
        quantity: tarea.Cantidad,
        weight: tarea.Peso,
        volume: tarea.Volumen,
        summary: this.tasksService.getSummary(tarea),
      };
      this.updateVisibleProperties(card);
      return card;
    });

    return tasks;
  }

  mapTarea(tarea: Tarea): Card {
    const card: Card = {
      id: tarea.IdTarea,
      title: tarea.Material ?? '',
      status: tarea.IdEstado,
      type: 'task',
      actionName: tarea.Accion,
      description: tarea.DepositoDestino,
      iconName: 'trash-bin-outline',
      iconSource: '',
      parentId: tarea.IdTransaccion,
      pendingItems: null,
      rejectedItems: null,
      successItems: null,
      quantity: tarea.Cantidad,
      weight: tarea.Peso,
      volume: tarea.Volumen,
      summary: this.tasksService.getSummary(tarea),
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
