import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Title } from '@angular/platform-browser';
import { Card } from '@app/interfaces/card';
import { ModalController, NavParams } from '@ionic/angular';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { Estado } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';

@Component({
  selector: 'app-transaction-approve',
  templateUrl: './transaction-approve.component.html',
  styleUrls: ['./transaction-approve.component.scss'],
})
export class TransactionApproveComponent  implements OnInit {
  @Input() showMileage: boolean = true;
  @Input() showName: boolean = true;
  @Input() showNotes: boolean = true;
  @Input() showPosition: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showSignPad: boolean = true;
  @Input() approveOrReject: string = 'approve';
  @Input() transaction: Card = { id:'', title:'', status:'', type:''};
  @ViewChild('canvas', { static: true }) signatureCanvas!: ElementRef;
  frmTransaccion: FormGroup;
  unidadKilometraje: string = '';
  private canvas: any;
  private ctx: any;
  private drawing: boolean = false;
  private penColor: string = 'black';

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private globales: GlobalesService,
    private modalCtrl:ModalController,
    private transaccionesService: TransaccionesService
  ) {
    this.frmTransaccion = this.formBuilder.group({
      Identificacion: '',
      Nombre: '',
      Cargo: '',
      Kilometraje: [null, [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      Observaciones: [],
    });
  }

  async ngOnInit() {
    this.unidadKilometraje = this.globales.unidadKilometraje;
    this.showMileage = this.globales.solicitarKilometraje;
  }

  ngAfterViewInit() {}

  ionViewDidEnter() {
    this.canvas = this.signatureCanvas.nativeElement;
    this.ctx = this.canvas.getContext('2d');
    this.renderer.setProperty(this.canvas, 'width', window.innerWidth);
    this.renderer.setProperty(this.canvas, 'height', 200);
    this.ctx.strokeStyle = this.penColor;
  }

  startDrawing(event: any) {
    this.drawing = true;
    this.ctx.beginPath();
    this.ctx.moveTo(event.touches[0].clientX, event.touches[0].clientY - 150);
  }

  draw(event: any) {
    if (!this.drawing) return;
    this.ctx.lineTo(event.touches[0].clientX, event.touches[0].clientY - 150);
    this.ctx.stroke();
  }

  endDrawing() {
    this.drawing = false;
  }

  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  getSignature(): string | null {
    const context = this.canvas.getContext('2d');
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight).data;
    const hasContent = Array.from(imageData).some(channel => channel !== 0);

    if (!hasContent) {
        return null;
    }

    const signatureData = this.canvas.toDataURL();
    return signatureData;
  }

  async getFormData(): Promise<Transaccion | undefined>{
    let transaccion: Transaccion | undefined;

    const data = this.frmTransaccion.value;
    transaccion = await this.transaccionesService.get(this.transaction?.parentId ?? '', this.transaction?.id ?? '');
    if (transaccion) { //Si hay transaccion
      const firma = this.getSignature();

      transaccion.Kilometraje = data.Kilometraje;
      transaccion.ResponsableCargo = data.Cargo;
      transaccion.ResponsableFirma = firma;
      transaccion.ResponsableIdentificacion = data.Identificacion;
      transaccion.ResponsableNombre = data.Nombre;
      transaccion.ResponsableObservaciones  = data.Observaciones;
    }
    return transaccion;
   }

  async confirm() {
    var transaccion = await this.getFormData();
    if (!transaccion) return;

    await this.globales.showLoading('Enviando información');
    transaccion.IdEstado = Estado.Aprobado;
    await this.transaccionesService.update(transaccion);
    this.globales.hideLoading();
    this.globales.presentToast('Transaccion aprobada', "top");
    this.modalCtrl.dismiss(transaccion);
  }

  async reject() {
    var transaccion = await this.getFormData();
    if (!transaccion) return;

    await this.globales.showLoading('Enviando información');
    transaccion.IdEstado = Estado.Rechazado;
    await this.transaccionesService.update(transaccion);
    this.globales.hideLoading();
    this.globales.presentToast('Transaccion rechazada', "top");
    this.modalCtrl.dismiss(transaccion);
  }
}
