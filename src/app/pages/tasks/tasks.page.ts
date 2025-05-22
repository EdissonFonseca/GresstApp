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
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/components/components.module';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

/**
 * TasksPage component that displays and manages tasks for a specific activity or transaction.
 * Handles task listing, filtering, creation, editing, and approval/rejection of transactions.
 */
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ComponentsModule, TranslateModule]
})
export class TasksPage implements OnInit {
  /** Signal containing the current activity displayed as a card */
  activity = signal<Card>({id:'', title: '', status: STATUS.PENDING, type:'activity'});
  /** Signal containing the list of transactions displayed as cards */
  transactions = signal<Card[]>([]);
  /** Signal containing the list of tasks displayed as cards */
  tasks = signal<Card[]>([]);
  /** ID of the current transaction being viewed */
  transactionId: string = '';
  /** Title of the current activity */
  title: string = '';
  /** Flag indicating whether the add task button should be shown */
  showAdd: boolean = true;
  /** Mode of operation ('A' for activity, 'T' for transaction) */
  mode: string = 'A';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController,
    private cardService: CardService,
    private transactionsService: TransactionsService,
    private tasksService: TasksService,
    public sessionService: SessionService,
    private userNotificationService: UserNotificationService,
    private translate: TranslateService
  ) {}

  /**
   * Initialize component by loading activity data and setting up mode
   */
  async ngOnInit() {
    try {
      this.route.queryParams.subscribe(params => {
        this.mode = params['Mode'];
        this.transactionId = params['TransactionId'];
      });
      const nav = this.router.getCurrentNavigation();
      if (nav?.extras.state) {
        const newActivity = nav.extras.state['activity'];
        if (newActivity) {
          this.title = newActivity.title;
          this.activity.set(newActivity);
        }
      }
    } catch (error) {
      console.error('Error initializing tasks page:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.INIT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Load tasks and transactions when the page is about to enter
   */
  async ionViewWillEnter() {
    try {
      let transactionList = await this.transactionsService.list(this.activity().id);
      if (this.transactionId) {
        transactionList = transactionList.filter(x => x.IdTransaccion == this.transactionId);
        const transaction = transactionList[0];
        if (transaction) {
          this.showAdd = transaction.IdEstado == STATUS.PENDING;
        }
      } else {
        this.showAdd = this.activity().status == STATUS.PENDING;
      }
      const mappedTransactions = await this.cardService.mapTransacciones(transactionList);
      const suggestedTasks = await this.tasksService.listSugeridas(this.activity().id);
      const mappedTasks = this.cardService.mapTareas(suggestedTasks);

      this.transactions.set(mappedTransactions);
      this.tasks.set(mappedTasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.LOAD_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Filter tasks by transaction ID
   * @param transactionId - The ID of the transaction to filter tasks for
   * @returns Array of tasks belonging to the specified transaction
   */
  filterTareas(transactionId: string): Card[] {
    return this.tasks().filter(x => x.parentId == transactionId);
  }

  /**
   * Handle search input to filter tasks and transactions
   * @param event - The input event containing the search query
   */
  async handleInput(event: any) {
    try {
      const query = event.target.value.toLowerCase();
      let transactionList = await this.transactionsService.list(this.activity().id);
      const taskList = await this.tasksService.listSugeridas(this.activity().id, this.transactionId);
      if (this.transactionId) {
        transactionList = transactionList.filter(x => x.IdTransaccion === this.transactionId);
      }
      const filteredTransactions = transactionList.filter(trx =>
        (trx.Punto?.toLowerCase().includes(query) ||
         trx.Tercero?.toLowerCase().includes(query))
      );
      this.transactions.set(filteredTransactions.length > 0
        ? await this.cardService.mapTransacciones(filteredTransactions)
        : await this.cardService.mapTransacciones(transactionList)
      );

      this.tasks.set(await this.cardService.mapTareas(
        taskList.filter(task => task.Material?.toLowerCase().includes(query))
      ));
    } catch (error) {
      console.error('Error filtering tasks:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.FILTER_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the add task modal
   */
  async openAddTarea() {
    try {
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
        await this.userNotificationService.showLoading(
          this.translate.instant('TASKS.MESSAGES.UPDATING_INFO')
        );

        if (data.IdTransaccion) {
          const transaction = this.transactions().find(x => x.id == data.IdTransaccion);
          if (!transaction) {
            const globalTransaction = await this.transactionsService.get(this.activity().id, data.IdTransaccion);
            if (globalTransaction) {
              const mappedTransaction = await this.cardService.mapTransaccion(globalTransaction);
              this.transactions().push(mappedTransaction);
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

        const mappedTask = await this.cardService.mapTarea(data);
        this.tasks().push(mappedTask);

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
        await this.userNotificationService.hideLoading();

        // This call is made without await to not block the screen and run in background
        this.sessionService.uploadData();
      }
    } catch (error) {
      console.error('Error adding task:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.ADD_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the edit task modal
   * @param task - The task card to edit
   */
  async openEditTarea(task: Card) {
    try {
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

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(
          this.translate.instant('TASKS.MESSAGES.UPDATING_INFO')
        );

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

        await this.userNotificationService.hideLoading();

        // This call is made without await to not block the screen and run in background
        this.sessionService.uploadData();
      }
    } catch (error) {
      console.error('Error editing task:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.EDIT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the approve transaction modal
   * @param id - The ID of the transaction to approve
   */
  async openApproveTransaccion(id: string) {
    try {
      const currentActivity = this.activity();
      if (!currentActivity) {
        return;
      }

      const currentTransaction = this.transactions().find(x => x.id == id);
      if (!currentTransaction) {
        return;
      }

      const modal = await this.modalCtrl.create({
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
        await this.userNotificationService.showLoading(
          this.translate.instant('TASKS.MESSAGES.UPDATING_INFO')
        );

        const pendingTasks = this.tasks().filter(x => x.parentId == id && x.status == STATUS.PENDING).length;

        this.transactions.update(transactions => {
          const transaction = transactions.find(x => x.id == id);
          if (transaction) {
            transaction.status = STATUS.APPROVED;
            transaction.rejectedItems = (transaction.rejectedItems ?? 0) + (transaction.pendingItems ?? 0);
            transaction.pendingItems = 0;
            this.cardService.updateVisibleProperties(transaction);
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
            activity.pendingItems = (activity.pendingItems ?? 0) - pendingTasks > 0 ? (activity.pendingItems ?? 0) - pendingTasks : 0;
            activity.rejectedItems = (activity.rejectedItems ?? 0) + pendingTasks;
          }
          this.cardService.updateVisibleProperties(activity);
          return activity;
        });

        this.showAdd = false;
        await this.userNotificationService.hideLoading();

        // This call is made without await to not block the screen and run in background
        this.sessionService.uploadData();
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.APPROVE_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the reject transaction modal
   * @param id - The ID of the transaction to reject
   */
  async openRejectTransaccion(id: string) {
    try {
      const currentActivity = this.activity();
      if (!currentActivity) {
        return;
      }

      const currentTransaction = this.transactions().find(x => x.id == id);
      if (!currentTransaction) {
        return;
      }

      const modal = await this.modalCtrl.create({
        component: TransactionApproveComponent,
        componentProps: {
          activityId: currentActivity.id,
          transaction: currentTransaction,
          approveOrReject: 'reject',
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data != null) {
        await this.userNotificationService.showLoading(
          this.translate.instant('TASKS.MESSAGES.UPDATING_INFO')
        );

        const pendingTasks = this.tasks().filter(x => x.parentId == id && x.status == STATUS.PENDING).length;

        this.transactions.update(transactions => {
          const transaction = transactions.find(x => x.id == id);
          if (transaction) {
            transaction.status = STATUS.APPROVED;
            transaction.rejectedItems = (transaction.rejectedItems ?? 0) + (transaction.pendingItems ?? 0);
            transaction.pendingItems = 0;
            this.cardService.updateVisibleProperties(transaction);
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
            activity.pendingItems = (activity.pendingItems ?? 0) - pendingTasks > 0 ? (activity.pendingItems ?? 0) - pendingTasks : 0;
            activity.rejectedItems = (activity.rejectedItems ?? 0) + pendingTasks;
          }
          this.cardService.updateVisibleProperties(activity);
          return activity;
        });

        this.showAdd = false;
        await this.userNotificationService.hideLoading();

        // This call is made without await to not block the screen and run in background
        this.sessionService.uploadData();
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.REJECT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Get the color for the synchronization status
   * @returns string - The color code for the synchronization status
   */
  getColor() {
    return this.sessionService.pendingTransactions() > 0 ? 'danger' : 'success';
  }

  /**
   * Synchronize data with the server
   */
  async synchronize() {
    try {
      await this.userNotificationService.showLoading(
        this.translate.instant('TASKS.MESSAGES.UPDATING_INFO')
      );
      const success = await this.sessionService.synchronize();
      await this.userNotificationService.hideLoading();

      if (success) {
        await this.userNotificationService.showToast(
          this.translate.instant('TASKS.MESSAGES.SYNC_SUCCESS'),
          'middle'
        );
        // Reload data after successful synchronization
        await this.ionViewWillEnter();
      } else {
        await this.userNotificationService.showToast(
          this.translate.instant('TASKS.MESSAGES.NO_CONNECTION'),
          'middle'
        );
      }
    } catch (error) {
      await this.userNotificationService.hideLoading();
      console.error('Error during synchronization:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.SYNC_ERROR'),
        'middle'
      );
    }
  }
}
