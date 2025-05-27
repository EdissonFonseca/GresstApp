import { Component, OnInit, signal, computed, ViewChild } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Card } from '@app/interfaces/card.interface';
import { CardService } from '@app/services/core/card.service';
import { ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { ActivityAddComponent } from 'src/app/components/activity-add/activity-add.component';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { CRUD_OPERATIONS, PERMISSIONS, SERVICE_TYPES, SERVICES, STATUS } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/components/components.module';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { ActivityApproveComponent } from 'src/app/components/activity-approve/activity-approve.component';
import { CardListComponent } from '@app/components/card-list/card-list.component';

/**
 * Interface for activity navigation parameters
 * Defines the structure for navigation data when moving between activities
 */
interface ActivityNavigationParams {
  /** The activity card to be displayed */
  activity: Card;
  /** Optional mode parameter for navigation */
  mode?: string;
  /** The target route for navigation */
  route: string;
}

/**
 * ActivitiesPage Component
 *
 * Manages and displays a list of activities with the following features:
 * - Activity listing and filtering
 * - Activity creation and management
 * - Navigation between activities and tasks
 * - Support for different service types (collection, transport)
 * - Activity state management
 * - Mileage tracking and initialization
 */
@Component({
  selector: 'app-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ComponentsModule, TranslateModule]
})
export class ActivitiesPage implements OnInit {
  /** Signal containing the current activity displayed as a card */
  activity = signal<Card>({id:'', title: '', status: STATUS.PENDING, type:'activity'});

  /** Signal containing the list of activities from the service */
  private activitiesSignal = this.activitiesService.activities;

  /** Computed property that transforms activities into cards for display */
  activities = computed(() => {
    const activityList = this.activitiesSignal();
    return this.cardService.mapActividades(activityList);
  });

  /** Flag indicating whether the add activity button should be shown */
  showAdd: boolean = true;

  /** Current fuel quantity value for the activity */
  fuelQuantity: number | null = null;

  /** Current mileage value for the activity */
  mileage: number | null = null;

  @ViewChild('cardList') cardList!: CardListComponent;

  /**
   * Constructor for ActivitiesPage
   * Initializes required services and dependencies
   */
  constructor(
    private navCtrl: NavController,
    private activitiesService: ActivitiesService,
    private cardService: CardService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private actionSheet: ActionSheetController,
    private authorizationService: AuthorizationService,
    private userNotificationService: UserNotificationService,
    private translate: TranslateService
  ) {}

  /**
   * Initialize component
   * Checks user permissions and loads initial activities
   */
  async ngOnInit() {
    try {
      this.showAdd = await this.authorizationService.allowAddActivity();
      await this.activitiesService.load();
    } catch (error) {
      this.showAdd = false;
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.PERMISSION_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Lifecycle hook called when the page is about to enter
   * Loads activities data
   */
  async ionViewWillEnter() {
    try {
      await this.activitiesService.load();
    } catch (error) {
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.LOAD_ERROR'),
        'middle'
      );
    }
    console.log('Activities page - ionViewWillEnter called - END');
  }

  /**
   * Handle search input to filter activities
   * Updates the displayed list based on the search query
   * @param event - The input event containing the search query
   */
  async handleInput(event: any) {
    try {
      const query = event.target.value.toLowerCase();
      const activityList = this.activitiesSignal().filter((activity: Actividad) =>
        activity.Titulo.toLowerCase().indexOf(query) > -1
      );
      this.activitiesService.activities.set(activityList);
    } catch (error) {
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.FILTER_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Display a prompt to request initial mileage
   * @returns Promise<boolean> - True if mileage was provided, false if cancelled
   */
  async requestMileagePrompt(): Promise<boolean> {
    try {
      return new Promise(async (resolve) => {
        const alert = await this.alertCtrl.create({
          header: this.translate.instant('ACTIVITIES.MESSAGES.INITIAL_MILEAGE'),
          inputs: [
            {
              name: 'mileage',
              type: 'number',
              placeholder: this.translate.instant('ACTIVITIES.MESSAGES.MILEAGE'),
              value: this.mileage ? Math.floor(this.mileage) : 0,
              min: 0,
              attributes: {
                'label': this.translate.instant('ACTIVITIES.MESSAGES.MILEAGE')
              }
            },
          ],
          buttons: [
            {
              text: this.translate.instant('COMMON.ACCEPT'),
              handler: (data) => {
                this.mileage = parseInt(data.mileage, 10);
                resolve(true);
              }
            },
            {
              text: this.translate.instant('COMMON.CANCEL'),
              role: 'cancel',
              handler: () => {
                resolve(false);
              }
            }
          ]
        });

        await alert.present();
      });
    } catch (error) {
      console.error('Error showing mileage prompt:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.MILEAGE_ERROR'),
        'middle'
      );
      return false;
    }
  }

  /**
   * Initialize activity start process if needed
   * Handles mileage input and activity start time
   * @param activity - The activity to initialize
   * @returns Promise<boolean> - True if initialization was successful or not needed
   */
  private async initializeActivityStart(activity: Actividad): Promise<boolean> {
    try {
      if (activity.FechaInicial == null) {
        console.log('Activities page - initializeActivityStart called - START');
        if (Utils.requestMileage) {
          const result = await this.requestMileagePrompt();
          if (!result) {
            return false;
          }
          activity.KilometrajeInicial = this.mileage;
        }

        await this.userNotificationService.showLoading(this.translate.instant('ACTIVITIES.MESSAGES.STARTING_ROUTE'));
        await this.activitiesService.updateStart(activity);
        await this.userNotificationService.hideLoading();
      }
      return true;
    } catch (error) {
      console.error('Error initializing activity start:', error);
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.START_ERROR'),
        'middle'
      );
      return true; // Continue navigation even if initialization fails
    }
  }

  /**
   * Get navigation parameters based on activity type
   * Determines the appropriate route and parameters for navigation
   * @param activity - The activity to navigate to
   * @param activityCard - The activity card
   * @returns ActivityNavigationParams - Navigation parameters
   */
  private getNavigationParams(activity: Actividad, activityCard: Card): ActivityNavigationParams {
    if (activity.NavegarPorTransaccion) {
      return {
        activity: activityCard,
        route: '/transactions'
      };
    }

    return {
      activity: activityCard,
      mode: 'A',
      route: '/tasks'
    };
  }

  /**
   * Navigate to the appropriate target based on activity type and state
   * Handles different service types and initializes activity if needed
   * @param activity - The activity card to navigate to
   */
  async navigateToTarget(activity: Card) {
    try {
      const activityData = await this.activitiesService.get(activity.id);
      if (!activityData) {
        throw new Error('Activity not found');
      }

      // Handle collection and transport services
      if (activityData.IdServicio === SERVICE_TYPES.COLLECTION ||
          activityData.IdServicio === SERVICE_TYPES.TRANSPORT) {
        // Initialize activity start if needed
        await this.initializeActivityStart(activityData);

        // Get navigation parameters
        const navParams = this.getNavigationParams(activityData, activity);

        // Navigate to the appropriate route
        const navigationExtras: NavigationExtras = {
          queryParams: navParams.mode ? { Mode: navParams.mode } : undefined,
          state: { activity: navParams.activity }
        };

        await this.navCtrl.navigateForward(navParams.route, navigationExtras);
        return;
      }

      // Handle other service types
      const navigationExtras: NavigationExtras = {
        queryParams: { Mode: 'T' },
        state: { activity: activity }
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

  /**
   * Open the add activity action sheet with available service options
   * Checks user permissions and displays appropriate service options
   */
  async openAddActivity() {
    try {
      const actionSheetDict: { [key: string]: { icon?: string, name?: string } } = {};

      // Check collection service permissions
      const hasCollectionPermission = (await this.authorizationService.getPermission(PERMISSIONS.APP_COLLECTION))?.includes(CRUD_OPERATIONS.CREATE);
      if (hasCollectionPermission) {
        const service = SERVICES.find(x => x.serviceId == SERVICE_TYPES.COLLECTION);
        if (service) {
          actionSheetDict[SERVICE_TYPES.COLLECTION] = { icon: service.Icon, name: service.Name };
        }
      }

      // Check transport service permissions
      const hasTransportPermission = (await this.authorizationService.getPermission(PERMISSIONS.APP_TRANSPORT))?.includes(CRUD_OPERATIONS.CREATE);
      if (hasTransportPermission) {
        const service = SERVICES.find(x => x.serviceId == SERVICE_TYPES.TRANSPORT);
        if (service) {
          actionSheetDict[SERVICE_TYPES.TRANSPORT] = { icon: service.Icon, name: service.Name };
        }
      }

      // Create action sheet buttons
      const buttons = Object.keys(actionSheetDict).map(key => ({
        text: actionSheetDict[key].name,
        icon: actionSheetDict[key].icon,
        handler: async () => await this.presentModal(key)
      }));

      const actionSheet = await this.actionSheet.create({
        header: this.translate.instant('ACTIVITIES.MESSAGES.SERVICES'),
        buttons
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

  /**
   * Present the activity add modal for a specific service type
   * Handles activity creation and updates
   * @param key - The service type key
   */
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
        const activity = currentActivities.find((x: Actividad) => x.IdActividad === data.IdActividad);

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

  /**
   * Open the activity approve modal
   */
  async openApproveActivity(id:string) {
    console.log('Activities page - openApproveActivity called with id:', id);
    try {
      const modal = await this.modalCtrl.create({
        component: ActivityApproveComponent,
        componentProps: {
          IdActividad: this.activity().id
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('ACTIVITIES.MESSAGES.UPDATING_INFO'));

        // Reload activities to reflect changes
        await this.activitiesService.load();

        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error approving activity:', error);
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.APPROVE_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open the activity reject modal
   */
  async openRejectActivity(id: string) {
    console.log('Activities page - openRejectActividad called with id:', id);

    if (!id) {
      console.error('Activities page - No activity ID provided');
      return;
    }

    try {
      const modal = await this.modalCtrl.create({
        component: ActivityApproveComponent,
        componentProps: {
          IdActividad: id,
          isReject: true
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('ACTIVITIES.MESSAGES.UPDATING_INFO'));
        await this.activitiesService.load();
        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error rejecting activity:', error);
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.REJECT_ERROR'),
        'middle'
      );
    }
  }
}
