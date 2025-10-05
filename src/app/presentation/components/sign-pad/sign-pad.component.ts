import { Component, OnInit, ElementRef, ViewChild, AfterViewInit, Injectable, Renderer2, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Injectable({
  providedIn: 'root',
})
@Component({
  selector: 'app-sign-pad',
  templateUrl: './sign-pad.component.html',
  styleUrls: ['./sign-pad.component.scss'],
})
export class SignPadComponent implements OnInit, AfterViewInit {
  @Input() showName: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showNotes: boolean = true;
  @ViewChild('canvas', { static: true }) signatureCanvas!: ElementRef;
  private canvas: any;
  private ctx: any;
  private drawing: boolean = false;
  private penColor: string = 'black';

  constructor(
    private renderer: Renderer2,
    private modalCtrl:ModalController
  ) {}

  ngOnInit() {

  }
  ngAfterViewInit() {

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
    this.ctx.moveTo(event.touches[0].clientX, event.touches[0].clientY);
  }
  draw(event: any) {
    if (!this.drawing) return;
    this.ctx.lineTo(event.touches[0].clientX, event.touches[0].clientY);
    this.ctx.stroke();
  }
  endDrawing() {
    this.drawing = false;
  }
  clear() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
  }
  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
  confirm() {
    const signatureData = this.canvas.toDataURL();
  }
}
