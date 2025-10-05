import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { Tarea } from '@app/domain/entities/tarea.entity';
import { INPUT_OUTPUT, STATUS, MEASUREMENTS, SERVICE_TYPES } from '@app/core/constants';
import { InventoryService } from '@app/infrastructure/repositories/transactions/inventory.repository';
import { MaterialsService } from '@app/infrastructure/repositories/masterdata/materials.repository';
import { PointsService } from '@app/infrastructure/repositories/masterdata/points.repository';
import { TasksService } from '@app/infrastructure/repositories/transactions/tasks.repository';
import { ThirdpartiesService } from '@app/infrastructure/repositories/masterdata/thirdparties.repository';
import { TransactionsService } from '@app/infrastructure/repositories/transactions/transactions.repository';
import { PackagingService } from '@app/infrastructure/repositories/masterdata/packaging.repository';
import { Utils } from '@app/core/utils';
import { Residuo } from '@app/domain/entities/residuo.entity';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { ProcessesService } from '@app/infrastructure/repositories/transactions/processes.repository';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss']
})
export class TaskEditComponent implements OnInit {
  /** Inputs */
  @Input() activityId: string = '';
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
  task: Tarea | undefined = undefined;

  /** Constructor */
  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private processesService: ProcessesService,
    private packagingService: PackagingService,
    private transactionsService: TransactionsService,
    private tasksService: TasksService,
    private inventoryService: InventoryService,
    private materialsService: MaterialsService,
    private pointsService: PointsService,
    private thirdpartiesService: ThirdpartiesService,
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
      this.status = this.task.IdEstado;
      this.photos = this.task.Fotos ?? [];

      const materialItem = await this.materialsService.get(this.task.IdMaterial);
      if (materialItem) {
        this.measurement = materialItem.TipoMedicion;
        this.captureType = materialItem.TipoCaptura;
        this.factor = materialItem.Factor ?? 1;
        this.frmTask.patchValue({
          Material: materialItem.Nombre
        });
      }

      if (this.task.IdDeposito) {
        const itemPoint = await this.pointsService.get(this.task.IdDeposito);
        if (itemPoint) {
          this.frmTask.patchValue({
            IdDeposito: itemPoint.IdDeposito,
            Deposito: itemPoint.Nombre
          });
        }
      }

      if (this.task.IdDepositoDestino) {
        const itemPoint = await this.pointsService.get(this.task.IdDepositoDestino);
        if (itemPoint) {
          this.frmTask.patchValue({
            IdDepositoDestino: itemPoint.IdDeposito,
            DepositoDestino: itemPoint.Nombre
          });
          if (itemPoint.IdPersona) {
            const thirdParty = await this.thirdpartiesService.get(itemPoint.IdPersona);
            if (thirdParty) {
              this.frmTask.patchValue({
                IdTerceroDestino: thirdParty.IdPersona,
                TerceroDestino: thirdParty.Nombre
              });
            }
          }
        }
      }

      if (this.task.IdTercero) {
        const thirdParty = await this.thirdpartiesService.get(this.task.IdTercero);
        if (thirdParty) {
          this.frmTask.patchValue({
            IdTercero: thirdParty.IdPersona,
            Tercero: thirdParty.Nombre
          });
        }
      }

      if (this.task.IdEmbalaje) {
        const packageItem = await this.packagingService.get(this.task.IdEmbalaje);
        if (packageItem) {
          this.frmTask.patchValue({
            IdEmbalaje: this.task.IdEmbalaje,
            Embalaje: packageItem.Nombre
          });
        }
      }

      if (this.inputOutput == INPUT_OUTPUT.OUTPUT) {
        const residueItem = await this.inventoryService.getResidue(this.residueId);
        if (residueItem) {
          this.frmTask.patchValue({
            Cantidad: residueItem.Cantidad ?? 0,
            Peso: residueItem.Peso ?? 0,
            Volumen: residueItem.Volumen ?? 0
          });
        }
      }

      this.frmTask.patchValue({
        Cantidad: this.task.Cantidad ?? 0,
        Peso: this.task.Peso ?? 0,
        Volumen: this.task.Volumen ?? 0,
        Valor: this.task.Valor,
        Observaciones: this.task.Observaciones
      });
    } else {
      if (this.transactionId) {
        const transaction = await this.transactionsService.get(this.activityId, this.transactionId);
        if (transaction) {
          const point = await this.pointsService.get(transaction.IdDeposito ?? '');
          if (point) {
            this.frmTask.patchValue({
              IdDeposito: point.IdDeposito,
              Deposito: point.Nombre
            });
            if (point.IdPersona) {
              const owner = await this.thirdpartiesService.get(point.IdPersona);
              if (owner) {
                this.frmTask.patchValue({
                  IdTercero: owner.IdPersona,
                  Tercero: owner.Nombre
                });
              }
            }
          }
        }
      }

      const material = await this.materialsService.get(this.materialId);
      if (material) {
        this.measurement = material.TipoMedicion;
        this.captureType = material.TipoCaptura;
        this.frmTask.patchValue({
          Material: material.Nombre
        });
      }

      const residueItem = await this.inventoryService.getResidue(this.residueId);
      if (residueItem) {
        this.frmTask.patchValue({
          Cantidad: residueItem.Cantidad ?? 0,
          Peso: residueItem.Peso ?? 0,
          Volumen: residueItem.Volumen ?? 0
        });
      }
    }
  }

  /**
   * Map the form to the Tarea interface
   */
  private mapFormToTask(): Tarea {
    const formValue = this.frmTask.value;
    const now = new Date().toISOString();

    return {
      IdTarea: this.taskId || Utils.generateId(),
      IdProceso: this.activityId,
      IdTransaccion: this.transactionId,
      IdMaterial: this.materialId,
      IdResiduo: this.residueId,
      EntradaSalida: this.task?.EntradaSalida || this.inputOutput,
      Cantidad: formValue.Cantidad,
      Peso: formValue.Peso,
      Volumen: formValue.Volumen,
      Valor: formValue.Valor,
      IdEmbalaje: formValue.IdEmbalaje,
      IdDeposito: formValue.IdDeposito,
      IdDepositoDestino: formValue.IdDepositoDestino,
      IdTercero: formValue.IdTercero,
      IdTerceroDestino: formValue.IdTerceroDestino,
      IdTratamiento: this.task?.IdTratamiento || formValue.IdTratamiento,
      FechaEjecucion: now,
      Fotos: this.photos,
      Observaciones: formValue.Observaciones,
      IdEstado: STATUS.APPROVED,
      IdRecurso: this.task?.IdRecurso || '',
      IdServicio: this.task?.IdServicio || '',
      Item: this.task?.Item || 0,
      FechaProgramada: this.task?.FechaProgramada || now,
      FechaSolicitud: this.task?.FechaSolicitud || now,
      IdSolicitud: this.task?.IdSolicitud || 0,
      Solicitud: this.task?.Solicitud || ''
    };
  }

  /**
   * Map the task to a residue
   */
  private mapResidueFromTask(task: Tarea): Residuo {
    return {
      IdResiduo: Utils.generateId(),
      IdMaterial: this.materialId,
      IdPropietario: task.IdTercero || '',
      IdDeposito: task.IdDeposito || '',
      IdVehiculo: '',
      IdDepositoOrigen: task.IdDeposito || '',
      Aprovechable: true,
      Cantidad: task.Cantidad || 0,
      Peso: task.Peso || 0,
      IdEmbalaje: task.IdEmbalaje || '',
      CantidadEmbalaje: 0,
      IdEstado: STATUS.APPROVED,
      Material: this.frmTask.value.Material || '',
      Ubicacion: '',
      Volumen: task.Volumen || 0,
    };
  }

  /**
   * Confirm the task
   */
  async confirm() {
    if (!this.frmTask.valid) return;

    const activity = await this.processesService.get(this.activityId);
    if (!activity) return;

    let task: Tarea = this.mapFormToTask();
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
      task.Observaciones = this.frmTask.value.Observaciones;
      task.IdEstado = STATUS.REJECTED;
      task.FechaEjecucion = new Date().toISOString();
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
