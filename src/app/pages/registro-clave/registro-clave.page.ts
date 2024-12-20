import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-registro-clave',
  templateUrl: './registro-clave.page.html',
  styleUrls: ['./registro-clave.page.scss'],
})
export class RegistroClavePage implements OnInit {
  newPassword = '';
  confirmPassword = '';

  constructor(
    private authenticationService: AuthenticationService,
    private navCtrl: NavController,
    private storage: StorageService,
    private globales: GlobalesService
) { }

  ngOnInit() {
  }

  async create(){
    if (this.newPassword == '' || this.confirmPassword == ''){
      this.globales.presentAlert('Error', '', 'Debe digitar usuario y contrasena');
      return;
    }

    try {
      this.globales.showLoading('Conectando ...');
      const email = await this.storage.get('Email');
      const name = await this.storage.get('Name');

      await this.authenticationService.register(email, name, this.newPassword);
      this.globales.hideLoading();
      await this.globales.presentAlert('Usuario registrado','', 'Usuario registrado con exito');
      this.navCtrl.navigateRoot('/login');
    } catch (error) {
      this.globales.hideLoading();
      if (error instanceof Error){
        throw new Error(`Request error: ${error.message}`);
      }
      else{
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

}
