import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonTabs } from '@ionic/angular';
import { signal, computed } from '@angular/core';
import { StorageService } from '../../services/core/storage.service';
import { STORAGE } from '@app/constants/constants';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateService } from '@ngx-translate/core';
import { SessionService } from '@app/services/core/session.service';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { CardService } from '@app/services/core/card.service';
import { Card } from '@app/interfaces/card.interface';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { NavController, ActionSheetController, ModalController } from '@ionic/angular';
import { ActivityAddComponent } from 'src/app/components/activity-add/activity-add.component';
import { SERVICE_TYPES } from '@app/constants/constants';

/**
 * HomePage component that serves as the main navigation hub of the application.
 * Handles tab navigation between actividades and inventario sections.
 * Manages user session data and synchronization status.
 */
@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  /** Title displayed in the header */
  @Input() title = 'Jornada';
  /** ID of the help popup to be displayed */
  @Input() helpPopup = 'help-inventario';
  /** Reference to the tabs component */
  @ViewChild('tabs', { static: true }) tabs: IonTabs | undefined;

  /** Current active tab using Angular signals */
  currentTab = signal<string>('actividades');
  /** Account name using Angular signals */
  nombreCuenta = signal<string>('');
  /** User name using Angular signals */
  nombreUsuario = signal<string>('');

  /** Signal containing the list of activities from the service */
  private activitiesSignal = this.activitiesService.activities;

  /** Computed property that transforms activities into cards for display */
  activities = computed(() => {
    const activityList = this.activitiesSignal();
    return this.cardService.mapActividades(activityList);
  });

  showAdd = true;

  constructor(
    public sessionService: SessionService,
    private storage: StorageService,
    private userNotificationService: UserNotificationService,
    private translate: TranslateService,
    private activitiesService: ActivitiesService,
    private cardService: CardService,
    private authorizationService: AuthorizationService,
    private navCtrl: NavController,
    private actionSheet: ActionSheetController,
    private modalCtrl: ModalController
  ) {}

  /**
   * Initialize component data and count pending transactions
   * @throws {Error} If initialization fails
   */
  async ngOnInit() {
    try {
      await this.initializeData();
      await this.sessionService.countPendingRequests();
      this.showAdd = await this.authorizationService.allowAddActivity();
      await this.activitiesService.load();
    } catch (error) {
      await this.handleError(error);
    }
  }

  /**
   * Handle tab changes and update the current tab state
   * @param event - The tab change event
   */
  onTabChange(event: any) {
    try {
      this.currentTab.set(event.tab);
    } catch (error) {
      console.error('Error changing tab:', error);
      this.handleError(error);
    }
  }

  /**
   * Update header title and help popup based on the selected tab
   * @param title - The new title to display
   * @param helpPopup - The new help popup ID
   */
  setHeader(title: string, helpPopup: string) {
    try {
      this.title = title;
      this.helpPopup = helpPopup;
      const selectedTab = this.tabs?.getSelected() || 'actividades';
      this.currentTab.set(selectedTab);
    } catch (error) {
      console.error('Error setting header:', error);
      this.handleError(error);
    }
  }

  /**
   * Get current sync status
   * @returns {number} Number of pending transactions
   */
  get syncStatus(): number {
    try {
      return this.sessionService.pendingRequests();
    } catch (error) {
      console.error('Error getting sync status:', error);
      return 0;
    }
  }

  /**
   * Initialize component data by loading user and account information
   * @private
   */
  private async initializeData() {
    try {
      await Promise.all([
        this.loadUserData(),
        this.loadAccountData()
      ]);
    } catch (error) {
      console.error('Error initializing data:', error);
      throw error;
    }
  }

  /**
   * Load user data from storage
   * @private
   */
  private async loadUserData() {
    try {
      const user = await this.storage.get(STORAGE.USERNAME);
      if (!user) {
        throw new Error('User data not found');
      }
      this.nombreUsuario.set(user.Nombre || '');
    } catch (error) {
      console.error('Error loading user data:', error);
      throw error;
    }
  }

  /**
   * Load account data from storage
   * @private
   */
  private async loadAccountData() {
    try {
      const cuenta = await this.storage.get(STORAGE.ACCOUNT);
      if (!cuenta) {
        throw new Error('Account data not found');
      }
      this.nombreCuenta.set(cuenta.NombreCuenta || '');
    } catch (error) {
      console.error('Error loading account data:', error);
      throw error;
    }
  }

  /**
   * Handle errors in the component
   * @param error - The error to handle
   * @private
   */
  private async handleError(error: any) {
    console.error('Error in HomePage:', error);
    await this.userNotificationService.showToast(
      this.translate.instant('HOME.MESSAGES.LOAD_ERROR'),
      'middle'
    );
  }

  /**
   * Lifecycle hook that is called when the page is about to enter
   */
  async ionViewWillEnter() {
    try {
      await this.sessionService.countPendingRequests();
    } catch (error) {
      console.error('Error in ionViewWillEnter:', error);
      this.handleError(error);
    }
  }

  async handleInput(event: any) {
    try {
      const query = event.target.value.toLowerCase();
      const activityList = this.activitiesSignal().filter((activity: any) =>
        activity.Titulo.toLowerCase().indexOf(query) > -1
      );
      this.activitiesService.activities.set(activityList);
    } catch (error) {
      console.error('Error filtering activities:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.FILTER_ERROR'),
        'middle'
      );
    }
  }

  async navigateToTarget(card: Card) {
    try {
      const activityData = await this.activitiesService.get(card.id);
      if (!activityData) {
        throw new Error('Activity not found');
      }

      // Handle collection and transport services
      if (activityData.IdServicio === SERVICE_TYPES.COLLECTION ||
          activityData.IdServicio === SERVICE_TYPES.TRANSPORT) {
        // Initialize activity start if needed
        if (activityData.FechaInicial == null) {
          await this.userNotificationService.showLoading(this.translate.instant('ACTIVITIES.MESSAGES.STARTING_ROUTE'));
          await this.activitiesService.updateStart(activityData);
          await this.userNotificationService.hideLoading();
        }

        // Get navigation parameters
        const navigationExtras = {
          queryParams: { Mode: 'A' },
          state: { activity: card }
        };

        // Navigate based on activity type
        if (activityData.NavegarPorTransaccion) {
          await this.navCtrl.navigateForward('/transactions', navigationExtras);
        } else {
          await this.navCtrl.navigateForward('/tasks', navigationExtras);
        }
        return;
      }

      // Handle other service types
      const navigationExtras = {
        queryParams: { Mode: 'T' },
        state: { activity: card }
      };
      await this.navCtrl.navigateForward('/tasks', navigationExtras);

    } catch (error) {
      console.error('Error navigating to activity:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.NAVIGATION_ERROR'),
        'middle'
      );
    }
  }

  async openAddActivity() {
    try {
      const actionSheet = await this.actionSheet.create({
        header: this.translate.instant('ACTIVITIES.MESSAGES.SERVICES'),
        buttons: [
          {
            text: 'Collection',
            icon: 'trash-outline',
            handler: () => this.presentModal('COLLECTION')
          },
          {
            text: 'Transport',
            icon: 'car-outline',
            handler: () => this.presentModal('TRANSPORT')
          }
        ]
      });

      await actionSheet.present();
    } catch (error) {
      console.error('Error opening add activity:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.ADD_ERROR'),
        'middle'
      );
    }
  }

  async presentModal(key: string) {
    try {
      const modal = await this.modalCtrl.create({
        component: ActivityAddComponent,
        componentProps: {
          IdServicio: key
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('ACTIVITIES.MESSAGES.UPDATING_INFO'));

        const currentActivities = this.activitiesSignal();
        const activity = currentActivities.find((x: any) => x.IdActividad === data.IdActividad);

        if (activity) {
          // Update activity in service
          await this.activitiesService.update(activity);
          // Reload activities to reflect changes
          await this.activitiesService.load();
        }

        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error updating activity:', error);
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.UPDATE_ERROR'),
        'middle'
      );
    }
  }
}
