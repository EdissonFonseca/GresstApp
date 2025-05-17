import { Component, Input, OnInit } from '@angular/core';
import { StorageService } from '@app/services/core/storage.service';
import { AlertController, NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { GlobalsService } from '@app/services/core/globals.service';
import { Permisos } from '@app/constants/constants';
import { environment } from '../../../environments/environment';
import { SessionService } from '@app/services/core/session.service';
import { Utils } from '@app/utils/utils';

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
    private sessionService: SessionService
  ) { }

  async ngOnInit() {
    const cuenta = await this.storage.get('Cuenta');

    this.idTercero = cuenta.IdPersona;
    this.account = cuenta.Nombre;
    this.user = cuenta.NombreUsuario;
    this.showCertificado = await Utils.getPermission(Permisos.AppCertificado) != '';
    this.showCuenta = await Utils.getPermission(Permisos.AppCuenta) != '';
    this.showEmbalajes = await Utils.getPermission(Permisos.AppEmbalaje) != '';
    this.showInsumos = await Utils.getPermission(Permisos.AppInsumo) != '';
    this.showMateriales = await Utils.getPermission(Permisos.AppMaterial) != '';
    this.showServicios = await Utils.getPermission(Permisos.AppServicio) != '';
    this.showPuntos = await Utils.getPermission(Permisos.AppPunto) != '';
    this.showTerceros = await Utils.getPermission(Permisos.AppTercero) != '';
    this.showTratamientos = await Utils.getPermission(Permisos.AppClaseTratamiento) != '';
    this.showVehiculos = await Utils.getPermission(Permisos.AppVehiculo) != '';

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
      await Utils.showLoading('Sincronizando ...');
      const result = await this.sessionService.close();
      Utils.hideLoading();
      if (result) {
        this.navCtrl.navigateRoot('/login');
      } else {
        const result = await this.showLogoutOptions();

        switch (result) {
          case 'Resume':
            Utils.estaCerrando = true;
            this.navCtrl.navigateRoot('/login');
            break;
          case 'Cancel':
            break;
          case 'ForceQuit':
            this.sessionService.forceQuit();
            this.navCtrl.navigateRoot('/login');
            break;
          default:
            break;
        }
      }
    } catch (error) {
      Utils.hideLoading();
      await Utils.presentToast('Error al sincronizar', 'middle');
    }
  }

  getInitials(name: string): string {
    const names = name.split(' ');
    return names.map(name => name[0]).join('');
  }
}
