import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Globales } from 'src/app/services/globales.service';
import { SynchronizationService } from 'src/app/services/synchronization.service';

@Component({
  selector: 'app-sincronizacion',
  templateUrl: './sincronizacion.page.html',
  styleUrls: ['./sincronizacion.page.scss'],
})
export class SincronizacionPage implements OnInit {
  title: string = '';

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private synchronizationService: SynchronizationService,
    private globales: Globales,
    private router: Router,
  ) { }

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.title = params["Title"]
    });
  }

  async synchronize() {
    try {
      await this.globales.showLoading('Conectando ...');

      if (this.title != 'Transacciones')
        await this.synchronizationService.refreshMasterData();
      else
        await this.synchronizationService.refreshTransactions();

      await this.globales.hideLoading();
      await this.globales.presentToast('Datos sincronizados', 'middle');

      this.navCtrl.navigateForward('//home');
    } catch (error) {
      await this.globales.presentToast('Error sincronizando', 'middle');
    }
  }

  async cancel() {
    this.navCtrl.navigateRoot('/home');
  }
}
