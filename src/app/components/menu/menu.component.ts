import { Component, Input, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { IntegrationService } from 'src/app/services/integration.service';
import { Globales } from 'src/app/services/globales.service';
import { Permisos } from 'src/app/services/constants.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent  implements OnInit {
  user: string = '';
  account: string = '';
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

  constructor(
    private storage: StorageService,
    private navCtrl: NavController,
    private router: Router,
    private menuCtrl: MenuController,
    private globales: Globales
  ) { }

  async ngOnInit() {
    const cuenta = await this.storage.get('Cuenta');

    this.idTercero = cuenta.IdPersona;
    this.account = cuenta.Nombre;
    this.user = cuenta.NombreUsuario;
    this.showCuenta = await this.globales.getPermiso(Permisos.AppCuenta) != '';
    this.showEmbalajes = await this.globales.getPermiso(Permisos.AppEmbalaje) != '';
    this.showInsumos = await this.globales.getPermiso(Permisos.AppInsumo) != '';
    this.showMateriales = await this.globales.getPermiso(Permisos.AppMaterial) != undefined;
    this.showServicios = await this.globales.getPermiso(Permisos.AppServicio) != undefined;
    this.showPuntos = await this.globales.getPermiso(Permisos.AppPunto) != undefined;
    this.showTerceros = await this.globales.getPermiso(Permisos.AppTercero) != undefined;
    this.showTratamientos = await this.globales.getPermiso(Permisos.AppClaseTratamiento) != undefined;
    this.showVehiculos = await this.globales.getPermiso(Permisos.AppVehiculo) != undefined;
  }

  navigateToPuntos() {
    this.menuCtrl.close();
    this.navCtrl.navigateForward(`/puntos/${this.idTercero}`);
  }

  navigateTo(page: string) {
    this.menuCtrl.close();
    this.router.navigate([page]);
  }

  close() {
    this.menuCtrl.close();
  }

  async logout() {
    await this.storage.remove('Login');
    await this.storage.remove('Token');
    this.navCtrl.navigateRoot('/login');
  }

  getInitials(name: string): string {
    const names = name.split(' ');
    return names.map(name => name[0]).join('');
  }
}
