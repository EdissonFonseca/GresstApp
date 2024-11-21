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
  generaError: boolean = false;

  constructor(
    private navCtrl: NavController,
    private synchronizationService: SynchronizationService,
    private globales: GlobalesService,
  ) { }

  ngOnInit() {}

  async synchronize() {
    try {
      await this.globales.showLoading('Closing ...');
      await this.synchronizationService.refresh();
      this.globales.hideLoading();
      await this.globales.presentToast('Datos sincronizados', 'middle');
      this.navCtrl.navigateForward('/home');
    } catch (error) {
      this.globales.hideLoading();
      await this.globales.presentToast('Error sincronizando', 'middle');
      this.generaError = true;
    }
  }

  async sendBackup() {
    try {
      await this.globales.showLoading('Force quit ...');
      await this.synchronizationService.forceQuit();
      this.globales.hideLoading();
      await this.globales.presentToast('Datos enviados al servidor', 'middle');
      this.navCtrl.navigateForward('/login');
    } catch (error) {
      this.globales.hideLoading();
      await this.globales.presentToast('Error enviando backup', 'middle');
    }
  }

  async cancel() {
    this.navCtrl.navigateRoot('/home');
  }
}
