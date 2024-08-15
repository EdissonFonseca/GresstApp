import { Component, Input, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';
import { IntegrationService } from 'src/app/services/integration.service';
import { Globales } from 'src/app/services/globales.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent  implements OnInit {
  user: string = '';
  account: string = '';
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
  ) { }

  async ngOnInit() {
    const cuenta = await this.storage.get('Cuenta');

    this.idTercero = cuenta.IdPersona;
    this.account = cuenta.Nombre;
    this.user = cuenta.NombreUsuario;
    this.showEmbalajes = cuenta.PermisosEmbalajesCRUD != null && cuenta.PermisosEmbalajesCRUD != "";
    this.showInsumos = cuenta.PermisosInsumosCRUD != null && cuenta.PermisosInsumosCRUD != "";
    this.showMateriales = cuenta.PermisosMaterialesCRUD != null && cuenta.PermisosMaterialesCRUD != "";
    this.showServicios = cuenta.PermisosServiciosCRUD != null && cuenta.PermisosServiciosCRUD != "";
    this.showPuntos = cuenta.PermisosPuntosCRUD != null && cuenta.PermisosPuntosCRUD != "";
    this.showTerceros = cuenta.PermisosTercerosCRUD != null && cuenta.PermisosTercerosCRUD != "";
    this.showTratamientos = cuenta.PermisosTratamientoCRUD != null && cuenta.PermisosTratamientoCRUD != "";
    this.showVehiculos = cuenta.PermisosVehiculosCRUD != null && cuenta.PermisosVehiculosCRUD != "";
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
