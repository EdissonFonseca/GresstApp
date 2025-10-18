import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { STATUS } from '@app/core/constants';
import { TaskAddComponent } from '@app/presentation/components/task-add/task-add.component';
import { ModalController } from '@ionic/angular';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { TaskService } from '@app/application/services/task.service';
import { TaskEditComponent } from '@app/presentation/components/task-edit/task-edit.component';
import { CardService } from '@app/presentation/services/card.service';
import { SessionService } from '@app/application/services/session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/presentation/components/components.module';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { ProcessService } from '@app/application/services/process.service';

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
  /** Signal for the ID of the current activity (process) */
  activityId = signal<string>('');

  /** Signal for the ID of the current transaction (subprocess) being viewed */
  subprocessId = signal<string>('');

  /** Title of the current activity */
  title: string = '';

  /** Flag indicating whether the add task button should be shown */
  showAdd: boolean = true;

  /** Mode of operation ('A' for activity, 'T' for transaction) */
  mode: string = 'A';

  /** Signal for loading state */
  loading = signal(false);

  /** Computed signal that gets subprocess cards filtered by process ID and optionally by subprocess ID */
  subprocessCards = computed(() => {
    const processId = this.activityId();
    const subprocessId = this.subprocessId();

    if (!processId) return [];

    const allSubprocesses = this.cardService.getSubprocessesByProcess(processId)();

    // If we have a specific subprocess ID, filter to show only that one
    if (subprocessId) {
      return allSubprocesses.filter(sp => sp.id === subprocessId);
    }

    // Otherwise show all subprocesses for the process
    return allSubprocesses;
  });

  /** Computed signal that gets all task cards filtered by process or subprocess */
  taskCards = computed(() => {
    const processId = this.activityId();
    const subprocessId = this.subprocessId();

    // If we have a specific subprocess, filter tasks by that subprocess
    if (subprocessId) {
      return this.cardService.getTasksBySubprocess(subprocessId)();
    }

    // Otherwise, get all tasks for the process (across all subprocesses)
    if (processId) {
      const subprocesses = this.cardService.getSubprocessesByProcess(processId)();
      const allTasks: Card[] = [];
      subprocesses.forEach(subprocess => {
        const tasks = this.cardService.getTasksBySubprocess(subprocess.id)();
        allTasks.push(...tasks);
      });
      return allTasks;
    }

    return [];
  });


  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private modalCtrl: ModalController,
    private cardService: CardService,
    private processService: ProcessService,
    private subprocessService: SubprocessService,
    private taskService: TaskService,
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
        // Support new parameter names (SubprocessId, ProcessId) and legacy names for backward compatibility
        this.subprocessId.set(params['subprocessId'] || params['transactionId'] || '');
        this.activityId.set(params['processId'] || params['activityId'] || '');
      });

      await this.loadData();

      // Get process title
      const activityData = await this.processService.get(this.activityId());
      if (activityData) {
        this.title = activityData.Title;
      }

      // Check subprocess status to determine if add button should be shown
      if (this.subprocessId()) {
        const subprocessCards = this.subprocessCards();
        if (subprocessCards.length > 0) {
          // Use the card's status (already loaded from CardService)
          this.showAdd = subprocessCards[0].status === STATUS.PENDING;
        }
      } else {
        // If no specific subprocess, don't allow adding tasks
        this.showAdd = false;
      }
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
   * Note: Data is automatically loaded from CardService's global signal
   * This method is kept for explicit refresh operations if needed
   */
  async loadData() {
    try {
      this.loading.set(true);
      // Data is already loaded in CardService.allCards signal
      // No need to fetch again, just trigger change detection
      await this.cardService.loadAllHierarchy();
    } catch (error) {
      this.logger.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Get tasks for a specific subprocess, sorted by status
   * @param subprocessId - The ID of the subprocess to get tasks for
   * @returns Array of tasks belonging to the specified subprocess, sorted by status
   */
  getTasksForSubprocess(subprocessId: string): Card[] {
    // Define the order of statuses
    const statusOrder: Record<string, number> = {
      [STATUS.PENDING]: 1,
      [STATUS.APPROVED]: 2,
      [STATUS.REJECTED]: 3
    };

    const tasks = this.cardService.getTasksBySubprocess(subprocessId)();

    // Sort tasks by status
    return tasks.sort((a: Card, b: Card) => {
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
          processId: this.activityId(),
          subprocessId: this.subprocessId(),
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
          processId: this.activityId(),
          subprocessId: card.parentId,
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
      this.router.navigate(['/subprocesses'], {
        queryParams: {
          mode: 'A',
          processId: this.activityId()
        }
      });
    } else {
      this.router.navigate(['/processes']);
    }
  }
}
