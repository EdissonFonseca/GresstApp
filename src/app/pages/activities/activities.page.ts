import { Component, OnInit, signal, computed } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { ActivityAddComponent } from 'src/app/components/activity-add/activity-add.component';
import { ActivityApproveComponent } from 'src/app/components/activity-approve/activity-approve.component';
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
import { Card } from '@app/interfaces/card.interface';
import { CardService } from '@app/services/core/card.service';

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
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RouterModule,
    ComponentsModule,
    TranslateModule
  ]
})
export class ActivitiesPage implements OnInit {
  /** Signal containing the list of activities from the service */
  private activitiesSignal = this.activitiesService.activities;

  /** Signal containing the list of activity cards */
  activityCards = signal<Card[]>([]);

  /** Flag to track if data has been loaded */
  private isDataLoaded = false;

  /** Flag indicating whether the add activity button should be shown */
  showAdd: boolean = true;

  /** Current fuel quantity value for the activity */
  fuelQuantity: number | null = null;

  /** Current mileage value for the activity */
  mileage: number | null = null;

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
   * Initialize component by loading activities and setting up permissions
   */
  async ngOnInit() {
    try {
      this.showAdd = await this.authorizationService.allowAddActivity();
      await this.loadData();
    } catch (error) {
      this.showAdd = false;
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.PERMISSION_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Load activities when the page is about to enter
   */
  async ionViewWillEnter() {
    if (!this.isDataLoaded) {
      try {
        await this.loadData();
      } catch (error) {
        console.error('Error loading activities:', error);
        await this.userNotificationService.showToast(
          this.translate.instant('ACTIVITIES.MESSAGES.LOAD_ERROR'),
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
      await this.activitiesService.load();
      const activities = this.activitiesSignal();

      if (!activities || activities.length === 0) {
        this.activityCards.set([]);
        return;
      }

      // Define el orden de los estados
      const statusOrder = {
        [STATUS.PENDING]: 1,
        [STATUS.APPROVED]: 2,
        [STATUS.REJECTED]: 3
      };

      // Sort activities by status
      const sortedActivities = activities.sort((a, b) => {
        const orderA = statusOrder[a.IdEstado] || 4;
        const orderB = statusOrder[b.IdEstado] || 4;
        return orderA - orderB;
      });

      // Use the CardService to map activities to cards
      const cards = await this.cardService.mapActividades(sortedActivities);
      this.activityCards.set(cards);
      this.isDataLoaded = true;
    } catch (error) {
      console.error('Error loading data:', error);
      this.activityCards.set([]);
    }
  }

  /**
   * Handle search input to filter activities
   * @param event - The input event containing the search query
   */
  async handleInput(event: any) {
    try {
      const query = event.target.value.toLowerCase();
      const activityList = this.activitiesSignal().filter((activity: Actividad) =>
        activity.Titulo.toLowerCase().indexOf(query) > -1
      );

      // Define the order of the statuses
      const statusOrder = {
        [STATUS.PENDING]: 1,
        [STATUS.APPROVED]: 2,
        [STATUS.REJECTED]: 3
      };

      // Sort activities by status
      const sortedActivities = activityList.sort((a, b) => {
        const orderA = statusOrder[a.IdEstado] || 4;
        const orderB = statusOrder[b.IdEstado] || 4;
        return orderA - orderB;
      });

      // Use the CardService to map activities to cards
      const cards = await this.cardService.mapActividades(sortedActivities);
      this.activityCards.set(cards);
    } catch (error) {
      console.error('Error filtering activities:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.FILTER_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Navigate to the appropriate target based on activity type and state
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
        if (activityData.FechaInicial == null) {
          if (Utils.requestMileage) {
            const result = await this.requestMileagePrompt();
            if (!result) {
              return;
            }
            activityData.KilometrajeInicial = this.mileage;
          }

          await this.userNotificationService.showLoading(this.translate.instant('ACTIVITIES.MESSAGES.STARTING_ROUTE'));
          await this.activitiesService.updateStart(activityData);
          await this.userNotificationService.hideLoading();
        }

        // Get navigation parameters
        const navigationExtras: NavigationExtras = {
          queryParams: { mode: 'A', activityId: activity.id }
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
   * Open the add activity action sheet with available service options
   */
  async openAdd() {
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
        handler: async () => await this.presentAdd(key)
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
   * @param key - The service type key
   */
  async presentAdd(key: string) {
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
          await this.loadData();
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
  async openApprove(id: string) {
    try {
      const activity = await this.activitiesService.get(id);
      if (!activity) {
        throw new Error('Activity not found');
      }

      const card = await this.cardService.mapActividades([activity]);
      if (!card || card.length === 0) {
        throw new Error('Could not map activity to card');
      }

      const modal = await this.modalCtrl.create({
        component: ActivityApproveComponent,
        componentProps: {
          IdActividad: id,
          activity: card[0]
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('ACTIVITIES.MESSAGES.UPDATING_INFO'));
        await this.loadData();
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
  async openReject(id: string) {
    try {
      const activity = await this.activitiesService.get(id);
      if (!activity) {
        throw new Error('Activity not found');
      }

      const card = await this.cardService.mapActividades([activity]);
      if (!card || card.length === 0) {
        throw new Error('Could not map activity to card');
      }

      const modal = await this.modalCtrl.create({
        component: ActivityApproveComponent,
        componentProps: {
          IdActividad: id,
          isReject: true,
          activity: card[0]
        },
      });

      await modal.present();

      const { data } = await modal.onDidDismiss();
      if (data) {
        await this.userNotificationService.showLoading(this.translate.instant('ACTIVITIES.MESSAGES.UPDATING_INFO'));
        await this.loadData();
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
