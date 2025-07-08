import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController, IonicModule } from '@ionic/angular';
import { THIRD_PARTY_TYPES, CRUD_OPERATIONS, INPUT_OUTPUT, STATUS, MEASUREMENTS, SERVICE_TYPES } from '@app/constants/constants';
import { PackagesComponent } from '../packages/packages.component';
import { MaterialsComponent } from '../materials/materials.component';
import { PointsComponent } from '../points/points.component';
import { ResiduesComponent } from '../residues/residues.component';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { TreatmentsComponent } from '../treatments/treatments.component';
import { TasksService } from '@app/services/transactions/tasks.service';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { Utils } from '@app/utils/utils';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { LoggerService } from '@app/services/core/logger.service';

/**
 * Component for adding new tasks to an activity
 * Handles the creation of tasks, residues, and transactions
 */
@Component({
  selector: 'app-task-add',
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.scss']
})
export class TaskAddComponent implements OnInit {
  @Input() activityId: string = '';
  @Input() transactionId: string = '';

  captureType: string = '';
  formData!: FormGroup;
  measurementType: string = '';
  photos: string[] = [];
  photosPerMaterial: number = 2;
  requestPoint: boolean = false;
  requestOwner: boolean = false;
  requestPackaging: boolean = false;
  requestTreatment: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private activitiesService: ActivitiesService,
    private transactionsService: TransactionsService,
    private tasksService: TasksService,
    private userNotificationService: UserNotificationService,
    private logger: LoggerService
  ) {
    this.initializeForm();
  }

  /**
   * Initializes the form with all required fields and validators
   */
  private initializeForm(): void {
    this.formData = this.formBuilder.group({
      // Non-editable fields
      IdActividad: [this.activityId],
      IdTransaccion: [this.transactionId],
      IdTarea: [Utils.generateId()],
      IdEstado: [STATUS.APPROVED],
      FechaSolicitud: [new Date().toISOString()],
      FechaProgramada: [new Date().toISOString()],
      FechaEjecucion: [new Date().toISOString()],
      Accion: ['Ver'],
      EntradaSalida: [INPUT_OUTPUT.INPUT],

      // Editable fields
      Quantity: [null, Validators.required],
      PackagingQuantity: [null],
      Photo: [null],
      PackagingId: [null],
      Packaging: [null],
      Observations: [null],
      Weight: [null],
      Price: [null],
      Volume: [null],
      MaterialId: [null, Validators.required],
      Material: [null],
      InputPointId: [null],
      InputPoint: [null],
      OutputPointId: [null],
      OutputPoint: [null],
      InputThirdPartyId: [null],
      InputThirdParty: [null],
      OutputThirdPartyId: [null],
      OutputThirdParty: [null],
      Title: [null],
      TreatmentId: [null],
      Treatment: [null],
      ResidueId: [null],
      Residue: [null],
      Factor: [null],
      Fotos: [[]]
    });
  }

  /**
   * Initializes component data and loads activity information
   */
  async ngOnInit() {
    this.photosPerMaterial = Utils.photosByMaterial ?? 2;
    await this.loadActivityData();
  }

  /**
   * Loads activity data and sets up component state based on activity type
   */
  private async loadActivityData(): Promise<void> {
    const activity = await this.activitiesService.get(this.activityId);
    if (!activity) return;

    // Set non-editable fields from activity
    this.formData.patchValue({
      IdServicio: activity.IdServicio,
      IdRecurso: activity.IdRecurso,
      IdOrden: activity.IdOrden,
      Titulo: activity.Titulo
    });

    if (activity.IdServicio == SERVICE_TYPES.COLLECTION || activity.IdServicio == SERVICE_TYPES.TRANSPORT) {
      this.requestPackaging = true;
      await this.handleTransportOrCollectionActivity(activity);
    } else if (activity.IdServicio == SERVICE_TYPES.RECEPTION) {
      this.requestOwner = true;
    }
  }

  /**
   * Handles activity data for transport or collection services
   */
  private async handleTransportOrCollectionActivity(activity: Actividad): Promise<void> {
    if (this.transactionId) {
      const transaction = await this.transactionsService.get(this.activityId, this.transactionId);
      if (!transaction) {
        this.requestPoint = true;
      } else {
        this.formData.patchValue({
          InputPointId: transaction.IdDeposito,
          InputPoint: transaction.Punto,
          InputThirdPartyId: transaction.IdTercero,
          InputThirdParty: transaction.Tercero,
          IdTransaccion: transaction.IdTransaccion,
          Title: transaction.Titulo
        });
      }
    } else {
      this.requestPoint = true;
    }
  }

  /**
   * Calculates weight or volume based on quantity and factor
   */
  calculateFromQuantity(event: any): void {
    const enteredValue = (event.target as HTMLInputElement).value;
    const resultValue = Number(enteredValue) * (this.formData.get('Factor')?.value ?? 1);

    if (this.formData.get('Measurement')?.value == MEASUREMENTS.WEIGHT) {
      this.formData.patchValue({ Weight: resultValue });
    } else if (this.formData.get('Measurement')?.value == MEASUREMENTS.VOLUME) {
      this.formData.patchValue({ Volume: resultValue });
    }
  }

  /**
   * Opens modal to select packaging
   */
  async selectPackaging(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PackagesComponent,
      componentProps: {},
    });

    modal.onDidDismiss().then((data) => {
      if (data?.data) {
        this.formData.patchValue({
          PackagingId: data.data.id,
          Packaging: data.data.name
        });
      }
    });

    await modal.present();
  }

  /**
   * Opens modal to select material
   */
  async selectMaterial(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: MaterialsComponent,
      componentProps: {},
    });

    modal.onDidDismiss().then((data) => {
      if (data?.data) {
        this.captureType = data.data.capture;
        this.measurementType = data.data.measure;
        this.formData.patchValue({
          MaterialId: data.data.id,
          Material: data.data.name,
          Capture: data.data.capture,
          Measurement: data.data.measure,
          Factor: data.data.factor
        });
      }
    });

    await modal.present();
  }

  /**
   * Opens modal to select input point
   */
  async selectInputPoint(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        tipoTercero: THIRD_PARTY_TYPES.CLIENT,
        includeMe: false,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data?.data) {
        this.formData.patchValue({
          InputPointId: data.data.id,
          InputPoint: data.data.name,
          InputThirdPartyId: data.data.owner,
          InputThirdParty: data.data.ownerName
        });
      }
    });

    await modal.present();
  }

  /**
   * Opens modal to select output point
   */
  async selectOutputPoint(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        tipoTercero: THIRD_PARTY_TYPES.SUPPLIER,
        includeMe: true,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data?.data) {
        this.formData.patchValue({
          OutputPointId: data.data.id,
          OutputPoint: data.data.name,
          OutputThirdPartyId: data.data.owner,
          OutputThirdParty: data.data.ownerName
        });
      }
    });

    await modal.present();
  }

  /**
   * Opens modal to select residue
   */
  async selectResidue(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: ResiduesComponent,
      componentProps: {},
    });

    modal.onDidDismiss().then((data) => {
      if (data?.data) {
        this.formData.patchValue({
          ResidueId: data.data.id,
          Residue: data.data.name
        });
      }
    });

    await modal.present();
  }

  /**
   * Opens modal to select treatment
   */
  async selectTreatment(): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: TreatmentsComponent,
      componentProps: {},
    });

    modal.onDidDismiss().then((data) => {
      if (data?.data) {
        this.formData.patchValue({
          TreatmentId: data.data.id,
          Treatment: data.data.name
        });
      }
    });

    await modal.present();
  }

  /**
   * Takes a photo using the device camera
   */
  async takePhoto(): Promise<void> {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (image.base64String) {
        const base64Image = `data:image/jpeg;base64,${image.base64String}`;
        this.photos.push(base64Image);
      } else {
        this.userNotificationService.showToast('TASK_ADD.MESSAGES.BASE64_ERROR', 'middle');
      }
    } catch (error) {
      this.userNotificationService.showToast('TASK_ADD.MESSAGES.PHOTO_ERROR', 'middle');
    }
  }

  /**
   * Deletes a photo from the photos array
   */
  deletePhoto(index: number): void {
    this.photos.splice(index, 1);
  }

  /**
   * Closes the modal without saving
   */
  cancel(): void {
    this.modalCtrl.dismiss({ returnToPrevious: true });
  }

  /**
   * Submits the form and creates the task
   */
  async submit(): Promise<void> {
    if (!this.formData.valid) {
      this.userNotificationService.showToast('TASK_ADD.MESSAGES.REQUIRED_FIELDS', 'middle');
      return;
    }

    const activity = await this.activitiesService.get(this.activityId);
    if (!activity) {
      this.userNotificationService.showToast('TASK_ADD.MESSAGES.ACTIVITY_NOT_FOUND', 'middle');
      return;
    }

    try {
      const formValue = this.formData.value;
      let transactionId = this.transactionId;
      if (!this.transactionId) {
        var isExistingTransaction = true;
        if (activity.IdServicio === SERVICE_TYPES.COLLECTION || activity.IdServicio == SERVICE_TYPES.TRANSPORT) {
          const existingTransaction = await this.transactionsService.getByPoint(this.activityId, formValue.InputPointId);
          if (!existingTransaction)
            isExistingTransaction = false;
        } else if (activity.IdServicio == SERVICE_TYPES.RECEPTION) {
          const existingTransaction = await this.transactionsService.getByThirdParty(this.activityId, formValue.InputThirdPartyId);
          if (!existingTransaction)
            isExistingTransaction = false;
        }
        if (!isExistingTransaction) {
          const transaction = await this.createTransaction(activity, formValue);
          transactionId = transaction.IdTransaccion;
        }
      }

      await this.createTask(activity, transactionId);
      this.modalCtrl.dismiss(true);

    } catch (error) {
      this.logger.error('Error creating task', error);
      this.userNotificationService.showToast('TASK_ADD.MESSAGES.CREATE_ERROR', 'middle');
    }
  }

  /**
   * Creates a new transaction
   */
  private async createTransaction(activity: Actividad, formValue: FormGroup['value']): Promise<Transaccion> {
    const now = new Date().toISOString();
    const transaction: Transaccion = {
      IdActividad: this.activityId,
      IdTransaccion: Utils.generateId(),
      IdEstado: STATUS.PENDING,
      EntradaSalida: INPUT_OUTPUT.INPUT,
      IdTercero: formValue.InputThirdPartyId,
      IdDeposito: formValue.InputPointId,
      IdDepositoDestino: formValue.OutputPointId,
      IdTerceroDestino: formValue.OutputThirdPartyId,
      IdOrden: activity.IdOrden,
      Punto: formValue.InputPoint,
      Tercero: formValue.InputThirdParty,
      Titulo: activity.IdServicio == SERVICE_TYPES.RECEPTION ?
        formValue.InputThirdParty :
        'Nueva - ' + (formValue.InputPoint ?? '') + (formValue.InputThirdParty ?? ''),
      Solicitudes: 'Nueva',
      Icono: activity.IdServicio == SERVICE_TYPES.RECEPTION ? 'person' : 'location',
      IdRecurso: activity.IdRecurso,
      IdServicio: activity.IdServicio,
      FechaInicial: now,
      FechaFinal: now,
      Accion: Utils.getInputOutputAction(INPUT_OUTPUT.TRANSFERENCE)
    };

    await this.transactionsService.create(transaction);
    return transaction;
  }

  /**
   * Creates a new task
   */
  private async createTask(activity: Actividad, transactionId: string | null): Promise<void> {
    const formValue = this.formData.value;
    const now = new Date().toISOString();

    const task: Tarea = {
      IdActividad: this.activityId,
      IdTransaccion: transactionId || undefined,
      IdTarea: Utils.generateId(),
      IdMaterial: formValue.MaterialId,
      Material: formValue.Material,
      IdDeposito: formValue.InputPointId,
      IdTercero: formValue.InputThirdPartyId,
      IdDepositoDestino: formValue.OutputPointId,
      IdTerceroDestino: formValue.OutputThirdPartyId,
      Accion: 'Ver',
      EntradaSalida: INPUT_OUTPUT.INPUT,
      IdServicio: activity.IdServicio,
      IdEstado: STATUS.APPROVED,
      IdRecurso: activity.IdRecurso,
      FechaEjecucion: now,
      FechaSolicitud: now,
      Cantidad: formValue.Quantity,
      Peso: formValue.Weight,
      Volumen: formValue.Volume,
      IdEmbalaje: formValue.PackagingId,
      FechaProgramada: now,
      Fotos: this.photos,
    };

    await this.tasksService.create(task);
  }
}
