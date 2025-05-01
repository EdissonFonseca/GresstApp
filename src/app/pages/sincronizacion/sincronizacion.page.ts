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
    await this.globales.showLoading('Sincronizando...');
    try {
      const success = await this.synchronizationService.refresh();
      this.globales.hideLoading();

      if (success) {
        await this.globales.presentToast('Sincronización exitosa', "middle");
        this.navCtrl.navigateForward('/home');
      } else {
        await this.globales.presentToast('No hay conexión con el servidor. Intente de nuevo más tarde', "middle");
      }
    } catch (error) {
      this.globales.hideLoading();
      console.error('Error durante la sincronización:', error);
      await this.globales.presentToast('Error durante la sincronización. Intente de nuevo más tarde', "middle");
    }
  }
}
