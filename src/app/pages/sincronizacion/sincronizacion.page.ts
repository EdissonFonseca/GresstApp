import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { GlobalesService } from 'src/app/services/globales.service';
import { SynchronizationService } from 'src/app/services/synchronization.service';

@Component({
  selector: 'app-sincronizacion',
  templateUrl: './sincronizacion.page.html',
  styleUrls: ['./sincronizacion.page.scss'],
})
export class SincronizacionPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    private synchronizationService: SynchronizationService,
    private globales: GlobalesService,
  ) { }

  ngOnInit() {}

  async synchronize() {
    try {
      await this.globales.showLoading('Conectando ...');
      await this.synchronizationService.reload();

      await this.globales.hideLoading();
      await this.globales.presentToast('Datos sincronizados', 'middle');

      this.navCtrl.navigateForward('/home');
    } catch (error) {
      await this.globales.hideLoading();
      await this.globales.presentToast('Error sincronizando', 'middle');
    }
  }

  async cancel() {
    this.navCtrl.navigateRoot('/home');
  }
}
