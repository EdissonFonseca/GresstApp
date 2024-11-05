import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { AuthenticationService } from 'src/app/services/authentication.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { StorageService } from 'src/app/services/storage.service';
import { SynchronizationService } from 'src/app/services/synchronization.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username = '';
  password = '';
  showNewAccount: boolean = false;

  constructor(
    private authenticationService: AuthenticationService,
    private synchronizationService: SynchronizationService,
    private navCtrl: NavController,
    private storage: StorageService,
    private globales: GlobalesService,
  ) { }

  async ngOnInit() {
    var loggedUser = await this.storage.get('Login');

    if (loggedUser) {
      this.globales.showLoading('Reconectando ...');
      if (await this.authenticationService.ping()) {
        this.synchronizationService.reload();
      }
      this.globales.initGlobales();
      this.globales.hideLoading();
      this.navCtrl.navigateRoot('/home');
    }
  }

  async login(){
    if (this.username == '' || this.password == ''){
      this.globales.presentAlert('Error', '', 'Debe digitar usuario y contrasena');
      return;
    }

    try {
      this.globales.showLoading('Conectando ...');
      if (await this.authenticationService.ping()) {
        const token = await this.authenticationService.login(this.username, this.password);
        if (token) {
          await this.synchronizationService.load();
          await this.storage.set('Login', this.username);
          await this.storage.set('Password', this.password);
          await this.storage.set('Token', token);
          this.globales.initGlobales();

          this.globales.hideLoading();

          this.navCtrl.navigateRoot('/home');

        } else {
          this.globales.hideLoading();
          await this.globales.presentAlert('Error','Usuario no autorizado', `Usuario o contraseña no válido.`);
        }
      }

    } catch (error) {
      this.globales.hideLoading();
      if (error instanceof Error){
        this.globales.presentAlert('Error','Request Error', error.message);
      }
      else{
        this.globales.presentAlert('Error','Unknown error', `${error}`);
      }
    }
    this.globales.hideLoading();
  }

  async goPassword(){
    this.navCtrl.navigateRoot('contrasena-correo');
  }

  async goRegister() {
    this.navCtrl.navigateRoot('/registro-correo');
  }
}
