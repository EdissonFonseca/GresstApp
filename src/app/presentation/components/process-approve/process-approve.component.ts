import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Proceso } from '@app/domain/entities/proceso.entity';
import { ProcessesService } from '@app/infrastructure/repositories/transactions/processes.repository';
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

  process: Proceso | null = null;

  private isDataLoaded = false;

  protected Utils = Utils;

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private processesService: ProcessesService,
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

    console.log('processId', this.processId);
    if (this.processId) {
      try {
        const proceso = await this.processesService.get(this.processId);
        if (proceso) {
          this.process = proceso;
          this.frmActividad.patchValue({
            Identificacion: proceso.ResponsableIdentificacion,
            Nombre: proceso.ResponsableNombre,
            Cargo: proceso.ResponsableCargo,
            Kilometraje: proceso.KilometrajeFinal,
            Observaciones: proceso.ResponsableObservaciones
          });

          this.summary = this.processesService.getSummary(proceso);
          console.log('Process loaded:', proceso);
          console.log('Summary:', this.summary);
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

  async getFormData(): Promise<Proceso | undefined> {
    const proceso = await this.processesService.get(this.processId);
    if (!proceso) return undefined;

    const formData = this.frmActividad.value;
    return {
      ...proceso,
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
        this.translate.instant(this.isReject ? 'PROCESSES.REJECT.SENDING' : 'PROCESSES.APPROVE.SENDING')
      );

      actividad.IdEstado = this.isReject ? STATUS.REJECTED : STATUS.APPROVED;
      await this.processesService.update(actividad);

      await this.userNotificationService.showToast(
        this.translate.instant(this.isReject ? 'PROCESSES.REJECT.SUCCESS' : 'PROCESSES.APPROVE.SUCCESS'),
        'top'
      );

      this.modalCtrl.dismiss(actividad);
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
