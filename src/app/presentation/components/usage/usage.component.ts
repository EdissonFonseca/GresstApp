import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Utils } from '@app/utils/utils';

@Component({
  selector: 'app-usage',
  templateUrl: './usage.component.html',
  styleUrls: ['./usage.component.scss'],
})
export class UsageComponent implements OnInit {
  frmConsumo: FormGroup;
  actividad: any;
  title: string = '';

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

  getStateColor(idEstado: string): string {
    return Utils.getStateColor(idEstado);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  async confirm() {
    const now = new Date();
    const isoDate = now.toISOString();

    if (!this.frmConsumo.valid) return;

    const data = this.frmConsumo.value;
    this.modalCtrl.dismiss(data);
  }
}
