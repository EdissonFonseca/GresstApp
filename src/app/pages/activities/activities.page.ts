import { Component, OnInit, signal } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Card } from '@app/interfaces/card';
import { CardService } from '@app/services/core/card.service';
import { ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { ActivityAddComponent } from 'src/app/components/activity-add/activity-add.component';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { CRUD_OPERATIONS, PERMISSIONS, SERVICE_TYPES, SERVICES } from '@app/constants/constants';
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
 * Interface for activity navigation parameters
 */
interface ActivityNavigationParams {
  activity: Card;
  mode?: string;
  route: string;
}

/**
 * ActivitiesPage component that displays and manages a list of activities.
 * Handles activity listing, filtering, creation, and navigation to activity details.
 * Supports different service types (collection, transport) and manages activity states.
 */
@Component({
  selector: 'app-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ComponentsModule, TranslateModule]
})
export class ActivitiesPage implements OnInit {
  /** Signal containing the list of activities displayed as cards */
  activities = signal<Card[]>([]);
  /** Flag indicating whether the add activity button should be shown */
  showAdd: boolean = true;
  /** Current fuel quantity value */
  fuelQuantity: number | null = null;
  /** Current mileage value */
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
   * Initialize component by checking user permissions for adding activities
   */
  async ngOnInit() {
    try {
      this.showAdd = await this.authorizationService.allowAddActivity();
    } catch (error) {
      console.error('Error checking activity permissions:', error);
      this.showAdd = false;
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.PERMISSION_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Load activities when the page is about to enter
   * Maps activities to card format for display
   */
  async ionViewWillEnter() {
    try {
      let activityList = await this.activitiesService.list();
      const mappedActivities = await this.cardService.mapActividades(activityList);
      this.activities.set(mappedActivities);
    } catch (error) {
      console.error('Error loading activities:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.LOAD_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Handle search input to filter activities
   * @param event - The input event containing the search query
   */
  async handleInput(event: any) {
    try {
      const query = event.target.value.toLowerCase();
      let activityList = await this.activitiesService.list();
      activityList = activityList.filter((activity) =>
        activity.Titulo.toLowerCase().indexOf(query) > -1
      );
      const mappedActivities = await this.cardService.mapActividades(activityList);
      this.activities.set(mappedActivities);
    } catch (error) {
      console.error('Error filtering activities:', error);
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
   * @param activity - The activity to initialize
   * @returns Promise<boolean> - True if initialization was successful or not needed
   */
  private async initializeActivityStart(activity: Actividad): Promise<boolean> {
    try {
      if (activity.FechaInicial == null) {
        if (Utils.requestMileage) {
          const result = await this.requestMileagePrompt();
          if (!result) {
            return false;
          }
          activity.KilometrajeInicial = this.mileage;
        }

        await this.userNotificationService.showLoading(this.translate.instant('ACTIVITIES.MESSAGES.STARTING_ROUTE'));
        await this.activitiesService.updateInicio(activity);
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
   * @param activity - The activity card to navigate to
   */
  async navigateToTarget(activity: Card) {
    try {
      const activityData: Actividad = await this.activitiesService.get(activity.id);
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
   */
  async openAddActivity() {
    try {
      const actionSheetDict: { [key: string]: { icon?: string, name?: string } } = {};

      const hasCollectionPermission = (await this.authorizationService.getPermission(PERMISSIONS.APP_COLLECTION))?.includes(CRUD_OPERATIONS.CREATE);
      if (hasCollectionPermission) {
        const service = SERVICES.find(x => x.serviceId == SERVICE_TYPES.COLLECTION);
        if (service) {
          actionSheetDict[SERVICE_TYPES.COLLECTION] = { icon: service.Icon, name: service.Name };
        }
      }

      const hasTransportPermission = (await this.authorizationService.getPermission(PERMISSIONS.APP_TRANSPORT))?.includes(CRUD_OPERATIONS.CREATE);
      if (hasTransportPermission) {
        const service = SERVICES.find(x => x.serviceId == SERVICE_TYPES.TRANSPORT);
        if (service) {
          actionSheetDict[SERVICE_TYPES.TRANSPORT] = { icon: service.Icon, name: service.Name };
        }
      }

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

        this.activities.update(activities => {
          const card = activities.find(x => x.id == data.IdActividad);
          if (!card) {
            this.activitiesService.get(data.IdActividad)
              .then(async newActivity => {
                if (newActivity) {
                  const mappedActivity = await this.cardService.mapActividad(newActivity);
                  if (mappedActivity) {
                    activities.push(mappedActivity);
                  }
                }
              })
              .catch(error => {
                console.error('Error adding new activity:', error);
                this.userNotificationService.showToast(
                  this.translate.instant('ACTIVITIES.MESSAGES.ADD_ERROR'),
                  'middle'
                );
              });
          } else {
            card.successItems = (card.successItems ?? 0) + 1;
          }
          return activities;
        });
        await this.userNotificationService.hideLoading();
      }
    } catch (error) {
      console.error('Error presenting modal:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.MODAL_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Get the color associated with an activity state
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
}
