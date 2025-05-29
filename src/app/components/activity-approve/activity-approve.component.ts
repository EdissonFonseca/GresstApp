import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Card } from '@app/interfaces/card.interface';
import { ModalController } from '@ionic/angular';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { STATUS } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateService } from '@ngx-translate/core';

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
  @Input() isReject: boolean = false;
  @Input() activityId: string = '';

  @ViewChild('canvas', { static: false }) signatureCanvas!: ElementRef;

  frmActividad!: FormGroup;
  summary = '';
  mileageUnit = signal<string>('');
  private canvas: any;
  private ctx: any;
  private drawing = signal<boolean>(false);
  private penColor = signal<string>('black');

  activity: Actividad | null = null;

  private isDataLoaded = false;

  protected Utils = Utils;

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private activitiesService: ActivitiesService,
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

    console.log('activityId', this.activityId);
    if (this.activityId) {
      try {
        const actividad = await this.activitiesService.get(this.activityId);
        if (actividad) {
          this.activity = actividad;
          this.frmActividad.patchValue({
            Identificacion: actividad.ResponsableIdentificacion,
            Nombre: actividad.ResponsableNombre,
            Cargo: actividad.ResponsableCargo,
            Kilometraje: actividad.KilometrajeFinal,
            Observaciones: actividad.ResponsableObservaciones
          });

          this.summary = this.activitiesService.getSummary(actividad);
          console.log('Activity loaded:', actividad);
          console.log('Summary:', this.summary);
        }
      } catch (error) {
        console.error('Error loading activity:', error);
        await this.userNotificationService.showToast(
          this.translate.instant('ACTIVITIES.MESSAGES.LOAD_ERROR'),
          'middle'
        );
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
    const actividad = await this.activitiesService.get(this.activityId);
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
        this.translate.instant(this.isReject ? 'ACTIVITIES.REJECT.SENDING' : 'ACTIVITIES.APPROVE.SENDING')
      );

      actividad.IdEstado = this.isReject ? STATUS.REJECTED : STATUS.APPROVED;
      await this.activitiesService.update(actividad);

      await this.userNotificationService.showToast(
        this.translate.instant(this.isReject ? 'ACTIVITIES.REJECT.SUCCESS' : 'ACTIVITIES.APPROVE.SUCCESS'),
        'top'
      );

      this.modalCtrl.dismiss(actividad);
    } catch (error) {
      await this.userNotificationService.showToast(
        this.translate.instant(this.isReject ? 'ACTIVITIES.REJECT.ERROR' : 'ACTIVITIES.APPROVE.ERROR'),
        'middle'
      );
    } finally {
      this.userNotificationService.hideLoading();
    }
  }
}
