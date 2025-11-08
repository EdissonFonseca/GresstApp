import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { Task } from '@app/domain/entities/task.entity';
import { Process } from '@app/domain/entities/process.entity';
import { Subprocess } from '@app/domain/entities/subprocess.entity';
import { STATUS, MEASUREMENTS } from '@app/core/constants';
import { MaterialRepository } from '@app/infrastructure/repositories/material.repository';
import { PackageRepository } from '@app/infrastructure/repositories/package.repository';
import { TaskService } from '@app/application/services/task.service';
import { ProcessService } from '@app/application/services/process.service';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { Utils } from '@app/core/utils';
import { TranslateService } from '@ngx-translate/core';
import { LoggerService } from '@app/infrastructure/services/logger.service';
import { PackagesComponent } from '@app/presentation/components/packages/packages.component';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss'],
  standalone: false
})
export class TaskEditComponent implements OnInit {
  /** Inputs */
  @Input() processId: string = '';
  @Input() subprocessId: string = '';
  @Input() taskId: string = '';
  @Input() materialId: string = '';
  @Input() wasteId: string = '';
  @Input() inputOutput: string = '';

  /** Variables */
  frmTask: FormGroup;
  captureType: string = '';
  factor: number | null = null;
  measurementType: string = '';
  photo!: SafeResourceUrl;
  photosByMaterial: number = 2;
  photos: string[] = [];
  status: string = '';
  showDetails: boolean = false;
  task: Task | undefined = undefined;

  // Display names (not in form, just for UI)
  materialName: string = '';
  packageName: string = '';

  // Context information (process/subprocess)
  process: Process | undefined = undefined;
  subprocess: Subprocess | undefined = undefined;

  /** Constructor */
  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private tasksService: TaskService,
    private processService: ProcessService,
    private subprocessService: SubprocessService,
    private materialsRepository: MaterialRepository,
    private packageRepository: PackageRepository,
    private translate: TranslateService,
    private logger: LoggerService
  ) {
    // Only fields that can be edited by the user
    this.frmTask = this.formBuilder.group({
      Quantity: [null],
      Weight: [null],
      Volume: [null],
      PackageId: [null],
      Notes: [null]
    });
  }

  /**
   * Form initialization
   * Load the task and populate only editable fields in the form
   */
  async ngOnInit() {
    this.photosByMaterial = Utils.photosByMaterial;

    // Load the task
    this.task = await this.tasksService.get(this.taskId);

    if (!this.task) {
      this.logger.error('Task not found', { taskId: this.taskId });
      return;
    }

    // Set status and photos
    this.status = this.task.StatusId;
    this.photos = this.task.Photos ?? [];

    // Load context information (Process and Subprocess)
    if (this.task.ProcessId) {
      this.process = await this.processService.get(this.task.ProcessId);
    }

    if (this.task.SubprocessId) {
      this.subprocess = await this.subprocessService.get(this.task.ProcessId, this.task.SubprocessId);
    }

    // Get material info for measurement type and display
    const materialItem = await this.materialsRepository.get(this.task.MaterialId);
    if (materialItem) {
      this.measurementType = materialItem.MeasurementType;
      this.captureType = materialItem.CaptureType;
      this.materialName = materialItem.Name;
    }

    // Get package name for display
    if (this.task.PackageId) {
      const packageItem = await this.packageRepository.get(this.task.PackageId);
      if (packageItem) {
        this.packageName = packageItem.Name;
      }
    }

    // Populate form with editable fields only
    this.frmTask.patchValue({
      Quantity: this.task.Quantity ?? 0,
      Weight: this.task.Weight ?? 0,
      Volume: this.task.Volume ?? 0,
      PackageId: this.task.PackageId,
      Notes: this.task.Notes
    });
  }

  /**
   * Update task with form values
   * Only modifies editable fields, preserving all other task data
   */
  private updateTaskFromForm(): Task {
    if (!this.task) {
      throw new Error('Task not loaded');
    }

    const formValue = this.frmTask.value;

    // Update only editable fields
    return {
      ...this.task,
      Quantity: formValue.Quantity,
      Weight: formValue.Weight,
      Volume: formValue.Volume,
      PackageId: formValue.PackageId,
      Notes: formValue.Notes,
      Photos: this.photos,
      ExecutionDate: new Date().toISOString(),
      StatusId: STATUS.APPROVED
    };
  }


  /**
   * Confirm the task
   * Steps:
   * 1. Update task with form values (only editable fields)
   * 2. Save to repository (which handles storage, queue, and API sync)
   * 3. Return task to caller (which will reload CardService and recalculate summaries)
   */
  async confirm() {
    if (!this.frmTask.valid || !this.task) return;

    // Update task with form values
    const updatedTask: Task = this.updateTaskFromForm();

    // Update task - this will:
    // - Update in operation.Tasks
    // - Save to storage
    // - Add to message queue
    // - Try to upload (if fails, message stays in queue)
    await this.tasksService.update(updatedTask);

    // Return task to caller - the page will reload CardService which recalculates hierarchical summaries
    this.modalCtrl.dismiss(updatedTask);
  }

  /**
   * Reject the task
   */
  async reject() {
    if (!this.task) return;

    // Update task with rejection
    const rejectedTask: Task = {
      ...this.task,
      Notes: this.frmTask.value.Notes,
      StatusId: STATUS.REJECTED,
      ExecutionDate: new Date().toISOString()
    };

    await this.tasksService.update(rejectedTask);
    this.modalCtrl.dismiss(rejectedTask);
  }

  /**
   * Return to the initial page
   */
  cancel() {
    this.modalCtrl.dismiss();
  }

  /**
   * Select the package and update the form
   */
  async selectPackage() {
    const modal = await this.modalCtrl.create({
      component: PackagesComponent,
      componentProps: {},
    });

    modal.onDidDismiss().then(async (data) => {
      if (data && data.data) {
        // Update form with package ID
        this.frmTask.patchValue({
          PackageId: data.data
        });

        // Load package name for display
        const packageItem = await this.packageRepository.get(data.data);
        if (packageItem) {
          this.packageName = packageItem.Name;
        }
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

    if (this.measurementType == MEASUREMENTS.WEIGHT)
      this.frmTask.patchValue({ Weight: resultValue });
    else if (this.measurementType == MEASUREMENTS.VOLUME)
      this.frmTask.patchValue({ Volume: resultValue });
  }
}
