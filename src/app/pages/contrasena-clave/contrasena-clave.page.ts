import { Component, OnInit } from '@angular/core';
import {  NavController } from '@ionic/angular';
import { AuthorizationService } from 'src/app/services/authorization.service';
import { Globales } from 'src/app/services/globales.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-contrasena-clave',
  templateUrl: './contrasena-clave.page.html',
  styleUrls: ['./contrasena-clave.page.scss'],
})
export class ContrasenaClavePage implements OnInit {
  newPassword = '';
  confirmPassword = '';

  constructor(
    private authorizationService: AuthorizationService,
    private navCtrl: NavController,
    private storage: StorageService,
    private globales: Globales,
) { }

  ngOnInit() {
  }

  goLogin() {
    this.navCtrl.navigateRoot('/login');
  }

  async create(){
    if (this.newPassword == '' || this.confirmPassword == ''){
      this.globales.presentToast('Debe digitar usuario y contrasena', 'middle');
      return;
    }

    try {
      this.globales.showLoading('Conectando ...');
      const email = await this.storage.get('Email');

      await this.authorizationService.changePassword(email, this.newPassword);
      this.globales.hideLoading();
      await this.globales.presentAlert('Contraseña cambiada','', 'Su clave ha sido cambiada con éxito');
      this.navCtrl.navigateRoot('/login');
    } catch (error) {
      this.globales.hideLoading();
      if (error instanceof Error){
        this.globales.presentToast(error.message,'middle');
        throw new Error(`Request error: ${error.message}`);
      }
      else{
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }
}
