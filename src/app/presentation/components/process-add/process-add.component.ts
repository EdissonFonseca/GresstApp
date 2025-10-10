import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, NavParams, IonicModule } from '@ionic/angular';
import { STATUS, SERVICE_TYPES } from '@app/core/constants';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { FacilitiesComponent } from '../facilities/facilities.component';
import { Process } from '@app/domain/entities/process.entity';
import { ProcessService } from '@app/application/services/process.service';
import { Utils } from '@app/core/utils';
import { AuthorizationRepository } from '@app/infrastructure/repositories/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { IonButton } from "@ionic/angular/standalone";

/**
 * ProcessAddComponent
 *
 * Component for creating new processes in the system.
 * Supports different types of processes:
 * - Transport processes
 * - Production processes
 * - Collection processes
 */
@Component({
  selector: 'app-process-add',
  templateUrl: './process-add.component.html',
  styleUrls: ['./process-add.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    TranslateModule,
    IonButton
  ]
})
export class ProcessAddComponent implements OnInit {
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
  /** Form group for process data */
  frmProcess: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private processesService: ProcessService,
    private formBuilder: FormBuilder,
    private userNotificationService: UserNotificationService,
    private authorizationService: AuthorizationRepository,
    private translate: TranslateService
  ) {
    this.frmProcess = this.formBuilder.group({
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
   * Confirm process creation
   * Validates and creates a new process
   */
  async confirm() {
    if (!this.frmProcess.valid) {
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITY.MESSAGES.INVALID_FORM'),
        'middle'
      );
      return;
    }

    const recurso: string = this.frmProcess.get('IdRecurso')?.value;
    const now = new Date();
    const isoDate = now.toISOString();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isoToday = today.toISOString();
    let titulo: string = '';

    await this.userNotificationService.showLoading(
      this.translate.instant('ACTIVITY.MESSAGES.CREATING')
    );

    if (this.idServicio === SERVICE_TYPES.TRANSPORT && this.idRecurso !== '') {
      const lista = await this.processesService.getAll();
      const procesos = lista.filter((x: Process) =>
        x.ServiceId === this.idServicio &&
        x.ResourceId === this.idRecurso &&
        x.StatusId === STATUS.PENDING
      );

      if (procesos.length > 0) {
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

    const process: Process = {
      ProcessId: Utils.generateId(),
      ServiceId: this.idServicio,
      ResourceId: this.idRecurso,
      Title: titulo,
      StartDate: isoDate,
      ProcessDate: isoToday,
      StatusId: STATUS.PENDING,
      InitialMileage: this.frmProcess.get('Kilometraje')?.value,
      Subprocesses: [],
      Tasks: []
    };

    try {
      await this.processesService.create(process);
      await this.userNotificationService.hideLoading();
      this.modalCtrl.dismiss(process);
    } catch (error) {
      console.error('Error creating process:', error);
      await this.userNotificationService.hideLoading();
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITY.MESSAGES.CREATE_ERROR'),
        'middle'
      );
    }
  }

  /**
   * Cancel process creation
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
          this.frmProcess.patchValue({
            IdRecurso: this.idRecurso
          });
        }
      });

      return await modal.present();
    } catch (error) {
      console.error('Error opening vehicle selection modal:', error);
    }
  }

  /**
   * Open target point selection modal
   */
  async selectTarget() {
    try {
      const modal = await this.modalCtrl.create({
        component: FacilitiesComponent,
        componentProps: {
          showHeader: false
        }
      });

      modal.onDidDismiss().then((data) => {
        if (data?.data) {
          this.idRecurso = data.data.id;
          this.recurso = data.data.name;
          this.frmProcess.patchValue({
            IdRecurso: this.idRecurso
          });
        }
      });

      return await modal.present();
    } catch (error) {
      console.error('Error opening target point selection modal:', error);
    }
  }

  /**
   * Open source point selection modal
   */
  async selectSource() {
    try {
      const modal = await this.modalCtrl.create({
        component: FacilitiesComponent,
        componentProps: {
          showHeader: false
        }
      });

      modal.onDidDismiss().then((data) => {
        if (data?.data) {
          this.idRecurso = data.data.id;
          this.recurso = data.data.name;
          this.frmProcess.patchValue({
            IdRecurso: this.idRecurso
          });
        }
      });

      return await modal.present();
    } catch (error) {
      console.error('Error opening source point selection modal:', error);
    }
  }
}
