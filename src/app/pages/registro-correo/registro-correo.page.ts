import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { Globales } from 'src/app/services/globales.service';
import { MailService } from 'src/app/services/mail.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-registro-correo',
  templateUrl: './registro-correo.page.html',
  styleUrls: ['./registro-correo.page.scss'],
})
export class RegistroCorreoPage implements OnInit {
  name = '';
  email = '';
  verificationCode = '';

  constructor(
    private authenticationService: AuthenticationService,
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

      const exist = await this.authenticationService.existUser(this.email);
      if (!exist)
      {
        this.verificationCode = await this.mailService.sendWithToken(this.email, 'Bienvenido a Gresst', 'Digite el siguiente codigo: {Token} en la app para continuar');
        if (this.verificationCode)
        {
          await this.storage.set('Email', this.email);
          await this.storage.set('Name', this.name);
          await this.storage.set('Code', this.verificationCode);
          this.navCtrl.navigateRoot('/registro-codigo');
        }
      } else {
        this.globales.presentToast('Este correo ya se encuentra registrado','middle');
      }
      this.globales.hideLoading();
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
