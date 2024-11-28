import { Component, Input, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { GlobalesService } from 'src/app/services/globales.service';
import { Permisos } from 'src/app/services/constants.service';
import { environment } from '../../../environments/environment';
import { SynchronizationService } from '@app/services/synchronization.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent  implements OnInit {
  user: string = '';
  account: string = '';
  showCertificado = true;
  showCuenta = true;
  showEmbalajes = true;
  showInsumos = true;
  showMateriales = true;
  showServicios = true;
  showPuntos = true;
  showTerceros = true;
  showTratamientos = true;
  showVehiculos = true;
  idTercero: string = '';
  debug: boolean = true;

  constructor(
    private storage: StorageService,
    private navCtrl: NavController,
    private router: Router,
    private menuCtrl: MenuController,
    private alertController: AlertController,
    private synchronizationService: SynchronizationService,
    private globales: GlobalesService
  ) { }

  async ngOnInit() {
    const cuenta = await this.storage.get('Cuenta');

    this.idTercero = cuenta.IdPersona;
    this.account = cuenta.Nombre;
    this.user = cuenta.NombreUsuario;
    this.showCertificado = await this.globales.getPermiso(Permisos.AppCertificado) != '';
    this.showCuenta = await this.globales.getPermiso(Permisos.AppCuenta) != '';
    this.showEmbalajes = await this.globales.getPermiso(Permisos.AppEmbalaje) != '';
    this.showInsumos = await this.globales.getPermiso(Permisos.AppInsumo) != '';
    this.showMateriales = await this.globales.getPermiso(Permisos.AppMaterial) != '';
    this.showServicios = await this.globales.getPermiso(Permisos.AppServicio) != '';
    this.showPuntos = await this.globales.getPermiso(Permisos.AppPunto) != '';
    this.showTerceros = await this.globales.getPermiso(Permisos.AppTercero) != '';
    this.showTratamientos = await this.globales.getPermiso(Permisos.AppClaseTratamiento) != '';
    this.showVehiculos = await this.globales.getPermiso(Permisos.AppVehiculo) != '';

    this.debug == !environment.production;
  }

  navigateToPuntos() {
    this.menuCtrl.close();
    this.navCtrl.navigateForward(`/puntos/${this.idTercero}`);
  }

  navigateTo(page: string) {
    this.menuCtrl.close();
    this.router.navigate([page]);
  }

  async sincronizar() {
    this.navCtrl.navigateForward('/sincronizacion');
  }

  close() {
    this.menuCtrl.close();
  }

  async showLogoutOptions(): Promise<string> {
    return new Promise((resolve) => {
      this.alertController
        .create({
          header: 'Datos sin sincronizar.',
          message: 'No se pudo sincronizar. ¿Qué desea hacer?',
          buttons: [
            {
              text: 'Forzar Cierre definitivo',
              handler: () => {
                resolve('ForceQuit');
              },
            },
            {
              text: 'Abandonar Sesión',
              handler: () => {
                resolve('Resume');
              },
            },
            {
              text: 'Continuar en Sesión',
              role: 'cancel',
              handler: () => {
                resolve('Cancel');
              },
            },
          ],
        })
        .then((alert) => {
          alert.present();
        });
    });
  }

  async logout() {
    try {
      await this.globales.showLoading('Sincronizando ...');
      const result = await this.synchronizationService.close();
      this.globales.hideLoading();
      if (result) {
        this.navCtrl.navigateRoot('/login');
      } else {
        const result = await this.showLogoutOptions();

        switch (result) {
          case 'Resume':
            this.globales.estaCerrando = true;
            this.navCtrl.navigateRoot('/login');
            break;
          case 'Cancel':
            break;
          case 'ForceQuit':
            this.synchronizationService.forceQuit();
            this.navCtrl.navigateRoot('/login');
            break;
          default:
            break;
        }
      }
    } catch (error) {
      this.globales.hideLoading();
      await this.globales.presentToast('Error al sincronizar', 'middle');
    }
  }

  getInitials(name: string): string {
    const names = name.split(' ');
    return names.map(name => name[0]).join('');
  }
}
