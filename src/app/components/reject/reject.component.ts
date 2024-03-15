import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-reject',
  templateUrl: './reject.component.html',
  styleUrls: ['./reject.component.scss'],
})
export class RejectComponent  implements OnInit {
  @Input() title: string = 'Rechazar';
  @Input() notesText: string = 'Al rechazar la operacion, todos los pendientes quedan descartados';

  constructor(
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }
  reject() {
    this.modalCtrl.dismiss('', 'reject');
  }

}
