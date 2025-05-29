import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { STATUS } from '@app/constants/constants';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { Utils } from '@app/utils/utils';
import { UserNotificationService } from '@app/services/core/user-notification.service';
import { TranslateService } from '@ngx-translate/core';

/**
 * TransactionApproveComponent
 *
 * Handles the approval or rejection of transactions with the following features:
 * - Form for collecting responsible person information
 * - Signature pad for digital signatures
 * - Mileage tracking (optional)
 * - Notes and observations
 * - Validation of required fields
 * - Support for both approval and rejection workflows
 */
@Component({
  selector: 'app-transaction-approve',
  templateUrl: './transaction-approve.component.html',
  styleUrls: ['./transaction-approve.component.scss']
})
export class TransactionApproveComponent implements OnInit {
  /** Controls visibility of mileage input field */
  @Input() showMileage: boolean = true;
  /** Controls visibility of name-related fields */
  @Input() showName: boolean = true;
  /** Controls visibility of notes field */
  @Input() showNotes: boolean = true;
  /** Controls visibility of position field */
  @Input() showPosition: boolean = true;
  /** Controls visibility of PIN field */
  @Input() showPin: boolean = true;
  /** Controls visibility of signature pad */
  @Input() showSignPad: boolean = true;
  /** Determines if component is in reject mode */
  @Input() isReject: boolean = false;
  /** Transaction data to be approved/rejected */
  @Input() transactionId: string = '';
  @Input() activityId: string = '';

  /** Reference to the signature canvas element */
  @ViewChild('canvas', { static: false }) signatureCanvas!: ElementRef;

  /** Form group for transaction approval/rejection data */
  frmTransaction!: FormGroup;
  /** Signal containing the mileage unit (km/mi) */
  mileageUnit = 'km';
  /** Canvas element for signature */
  private canvas: any;
  /** Canvas 2D context for drawing */
  private ctx: any;
  /** Signal tracking if user is currently drawing */
  private drawing = false;
  /** Signal containing the pen color for signature */
  private penColor = 'black';

  /** Signal containing the transaction details */
  transaction = signal<Transaccion | null>(null);

  /** Flag to track if data has been loaded */
  private isDataLoaded = false;

  /** Utils instance for template access */
  protected Utils = Utils;

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private modalCtrl: ModalController,
    private transactionsService: TransactionsService,
    private userNotificationService: UserNotificationService,
    private translate: TranslateService
  ) {}

  /**
   * Initialize component
   * Sets up mileage unit and loads transaction data if available
   */
  async ngOnInit() {
    if (this.isDataLoaded) return;

    this.mileageUnit = Utils.mileageUnit;
    this.showMileage = Utils.requestMileage;

    console.log('transactionId', this.transactionId);
    // Initialize form without required validators
    this.frmTransaction = this.formBuilder.group({
      Identificacion: [''],
      Nombre: [''],
      Cargo: [''],
      Kilometraje: [null, [Validators.min(1), Validators.pattern("^[0-9]*$")]],
      Observaciones: [''],
      Firma: [null]
    });

    // Load transaction data if available
    if (this.transactionId) {
      const transaccion = await this.transactionsService.get(this.activityId, this.transactionId);
      if (transaccion) {
        console.log('transaccion', transaccion);
        this.transaction.set(transaccion);
        this.frmTransaction.patchValue({
          Identificacion: transaccion.ResponsableIdentificacion,
          Nombre: transaccion.ResponsableNombre,
          Cargo: transaccion.ResponsableCargo,
          Kilometraje: transaccion.Kilometraje,
          Observaciones: transaccion.ResponsableObservaciones
        });
      }
    }

    this.isDataLoaded = true;
  }

  /**
   * Initialize canvas when view enters
   * Sets up canvas dimensions and drawing context
   */
  ionViewDidEnter() {
    if (this.signatureCanvas?.nativeElement) {
      this.canvas = this.signatureCanvas.nativeElement;
      this.ctx = this.canvas.getContext('2d');
      this.renderer.setProperty(this.canvas, 'width', window.innerWidth);
      this.renderer.setProperty(this.canvas, 'height', 200);
      this.ctx.strokeStyle = this.penColor;
      this.ctx.lineWidth = 2;
      this.ctx.lineCap = 'round';
      this.ctx.lineJoin = 'round';
    }
  }

  /**
   * Start drawing on signature pad
   * @param event Touch event containing coordinates
   */
  startDrawing(event: any) {
    if (!this.ctx) return;
    event.preventDefault();
    const touch = event.touches[0];
    const rect = this.canvas.getBoundingClientRect();
    const scaleX = this.canvas.width / rect.width;
    const scaleY = this.canvas.height / rect.height;
    const x = (touch.clientX - rect.left) * scaleX;
    const y = (touch.clientY - rect.top) * scaleY;

    this.drawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(x, y);
  }

  /**
   * Draw on signature pad
   * @param event Touch event containing coordinates
   */
  draw(event: any) {
    if (!this.ctx || !this.drawing) return;
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

  /**
   * End drawing on signature pad
   * Updates form with signature data
   */
  endDrawing() {
    if (!this.ctx) return;
    this.drawing = false;
    this.updateSignatureField();
  }

  /**
   * Clear signature pad and form field
   */
  clear() {
    if (!this.ctx) return;
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.frmTransaction.patchValue({ Firma: null });
  }

  /**
   * Update form with current signature data
   */
  private updateSignatureField() {
    const signatureData = this.getSignature();
    this.frmTransaction.patchValue({ Firma: signatureData });
  }

  /**
   * Cancel and close modal
   */
  cancel() {
    this.modalCtrl.dismiss(null);
  }

  /**
   * Get signature data from canvas
   * @returns Base64 string of signature or null if empty
   */
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

  /**
   * Get form data and prepare transaction for update
   * @returns Promise with transaction data or undefined if invalid
   */
  async getFormData(): Promise<Transaccion | undefined> {
    if (this.frmTransaction.invalid) {
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.MESSAGES.FORM_ERROR'),
        'middle'
      );
      return undefined;
    }

    const transaccion = await this.transactionsService.get(this.activityId, this.transactionId);

    if (!transaccion) return undefined;

    const formData = this.frmTransaction.value;
    return {
      ...transaccion,
      Kilometraje: formData.Kilometraje,
      ResponsableCargo: formData.Cargo,
      ResponsableFirma: formData.Firma,
      ResponsableIdentificacion: formData.Identificacion,
      ResponsableNombre: formData.Nombre,
      ResponsableObservaciones: formData.Observaciones
    };
  }

  /**
   * Handle form submission based on mode
   * Updates transaction status and saves changes
   */
  async submit() {
    const transaccion = await this.getFormData();
    if (!transaccion) return;

    try {
      await this.userNotificationService.showLoading(
        this.translate.instant('TRANSACTIONS.APPROVE.SENDING')
      );

      transaccion.IdEstado = this.isReject ? STATUS.REJECTED : STATUS.APPROVED;
      await this.transactionsService.update(transaccion);
      await this.userNotificationService.showToast(
        this.translate.instant(this.isReject ? 'TRANSACTIONS.REJECT.SUCCESS' : 'TRANSACTIONS.APPROVE.SUCCESS'),
        'top'
      );
      this.modalCtrl.dismiss(transaccion);
    } catch (error) {
      await this.userNotificationService.showToast(
        this.translate.instant('TRANSACTIONS.APPROVE.ERROR'),
        'middle'
      );
    } finally {
      this.userNotificationService.hideLoading();
    }
  }
}
