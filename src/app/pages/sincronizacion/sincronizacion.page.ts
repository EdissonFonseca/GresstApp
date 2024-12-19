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
    await this.globales.showLoading('Closing ...');
    try {
      await this.synchronizationService.downloadMasterData();
      this.globales.hideLoading();
      await this.globales.presentToast('Sincronización exitosa', "middle");
      this.navCtrl.navigateForward('/home');
    } catch (error) {
      this.globales.hideLoading();
      await this.globales.presentToast('Sincronización fallida. Intente de nuevo mas tarde', "middle");
    }
  }
}
