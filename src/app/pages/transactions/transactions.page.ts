import { Component, Input, OnInit, signal } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { ActivityApproveComponent } from 'src/app/components/activity-approve/activity-approve.component';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { STATUS, SERVICE_TYPES } from '@app/constants/constants';
import { environment } from '../../../environments/environment';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { Card } from '@app/interfaces/card';
import { CardService } from '@app/services/core/card.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
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
  /** Signal containing the list of transactions displayed as cards */
  transactions = signal<Card[]>([]);
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
    public synchronizationService: SynchronizationService,
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
   * Maps transactions to card format for display
   */
  async ionViewWillEnter() {
    try {
      const transactionList = await this.transactionsService.list(this.activity().id);
      const mappedTransactions = await this.cardService.mapTransacciones(transactionList);
      this.transactions.set(mappedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.LOAD_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Handle search input to filter transactions
   * @param event - The input event containing the search query
   */
  async handleInput(event: any) {
    try {
      const query = event.target.value.toLowerCase();
      let transactionList = await this.transactionsService.list(this.activity().id);
      const filteredTransactions = transactionList.filter(transaction =>
        (transaction.Punto?.toLowerCase().includes(query) ||
         transaction.Tercero?.toLowerCase().includes(query))
      );
      this.transactions.set(filteredTransactions.length > 0
        ? await this.cardService.mapTransacciones(filteredTransactions)
        : await this.cardService.mapTransacciones(transactionList)
      );
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
    this.navCtrl.navigateBack('/home/activities');
  }

  /**
   * Get the color associated with a transaction state
   * @param stateId - The state ID to get the color for
   * @returns string - The color code for the state
   */
  getColorEstado(stateId: string): string {
    try {
      return Utils.getStateColor(stateId);
    } catch (error) {
      console.error('Error getting state color:', error);
      return 'primary'; // Default color
    }
  }

  /**
   * Get the image associated with a process
   * @param processId - The process ID to get the image for
   * @returns string - The image URL for the process
   */
  getImagen(processId: string) {
    try {
      return Utils.getImage(processId);
    } catch (error) {
      console.error('Error getting process image:', error);
      return ''; // Default empty image
    }
  }

  /**
   * Navigate to tasks page for a specific transaction
   * @param transaction - The transaction card to navigate to
   */
  navigateToTareas(transaction: Card) {
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
   * Open the add task modal
   */
  async openAddTarea() {
    try {
      const modal = await this.modalCtrl.create({
        component: TaskAddComponent,
        componentProps: {
          idActividad: this.activity().id,
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(
          this.translate.instant('TRANSACTIONS.MESSAGES.UPDATING_INFO')
        );

        this.transactions.update(transactions => {
          const card = transactions.find(x => x.id == data.IdTransaccion);
          if (!card) {
            this.transactionsService.get(this.activity().id, data.IdTransaccion)
              .then(async newTransaction => {
                if (newTransaction) {
                  const mappedTransaction = await this.cardService.mapTransaccion(newTransaction);
                  if (mappedTransaction) {
                    transactions.push(mappedTransaction);
                  }
                }
              })
              .catch(error => {
                console.error('Error adding new transaction:', error);
                this.userNotificationService.showToast(
                  this.translate.instant('TRANSACTIONS.MESSAGES.ADD_ERROR'),
                  'middle'
                );
              });
          } else {
            card.successItems = (card.successItems ?? 0) + 1;
          }
          return transactions;
        });

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
        this.synchronizationService.uploadData();
      }
    } catch (error) {
      console.error('Error opening add task modal:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.MODAL_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the activity approval modal
   */
  async openApproveActividad() {
    try {
      const modal = await this.modalCtrl.create({
        component: ActivityApproveComponent,
        componentProps: {
          activity: this.activity(),
          approveOrReject: 'approve',
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data != null) {
        this.activity.update(activity => {
          if (activity) {
            activity.status = STATUS.APPROVED;
            this.cardService.updateVisibleProperties(activity);
          }
          return activity;
        });

        this.transactions.update(transactions => {
          const filteredTransactions = transactions.filter(x => x.parentId == this.activity().id && x.status == STATUS.PENDING);
          filteredTransactions.forEach(transaction => {
            transaction.status = STATUS.REJECTED;
            this.cardService.updateVisibleProperties(transaction);
          });
          return transactions;
        });

        this.showAdd = false;

        // This call is made without await to not block the screen and run in background
        this.synchronizationService.uploadData();
      }
    } catch (error) {
      console.error('Error opening approve activity modal:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.APPROVE_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Get the color for the synchronization status
   * @returns string - The color code for the synchronization status
   */
  getColor() {
    return this.synchronizationService.pendingTransactions() > 0 ? 'danger' : 'success';
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
