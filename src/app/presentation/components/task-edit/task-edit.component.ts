import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { Task } from '@app/domain/entities/task.entity';
import { INPUT_OUTPUT, STATUS, MEASUREMENTS, SERVICE_TYPES } from '@app/core/constants';
import { InventoryRepository } from '@app/infrastructure/repositories/inventory.repository';
import { MaterialRepository } from '@app/infrastructure/repositories/material.repository';
import { FacilityRepository } from '@app/infrastructure/repositories/facility.repository';
import { TaskService } from '@app/application/services/task.service';
import { PartyRepository } from '@app/infrastructure/repositories/party.repository';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { PackageRepository } from '@app/infrastructure/repositories/package.repository';
import { Utils } from '@app/core/utils';
import { Waste } from '@app/domain/entities/waste.entity';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { ProcessService } from '@app/application/services/process.service';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss']
})
export class TaskEditComponent implements OnInit {
  /** Inputs */
  @Input() activityId: string = '';
  @Input() processId: string = '';
  @Input() transactionId: string = '';
  @Input() taskId: string = '';
  @Input() materialId: string = '';
  @Input() residueId: string = '';
  @Input() inputOutput: string = '';

  /** Variables */
  frmTask: FormGroup;
  captureType: string = '';
  factor: number | null = null;
  measurement: string = '';
  photo!: SafeResourceUrl;
  photosByMaterial: number = 2;
  photos: string[] = [];
  status: string = '';
  showDetails: boolean = false;
  showTreatment: boolean = false;
  task: Task | undefined = undefined;

  /** Constructor */
  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private processService: ProcessService,
    private packageRepository: PackageRepository,
    private subprocessService: SubprocessService,
    private tasksService: TaskService,
    private inventoryService: InventoryRepository,
    private materialsService: MaterialRepository,
    private materialsRepository: MaterialRepository,
    private facilityRepository: FacilityRepository,
    private partiesService: PartyRepository,
    private translate: TranslateService,
    private logger: LoggerService
  ) {
    this.frmTask = this.formBuilder.group({
      Cantidad: [null],
      Peso: [null],
      Volumen: [null],
      Valor: [null],
      IdEmbalaje: [null],
      Observaciones: [null],
      IdDeposito: [null],
      IdDepositoDestino: [null],
      IdTercero: [null],
      IdTerceroDestino: [null],
      IdTratamiento: [null],
      Material: [null],
      Deposito: [null],
      DepositoDestino: [null],
      Tercero: [null],
      TerceroDestino: [null],
      Tratamiento: [null],
      Embalaje: [null]
    });
  }

  /**
   * Form initialization
   */
  async ngOnInit() {
    this.photosByMaterial = Utils.photosByMaterial;
    this.task = await this.tasksService.get(this.taskId);

    if (this.task) {
      this.status = this.task.StatusId;
      this.photos = this.task.Photos ?? [];

      const materialItem = await this.materialsRepository.get(this.task.MaterialId);
      if (materialItem) {
        this.measurement = materialItem.MeasurementType;
        this.captureType = materialItem.CaptureType;
        this.frmTask.patchValue({
          Material: materialItem.Name
        });
      }

      if (this.task.FacilityId) {
        const itemPoint = await this.facilityRepository.get(this.task.FacilityId);
        if (itemPoint) {
          this.frmTask.patchValue({
            IdDeposito: itemPoint.Id,
            Deposito: itemPoint.Name
          });
        }
      }

      if (this.task.DestinationFacilityId) {
        const itemPoint = await this.facilityRepository.get(this.task.DestinationFacilityId);
        if (itemPoint) {
          this.frmTask.patchValue({
            IdDepositoDestino: itemPoint.Id,
            DepositoDestino: itemPoint.Name
          });
          if (itemPoint.OwnerId) {
            const thirdParty = await this.partiesService.get(itemPoint.OwnerId);
            if (thirdParty) {
              this.frmTask.patchValue({
                IdTerceroDestino: thirdParty.Id,
                TerceroDestino: thirdParty.Name
              });
            }
          }
        }
      }

      if (this.task.PartyId) {
        const party = await this.partiesService.get(this.task.PartyId);
        if (party) {
          this.frmTask.patchValue({
            IdTercero: party.Id,
            Tercero: party.Name
          });
        }
      }

      if (this.task.PackageId) {
        const packageItem = await this.packageRepository.get(this.task.PackageId);
        if (packageItem) {
          this.frmTask.patchValue({
            IdEmbalaje: this.task.PackageId,
            Embalaje: packageItem.Name
          });
        }
      }

      if (this.inputOutput == INPUT_OUTPUT.OUTPUT) {
        const residueItem = await this.inventoryService.getResidue(this.residueId);
        if (residueItem) {
          this.frmTask.patchValue({
            Cantidad: residueItem.Quantity ?? 0,
            Peso: residueItem.Weight ?? 0,
            Volumen: residueItem.Volume ?? 0
          });
        }
      }

      this.frmTask.patchValue({
        Cantidad: this.task.Quantity ?? 0,
        Peso: this.task.Weight ?? 0,
        Volumen: this.task.Volume ?? 0,
        Valor: this.task.Price,
        Observaciones: this.task.Notes
      });
    } else {
      if (this.transactionId) {
        const transaction = await this.subprocessService.get(this.activityId, this.transactionId);
        if (transaction) {
          const point = await this.facilityRepository.get(transaction.FacilityId ?? '');
          if (point) {
            this.frmTask.patchValue({
              IdDeposito: point.Id,
              Deposito: point.Name
            });
            if (point.OwnerId) {
              const owner = await this.partiesService.get(point.Id);
              if (owner) {
                this.frmTask.patchValue({
                  IdTercero: owner.Id,
                  Tercero: owner.Name
                });
              }
            }
          }
        }
      }

      const material = await this.materialsService.get(this.materialId);
      if (material) {
        this.measurement = material.MeasurementType;
        this.captureType = material.Type;
        this.frmTask.patchValue({
          Material: material.Name
        });
      }

      const residueItem = await this.inventoryService.getResidue(this.residueId);
      if (residueItem) {
        this.frmTask.patchValue({
          Cantidad: residueItem.Quantity ?? 0,
          Peso: residueItem.Weight ?? 0,
          Volumen: residueItem.Volume ?? 0
        });
      }
    }
  }

  /**
   * Map the form to the Task interface
   */
  private mapFormToTask(): Task {
    const formValue = this.frmTask.value;
    const now = new Date().toISOString();

    return {
      TaskId: this.taskId || Utils.generateId(),
      ProcessId: this.processId,
      SubprocessId: this.transactionId,
      MaterialId: this.materialId,
      WasteId: this.residueId,
      InputOutput: this.inputOutput,
      Quantity: formValue.Cantidad,
      Weight: formValue.Peso,
      Volume: formValue.Volumen,
      Price: formValue.Valor,
      PackageId: formValue.IdEmbalaje,
      FacilityId: formValue.IdDeposito,
      DestinationFacilityId: formValue.IdDepositoDestino,
      PartyId: formValue.IdTercero,
      DestinationPartyId: formValue.IdTerceroDestino,
      TreatmentId: formValue.IdTratamiento,
      ExecutionDate: now,
      Photos: this.photos,
      Notes: formValue.Observaciones,
      StatusId: STATUS.APPROVED,
      ResourceId: this.task?.ResourceId || '',
      ServiceId: this.task?.ServiceId || '',
      Item: this.task?.Item || 0,
      ScheduledDate: this.task?.ScheduledDate || now,
      RequestDate: now,
      RequestId: 0,
      RequestName: ''
    };
  }

  /**
   * Map the task to a residue
   */
  private mapResidueFromTask(task: Task): Waste {
    return {
      Id: Utils.generateId(),
      MaterialId: this.materialId,
      OwnerId: task.PartyId || '',
      FacilityId: task.FacilityId || '',
      VehicleId: '',
      OriginFacilityId: task.FacilityId || '',
      IsRecyclable: true,
      Quantity: task.Quantity || 0,
      PackageQuantity: 0,
      Weight: task.Weight || 0,
      PackageId: task.PackageId || '',
      StatusId: STATUS.APPROVED,
      MaterialName: this.frmTask.value.Material || '',
      LocationName: '',
      Volume: task.Volume || 0,
    };
  }

  /**
   * Confirm the task
   */
  async confirm() {
    if (!this.frmTask.valid) return;

    const activity = await this.processService.get(this.activityId);
    if (!activity) return;

    let task: Task = this.mapFormToTask();
    if (this.task) {
      await this.tasksService.update(task);
    }
    this.modalCtrl.dismiss(task);
  }

  /**
   * Reject the task
   */
  async reject() {
    const task = await this.tasksService.get(this.taskId);
    if (task) {
      task.Notes = this.frmTask.value.Observaciones;
      task.StatusId = STATUS.REJECTED;
      task.ExecutionDate = new Date().toISOString();
      await this.tasksService.update(task);
    }
    this.modalCtrl.dismiss(task);
  }

  /**
   * Return to the initial page
   */
  cancel() {
    this.modalCtrl.dismiss();
  }

  /**
   * Select the package and set the values in the page variables
   */
  async selectPackage() {
    const modal = await this.modalCtrl.create({
      component: 'app-packages',
      componentProps: {},
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.frmTask.patchValue({
          IdEmbalaje: data.data.id,
          Embalaje: data.data.name
        });
      }
    });

    return await modal.present();
  }

  /**
   * Select the treatment and set the values in the page variables
   */
  async selectTreatment() {
    const modal = await this.modalCtrl.create({
      component: 'app-treatments',
      componentProps: {},
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.frmTask.patchValue({
          IdTratamiento: data.data.id,
          Tratamiento: data.data.name
        });
      }
    });

    return await modal.present();
  }

  /**
   * Take a photo
   */
  async takePhoto() {
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
        this.logger.error(this.translate.instant('TASK_EDIT.MESSAGES.BASE64_ERROR'), 'TaskEditComponent');
      }
    } catch (error) {
      this.logger.error(this.translate.instant('TASK_EDIT.MESSAGES.PHOTO_ERROR'), error);
    }
  }

  /**
   * Delete a photo
   */
  deletePhoto(index: number) {
    this.photos.splice(index, 1);
  }

  /**
   * Calculate the weight or volume from the quantity
   */
  calculateFromQuantity(event: any) {
    const enteredValue = (event.target as HTMLInputElement).value;
    const resultValue = Number(enteredValue) * (this.factor ?? 1);

    if (this.measurement == MEASUREMENTS.WEIGHT)
      this.frmTask.patchValue({ Peso: resultValue });
    else if (this.measurement == MEASUREMENTS.VOLUME)
      this.frmTask.patchValue({ Volumen: resultValue });
  }
}
