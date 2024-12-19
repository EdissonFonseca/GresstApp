import { Component, Input, OnInit, signal, Signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionApproveComponent } from 'src/app/components/transaction-approve/transaction-approve.component';
import { Estado } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { ModalController } from '@ionic/angular';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { TareasService } from 'src/app/services/tareas.service';
import { TaskEditComponent } from 'src/app/components/task-edit/task-edit.component';
import { Card } from '@app/interfaces/card';
import { CardService } from '@app/services/card.service';
import { SynchronizationService } from '@app/services/synchronization.service';

@Component({
  selector: 'app-tareas',
  templateUrl: './tareas.page.html',
  styleUrls: ['./tareas.page.scss'],
})
export class TareasPage implements OnInit {
  activity = signal<Card>({id:'', title: '', status: Estado.Pendiente, type:'activity'});
  transactions = signal<Card[]>([]);
  tasks = signal<Card[]>([]);
  transactionId: string = '';
  title: string = '';
  showAdd: boolean = true;
  mode: string = 'A';

  constructor(
    private globales: GlobalesService,
    private route: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController,
    private cardService: CardService,
    private transaccionesService: TransaccionesService,
    private tareasService: TareasService,
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
    let transacciones = await this.transaccionesService.list(this.activity().id);
    if (this.transactionId) {
      transacciones = transacciones.filter(x => x.IdTransaccion == this.transactionId);
      const transaccion = transacciones[0];
      if (transaccion)
        this.showAdd = transaccion.IdEstado == Estado.Pendiente;
    } else {
      this.showAdd = this.activity().status == Estado.Pendiente;
    }
    const mappedTransactions = await this.cardService.mapTransacciones(transacciones);
    const tareas = await this.tareasService.listSugeridas(this.activity().id);
    const mappedTasks = this.cardService.mapTareas(tareas);

    this.transactions.set(mappedTransactions);
    this.tasks.set(mappedTasks);
  }

  filterTareas(transactionId: string): Card[] {
    return this.tasks().filter(x => x.parentId == transactionId);
  }

  async handleInput(event: any) {
    const query = event.target.value.toLowerCase();
    let transaccionesList = await this.transaccionesService.list(this.activity().id);
    const tareasList = await this.tareasService.listSugeridas(this.activity().id, this.transactionId);
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
            IdActividad: this.activity().id,
            IdTransaccion: this.transactionId,
        },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
        await this.globales.showLoading('Actualizando información');

        if (data.IdTransaccion) {
            const transaccion = this.transactions().find(x => x.id == data.IdTransaccion);
            if (!transaccion) {
                const transaccionGlobal = await this.transaccionesService.get(this.activity().id, data.IdTransaccion);
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
        await this.globales.hideLoading();

      //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
      this.synchronizationService.uploadTransactions();
    }
  }

  async openEditTarea(task: Card) {
    const currentActivity = this.activity();
    if (!currentActivity) {
      return;
    }

    const modal =   await this.modalCtrl.create({
      component: TaskEditComponent,
      componentProps: {
        ActivityId: currentActivity.id,
        TransactionId: task.parentId,
        TaskId: task.id,
      },
    });

    await modal.present();

    const { data }  = await modal.onDidDismiss();
    if (data)
    {
      await this.globales.showLoading('Actualizando información');

      this.tasks.update(tasks => {
        const taskToUpdate = tasks.find(t => t.id === task.id);
        if (taskToUpdate) {
          taskToUpdate.status = data.IdEstado;
          if (data.IdEstado == Estado.Aprobado) {
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
            if (data.IdEstado === Estado.Aprobado) {
              transactionToUpdate.successItems = (transactionToUpdate.successItems ?? 0) + 1;
              transactionToUpdate.quantity = (transactionToUpdate.quantity ?? 0) + (data.Cantidad ?? 0);
              transactionToUpdate.weight = (transactionToUpdate.weight ?? 0) + (data.Peso ?? 0);
              transactionToUpdate.volume = (transactionToUpdate.volume ?? 0) + (data.Volumen ?? 0);
            } else if (data.IdEstado === Estado.Rechazado) {
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
          if (data.IdEstado === Estado.Aprobado) {
              activity.successItems = (activity.successItems ?? 0) + 1;
              activity.quantity = (activity.quantity ?? 0) + (data.Cantidad ?? 0);
              activity.weight = (activity.weight ?? 0) + (data.Peso ?? 0);
              activity.volume = (activity.volume ?? 0) + (data.Volumen ?? 0);
          } else if (data.IdEstado === Estado.Rechazado) {
              activity.rejectedItems = (activity.rejectedItems ?? 0) + 1;
          }
        }
        this.cardService.updateVisibleProperties(activity);
        return activity;
      });

      await this.globales.hideLoading();

      //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
      this.synchronizationService.uploadTransactions();
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
        await this.globales.showLoading('Actualizando información');

        const pendientes = this.tasks().filter(x => x.parentId == id && x.status == Estado.Pendiente).length;

        this.transactions.update(transactions => {
          const transaccion = transactions.find(x => x.id == id);
          if (transaccion) {
            transaccion.status = Estado.Aprobado;
            transaccion.rejectedItems = (transaccion.rejectedItems ?? 0) + (transaccion.pendingItems ?? 0);
            transaccion.pendingItems = 0;
            this.cardService.updateVisibleProperties(transaccion);
          }
          return transactions;
        });

        this.tasks.update(tasks => {
          const filteredTasks = tasks.filter(x => x.parentId == id && x.status == Estado.Pendiente);
          filteredTasks.forEach(task => {
            task.status = Estado.Rechazado;
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
      await this.globales.hideLoading();

      //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
      this.synchronizationService.uploadTransactions();

    } catch (error) {
      console.error(error);
      await this.globales.hideLoading();
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
      await this.globales.showLoading('Actualizando información');

      const pendientes = this.tasks().filter(x => x.parentId == id && x.status == Estado.Pendiente).length;

      this.transactions.update(transactions => {
        const transaccion = transactions.find(x => x.id == id);
        if (transaccion) {
          transaccion.status = Estado.Aprobado;
          transaccion.rejectedItems = (transaccion.rejectedItems ?? 0) + (transaccion.pendingItems ?? 0);
          transaccion.pendingItems = 0;
          this.cardService.updateVisibleProperties(transaccion);
        }
        return transactions;
      });

      this.tasks.update(tasks => {
        const filteredTasks = tasks.filter(x => x.parentId == id && x.status == Estado.Pendiente);
        filteredTasks.forEach(task => {
          task.status = Estado.Rechazado;
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
      await this.globales.hideLoading();

      //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
      this.synchronizationService.uploadTransactions();

    }
  }
  getColor() {
    return this.synchronizationService.pendingTransactions() > 0 ? 'danger' : 'success';
  }

  async synchronize() {
    if (await this.synchronizationService.refresh()){
      this.globales.presentToast('Sincronización exitosa', "middle");
    } else {
      this.globales.presentToast('Sincronización fallida. Intente de nuevo mas tarde', "middle");
    }
  }
}
