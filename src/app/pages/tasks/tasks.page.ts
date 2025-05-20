import { Component, Input, OnInit, signal, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionApproveComponent } from 'src/app/components/transaction-approve/transaction-approve.component';
import { STATUS } from '@app/constants/constants';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { ModalController } from '@ionic/angular';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { TasksService } from '@app/services/transactions/tasks.service';
import { TaskEditComponent } from 'src/app/components/task-edit/task-edit.component';
import { Card } from '@app/interfaces/card';
import { CardService } from '@app/services/core/card.service';
import { SessionService } from '@app/services/core/session.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { Utils } from '@app/utils/utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/components/components.module';

@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ComponentsModule]
})
export class TasksPage implements OnInit {
  activity = signal<Card>({id:'', title: '', status: STATUS.PENDING, type:'activity'});
  transactions = signal<Card[]>([]);
  tasks = signal<Card[]>([]);
  transactionId: string = '';
  title: string = '';
  showAdd: boolean = true;
  mode: string = 'A';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController,
    private cardService: CardService,
    private transactionsService: TransactionsService,
    private tasksService: TasksService,
    public sessionService: SessionService,
    public synchronizationService: SynchronizationService,
  ) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.mode = params['Mode'],
      this.transactionId = params['TransactionId']
    });
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state){
      const newActivity = nav.extras.state['activity'];
      if (newActivity){
        this.title = newActivity.title;
        this.activity.set(newActivity);
      }
    }
  }

  async ionViewWillEnter() {
    let transacciones = await this.transactionsService.list(this.activity().id);
    if (this.transactionId) {
      transacciones = transacciones.filter(x => x.IdTransaccion == this.transactionId);
      const transaccion = transacciones[0];
      if (transaccion)
        this.showAdd = transaccion.IdEstado == STATUS.PENDING;
    } else {
      this.showAdd = this.activity().status == STATUS.PENDING;
    }
    const mappedTransactions = await this.cardService.mapTransacciones(transacciones);
    const tareas = await this.tasksService.listSugeridas(this.activity().id);
    const mappedTasks = this.cardService.mapTareas(tareas);

    this.transactions.set(mappedTransactions);
    this.tasks.set(mappedTasks);
  }

  filterTareas(transactionId: string): Card[] {
    return this.tasks().filter(x => x.parentId == transactionId);
  }

  async handleInput(event: any) {
    const query = event.target.value.toLowerCase();
    let transaccionesList = await this.transactionsService.list(this.activity().id);
    const tareasList = await this.tasksService.listSugeridas(this.activity().id, this.transactionId);
    if (this.transactionId) {
      transaccionesList = transaccionesList.filter(x => x.IdTransaccion === this.transactionId);
    }
    const transaccionesFilter = transaccionesList.filter(trx =>
      (trx.Punto?.toLowerCase().includes(query) ||
       trx.Tercero?.toLowerCase().includes(query))
    );
    this.transactions.set(transaccionesFilter.length > 0
      ? await this.cardService.mapTransacciones(transaccionesFilter)
      : await this.cardService.mapTransacciones(transaccionesList)
    );

    this.tasks.set(await this.cardService.mapTareas(
      tareasList.filter(tarea => tarea.Material?.toLowerCase().includes(query))
    ));
  }

  async openAddTarea() {
    const modal = await this.modalCtrl.create({
        component: TaskAddComponent,
        componentProps: {
            idActividad: this.activity().id,
            idTransaccion: this.transactionId,
        },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
        await Utils.showLoading('Actualizando información');

        if (data.IdTransaccion) {
            const transaccion = this.transactions().find(x => x.id == data.IdTransaccion);
            if (!transaccion) {
                const transaccionGlobal = await this.transactionsService.get(this.activity().id, data.IdTransaccion);
                if (transaccionGlobal) {
                    const transaction = await this.cardService.mapTransaccion(transaccionGlobal);
                    this.transactions().push(transaction);
                }
            } else {
                this.transactions.update(transactions => {
                    const transactionToUpdate = transactions.find(t => t.id === data.IdTransaccion);
                    if (transactionToUpdate) {
                      transactionToUpdate.successItems = (transactionToUpdate.successItems ?? 0) + 1;
                      transactionToUpdate.quantity = (transactionToUpdate.quantity ?? 0) + (data.Cantidad ?? 0);
                      transactionToUpdate.weight = (transactionToUpdate.weight ?? 0) + (data.Peso ?? 0);
                      transactionToUpdate.volume = (transactionToUpdate.volume ?? 0) + (data.Volumen ?? 0);
                      this.cardService.updateVisibleProperties(transactionToUpdate);
                    }
                    return transactions;
                });
            }
        }

        var task = await this.cardService.mapTarea(data);
        this.tasks().push(task);

        this.activity.update(activity => {
            if (activity) {
              activity.successItems = (activity.successItems ?? 0) + 1;
              activity.quantity = (activity.quantity ?? 0) + (data.Cantidad ?? 0);
              activity.weight = (activity.weight ?? 0) + (data.Peso ?? 0);
              activity.volume = (activity.volume ?? 0) + (data.Volumen ?? 0);
            }
            this.cardService.updateVisibleProperties(activity);
            return activity;
        });
        await Utils.hideLoading();

      //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
      this.synchronizationService.uploadData();
    }
  }

  async openEditTarea(task: Card) {
    const currentActivity = this.activity();
    if (!currentActivity) {
      return;
    }

    const modal = await this.modalCtrl.create({
      component: TaskEditComponent,
      componentProps: {
        activityId: currentActivity.id,
        transactionId: task.parentId,
        taskId: task.id,
        materialId: task.materialId,
        residueId: task.residueId,
        inputOutput: task.inputOutput,
        showName: true,
        showPin: true,
        showNotes: true,
        showSignPad: true
      },
    });

    await modal.present();

    const { data }  = await modal.onDidDismiss();
    if (data)
    {
      await Utils.showLoading('Actualizando información');

      this.tasks.update(tasks => {
        const taskToUpdate = tasks.find(t => t.id === task.id);
        if (taskToUpdate) {
          taskToUpdate.status = data.IdEstado;
          if (data.IdEstado == STATUS.APPROVED) {
            taskToUpdate.quantity = data.Cantidad;
            taskToUpdate.weight = data.Peso;
            taskToUpdate.volume = data.Volumen;
          }
          this.cardService.updateVisibleProperties(taskToUpdate);
        }
        return tasks;
      });

      if (task.parentId != null) {
        this.transactions.update(transactions => {
          const transactionToUpdate = transactions.find(t => t.id === task.parentId);
          if (transactionToUpdate) {
            transactionToUpdate.pendingItems = (transactionToUpdate.pendingItems ?? 0) - 1;
            if (data.IdEstado === STATUS.APPROVED) {
              transactionToUpdate.successItems = (transactionToUpdate.successItems ?? 0) + 1;
              transactionToUpdate.quantity = (transactionToUpdate.quantity ?? 0) + (data.Cantidad ?? 0);
              transactionToUpdate.weight = (transactionToUpdate.weight ?? 0) + (data.Peso ?? 0);
              transactionToUpdate.volume = (transactionToUpdate.volume ?? 0) + (data.Volumen ?? 0);
            } else if (data.IdEstado === STATUS.REJECTED) {
              transactionToUpdate.rejectedItems = (transactionToUpdate.rejectedItems ?? 0) + 1;
            }
            this.cardService.updateVisibleProperties(transactionToUpdate);
          }
          return transactions;
        });
      }

      this.activity.update(activity => {
        if (activity) {
          activity.pendingItems = (activity.pendingItems ?? 0) - 1;
          if (data.IdEstado === STATUS.APPROVED) {
              activity.successItems = (activity.successItems ?? 0) + 1;
              activity.quantity = (activity.quantity ?? 0) + (data.Cantidad ?? 0);
              activity.weight = (activity.weight ?? 0) + (data.Peso ?? 0);
              activity.volume = (activity.volume ?? 0) + (data.Volumen ?? 0);
          } else if (data.IdEstado === STATUS.REJECTED) {
              activity.rejectedItems = (activity.rejectedItems ?? 0) + 1;
          }
        }
        this.cardService.updateVisibleProperties(activity);
        return activity;
      });

      await Utils.hideLoading();

      //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
      this.synchronizationService.uploadData();
    }
  }

  async openApproveTransaccion(id: string){
    const currentActivity = this.activity();
    if (!currentActivity) {
      return;
    }

    const currentTransaction = this.transactions().find(x => x.id == id);
    if (!currentTransaction){
      return;
    }

    try {
      const modal =   await this.modalCtrl.create({
        component: TransactionApproveComponent,
        componentProps: {
          activityId: currentActivity.id,
          transaction: currentTransaction,
          approveOrReject: 'approve',
        },
      });
      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data != null) {
        await Utils.showLoading('Actualizando información');

        const pendientes = this.tasks().filter(x => x.parentId == id && x.status == STATUS.PENDING).length;

        this.transactions.update(transactions => {
          const transaccion = transactions.find(x => x.id == id);
          if (transaccion) {
            transaccion.status = STATUS.APPROVED;
            transaccion.rejectedItems = (transaccion.rejectedItems ?? 0) + (transaccion.pendingItems ?? 0);
            transaccion.pendingItems = 0;
            this.cardService.updateVisibleProperties(transaccion);
          }
          return transactions;
        });

        this.tasks.update(tasks => {
          const filteredTasks = tasks.filter(x => x.parentId == id && x.status == STATUS.PENDING);
          filteredTasks.forEach(task => {
            task.status = STATUS.REJECTED;
            this.cardService.updateVisibleProperties(task);
          });
          return tasks;
        });

        this.activity.update(activity => {
          if (activity) {
            activity.pendingItems = (activity.pendingItems ?? 0) - pendientes > 0? (activity.pendingItems ?? 0) - pendientes: 0;
            activity.rejectedItems = (activity.rejectedItems ?? 0) + pendientes;
          }
          this.cardService.updateVisibleProperties(activity);
          return activity;
        });
      }

      this.showAdd = false;
      await Utils.hideLoading();

      //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
      this.synchronizationService.uploadData();

    } catch (error) {
      console.error(error);
      await Utils.hideLoading();
    }
  }

  async openRejectTransaccion(id: string) {
    const currentActivity = this.activity();
    if (!currentActivity) {
      return;
    }

    const currentTransaction = this.transactions().find(x => x.id == id);
    if (!currentTransaction){
      return;
    }

    const modal =   await this.modalCtrl.create({
      component: TransactionApproveComponent,
      componentProps: {
        activityId: currentActivity.id,
        transaction: currentTransaction,
        approveOrReject: 'reject',
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data != null)
    {
      await Utils.showLoading('Actualizando información');

      const pendientes = this.tasks().filter(x => x.parentId == id && x.status == STATUS.PENDING).length;

      this.transactions.update(transactions => {
        const transaccion = transactions.find(x => x.id == id);
        if (transaccion) {
          transaccion.status = STATUS.APPROVED;
          transaccion.rejectedItems = (transaccion.rejectedItems ?? 0) + (transaccion.pendingItems ?? 0);
          transaccion.pendingItems = 0;
          this.cardService.updateVisibleProperties(transaccion);
        }
        return transactions;
      });

      this.tasks.update(tasks => {
        const filteredTasks = tasks.filter(x => x.parentId == id && x.status == STATUS.PENDING);
        filteredTasks.forEach(task => {
          task.status = STATUS.REJECTED;
          this.cardService.updateVisibleProperties(task);
        });
        return tasks;
      });

      this.activity.update(activity => {
        if (activity) {
          activity.pendingItems = (activity.pendingItems ?? 0) - pendientes > 0? (activity.pendingItems ?? 0) - pendientes: 0;
          activity.rejectedItems = (activity.rejectedItems ?? 0) + pendientes;
        }
        this.cardService.updateVisibleProperties(activity);
        return activity;
      });

      this.showAdd = false;
      await Utils.hideLoading();

      //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
      this.synchronizationService.uploadData();

    }
  }
  getColor() {
    return this.synchronizationService.pendingTransactions() > 0 ? 'danger' : 'success';
  }

  async synchronize() {
    await Utils.showLoading('Sincronizando...');
    try {
      const success = await this.sessionService.refresh();
      await Utils.hideLoading();

      if (success) {
        await Utils.showToast('Sincronización exitosa', "middle");
        // Recargar los datos después de una sincronización exitosa
        await this.ionViewWillEnter();
      } else {
        await Utils.showToast('No hay conexión con el servidor. Intente de nuevo más tarde', "middle");
      }
    } catch (error) {
      await Utils.hideLoading();
      console.error('Error durante la sincronización:', error);
      await Utils.showToast('Error durante la sincronización. Intente de nuevo más tarde', "middle");
    }
  }
}
