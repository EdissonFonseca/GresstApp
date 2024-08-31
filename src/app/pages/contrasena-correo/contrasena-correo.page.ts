import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { AuthorizationService } from 'src/app/services/authorization.service';
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
    private authorizationService: AuthorizationService,
    private menuCtrl: MenuController,
    private globales: Globales,
    private mailService: MailService,
    private storage: StorageService,
    private navCtrl: NavController,
  ) { }

  ngOnInit() {
    this.menuCtrl.enable(false);
  }

  goLogin() {
    this.navCtrl.navigateRoot('/login');
  }

  async verify(){
    try {
      this.globales.showLoading('Conectando ...');

      const exist = await this.authorizationService.existUser(this.email);
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
        this.email ='';
      }
      this.globales.hideLoading();
    } catch (error) {
      this.globales.hideLoading();
      if (error instanceof Error){
        this.globales.presentToast(error.message,'middle');
      } else {
        this.globales.presentToast(`Usuario no existe`,'middle');
      }
      this.email ='';
    }
  }
}
