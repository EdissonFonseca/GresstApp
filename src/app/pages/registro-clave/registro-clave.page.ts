import { Component, OnInit } from '@angular/core';
import { AlertController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Globales } from 'src/app/services/globales.service';
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
      const name = await this.storage.get('Name');

      await this.authService.register(email, name, this.newPassword);
      this.globales.hideLoading();
      await this.presentAlert('Usuario registrado','', 'Usuario registrado con exito');
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
