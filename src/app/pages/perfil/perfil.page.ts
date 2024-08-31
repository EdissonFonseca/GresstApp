import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Cuenta } from 'src/app/interfaces/cuenta.interface';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Globales } from 'src/app/services/globales.service';
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
    private globales: Globales,
    private authenticationService: AuthenticationService,
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

  async changeName() {
    const userName = await this.storage.get('Login');

    const formValues = this.formData.value;
    try{
      await this.authenticationService.changeName(userName, formValues.Nombre);
      if (this.cuenta) {
        this.cuenta.NombreUsuario = formValues.Nombre;
        await this.storage.set('Cuenta', this.cuenta);
      }
      await this.globales.presentAlert('Nombre cambiado','', 'Su nombre ha sido cambiada con éxito');
    } catch (error) {
      await this.globales.presentAlert('Error','', 'Ocurrió un error cambiando su nombre');
    }
    this.showPassword = false;
  }

  async changePassword() {
    const userName = await this.storage.get('Login');
    const currentPassword = await this.storage.get('Password');

    if (this.formData.valid) {
      const formValues = this.formData.value;
      if (formValues.ClaveNueva != formValues.ClaveConfirmar){
        this.globales.presentAlert('Error','Error','La clave nueva y la confirmacion no corresponden');
      } else if (formValues.ClaveActual != currentPassword) {
        this.globales.presentAlert('Error','Error','La clave actual no corresponde');
      } else {
        try{
          await this.authenticationService.changePassword(userName, formValues.ClaveNueva);
          await this.storage.set('Password', formValues.ClaveNueva);
          await this.globales.presentAlert('Contraseña cambiada','', 'Su clave ha sido cambiada con éxito');
         } catch (error) {
          await this.globales.presentAlert('Error','', 'Ocurrió un error cambiando su contraseña');
         }
         this.showPassword = false;
       }
    } else {
      console.log('Formulario no válido');
    }
  }
}
