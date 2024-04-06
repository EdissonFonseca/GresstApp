import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
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
    private authService: AuthService,
    private navCtrl: NavController,
    private storage: StorageService,
    private globales: Globales,
    private alertController: AlertController
) { }

  ngOnInit() {
  }

  async create(){
    if (this.newPassword == '' || this.confirmPassword == ''){
      this.presentAlert('Error', '', 'Debe digitar usuario y contrasena');
      return;
    }

    try {
      this.globales.showLoading('Conectando ...');
      const email = await this.storage.get('Email');

      await this.authService.changeEmail(email, this.newPassword);
      this.globales.hideLoading();
      await this.presentAlert('Contraseña cambiada','', 'Su clave ha sido cambiada con éxito');
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

  async presentAlert(header: string, subHeader: string, message: string) {
    const alert = await this.alertController.create({
      header: header,
      subHeader: subHeader,
      message: message,
      buttons: ['OK'],
    });

    await alert.present();
  }
}
