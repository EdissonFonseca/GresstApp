import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TransactionApproveComponent } from 'src/app/components/transaction-approve/transaction-approve.component';
import { STATUS } from '@app/constants/constants';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { ModalController } from '@ionic/angular';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { TasksService } from '@app/services/transactions/tasks.service';
import { TaskEditComponent } from 'src/app/components/task-edit/task-edit.component';
import { CardService } from '@app/services/core/card.service';
import { SessionService } from '@app/services/core/session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/components/components.module';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Card } from '@app/interfaces/card.interface';
import { Transaccion } from '@app/interfaces/transaccion.interface';
import { Tarea } from '@app/interfaces/tarea.interface';

/**
 * TasksPage Component
 *
 * Manages and displays tasks for a specific activity or transaction.
 * Provides functionality for:
 * - Viewing and filtering tasks
 * - Adding new tasks
 * - Editing existing tasks
 * - Approving/rejecting transactions
 * - Synchronizing data with the server
 */
@Component({
  selector: 'app-tasks',
  templateUrl: './tasks.page.html',
  styleUrls: ['./tasks.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    ComponentsModule,
    TranslateModule
  ]
})
export class TasksPage implements OnInit {
  /** Signal containing the current activity displayed as a card */
  activity = signal<Card>({id:'', title: '', status: STATUS.PENDING, type:'activity'});

  /** Signal containing the list of transactions from the service */
  private transactionsSignal = this.transactionsService.transactions;

  /** Signal containing the list of tasks from the service */
  private tasksSignal = this.tasksService.tasks$;

  /** Flag indicating if synchronization is in progress */
  isSynchronizing: boolean = false;

  /** Computed property that transforms transactions into cards for display */
  transactions = computed(async () => {
    const transactionList = this.transactionsSignal();
    return await this.cardService.mapTransacciones(transactionList);
  });

  /** Computed property that transforms tasks into cards for display */
  tasks = computed(() => {
    const taskList = this.tasksSignal();
    console.log('tasks computed', taskList);
    return this.cardService.mapTareas(taskList);
  });

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
   * Called when the component is created
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
          await this.loadData();
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
   * Called before the page is displayed
   */
  async ionViewWillEnter() {
    try {
      await this.loadData();
    } catch (error) {
      console.error('Error loading tasks:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.LOAD_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Load all necessary data for the page
   * - Loads transactions for the current activity
   * - Loads tasks for the current activity/transaction
   * - Sets up edit permissions based on status
   */
  private async loadData() {
    try {
      await this.transactionsService.loadTransactions(this.activity().id);
      await this.tasksService.load(this.activity().id, this.transactionId);

      if (this.transactionId) {
        const transactionList = this.transactionsSignal();
        const transaction = transactionList.find(x => x.IdTransaccion === this.transactionId);
        if (transaction) {
          this.showAdd = transaction.IdEstado === STATUS.PENDING;
        }
      } else {
        this.showAdd = this.activity().status === STATUS.PENDING;
      }
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  /**
   * Filter tasks by transaction ID
   * @param transactionId - The ID of the transaction to filter tasks for
   * @returns Array of tasks belonging to the specified transaction
   */
  filterTareas(transactionId: string): Card[] {
    const taskList = this.tasks();
    return taskList.filter((x: Card) => x.parentId === transactionId);
  }

  /**
   * Handle search input to filter tasks and transactions
   * Updates the displayed lists based on the search query
   * @param event - The input event containing the search query
   */
  async handleInput(event: any) {
    try {
      const query = event.target.value.toLowerCase();

      // Filter transactions based on point or third party name
      const transactionList = this.transactionsSignal().filter((trx: Transaccion) =>
        (trx.Punto?.toLowerCase().includes(query) ||
         trx.Tercero?.toLowerCase().includes(query))
      );
      await this.transactionsService.loadTransactions(this.activity().id);

      // Filter tasks based on material name
      const taskList = this.tasksSignal().filter((task: Tarea) =>
        task.Material?.toLowerCase().includes(query)
      );
      await this.tasksService.load(this.activity().id, this.transactionId);
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
   * Creates a new task for the current activity/transaction
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

        await this.loadData();
        await this.userNotificationService.hideLoading();
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
   * Allows editing of an existing task's properties
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

        await this.loadData();
        await this.userNotificationService.hideLoading();

        // Upload data in background
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
   * Handles the approval process for a transaction
   * @param id - The ID of the transaction to approve
   */
  async openApproveTransaccion(id: string) {
    try {
      const currentActivity = this.activity();
      if (!currentActivity) {
        return;
      }

      const transactions = await this.transactions();
      const currentTransaction = transactions.find((x: Card) => x.id === id);
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

        await this.loadData();
        this.showAdd = false;
        await this.userNotificationService.hideLoading();

        // Upload data in background
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
   * Handles the rejection process for a transaction
   * @param id - The ID of the transaction to reject
   */
  async openRejectTransaccion(id: string) {
    try {
      const currentActivity = this.activity();
      if (!currentActivity) {
        return;
      }

      const transactions = await this.transactions();
      const currentTransaction = transactions.find((x: Card) => x.id === id);
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

        await this.loadData();
        this.showAdd = false;
        await this.userNotificationService.hideLoading();

        // Upload data in background
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
   * Updates local data with server data
   */
  async synchronize() {
    try {
      this.isSynchronizing = true;
      await this.loadData();
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.SYNC_SUCCESS'),
        'top'
      );
    } catch (error) {
      console.error('Error synchronizing data:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.SYNC_ERROR'),
        'middle'
      );
    } finally {
      this.isSynchronizing = false;
    }
  }
}
