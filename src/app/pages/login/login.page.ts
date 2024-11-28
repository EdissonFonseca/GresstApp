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

    try {
      if (loggedUser) {
        if (await this.authenticationService.ping()) { // En linea
          const user = await this.storage.get('Login');
          const password = await this.storage.get('Password');
          const token = await this.storage.get('Token');
          await this.globales.showLoading('Sincronizando ...');
          await this.synchronizationService.refresh()
          this.globales.hideLoading();
          await this.storage.set('Login', user);
          await this.storage.set('Password', password);
          await this.storage.set('Token', token);
        } else {
          await this.globales.presentToast("Está trabajando sin conexión", "middle");
        }
        await this.globales.initGlobales();
        this.navCtrl.navigateRoot('/home');
      }
    } catch (error) {
      this.globales.hideLoading();
      await this.globales.presentToast("Error al sincronizar", "middle");
      return;
    }
  }

  async login(){
    if (this.username == '' || this.password == ''){
      await this.globales.presentAlert('Error', '', 'Debe digitar usuario y contrasena');
      return;
    }

    try {
      await this.globales.showLoading('Conectando ...');
      if (await this.authenticationService.ping()) {
        const token = await this.authenticationService.login(this.username, this.password);
        if (token) {
          this.globales.token = token;
          await this.synchronizationService.load();
          await this.storage.set('Login', this.username);
          await this.storage.set('Password', this.password);
          await this.storage.set('Token', token);
          await this.globales.initGlobales();
          this.globales.hideLoading();
          this.navCtrl.navigateRoot('/home');
        } else {
          this.globales.hideLoading();
          await this.globales.presentAlert('Error','Usuario no autorizado', `Usuario o contraseña no válido.`);
        }
      } else {
        await this.globales.presentAlert('Error','Sin conexión', `No se puede conectar al servidor.`);
      }
      this.globales.hideLoading();
    } catch (error) {
      this.globales.hideLoading();
      if (error instanceof Error){
        await this.globales.presentAlert('Error','Request Error', error.message);
      }
      else{
        await this.globales.presentAlert('Error','Unknown error', `${error}`);
      }
    }
  }

  async goPassword(){
    this.navCtrl.navigateRoot('contrasena-correo');
  }

  async goRegister() {
    this.navCtrl.navigateRoot('/registro-correo');
  }
}
