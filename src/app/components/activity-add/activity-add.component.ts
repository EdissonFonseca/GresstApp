import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, NavParams, IonicModule } from '@ionic/angular';
import { STATUS, SERVICE_TYPES } from '@app/constants/constants';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { PointsComponent } from '../points/points.component';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { Utils } from '@app/utils/utils';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { IonButton } from "@ionic/angular/standalone";

/**
 * ActivityAddComponent
 *
 * Component for creating new activities in the system.
 * Supports different types of activities:
 * - Transport activities
 * - Production activities
 * - Collection activities
 */
@Component({
  selector: 'app-activity-add',
  templateUrl: './activity-add.component.html',
  styleUrls: ['./activity-add.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    IonButton
  ]
})
export class ActivityAddComponent implements OnInit {
  /** Color for generation service type */
  colorGeneracion: string = 'medium';
  /** Color for delivery service type */
  colorEntrega: string = 'medium';
  /** Color for reception service type */
  colorRecepcion: string = 'medium';
  /** Color for collection service type */
  colorRecoleccion: string = 'primary';
  /** Current service type ID */
  idServicio: string = '';
  /** Current resource ID */
  idRecurso: string = '';
  /** Current resource name */
  recurso: string = '';
  /** Mileage unit */
  unidadKilometraje: string = '';
  /** Fuel unit */
  unidadCombustible: string = '';
  /** Flag to show fuel input */
  showFuel: boolean = true;
  /** Flag to show mileage input */
  showMileage: boolean = true;
  /** Flag to show transport service type */
  showTransport: boolean = false;
  /** Flag to show collection service type */
  showCollect: boolean = false;
  /** Flag to show production service type */
  showProduce: boolean = false;
  /** Form group for activity data */
  frmActivity: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private activitiesService: ActivitiesService,
    private formBuilder: FormBuilder,
    private userNotificationService: UserNotificationService,
    private authorizationService: AuthorizationService,
    private translate: TranslateService
  ) {
    this.frmActivity = this.formBuilder.group({
      IdRecurso: ['', [Validators.required]],
      Kilometraje: [null, [Validators.min(0)]]
    });
  }

  /**
   * Initialize component
   * Sets up service type and units
   */
  async ngOnInit() {
    this.idServicio = this.navParams.get('IdServicio');
    if (this.idServicio === SERVICE_TYPES.TRANSPORT) {
      this.showTransport = true;
    }
    this.unidadCombustible = Utils.fuelUnit;
    this.unidadKilometraje = Utils.mileageUnit;
    this.showMileage = Utils.requestMileage;
  }

  /**
   * Confirm activity creation
   * Validates and creates a new activity
   */
  async confirm() {
    if (!this.frmActivity.valid) {
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITY.MESSAGES.INVALID_FORM'),
        'middle'
      );
      return;
    }

    const recurso: string = this.frmActivity.get('IdRecurso')?.value;
    const now = new Date();
    const isoDate = now.toISOString();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isoToday = today.toISOString();
    let titulo: string = '';

    await this.userNotificationService.showLoading(
      this.translate.instant('ACTIVITY.MESSAGES.CREATING')
    );

    if (this.idServicio === SERVICE_TYPES.TRANSPORT && this.idRecurso !== '') {
      const lista = await this.activitiesService.list();
      const actividades = lista.filter((x: Actividad) =>
        x.IdServicio === this.idServicio &&
        x.IdRecurso === this.idRecurso &&
        x.IdEstado === STATUS.PENDING
      );

      if (actividades.length > 0) {
        await this.userNotificationService.showToast(
          this.translate.instant('ACTIVITY.MESSAGES.ACTIVE_SERVICE_EXISTS'),
          'middle'
        );
        this.idRecurso = '';
        this.recurso = '';
        return;
      }
      titulo = this.idRecurso;
    } else {
      titulo = recurso;
    }

    const actividad: Actividad = {
      IdActividad: Utils.generateId(),
      IdServicio: this.idServicio,
      IdRecurso: this.idRecurso,
      Titulo: titulo,
      FechaInicial: isoDate,
      FechaOrden: isoToday,
      IdEstado: STATUS.PENDING,
      NavegarPorTransaccion: true,
      KilometrajeInicial: this.frmActivity.get('Kilometraje')?.value
    };

    try {
      await this.activitiesService.create(actividad);
      await this.userNotificationService.hideLoading();
      this.modalCtrl.dismiss(actividad);
    } catch (error) {
      console.error('Error creating activity:', error);
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITY.MESSAGES.CREATE_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Cancel activity creation
   */
  cancel() {
    this.modalCtrl.dismiss(null);
  }

  /**
   * Change service type
   * @param serviceId - The new service type ID
   */
  changeService(serviceId: string) {
    this.idServicio = serviceId;
  }

  /**
   * Open vehicle selection modal
   */
  async selectVehicle() {
    try {
      const modal = await this.modalCtrl.create({
        component: VehiclesComponent,
        componentProps: {}
      });

      modal.onDidDismiss().then((data) => {
        if (data?.data) {
          this.idRecurso = data.data.id;
          this.recurso = data.data.name;
          this.frmActivity.patchValue({
            IdRecurso: data.data.id
          });
        }
      });

      await modal.present();
    } catch (error) {
      console.error('Error selecting vehicle:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITY.MESSAGES.SELECT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open target point selection modal
   */
  async selectTarget() {
    try {
      const idTercero = await this.authorizationService.getPersonId();
      const modal = await this.modalCtrl.create({
        component: PointsComponent,
        componentProps: {
          IdTercero: idTercero
        }
      });

      modal.onDidDismiss().then((data) => {
        if (data?.data) {
          this.idRecurso = data.data.id;
          this.recurso = data.data.name;
          this.frmActivity.patchValue({
            IdRecurso: data.data.id
          });
        }
      });

      await modal.present();
    } catch (error) {
      console.error('Error selecting target:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITY.MESSAGES.SELECT_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Open source point selection modal
   */
  async selectSource() {
    try {
      const idTercero = await this.authorizationService.getPersonId();
      const modal = await this.modalCtrl.create({
        component: PointsComponent,
        componentProps: {}
      });

      modal.onDidDismiss().then((data) => {
        if (data?.data) {
          this.idRecurso = data.data.id;
          this.recurso = data.data.name;
          this.frmActivity.patchValue({
            IdRecurso: data.data.id
          });
        }
      });

      await modal.present();
    } catch (error) {
      console.error('Error selecting source:', error);
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITY.MESSAGES.SELECT_ERROR'),
        'middle'
      );
    }
  }
}
