import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';

@Component({
  selector: 'app-consumos',
  templateUrl: './consumos.component.html',
  styleUrls: ['./consumos.component.scss'],
})
export class ConsumosComponent  implements OnInit {
  frmConsumo: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController
  ) {

    this.frmConsumo = this.formBuilder.group({
      Insumo: '',
      Cantidad: null,
      Precio: null,
    });
   }

  ngOnInit() {}

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  async confirm() {
    const now = new Date();
    const isoDate = now.toISOString();

    if (!this.frmConsumo.valid) return;

    const data = this.frmConsumo.value;
  }
}
