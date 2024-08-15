import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Globales } from 'src/app/services/globales.service';

@Component({
  selector: 'app-sincronizacion',
  templateUrl: './sincronizacion.page.html',
  styleUrls: ['./sincronizacion.page.scss'],
})
export class SincronizacionPage implements OnInit {

  constructor(
    private navCtrl: NavController,
    private globales: Globales
  ) { }

  ngOnInit() {
  }

  async synchronize() {
    console.log('sincronizar');;
    this.globales.showLoading('Conectando ...');

    await this.globales.sincronizar();

    this.globales.hideLoading();
    this.globales.presentToast('Datos sincronizada', 'middle');

    this.navCtrl.navigateRoot('/home');
  }

  async cancel() {
    this.navCtrl.navigateRoot('/home');
  }
}
