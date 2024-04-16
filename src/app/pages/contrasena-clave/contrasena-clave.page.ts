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
      this.globales.presentToast('Debe digitar usuario y contrasena', 'middle');
      return;
    }

    try {
      this.globales.showLoading('Conectando ...');
      const email = await this.storage.get('Email');

      await this.authService.changeEmail(email, this.newPassword);
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
