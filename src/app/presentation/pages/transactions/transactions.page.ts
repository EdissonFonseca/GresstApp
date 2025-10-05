import { Component, OnInit, signal, computed } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { TaskAddComponent } from '@app/presentation/components/task-add/task-add.component';
import { TransactionApproveComponent } from '@app/presentation/components/transaction-approve/transaction-approve.component';
import { ProcessesService } from '@app/infrastructure/repositories/transactions/processes.repository';
import { STATUS, SERVICE_TYPES } from '@app/core/constants';
import { environment } from '../../../../environments/environment';
import { TransactionsService } from '@app/infrastructure/repositories/transactions/transactions.repository';
import { Card } from '@app/presentation/view-models/card.viewmodel';
import { CardService } from '@app/presentation/services/card.service';
import { SessionService } from '@app/infrastructure/services/session.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/presentation/components/components.module';
import { AuthorizationService } from '@app/infrastructure/repositories/masterdata/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@app/infrastructure/services/logger.service';

/**
 * TransactionsPage component that displays and manages a list of transactions for a specific activity.
 * Handles transaction listing, filtering, creation, and navigation to transaction details.
 * Supports different service types and manages transaction states.
 */
@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ComponentsModule, TranslateModule]
})
export class TransactionsPage implements OnInit {
  /** Title of the current activity */
  title: string = '';

  /** ID of the current activity */
  activityId: string = '';

  /** Flag indicating whether the add transaction button should be shown */
  showAdd: boolean = true;

  /** Flag indicating whether the navigation button should be shown */
  showNavigation: boolean = true;

  /** Flag indicating whether the support documents button should be shown */
  showSupport: boolean = true;

  /** Signal for loading state */
  loading = signal(false);

  /** Signal containing the list of transactions from the service */
  private transactionsSignal = this.transactionsService.transactions$;

  /** Computed property that transforms transactions into cards for display */
  transactionCards = computed(() => {
    const transactionList = this.transactionsSignal();
    // Define the order of the statuses
    const statusOrder = {
      [STATUS.PENDING]: 1,
      [STATUS.APPROVED]: 2,
      [STATUS.REJECTED]: 3
    };

    // Sort transactions by status
    const sortedTransactions = transactionList.sort((a, b) => {
      const orderA = statusOrder[a.IdEstado] || 4; // Other statuses go last
      const orderB = statusOrder[b.IdEstado] || 4;
      return orderA - orderB;
    });

    // Transform transactions to cards
    return this.cardService.mapTransacciones(sortedTransactions);
  });

  constructor(
    private navCtrl: NavController,
    private processesService: ProcessesService,
    private cardService: CardService,
    private transactionsService: TransactionsService,
    public sessionService: SessionService,
    private modalCtrl: ModalController,
    private actionSheet: ActionSheetController,
    private authorizationService: AuthorizationService,
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
      const activityData = await this.processesService.get(this.activityId);
      if (activityData) {
        this.title = activityData.Titulo;
        this.showAdd = activityData.IdEstado == STATUS.PENDING;
        this.showNavigation = activityData.IdServicio == SERVICE_TYPES.TRANSPORT;
        this.showSupport = activityData.IdServicio == SERVICE_TYPES.TRANSPORT;
      }
      await this.loadData();
    } catch (error) {
      console.error('Error initializing transactions page:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.INIT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Load transactions when the page is about to enter
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
      await this.transactionsService.list(this.activityId);
    } catch (error) {
      this.logger.error('Error loading data:', error);
    } finally {
      this.loading.set(false);
    }
  }

  /**
   * Handle search input to filter transactions
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
   * Navigate to tasks page for a specific transaction
   * @param transaction - The transaction card to navigate to
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
      const activityData = await this.processesService.get(this.activityId);
      const baseUrl = `${environment.filesUrl}/Cuentas/${account.IdPersonaCuenta}/Soportes/Ordenes/${activityData?.IdOrden}/`;
      const documentsArray = activityData?.Soporte?.split(';');

      const buttons = documentsArray && documentsArray.length > 0
        ? documentsArray.map(doc => ({
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
   * Open the add transaction modal
   * @param id - The ID of the transaction to add tasks to
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
   * Open the approve transaction modal
   * @param id - The ID of the transaction to approve
   */
  async openApprove(id: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: TransactionApproveComponent,
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
   * Open the reject transaction modal
   * @param id - The ID of the transaction to reject
   */
  async openReject(id: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: TransactionApproveComponent,
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
