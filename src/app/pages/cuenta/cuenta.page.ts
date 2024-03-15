import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cuenta } from 'src/app/interfaces/cuenta.interface';

@Component({
  selector: 'app-cuenta',
  templateUrl: './cuenta.page.html',
  styleUrls: ['./cuenta.page.scss'],
})
export class CuentaPage implements OnInit {
  formData: FormGroup;
  cuenta: Cuenta | undefined;

  constructor(
    private navCtrl: NavController,
    private formBuilder: FormBuilder,
    private storage: Storage
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
      Identificacion: ['', Validators.required],
      Cubrimiento: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.cuenta = await this.storage.get('Cuenta');

    this.formData.patchValue({
      Nombre: this.cuenta?.Nombre,
      Identificacion: this.cuenta?.Identificacion
    });
  }

}
