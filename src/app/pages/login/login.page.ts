import { Component, OnInit } from '@angular/core';
import { NavController } from '@ionic/angular';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { AuthService } from 'src/app/services/auth.service';
import { Cuenta } from 'src/app/interfaces/cuenta.interface';
import { environment } from 'src/environments/environment';
import { Globales } from 'src/app/services/globales.service';
import { IntegrationService } from 'src/app/services/integration.service';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {
  username = '';
  password = '';

  constructor(
    private authService: AuthService,
    private navCtrl: NavController,
    private storage: StorageService,
    private globales: Globales,
  ) { }

  ngOnInit() {
  }

  async login(){
    if (this.username == '' || this.password == ''){
      this.globales.presentAlert('Error', '', 'Debe digitar usuario y contrasena');
      return;
    }

    try {
      this.globales.showLoading('Conectando ...');

      if (await this.authService.ping()){
        const token = await this.authService.login(this.username, this.password);
        if (token) {
          await this.storage.set('Login', this.username);
          await this.storage.set('Password', this.password);
          await this.storage.set('Token', token);

          await this.globales.sincronizar();

          this.globales.hideLoading();

          this.navCtrl.navigateRoot('/home');
        } else {
          this.globales.hideLoading();
          await this.globales.presentAlert('Error','Usuario no autorizado', `Usuario o contraseña no válido.`);
        }
      } else {
        const savedLogin = await this.storage.get('Login');
        const savedPassword = await this.storage.get('Password');
        if (this.login == savedLogin && this.password == savedPassword){
          this.globales.hideLoading();
          this.globales.presentToast('Trabajando en modo desconectado', "middle");
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
  }

  async goPassword(){
    this.navCtrl.navigateRoot('contrasena-correo');
  }

  async goRegister() {
    this.navCtrl.navigateRoot('/registro-correo');
  }
}
