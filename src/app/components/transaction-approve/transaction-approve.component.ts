import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { ActividadesService } from 'src/app/services/actividades.service';
import { CRUDOperacion, Estado } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';

@Component({
  selector: 'app-transaction-approve',
  templateUrl: './transaction-approve.component.html',
  styleUrls: ['./transaction-approve.component.scss'],
})
export class TransactionApproveComponent  implements OnInit {
  @Input() title: string='Aprobar transacción';
  @Input() showName: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showNotes: boolean = true;
  @Input() showSignPad: boolean = true;
  @ViewChild('canvas', { static: true }) signatureCanvas!: ElementRef;
  frmTransaccion: FormGroup;
  idActividad: string = '';
  idTransaccion: string = '';
  private canvas: any;
  private ctx: any;
  private drawing: boolean = false;
  private penColor: string = 'black';

  constructor(
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private renderer: Renderer2,
    private globales: Globales,
    private modalCtrl:ModalController,
    private actividadesService: ActividadesService,
    private transaccionesService: TransaccionesService
  ) {
    this.idActividad = this.navParams.get("ActivityId");
    this.idTransaccion = this.navParams.get("TransactionId");
    this.title = this.navParams.get("Title");
    this.frmTransaccion = this.formBuilder.group({
      Identificacion: '',
      Nombre: '',
      Observaciones: [],
    });
  }

  ngOnInit() {
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
    this.ctx.moveTo(event.touches[0].clientX, event.touches[0].clientY - 100);
  }

  draw(event: any) {
    if (!this.drawing) return;
    this.ctx.lineTo(event.touches[0].clientX, event.touches[0].clientY - 100);
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

  async confirm() {
    const now = new Date();
    const isoDate = now.toISOString();

    if (!this.frmTransaccion.valid) return;

    let transaccion: Transaccion | undefined;
    const data = this.frmTransaccion.value;
    const actividad = await this.actividadesService.get(this.idActividad);

    if (!actividad) return;

    transaccion = await this.transaccionesService.get(this.idActividad, this.idTransaccion);
    if (transaccion) { //Si hay transaccion
      const firmaBlob = this.getSignature();

      transaccion.IdEstado = Estado.Aprobado;
      transaccion.CRUD = CRUDOperacion.Update;
      transaccion.CRUDDate = now;
      transaccion.IdentificacionResponsable = data.Identificacion;
      transaccion.NombreResponsable = data.Nombre;
      transaccion.Observaciones = data.Observaciones;
      transaccion.Firma = firmaBlob;
      transaccion.FirmaUrl = firmaBlob != null ?  "firma.png": null;
      this.transaccionesService.update(this.idActividad, transaccion);
    }
    this.clear();
    this.globales.presentToast('Transaccion aprobada', "top");
    this.modalCtrl.dismiss(transaccion);
  }

  getSignature(): Blob | null{
    const context = this.canvas.getContext('2d');
    const canvasWidth = this.canvas.width;
    const canvasHeight = this.canvas.height;

    const imageData = context.getImageData(0, 0, canvasWidth, canvasHeight).data;
    const hasContent = Array.from(imageData).some(channel => channel !== 0);

    if (!hasContent) {
        return null;
    }

    const signatureData = this.canvas.toDataURL();
    const signature = signatureData.replace('data:image/png;base64,', '');
    const byteString = atob(signature);
    const arrayBuffer = new ArrayBuffer(byteString.length);
    const uint8Array = new Uint8Array(arrayBuffer);
    for (let i = 0; i < byteString.length; i++) {
        uint8Array[i] = byteString.charCodeAt(i);
    }
    const blob = new Blob([uint8Array], { type: 'image/png' });
    return blob;
  }
}
