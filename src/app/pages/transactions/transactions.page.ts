import { Component, Input, OnInit, signal, computed } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { TransactionApproveComponent } from 'src/app/components/transaction-approve/transaction-approve.component';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { STATUS, SERVICE_TYPES } from '@app/constants/constants';
import { environment } from '../../../environments/environment';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { Card } from '@app/interfaces/card.interface';
import { CardService } from '@app/services/core/card.service';
import { SessionService } from '@app/services/core/session.service';
import { Utils } from '@app/utils/utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/components/components.module';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

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
  /** Signal containing the current activity displayed as a card */
  activity = signal<Card>({id:'', title: '', status: STATUS.PENDING, type:'activity'});

  /** Signal containing the list of transactions from the service */
  private transactionsSignal = this.transactionsService.transactions;

  /** Signal containing the list of transaction cards */
  transactionCards = signal<Card[]>([]);

  /** Flag to track if data has been loaded */
  private isDataLoaded = false;

  /** Flag indicating whether the add transaction button should be shown */
  showAdd: boolean = true;
  /** Flag indicating whether the navigation button should be shown */
  showNavigation: boolean = true;
  /** Flag indicating whether the support documents button should be shown */
  showSupport: boolean = true;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private activitiesService: ActivitiesService,
    private cardService: CardService,
    private transactionsService: TransactionsService,
    public sessionService: SessionService,
    private modalCtrl: ModalController,
    private actionSheet: ActionSheetController,
    private authorizationService: AuthorizationService,
    private userNotificationService: UserNotificationService,
    private translate: TranslateService
  ) {}

  /**
   * Initialize component by loading activity data and setting up permissions
   */
  async ngOnInit() {
    try {
      const nav = this.router.getCurrentNavigation();
      if (nav?.extras.state) {
        const newActivity = nav.extras.state['activity'];
        if (newActivity) {
          this.activity.set(newActivity);
          await this.loadData();
        }
        const activityData = await this.activitiesService.get(this.activity().id);
        if (activityData) {
          this.showAdd = activityData.IdEstado == STATUS.PENDING;
          this.showNavigation = activityData.IdServicio == SERVICE_TYPES.TRANSPORT;
          this.showSupport = activityData.IdServicio == SERVICE_TYPES.TRANSPORT;
        }
      }
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
    if (!this.isDataLoaded) {
      try {
        await this.loadData();
      } catch (error) {
        console.error('Error loading transactions:', error);
        await this.userNotificationService.showToast(
          this.translate.instant('TRANSACTIONS.MESSAGES.LOAD_ERROR'),
          'middle'
        );
      }
    }
  }

  /**
   * Load all necessary data for the page
   */
  private async loadData() {
    try {
      await this.transactionsService.load(this.activity().id);
      await this.updateTransactionCards();
      this.isDataLoaded = true;
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  /**
   * Update transaction cards from the current transactions
   */
  private async updateTransactionCards() {
    const transactionList = this.transactionsSignal();
    if (!transactionList) return;

    // Define el orden de los estados
    const statusOrder = {
      [STATUS.PENDING]: 1,
      [STATUS.APPROVED]: 2,
      [STATUS.REJECTED]: 3
    };

    // Ordenar las transacciones por estado
    const sortedTransactions = transactionList.sort((a, b) => {
      const orderA = statusOrder[a.IdEstado] || 4; // Otros estados van al final
      const orderB = statusOrder[b.IdEstado] || 4;
      return orderA - orderB;
    });

    const cards = await this.cardService.mapTransacciones(sortedTransactions);
    this.transactionCards.set(cards);
  }

  /**
   * Handle search input to filter transactions
   * @param event - The input event containing the search query
   */
  async handleInput(event: any) {
    try {
      const query = event.target.value.toLowerCase();
      const transactionList = this.transactionsSignal().filter(transaction =>
        (transaction.Punto?.toLowerCase().includes(query) ||
         transaction.Tercero?.toLowerCase().includes(query))
      );
      this.transactionsService.transactions.set(transactionList);
      await this.updateTransactionCards();
    } catch (error) {
      console.error('Error filtering transactions:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.FILTER_ERROR'),
        'middle'
      );
    }
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
        queryParams: { Mode: 'T', TransactionId: transaction.id },
        state: { activity: this.activity() }
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
          IdActividad: this.activity().id,
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
      const activityData = await this.activitiesService.get(this.activity().id);
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
              console.log('No documents to show');
            }
          }];

      const actionSheet = await this.actionSheet.create({
        header: this.translate.instant('TRANSACTIONS.MESSAGES.DOCUMENTS'),
        buttons
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
   * Present the task add modal for a specific transaction
   * @param transaction - The transaction card
   */
  async openAdd(transaction: Card) {
    try {
      const modal = await this.modalCtrl.create({
        component: TaskAddComponent,
        componentProps: {
          activityId: this.activity().id
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('TRANSACTIONS.MESSAGES.UPDATING_INFO'));

        // Reload transactions to reflect changes
        await this.transactionsService.load(this.activity().id);
        await this.updateTransactionCards();

        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error updating transaction:', error);
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.UPDATE_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the transaction approve modal
   */
  async openApprove(id: string) {
    try {
      const transaction = this.transactionsSignal().find(t => t.IdTransaccion === id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const modal = await this.modalCtrl.create({
        component: TransactionApproveComponent,
        componentProps: {
          transaction: {
            id: transaction.IdTransaccion,
            title: transaction.Titulo,
            status: transaction.IdEstado,
            type: 'transaction',
            parentId: transaction.IdActividad
          }
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('TRANSACTIONS.MESSAGES.UPDATING_INFO'));

        // Recargar las transacciones para reflejar los cambios
        await this.transactionsService.load(this.activity().id);
        await this.updateTransactionCards();

        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error approving transaction:', error);
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.APPROVE_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the transaction reject modal
   */
  async openReject(id: string) {
    try {
      const transaction = this.transactionsSignal().find(t => t.IdTransaccion === id);
      if (!transaction) {
        throw new Error('Transaction not found');
      }

      const modal = await this.modalCtrl.create({
        component: TransactionApproveComponent,
        componentProps: {
          transaction: {
            id: transaction.IdTransaccion,
            title: transaction.Titulo,
            status: transaction.IdEstado,
            type: 'transaction',
            parentId: transaction.IdActividad
          },
          isReject: true
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('TRANSACTIONS.MESSAGES.UPDATING_INFO'));

        // Reload transactions to reflect changes
        await this.transactionsService.load(this.activity().id);
        await this.updateTransactionCards();

        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error rejecting transaction:', error);
      await this.userNotificationService.hideLoading();
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
      if (await this.sessionService.synchronize()) {
        await this.userNotificationService.showToast(
          this.translate.instant('TRANSACTIONS.MESSAGES.SYNC_SUCCESS'),
          'middle'
        );
      } else {
        await this.userNotificationService.showToast(
          this.translate.instant('TRANSACTIONS.MESSAGES.SYNC_ERROR'),
          'middle'
        );
      }
    } catch (error) {
      console.error('Error during synchronization:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.SYNC_ERROR'),
        'middle'
      );
    }
  }
}
