import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Card } from '@app/interfaces/card';
import { ModalController, NavParams } from '@ionic/angular';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { ActividadesService } from 'src/app/services/actividades.service';
import { Estado } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';

@Component({
  selector: 'app-activity-approve',
  templateUrl: './activity-approve.component.html',
  styleUrls: ['./activity-approve.component.scss'],
})
export class ActivityApproveComponent  implements OnInit {
  @Input() showMileage: boolean = true;
  @Input() showName: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showNotes: boolean = true;
  @Input() showSignPad: boolean = true;
  @Input() approveOrReject: string = 'approve';
  @Input() activity!: Card;
  @ViewChild('canvas', { static: true }) signatureCanvas!: ElementRef;
  frmActividad: FormGroup;
  unidadKilometraje: string = '';
  private canvas: any;
  private ctx: any;
  private drawing: boolean = false;
  private penColor: string = 'black';

  constructor(
    private formBuilder: FormBuilder,
    private renderer: Renderer2,
    private globales: GlobalesService,
    private actividadesService: ActividadesService,
    private modalCtrl:ModalController
  ) {
    this.frmActividad = this.formBuilder.group({
      Identificacion: '',
      Nombre: '',
      Observaciones: [],
      Cargo: '',
      Kilometraje: [null, [Validators.required, Validators.min(1), Validators.pattern("^[0-9]*$")]],
    });
  }

  async ngOnInit() {
    this.unidadKilometraje = this.globales.unidadKilometraje;
    this.showMileage = this.globales.solicitarKilometraje;
  }

  ngAfterViewInit() {}

  getColorEstado(idEstado: string): string {
    return this.globales.getColorEstado(idEstado);
  }

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
    this.ctx.moveTo(event.touches[0].clientX, event.touches[0].clientY - 130);
  }

  draw(event: any) {
    if (!this.drawing) return;
    this.ctx.lineTo(event.touches[0].clientX, event.touches[0].clientY - 130);
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

  async getFormData(): Promise<Actividad | undefined>{
    const data = this.frmActividad.value;
    const actividad = await this.actividadesService.get(this.activity?.id ?? '');

    if (!actividad) return;

    const firma = this.getSignature();
    actividad.IdEstado = Estado.Rechazado;
    actividad.KilometrajeFinal = data.Kilometraje;
    actividad.ResponsableCargo = data.Cargo;
    actividad.ResponsableIdentificacion = data.Identificacion;
    actividad.ResponsableNombre = data.Nombre;
    actividad.ResponsableObservaciones = data.Observaciones;
    actividad.ResponsableFirma = firma;
    return actividad;
  }

  async confirm() {
    await this.globales.showLoading('Enviando información');
    const actividad = await this.getFormData();

    if (!actividad) return;

    actividad.IdEstado = Estado.Aprobado;
    this.actividadesService.update(actividad);
    this.globales.hideLoading();
    this.globales.presentToast('Actividad aprobada', "top");
    this.modalCtrl.dismiss(actividad);
  }

  async reject() {
    await this.globales.showLoading('Enviando información');
    const actividad = await this.getFormData();

    if (!actividad) return;

    actividad.IdEstado = Estado.Rechazado;
    this.actividadesService.update(actividad);
    this.globales.hideLoading();
    this.globales.presentToast('Actividad rechazada', "top");
    this.modalCtrl.dismiss(actividad);
  }
}
