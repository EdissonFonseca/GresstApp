import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Globales } from 'src/app/services/globales.service';
import { MailService } from 'src/app/services/mail.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-contrasena-correo',
  templateUrl: './contrasena-correo.page.html',
  styleUrls: ['./contrasena-correo.page.scss'],
})
export class ContrasenaCorreoPage implements OnInit {
  email = '';
  verificationCode = '';

  constructor(
    private authService: AuthService,
    private menuCtrl: MenuController,
    private globales: Globales,
    private mailService: MailService,
    private storage: StorageService,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    this.menuCtrl.enable(false);
  }

  async verify(){
    try {
      this.globales.showLoading('Conectando ...');

      const exist = await this.authService.existUser(this.email);
      if (exist)
      {
        this.verificationCode = await this.mailService.sendWithToken(this.email, 'Gresst - Cambio de contraseña', 'Para continuar, digite el siguiente código: {Token}, en la app');
        if (this.verificationCode)
        {
          await this.storage.set('Email', this.email);
          await this.storage.set('Code', this.verificationCode);
          this.navCtrl.navigateRoot('/contrasena-codigo');
        }
      } else {
        this.globales.presentToast('Este correo no se encuentra registrado','middle');
      }
      this.globales.hideLoading();
    } catch (error) {
      this.globales.hideLoading();
      if (error instanceof Error){
        this.globales.presentToast(error.message,'middle');
        throw new Error(`Request error: ${error.message}`);
      }
      else{
        //this.globales.presentToast(error,'middle');
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }
}
