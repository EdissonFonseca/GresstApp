import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { GlobalesService } from 'src/app/services/globales.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-contrasena-codigo',
  templateUrl: './contrasena-codigo.page.html',
  styleUrls: ['./contrasena-codigo.page.scss'],
})
export class ContrasenaCodigoPage implements OnInit {
  verificationCode = '';

  constructor(
    private menuCtrl: MenuController,
    private globales: GlobalesService,
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
      const generatedCode = await this.storage.get('Code');

      if (this.verificationCode != generatedCode) {
        await this.globales.presentToast('El código no corresponde','middle');
      } else {
        this.navCtrl.navigateRoot('/contrasena-clave');
      }
    } catch (error) {
      if (error instanceof Error){
        throw new Error(`Request error: ${error.message}`);
      }
      else{
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }
}
