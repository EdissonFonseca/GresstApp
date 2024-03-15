import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cuenta } from 'src/app/interfaces/cuenta.interface';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {
  formData: FormGroup;
  cuenta: Cuenta | undefined = undefined;
  showPassword: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private storage: StorageService
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
      Correo: [],
      ClaveActual: ['', Validators.required],
      ClaveNueva: ['', Validators.required],
      ClaveConfirmar: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.cuenta = await this.storage.get('Cuenta');

    this.formData.patchValue({
      Nombre: this.cuenta?.NombreUsuario,
      Correo: this.cuenta?.CorreoUsuario
    });
  }

  toggleShowPassword(){
    this.showPassword = !this.showPassword;
  }
}
