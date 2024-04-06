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

      this.verificationCode = await this.mailService.sendWithToken(this.email, 'Gresst - Cambio de contraseña', 'Para continuar, digite el siguiente código: {Token}, en la app');
      this.globales.hideLoading();
      if (this.verificationCode)
      {
        await this.storage.set('Email', this.email);
        await this.storage.set('Code', this.verificationCode);
        this.navCtrl.navigateRoot('/registro-codigo');
      }
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
