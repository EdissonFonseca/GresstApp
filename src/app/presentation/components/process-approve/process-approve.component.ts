import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Process } from '@app/domain/entities/process.entity';
import { ProcessService } from '@app/application/services/process.service';
import { SubprocessService } from '@app/application/services/subprocess.service';
import { TaskService } from '@app/application/services/task.service';
import { STATUS } from '@app/core/constants';
import { Utils } from '@app/core/utils';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-process-approve',
  templateUrl: './process-approve.component.html',
  styleUrls: ['./process-approve.component.scss']
})
export class ProcessApproveComponent implements OnInit {
  @Input() showMileage: boolean = true;
  @Input() showName: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showNotes: boolean = true;
  @Input() showSignPad: boolean = true;
  @Input() isReject: boolean = false;
  @Input() processId: string = '';

  @ViewChild('canvas', { static: false }) signatureCanvas!: ElementRef;

  frmActividad!: FormGroup;
  summary = '';
  mileageUnit = signal<string>('');
  private canvas: any;
  private ctx: any;
  private drawing = signal<boolean>(false);
  private penColor = signal<string>('black');

  process: Process | null = null;

  private isDataLoaded = false;

  protected Utils = Utils;

  // Process summary data
  processSummary = {
    approved: 0,
    pending: 0,
    rejected: 0,
    quantity: 0,
    weight: 0,
    volume: 0
  };

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private processService: ProcessService,
    private subprocessService: SubprocessService,
    private taskService: TaskService,
    private userNotificationService: UserNotificationService,
    private modalCtrl: ModalController,
    private translate: TranslateService
  ) {}

  async ngOnInit() {
    if (this.isDataLoaded) return;

    this.mileageUnit.set(Utils.mileageUnit);
    this.showMileage = Utils.requestMileage;

    this.frmActividad = this.formBuilder.group({
      Identificacion: [''],
      Nombre: [''],
      Cargo: [''],
      Kilometraje: [null],
      Observaciones: [''],
      Firma: [null]
    });

    if (this.processId) {
      try {
        const process = await this.processService.get(this.processId);
        if (process) {
          this.process = process;
          this.frmActividad.patchValue({
            Identificacion: process.ResponsibleIdentification,
            Nombre: process.ResponsibleName,
            Cargo: process.ResponsiblePosition,
            Observaciones: process.ResponsibleNotes
          });

          // Calculate process summary from subprocesses
          await this.calculateProcessSummary(this.processId);
        }
      } catch (error) {
        console.error('Error loading activity:', error);
        await this.userNotificationService.showToast(
          this.translate.instant('PROCESSES.MESSAGES.LOAD_ERROR'),
          'middle'
        );
      }
    }

    this.isDataLoaded = true;
  }

  /**
   * Calculate summary data for process from its subprocesses and tasks
   */
  private async calculateProcessSummary(processId: string): Promise<void> {
    const subprocesses = await this.subprocessService.listByProcess(processId);

    // Count subprocesses by status
    this.processSummary.approved = subprocesses.filter(sp => sp.StatusId === STATUS.APPROVED).length;
    this.processSummary.pending = subprocesses.filter(sp => sp.StatusId === STATUS.PENDING).length;
    this.processSummary.rejected = subprocesses.filter(sp => sp.StatusId === STATUS.REJECTED).length;

    // Sum quantities from all tasks (only approved)
    let totalQuantity = 0;
    let totalWeight = 0;
    let totalVolume = 0;

    for (const subprocess of subprocesses) {
      const tasks = await this.taskService.listByProcessAndSubprocess(processId, subprocess.SubprocessId);
      const approvedTasks = tasks.filter(t => t.StatusId === STATUS.APPROVED);

      totalQuantity += approvedTasks.reduce((sum, t) => sum + (t.Quantity || 0), 0);
      totalWeight += approvedTasks.reduce((sum, t) => sum + (t.Weight || 0), 0);
      totalVolume += approvedTasks.reduce((sum, t) => sum + (t.Volume || 0), 0);
    }

    this.processSummary.quantity = totalQuantity;
    this.processSummary.weight = totalWeight;
    this.processSummary.volume = totalVolume;
  }

  ionViewDidEnter() {
    if (this.signatureCanvas?.nativeElement) {
      this.canvas = this.signatureCanvas.nativeElement;
      this.ctx = this.canvas.getContext('2d');
      this.renderer.setProperty(this.canvas, 'width', window.innerWidth);
      this.renderer.setProperty(this.canvas, 'height', 200);
      this.ctx.strokeStyle = this.penColor();
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }
  }

  startDrawing(event: any) {
    if (!this.ctx) return;
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    this.drawing.set(true);
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  draw(event: any) {
    if (!this.ctx || !this.drawing()) return;
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    this.ctx.lineTo(x, y);
    this.ctx.stroke();
  }

  endDrawing() {
    if (!this.ctx) return;
    this.drawing.set(false);
    this.updateSignatureField();
  }

  clear() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.frmActividad.patchValue({ Firma: null });
  }

  private updateSignatureField() {
    const signatureData = this.getSignature();
    this.frmActividad.patchValue({ Firma: signatureData });
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  getSignature(): string | null {
    if (!this.canvas) return null;
    const context = this.canvas.getContext('2d');
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight).data;
    const hasContent = Array.from(imageData).some(channel => channel !== 0);

    if (!hasContent) {
      return null;
    }

    return this.canvas.toDataURL();
  }

  async getFormData(): Promise<Process | undefined> {
    const process = await this.processService.get(this.processId);
    if (!process) return undefined;

    const formData = this.frmActividad.value;
    return {
      ...process,
      ResponsiblePosition: formData.Cargo,
      ResponsibleSignature: formData.Firma,
      ResponsibleIdentification: formData.Identificacion,
      ResponsibleName: formData.Nombre,
      ResponsibleNotes: formData.Observaciones
    };
  }

  async submit() {
    const process = await this.getFormData();
    if (!process) return;

    try {
      await this.userNotificationService.showLoading(
        this.translate.instant(this.isReject ? 'PROCESSES.REJECT.SENDING' : 'PROCESSES.APPROVE.SENDING')
      );

      process.StatusId = this.isReject ? STATUS.REJECTED : STATUS.APPROVED;

      // Get all subprocesses for this process
      const subprocesses = await this.subprocessService.listByProcess(this.processId);

      // Process each subprocess
      for (const subprocess of subprocesses) {
        if (subprocess.StatusId === STATUS.PENDING) {
          // Get all tasks for this subprocess
          const tasks = await this.taskService.listByProcessAndSubprocess(this.processId, subprocess.SubprocessId);

          // Reject all pending tasks
          const pendingTasks = tasks.filter(task => task.StatusId === STATUS.PENDING);
          for (const task of pendingTasks) {
            task.StatusId = STATUS.REJECTED;
            task.ExecutionDate = new Date().toISOString();
            await this.taskService.update(task);
          }

          // Check if subprocess has any approved tasks
          const hasApprovedTasks = tasks.some(task => task.StatusId === STATUS.APPROVED);

          // Update subprocess status
          subprocess.StatusId = hasApprovedTasks ? STATUS.APPROVED : STATUS.REJECTED;
          subprocess.EndDate = new Date().toISOString();
          await this.subprocessService.update(subprocess);
        }
      }

      // Update process
      await this.processService.update(process);

      await this.userNotificationService.showToast(
        this.translate.instant(this.isReject ? 'PROCESSES.REJECT.SUCCESS' : 'PROCESSES.APPROVE.SUCCESS'),
        'top'
      );

      this.modalCtrl.dismiss(process);
    } catch (error) {
      await this.userNotificationService.showToast(
        this.translate.instant(this.isReject ? 'PROCESSES.REJECT.ERROR' : 'PROCESSES.APPROVE.ERROR'),
        'middle'
      );
    } finally {
      this.userNotificationService.hideLoading();
    }
  }
}
