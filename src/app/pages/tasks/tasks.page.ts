import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
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
import { LoggerService } from '@app/services/core/logger.service';
import { ActivitiesService } from '@app/services/transactions/activities.service';

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
  /** ID of the current activity */
  activityId: string = '';

  /** ID of the current transaction being viewed */
  transactionId: string = '';

  /** Title of the current activity */
  title: string = '';

  /** Flag indicating whether the add task button should be shown */
  showAdd: boolean = true;

  /** Mode of operation ('A' for activity, 'T' for transaction) */
  mode: string = 'A';

  /** Signal for loading state */
  loading = signal(false);

  /** Signal containing the list of transactions from the service */
  transactionsSignal = this.transactionsService.transactions$;

  /** Signal containing the list of tasks from the service */
  private tasksSignal = this.tasksService.tasks$;

  /** Computed property that provides the task cards */
  taskCards = computed(() => {
    const taskList = this.tasksSignal();
    return this.cardService.mapTareas(taskList);
  });


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController,
    private cardService: CardService,
    private activitiesService: ActivitiesService,
    private transactionsService: TransactionsService,
    private tasksService: TasksService,
    public sessionService: SessionService,
    private userNotificationService: UserNotificationService,
    private translate: TranslateService,
    private logger: LoggerService
  ) {}

  /**
   * Initialize component by loading activity data and setting up mode
   * Called when the component is created
   */
  async ngOnInit() {
    try {
      this.route.queryParams.subscribe(params => {
        this.mode = params['mode'];
        this.transactionId = params['transactionId'];
        this.activityId = params['activityId'];
      });
      const activityData = await this.activitiesService.get(this.activityId);
      if (activityData) {
        this.title = activityData.Titulo;
      }
      if (this.transactionId) {
        const transaction = await this.transactionsService.get(this.activityId, this.transactionId);
        if (transaction) {
          this.showAdd = transaction.IdEstado == STATUS.PENDING;
        }
      }
      await this.loadData();
    } catch (error) {
      this.logger.error('Error initializing tasks page:', error);
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
      await this.loadData();
  }

  /**
   * Handle search input to filter tasks and transactions
   * Updates the displayed lists based on the search query
   * @param event - The input event containing the search query
   */
  async handleInput(event: any) {
    await this.loadData();
  }

  /**
   * Load all necessary data for the page
   * - Loads transactions for the current activity
   * - Loads tasks for the current activity/transaction
   * - Sets up edit permissions based on status
   */
  async loadData() {
    try {
      this.loading.set(true);

      // Load transactions
      await this.transactionsService.list(this.activityId);

      // Load tasks
      await this.tasksService.list(this.activityId, this.transactionId);

    } catch (error) {
      this.logger.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Filter tasks by transaction ID and sort them by status
   * @param transactionId - The ID of the transaction to filter tasks for
   * @returns Array of tasks belonging to the specified transaction, sorted by status
   */
  filterTasks(transactionId: string): Card[] {
    // Define the order of statuses
    const statusOrder: Record<string, number> = {
      [STATUS.PENDING]: 1,
      [STATUS.APPROVED]: 2,
      [STATUS.REJECTED]: 3
    };

    const taskList = this.taskCards();
    const filteredTasks = taskList.filter((x: Card) => x.parentId === transactionId);

    // Sort tasks by status
    return filteredTasks.sort((a: Card, b: Card) => {
      const orderA = statusOrder[a.status] || 4; // Other statuses go last
      const orderB = statusOrder[b.status] || 4;
      return orderA - orderB;
    });
  }

  /**
   * Open the add task modal
   * Creates a new task for the current activity/transaction
   */
  async openAdd() {
    try {
      const modal = await this.modalCtrl.create({
        component: TaskAddComponent,
        componentProps: {
          activityId: this.activityId,
          transactionId: this.transactionId,
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('TASKS.MESSAGES.UPDATING_INFO'));
        await this.loadData();
        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      this.logger.error('Error adding task:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.ADD_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the edit task modal
   * Allows editing of an existing task's properties
   * @param card - The task card to edit
   */
  async openEdit(card: Card) {
    try {
      const modal = await this.modalCtrl.create({
        component: TaskEditComponent,
        componentProps: {
          activityId: this.activityId,
          transactionId: card.parentId,
          taskId: card.id,
          materialId: card.materialId,
          residueId: card.residueId,
          inputOutput: card.inputOutput,
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('TASKS.MESSAGES.UPDATING_INFO'));
        await this.loadData();
        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      this.logger.error('Error editing task:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.EDIT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Synchronize data with the server
   * Updates local data with server data
   */
  async synchronize() {
    try {
      await this.userNotificationService.showLoading(
        this.translate.instant('TASKS.MESSAGES.SYNCHRONIZING')
      );
      await this.loadData();
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.SYNC_SUCCESS'),
        'top'
      );
    } catch (error) {
      this.logger.error('Error synchronizing data:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TASKS.MESSAGES.SYNC_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Handle back navigation
   */
  goBack() {
    if (this.mode === 'T') {
      this.router.navigate(['/transactions'], {
        queryParams: {
          mode: 'A',
          activityId: this.activityId
        }
      });
    } else {
      this.router.navigate(['/activities']);
    }
  }
}
