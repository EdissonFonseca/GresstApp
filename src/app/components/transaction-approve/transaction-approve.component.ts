import { Component, ElementRef, Input, OnInit, Renderer2, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-transaction-approve',
  templateUrl: './transaction-approve.component.html',
  styleUrls: ['./transaction-approve.component.scss'],
})
export class TransactionApproveComponent  implements OnInit {
  @Input() title: string='';
  @Input() showName: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showNotes: boolean = true;
  @Input() showSignPad: boolean = true;
  @Input() notesText: string = 'Al aprobar la operacion, todos los pendientes quedan descartados';
  @ViewChild('canvas', { static: true }) signatureCanvas!: ElementRef;
  private canvas: any;
  private ctx: any;
  private drawing: boolean = false;
  private penColor: string = 'black';

  constructor(
    private renderer: Renderer2,
    private modalCtrl:ModalController
  ) { }

  ngOnInit() {}

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

  confirm() {
    const signatureData = this.canvas.toDataURL();
    this.modalCtrl.dismiss('data');
  }
}
