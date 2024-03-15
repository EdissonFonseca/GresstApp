import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-registro-cuenta',
  templateUrl: './registro-cuenta.page.html',
  styleUrls: ['./registro-cuenta.page.scss'],
})
export class RegistroCuentaPage implements OnInit {
  formData: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private storage: StorageService
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
      Correo: [],
      Identificacion: ['', Validators.required],
      Cuenta: [],
      Clave: [],
      ClaveConfirmar: [],
    });
  }

  async ngOnInit() {
    const correo = await this.storage.get('Login');

    this.formData.patchValue({
      Correo: correo
    });
  }

  async updateNombreCuenta(event: any) {
    const nombre = event.target.value;

    const cuenta = this.formData.get('Cuenta')?.value;

    if (!cuenta || nombre.startsWith(cuenta)){
      this.formData.patchValue({
        Cuenta: nombre,
      });
    }
  }
}
