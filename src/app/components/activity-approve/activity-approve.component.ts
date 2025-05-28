import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Card } from '@app/interfaces/card.interface';
import { ModalController } from '@ionic/angular';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { STATUS } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateService } from '@ngx-translate/core';
import { TasksService } from '@app/services/transactions/tasks.service';

interface TaskSummary {
  total: number;
  pending: number;
  completed: number;
  approved: number;
  rejected: number;
  quantity: number;
  weight: number;
  volume: number;
}

@Component({
  selector: 'app-activity-approve',
  templateUrl: './activity-approve.component.html',
  styleUrls: ['./activity-approve.component.scss']
})
export class ActivityApproveComponent implements OnInit {
  @Input() showMileage: boolean = true;
  @Input() showName: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showNotes: boolean = true;
  @Input() showSignPad: boolean = true;
  @Input() approveOrReject: string = 'approve';
  @Input() activity: Card = { id: '', title: '', status: '', type: '' };

  @ViewChild('canvas', { static: false }) signatureCanvas!: ElementRef;

  frmActividad!: FormGroup;
  mileageUnit = signal<string>('');
  private canvas: any;
  private ctx: any;
  private drawing = signal<boolean>(false);
  private penColor = signal<string>('black');

  activityDetails = signal<Actividad | null>(null);
  taskSummary = signal<TaskSummary | null>(null);

  private isDataLoaded = false;

  protected Utils = Utils;

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private activitiesService: ActivitiesService,
    private userNotificationService: UserNotificationService,
    private modalCtrl: ModalController,
    private translate: TranslateService,
    private tasksService: TasksService
  ) {}

  async ngOnInit() {
    if (this.isDataLoaded) return;

    this.mileageUnit.set(Utils.mileageUnit);
    this.showMileage = Utils.requestMileage;

    this.frmActividad = this.formBuilder.group({
      Identificacion: [''],
      Nombre: [''],
      Cargo: [''],
      Kilometraje: [null, [Validators.min(1), Validators.pattern("^[0-9]*$")]],
      Observaciones: [''],
      Firma: [null]
    });

    if (this.activity?.id) {
      const actividad = await this.activitiesService.get(this.activity.id);
      if (actividad) {
        this.activityDetails.set(actividad);
        this.frmActividad.patchValue({
          Identificacion: actividad.ResponsableIdentificacion,
          Nombre: actividad.ResponsableNombre,
          Cargo: actividad.ResponsableCargo,
          Kilometraje: actividad.KilometrajeFinal,
          Observaciones: actividad.ResponsableObservaciones
        });

        const summary = await this.tasksService.getSummary(actividad.IdActividad);
        this.taskSummary.set(summary);
      }
    }

    this.isDataLoaded = true;
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

  async getFormData(): Promise<Actividad | undefined> {
    if (this.frmActividad.invalid) {
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.MESSAGES.FORM_ERROR'),
        'middle'
      );
      return undefined;
    }

    const actividad = await this.activitiesService.get(this.activity?.id ?? '');
    if (!actividad) return undefined;

    const formData = this.frmActividad.value;
    return {
      ...actividad,
      KilometrajeFinal: formData.Kilometraje,
      ResponsableCargo: formData.Cargo,
      ResponsableFirma: formData.Firma,
      ResponsableIdentificacion: formData.Identificacion,
      ResponsableNombre: formData.Nombre,
      ResponsableObservaciones: formData.Observaciones
    };
  }

  async submit() {
    const actividad = await this.getFormData();
    if (!actividad) return;

    try {
      await this.userNotificationService.showLoading(
        this.translate.instant('ACTIVITIES.APPROVE.SENDING')
      );

      actividad.IdEstado = this.approveOrReject === 'reject' ? STATUS.REJECTED : STATUS.APPROVED;
      await this.activitiesService.update(actividad);

      await this.userNotificationService.showToast(
        this.translate.instant(this.approveOrReject === 'reject' ? 'ACTIVITIES.REJECT.SUCCESS' : 'ACTIVITIES.APPROVE.SUCCESS'),
        'top'
      );

      this.modalCtrl.dismiss(actividad);
    } catch (error) {
      await this.userNotificationService.showToast(
        this.translate.instant('ACTIVITIES.APPROVE.ERROR'),
        'middle'
      );
    } finally {
      this.userNotificationService.hideLoading();
    }
  }
}
