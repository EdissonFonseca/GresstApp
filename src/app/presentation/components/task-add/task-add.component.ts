import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { THIRD_PARTY_TYPES, INPUT_OUTPUT, STATUS, MEASUREMENTS, SERVICE_TYPES } from '@app/core/constants';
import { PackagesComponent } from '@app/presentation/components/packages/packages.component';
import { MaterialsComponent } from '../materials/materials.component';
import { FacilitiesComponent } from '../facilities/facilities.component';
import { WastesComponent } from '../wastes/wastes.component';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Task } from '@app/domain/entities/task.entity';
import { Subprocess } from '@app/domain/entities/subprocess.entity';
import { TaskService } from '@app/application/services/task.service';
import { ProcessService } from '@app/application/services/process.service';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { Utils } from '@app/core/utils';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { Process } from '@app/domain/entities/process.entity';
import { LoggerService } from '@app/infrastructure/services/logger.service';

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
    private processService: ProcessService,
    private subprocessService: SubprocessService,
    private taskService: TaskService,
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
    const activity = await this.processService.get(this.activityId);
    if (!activity) return;

    // Set non-editable fields from activity
    this.formData.patchValue({
      IdServicio: activity.ServiceId,
      IdRecurso: activity.ResourceId,
      IdOrden: activity.OrderId,
      Titulo: activity.Title
    });

    if (activity.ServiceId == SERVICE_TYPES.COLLECTION || activity.ServiceId == SERVICE_TYPES.TRANSPORT) {
      this.requestPackaging = true;
      await this.handleTransportOrCollectionActivity(activity);
    } else if (activity.ServiceId == SERVICE_TYPES.RECEPTION) {
      this.requestOwner = true;
    }
  }

  /**
   * Handles activity data for transport or collection services
   */
  private async handleTransportOrCollectionActivity(activity: Process): Promise<void> {
    if (this.transactionId) {
      const subprocess = await this.subprocessService.get(this.activityId, this.transactionId);
      if (!subprocess) {
        this.requestPoint = true;
      } else {
        this.formData.patchValue({
          InputPointId: subprocess.FacilityId,
          InputPoint: subprocess.FacilityName,
          InputThirdPartyId: subprocess.PartyId,
          InputThirdParty: subprocess.PartyName,
          IdTransaccion: subprocess.SubprocessId,
          Title: subprocess.Title
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
      component: FacilitiesComponent,
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
      component: FacilitiesComponent,
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
      component: WastesComponent,
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

    const activity = await this.processService.get(this.activityId);
    if (!activity) {
      this.userNotificationService.showToast('TASK_ADD.MESSAGES.ACTIVITY_NOT_FOUND', 'middle');
      return;
    }

    try {
      const formValue = this.formData.value;
      let transactionId = this.transactionId;
      if (!this.transactionId) {
        var isExistingTransaction = true;
        if (activity.ServiceId === SERVICE_TYPES.COLLECTION || activity.ServiceId == SERVICE_TYPES.TRANSPORT) {
          const existingTransaction = await this.subprocessService.getByPoint(this.activityId, formValue.InputPointId);
          if (!existingTransaction)
            isExistingTransaction = false;
        } else if (activity.ServiceId == SERVICE_TYPES.RECEPTION) {
          const existingTransaction = await this.subprocessService.getByThirdParty(this.activityId, formValue.InputThirdPartyId);
          if (!existingTransaction)
            isExistingTransaction = false;
        }
        if (!isExistingTransaction) {
          const transaction = await this.createTransaction(activity, formValue);
          transactionId = transaction.SubprocessId;
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
  private async createTransaction(activity: Process, formValue: FormGroup['value']): Promise<Subprocess> {
    const now = new Date().toISOString();
    const subprocess: Subprocess = {
      ProcessId: this.activityId,
      SubprocessId: Utils.generateId(),
      StatusId: STATUS.PENDING,
      InputOutput: INPUT_OUTPUT.INPUT,
      PartyId: formValue.InputThirdPartyId,
      FacilityId: formValue.InputPointId,
      DestinationFacilityId: formValue.OutputPointId,
      DestinationPartyId: formValue.OutputThirdPartyId,
      OrderId: activity.OrderId,
      FacilityName: formValue.InputPoint,
      PartyName: formValue.InputThirdParty,
      Title: activity.ServiceId == SERVICE_TYPES.RECEPTION ?
        formValue.InputThirdParty :
        'Nueva - ' + (formValue.InputPoint ?? '') + (formValue.InputThirdParty ?? ''),
      Requests: 'Nueva',
      Icon: activity.ServiceId == SERVICE_TYPES.RECEPTION ? 'person' : 'location',
      ResourceId: activity.ResourceId,
      ServiceId: activity.ServiceId,
      StartDate: now,
      EndDate: now,
      Action: Utils.getInputOutputAction(INPUT_OUTPUT.TRANSFERENCE),
      Tasks: []
    };

    await this.subprocessService.create(subprocess);
    return subprocess;
  }

  /**
   * Creates a new task
   */
  private async createTask(activity: Process, transactionId: string | null): Promise<void> {
    const formValue = this.formData.value;
    const now = new Date().toISOString();

    const task: Task = {
      ProcessId: this.activityId,
      SubprocessId: transactionId || undefined,
      TaskId: Utils.generateId(),
      MaterialId: formValue.MaterialId,
      FacilityId: formValue.InputPointId,
      PartyId: formValue.InputThirdPartyId,
      DestinationFacilityId: formValue.OutputPointId,
      DestinationPartyId: formValue.OutputThirdPartyId,
      InputOutput: INPUT_OUTPUT.INPUT,
      ServiceId: activity.ServiceId,
      StatusId: STATUS.APPROVED,
      ResourceId: activity.ResourceId,
      ExecutionDate: now,
      RequestDate: now,
      Quantity: formValue.Quantity,
      Weight: formValue.Weight,
      Volume: formValue.Volume,
      PackageId: formValue.PackagingId,
      ScheduledDate: now,
      Photos: this.photos,
    };

    await this.taskService.create(task);
  }
}
