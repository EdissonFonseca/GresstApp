import { Component, OnInit } from '@angular/core';
import { MenuController, NavController } from '@ionic/angular';
import { GlobalesService } from 'src/app/services/globales.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-registro-codigo',
  templateUrl: './registro-codigo.page.html',
  styleUrls: ['./registro-codigo.page.scss'],
})
export class RegistroCodigoPage implements OnInit {
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

  async verify(){
    try {
      const generatedCode = await this.storage.get('Code');

      if (this.verificationCode != generatedCode) {
        await this.globales.presentToast('El código no corresponde','middle');
      } else {
        this.navCtrl.navigateRoot('/registro-clave');
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
