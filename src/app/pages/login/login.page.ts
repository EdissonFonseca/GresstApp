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
    private integrationService: IntegrationService,
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

          this.integrationService.sincronizar();

          const cuenta: Cuenta = await this.integrationService.getConfiguracion();
          await this.storage.set('Cuenta', cuenta);

          const actividades: Actividad[] = await this.integrationService.getActividades();
          await this.storage.set('Actividades', actividades);

          const inventario: Residuo[] = await this.integrationService.getInventario();
          await this.storage.set('Inventario', inventario);

          this.globales.hideLoading();

          if (cuenta.MostrarIntroduccion)
            this.navCtrl.navigateRoot('/tutorial');
          else
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
      await this.globales.presentAlert('Error','Usuario no autorizado', `Usuario o contraseña no válido.`);
      if (error instanceof Error){
        throw new Error(`Request error: ${error.message}`);
      }
      else{
        throw new Error(`Unknown error: ${error}`);
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
