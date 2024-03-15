import { Component, Input, OnInit } from '@angular/core';
import { StorageService } from 'src/app/services/storage.service';
import { NavController } from '@ionic/angular';
import { Router } from '@angular/router';
import { MenuController } from '@ionic/angular';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss'],
})
export class MenuComponent  implements OnInit {
  user: string = '';
  account: string = '';

  constructor(
    private storage: StorageService,
    private navCtrl: NavController,
    private router: Router,
    private menuCtrl: MenuController
  ) { }

  async ngOnInit() {
    const cuenta = await this.storage.get('Cuenta');

    this.account = cuenta.Nombre;
    this.user = cuenta.NombreUsuario;
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
