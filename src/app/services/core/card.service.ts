import { Injectable, Signal, signal } from '@angular/core';
import { Actividad } from '@app/interfaces/actividad.interface';
import { Card } from '@app/interfaces/card.interface';
import { Tarea } from '@app/interfaces/tarea.interface';
import { Transaccion } from '@app/interfaces/transaccion.interface';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { STATUS } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  constructor(
    private activitiesService: ActivitiesService,
    private transactionsService: TransactionsService
  ) {}

  async mapActividades(actividades: Actividad[]): Promise<Card[]> {
    const cards = await Promise.all(actividades.map(async actividad => {
      const summaryData = await this.activitiesService.getSummary(actividad.IdActividad);

      const card: Card = {
        id: actividad.IdActividad,
        title: actividad.Titulo,
        status: actividad.IdEstado,
        type: 'activity',

        actionName: actividad.Accion,
        description: '',
        iconName: undefined,
        iconSource: actividad.Icono,
        parentId: null,
        pendingItems: summaryData.pendientes,
        rejectedItems: summaryData.rechazados,
        successItems: summaryData.aprobados,
        quantity: summaryData.cantidad,
        weight: summaryData.peso,
        volume: summaryData.volumen,
      };
      this.updateVisibleProperties(card);
      return card;
    }));

    return cards;
  }

  async mapActividad(actividad: Actividad): Promise<Card> {
    const summaryData = await this.activitiesService.getSummary(actividad.IdActividad);

    const card: Card = {
      id: actividad.IdActividad,
      title: actividad.Titulo,
      status: actividad.IdEstado,
      type: 'activity',

      actionName: actividad.Accion,
      description: '',
      iconName: undefined,
      iconSource: actividad.Icono,
      parentId: null,
      pendingItems: summaryData.pendientes,
      rejectedItems: summaryData.rechazados,
      successItems: summaryData.aprobados,
      quantity: summaryData.cantidad,
      weight: summaryData.peso,
      volume: summaryData.volumen,
    };
    this.updateVisibleProperties(card);

    return card;
  }

  async mapTransacciones(transacciones: Transaccion[]): Promise<Card[]> {
    return Promise.all(transacciones.map(async transaccion => {
      const summaryData = await this.transactionsService.getSummary(transaccion.IdActividad, transaccion.IdTransaccion);

      const card: Card = {
        id: transaccion.IdTransaccion,
        title: transaccion.Titulo,
        status: transaccion.IdEstado,
        type: 'transaction',

        actionName: transaccion.Accion,
        description: transaccion.Ubicacion,
        iconName: transaccion.Icono,
        iconSource: undefined,
        parentId: transaccion.IdActividad,
        pendingItems: summaryData.pendientes,
        rejectedItems: summaryData.rechazados,
        successItems: summaryData.aprobados,
        quantity: summaryData.cantidad,
        weight: summaryData.peso,
        volume: summaryData.volumen,
      };
      this.updateVisibleProperties(card);
      return card;
    }));
  }

  async mapTransaccion(transaccion: Transaccion): Promise<Card> {
    const summaryData = await this.transactionsService.getSummary(transaccion.IdActividad, transaccion.IdTransaccion);

    const card: Card = {
      id: transaccion.IdTransaccion,
      title: transaccion.Titulo,
      status: transaccion.IdEstado,
      type: 'transaction',

      actionName: transaccion.Accion,
      description: transaccion.Ubicacion,
      iconName: transaccion.Icono,
      iconSource: undefined,
      parentId: transaccion.IdActividad,
      pendingItems: summaryData.pendientes,
      rejectedItems: summaryData.rechazados,
      successItems: summaryData.aprobados,
      quantity: summaryData.cantidad,
      weight: summaryData.peso,
      volume: summaryData.volumen,
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
    };
    this.updateVisibleProperties(card);
    return card;
  }

  updateVisibleProperties(card: Card) {
    let summary: string = '';
    if ((card.quantity ?? 0) > 0) {
      summary = `${card.quantity} ${Utils.quantityUnit}`;
    }
    if ((card.weight ?? 0) > 0) {
      if (summary !== '')
        summary += `/${card.weight} ${Utils.weightUnit}`;
      else
        summary = `${card.weight} ${Utils.weightUnit}`;
    }
    if ((card.volume ?? 0) > 0) {
      if (summary !== '')
        summary += `/${card.volume} ${Utils.volumeUnit}`;
      else
        summary = `${card.volume} ${Utils.volumeUnit}`;
    }
    card.summary = summary;
    card.color = Utils.getStateColor(card.status);
    card.showReject = card.type !== 'task' && card.status === STATUS.PENDING && card.successItems === 0;
    card.showApprove = card.type !== 'task' && card.status === STATUS.PENDING && (card.successItems ?? 0) > 0;
    card.showItems = card.type !== 'task';
    card.showSummary = card.status !== STATUS.REJECTED;
    if (card.status !== STATUS.PENDING)
      card.actionName = "Ver";
  }
}
