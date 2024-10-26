import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { ActividadesService } from 'src/app/services/actividades.service';
import { Estado } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { PuntosService } from 'src/app/services/puntos.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';

@Component({
  selector: 'app-transaction-approve',
  templateUrl: './transaction-approve.component.html',
  styleUrls: ['./transaction-approve.component.scss'],
})
export class TransactionApproveComponent  implements OnInit {
  @Input() showFuel: boolean = true;
  @Input() showMileage: boolean = true;
  @Input() showName: boolean = true;
  @Input() showNotes: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showCost: boolean = false;
  @Input() showPosition: boolean = true;
  @Input() showSignPad: boolean = true;
  @ViewChild('canvas', { static: true }) signatureCanvas!: ElementRef;
  frmTransaccion: FormGroup;
  idActividad: string = '';
  idTransaccion: string = '';
  unidadKilometraje: string = '';
  unidadCombustible: string = '';
  moneda: string = '';
  transaccion: Transaccion | undefined;
  title: string = '';
  itemsAprobados: number = 0;
  itemsPendientes: number = 0;
  itemsRechazados: number = 0;
  resumen: string = '';
  private canvas: any;
  private ctx: any;
  private drawing: boolean = false;
  private penColor: string = 'black';

  constructor(
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private renderer: Renderer2,
    private globales: GlobalesService,
    private modalCtrl:ModalController,
    private puntosService: PuntosService,
    private tercerosService: TercerosService,
    private actividadesService: ActividadesService,
    private transaccionesService: TransaccionesService
  ) {
    this.idActividad = this.navParams.get("ActivityId");
    this.idTransaccion = this.navParams.get("TransactionId");
    this.frmTransaccion = this.formBuilder.group({
      Identificacion: '',
      Nombre: '',
      Cargo: '',
      Kilometraje: [null, [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
      Observaciones: [],
    });
  }

  async ngOnInit() {
    this.unidadCombustible = this.globales.unidadCombustible;
    this.unidadKilometraje = this.globales.unidadKilometraje;
    this.moneda = this.globales.moneda;
    this.showMileage = this.globales.solicitarKilometraje;
    this.transaccion = await this.transaccionesService.get(this.idActividad, this.idTransaccion);

    if (this.transaccion && this.transaccion.IdTercero && this.transaccion.IdDeposito)
    {
      const tercero = await this.tercerosService.get(this.transaccion.IdTercero);
      if (tercero)
        this.title = tercero.Nombre;

      const punto = await this.puntosService.get(this.transaccion.IdDeposito);
      if (punto)
        this.title +=  ` - ${punto.Nombre}`;
    }
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

  async confirm() {
    let transaccion: Transaccion | undefined;
    const data = this.frmTransaccion.value;
    const actividad = await this.actividadesService.get(this.idActividad);

    if (!actividad) return;

    await this.globales.showLoading('Enviando información');
    transaccion = await this.transaccionesService.get(this.idActividad, this.idTransaccion);
    if (transaccion) { //Si hay transaccion
      const firma = this.getSignature();

      transaccion.IdEstado = Estado.Aprobado;
      transaccion.Kilometraje = data.Kilometraje;
      transaccion.ResponsableCargo = data.Cargo;
      transaccion.ResponsableFirma = firma;
      transaccion.ResponsableIdentificacion = data.Identificacion;
      transaccion.ResponsableNombre = data.Nombre;
      transaccion.ResponsableObservaciones  = data.Observaciones;
      await this.transaccionesService.update(transaccion);
    }
    this.globales.hideLoading();
    this.globales.presentToast('Transaccion aprobada', "top");
    this.modalCtrl.dismiss(transaccion);
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

}
