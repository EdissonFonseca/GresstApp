import { Component, OnInit } from '@angular/core';
import { AlertController, MenuController, NavController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Globales } from 'src/app/services/globales.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
})
export class RegistroPage implements OnInit {
  username = '';
  verificationCode = '';
  showTutorial: boolean = true;

  constructor(
    private menuCtrl: MenuController,
    private globales: Globales,
    private authService: AuthService,
    private storage: StorageService,
    private navCtrl: NavController,
    private alertCtrl: AlertController,
  ) { }

  ngOnInit() {
    this.menuCtrl.enable(false);
  }

  async register(){
    try {
      this.globales.showLoading('Conectando ...');

      this.verificationCode = await this.authService.register(this.username);
      this.globales.hideLoading();
      if (this.verificationCode)
      {
        await this.storage.set('Login', this.username);
        await this.presentAlert();
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

  async presentAlert() {
    const alert = await this.alertCtrl.create({
      header: 'Verificación',
      inputs: [
        {
          placeholder: 'Ingrese el codigo enviado a su correo',
        },
      ],
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: () => {
            console.log('Verificacion cancelada');
          },
        },
        {
          text: 'Validar',
          handler: async (data) => {
              const isCodeValid = await this.verifyCode(data["0"]);
              if (isCodeValid) {
                this.navCtrl.navigateRoot('/registro-cuenta');
              } else {
                console.log('Codigo no valido');
              }
          },
        },
      ],
    });

    await alert.present();
  }

  async verifyCode(enteredCode: string): Promise<boolean> {
    return (enteredCode === this.verificationCode);
  }
}
