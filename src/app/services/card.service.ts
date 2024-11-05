import { Injectable, Signal, signal } from '@angular/core';
import { Actividad } from '@app/interfaces/actividad.interface';
import { Card } from '@app/interfaces/card';
import { Tarea } from '@app/interfaces/tarea.interface';
import { Transaccion } from '@app/interfaces/transaccion.interface';
import { ActividadesService } from './actividades.service';
import { TransaccionesService } from './transacciones.service';
import { GlobalesService } from './globales.service';
import { Estado } from 'src/app/services/constants.service';

@Injectable({
  providedIn: 'root'
})
export class CardService {
  private activitiesSignal = signal<Card[]>([]);
  private transactionsSignal = signal<Card[]>([]);
  private tasksSignal = signal<Card[]>([]);

  constructor(
    private actividadesService: ActividadesService,
    private transaccionesService: TransaccionesService,
    private globales: GlobalesService,
  ) {}

  setActivities(activities: Card[]): Signal<Card[]> {
    this.activitiesSignal.set(activities);
    return this.activitiesSignal;
  }

  updateActivity(activity: Card) {
    const cards = this.activitiesSignal();
    const index = cards.findIndex(card => card.id === activity.id);
    if (index !== -1) {
      cards[index] = activity;
      this.activitiesSignal.set([...cards]);
    }
  }

  setTransactions(transactions: Card[]): Signal<Card[]> {
    this.transactionsSignal.set(transactions);
    return this.transactionsSignal;
  }

  updateTransaction(transaction: Card) {
    const cards = this.transactionsSignal();
    const index = cards.findIndex(card => card.id === transaction.id);
    if (index !== -1) {
      cards[index] = transaction;
      this.transactionsSignal.set([...cards]);
    }
  }

  setTasks(tasks: Card[]): Signal<Card[]> {
    this.tasksSignal.set(tasks);
    return this.tasksSignal
  }

  updateTask(task: Card) {
    const cards = this.tasksSignal();
    const index = cards.findIndex(card => card.id === task.id);
    if (index !== -1) {
      cards[index] = task;
      this.tasksSignal.set([...cards]);
    }
  }

  async mapActividades(actividades: Actividad[]): Promise<Card[]> {
    const cards = await Promise.all(actividades.map(async actividad => {
      const summaryData = await this.actividadesService.getSummary(actividad.IdActividad);

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
    const summaryData = await this.actividadesService.getSummary(actividad.IdActividad);

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
      const summaryData = await this.transaccionesService.getSummary(transaccion.IdActividad, transaccion.IdTransaccion);

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
    const summaryData = await this.transaccionesService.getSummary(transaccion.IdActividad, transaccion.IdTransaccion);

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
      summary = `${card.quantity} ${this.globales.unidadCantidad}`;
    }
    if ((card.weight ?? 0) > 0) {
      if (summary !== '')
        summary += `/${card.weight} ${this.globales.unidadPeso}`;
      else
        summary = `${card.weight} ${this.globales.unidadPeso}`;
    }
    if ((card.volume ?? 0) > 0) {
      if (summary !== '')
        summary += `/${card.volume} ${this.globales.unidadVolumen}`;
      else
        summary = `${card.volume} ${this.globales.unidadVolumen}`;
    }
    card.summary = summary;
    card.color = this.globales.getColorEstado(card.status);
    card.showReject = card.type !== 'task' && card.status === Estado.Pendiente && card.successItems === 0;
    card.showApprove = card.type !== 'task' && card.status === Estado.Pendiente && (card.successItems ?? 0) > 0;
    card.showItems = card.type !== 'task';
    card.showSummary = card.status !== Estado.Rechazado;
    if (card.status !== Estado.Pendiente)
      card.actionName = "Ver";
  }
}
