import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { TaskAddComponent } from '@app/presentation/components/task-add/task-add.component';
import { SubprocessApproveComponent } from '@app/presentation/components/subprocess-approve/subprocess-approve.component';
import { ProcessService } from '@app/application/services/process.service';
import { STATUS, SERVICE_TYPES } from '@app/core/constants';
import { environment } from '../../../../environments/environment';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { CardService } from '@app/presentation/services/card.service';
import { SessionService } from '@app/infrastructure/services/session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/presentation/components/components.module';
import { AuthorizationRepository } from '@app/infrastructure/repositories/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@app/infrastructure/services/logger.service';

/**
 * SubprocessesPage component that displays and manages a list of subprocesses for a specific activity.
 * Handles subprocess listing, filtering, creation, and navigation to subprocess details.
 * Supports different service types and manages subprocess states.
 */
@Component({
  selector: 'app-subprocesses',
  templateUrl: './subprocesses.page.html',
  styleUrls: ['./subprocesses.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ComponentsModule, TranslateModule]
})
export class SubprocessesPage implements OnInit {
  /** Title of the current activity */
  title: string = '';

  /** ID of the current activity */
  activityId: string = '';

  /** Flag indicating whether the add subprocess button should be shown */
  showAdd: boolean = true;

  /** Flag indicating whether the navigation button should be shown */
  showNavigation: boolean = true;

  /** Flag indicating whether the support documents button should be shown */
  showSupport: boolean = true;

  /** Signal for loading state */
  loading = signal(false);

  /** Signal containing the list of subprocesses from the service */
  private transactionsSignal = signal([]);

  /** Computed property that transforms subprocesses into cards for display */
  transactionCards = computed(() => {
    const transactionList = this.transactionsSignal();
    // Define the order of the statuses
    const statusOrder = {
      [STATUS.PENDING]: 1,
      [STATUS.APPROVED]: 2,
      [STATUS.REJECTED]: 3
    };

    // Sort subprocesses by status
    const sortedTransactions = transactionList;

    // Transform subprocesses to cards
    return this.cardService.mapTransacciones(sortedTransactions);
  });

  constructor(
    private navCtrl: NavController,
    private processService: ProcessService,
    private cardService: CardService,
    private subprocessService: SubprocessService,
    public sessionService: SessionService,
    private modalCtrl: ModalController,
    private actionSheet: ActionSheetController,
    private authorizationService: AuthorizationRepository,
    private userNotificationService: UserNotificationService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private logger: LoggerService
  ) {}

  /**
   * Initialize component by loading activity data and setting up permissions
   */
  async ngOnInit() {
    try {
      this.route.queryParams.subscribe(params => {
        this.activityId = params['activityId'];
      });
      const activityData = await this.processService.get(this.activityId);
      if (activityData) {
        this.title = activityData.Title;
        this.showAdd = activityData.StatusId == STATUS.PENDING;
        this.showNavigation = activityData.ServiceId == SERVICE_TYPES.TRANSPORT;
        this.showSupport = activityData.ServiceId == SERVICE_TYPES.TRANSPORT;
      }
      await this.loadData();
    } catch (error) {
      console.error('Error initializing subprocesses page:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.INIT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Load subprocesses when the page is about to enter
   */
  async ionViewWillEnter() {
    await this.loadData();
  }

  /**
   * Load data for the current activity
   */
  async loadData() {
    try {
      this.loading.set(true);
      await this.subprocessService.listByProcess(this.activityId);
    } catch (error) {
      this.logger.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Handle search input to filter subprocesses
   * @param event - The input event containing the search query
   */
  async handleInput(event: any) {
    await this.loadData();
  }

  /**
   * Navigate back to the activities page
   */
  goBack() {
    this.navCtrl.navigateBack('/home');
  }

  /**
   * Navigate to tasks page for a specific subprocess
   * @param transaction - The subprocess card to navigate to
   */
  navigateToTasks(transaction: Card) {
    try {
      const navigationExtras: NavigationExtras = {
        queryParams: { mode: 'T', transactionId: transaction.id, activityId: this.activityId },
      };
      this.navCtrl.navigateForward('/tasks', navigationExtras);
    } catch (error) {
      console.error('Error navigating to tasks:', error);
      this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.NAVIGATION_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Navigate to map page for the current activity
   */
  navigateToMap() {
    try {
      const navigationExtras: NavigationExtras = {
        queryParams: {
          IdActividad: this.activityId,
        }
      };
      this.navCtrl.navigateForward('/route', navigationExtras);
    } catch (error) {
      console.error('Error navigating to map:', error);
      this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.NAVIGATION_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Display support documents for the current activity
   */
  async showSupports() {
    try {
      const account = await this.authorizationService.getAccount();
      const activityData = await this.processService.get(this.activityId);
      const baseUrl = `${environment.filesUrl}/Cuentas/${account.IdPersonaCuenta}/Soportes/Ordenes/${activityData?.OrderId}/`;
      const documentsArray = activityData?.Support?.split(';');

      const buttons = documentsArray && documentsArray.length > 0
        ? documentsArray.map((doc: string) => ({
            text: `${doc}`,
            icon: 'document',
            handler: () => {
              const fullUrl = `${baseUrl}${doc}`;
              window.open(fullUrl, '_blank');
            }
          }))
        : [{
            text: this.translate.instant('TRANSACTIONS.MESSAGES.NO_DOCUMENTS'),
            icon: 'alert',
            handler: () => {
              this.logger.debug('No documents to show');
            }
          }];

      const actionSheet = await this.actionSheet.create({
        header: this.translate.instant('TRANSACTIONS.MESSAGES.DOCUMENTS'),
        buttons: buttons
      });

      await actionSheet.present();
    } catch (error) {
      console.error('Error showing support documents:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.DOCUMENTS_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the add subprocess modal
   * @param id - The ID of the subprocess to add tasks to
   */
  async openAdd() {
    try {
      const modal = await this.modalCtrl.create({
        component: TaskAddComponent,
        componentProps: {
          activityId: this.activityId
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('TRANSACTIONS.MESSAGES.UPDATING_INFO'));
        await this.loadData();
        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      this.logger.error('Error opening add modal:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.ADD_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the approve subprocess modal
   * @param id - The ID of the subprocess to approve
   */
  async openApprove(id: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: SubprocessApproveComponent,
        componentProps: {
          activityId: this.activityId,
          transactionId: id,
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(
          this.translate.instant('TRANSACTIONS.MESSAGES.UPDATING_INFO')
        );
        await this.loadData();
        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error opening approve modal:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.APPROVE_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the reject subprocess modal
   * @param id - The ID of the subprocess to reject
   */
  async openReject(id: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: SubprocessApproveComponent,
        componentProps: {
          activityId: this.activityId,
          transactionId: id,
          isReject: true,
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('TRANSACTIONS.MESSAGES.UPDATING_INFO'));
        await this.loadData();
        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error opening reject modal:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.REJECT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Synchronize data with the server
   */
  async synchronize() {
    try {
      await this.userNotificationService.showLoading(
        this.translate.instant('TRANSACTIONS.MESSAGES.SYNCHRONIZING')
      );
      await this.loadData();
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.SYNC_SUCCESS'),
        'middle'
      );
    } catch (error) {
      console.error('Error synchronizing data:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.SYNC_ERROR'),
        'middle'
      );
    }
  }
}

