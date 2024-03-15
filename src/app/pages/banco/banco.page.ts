import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { MenuController, NavController } from '@ionic/angular';
import { Banco } from 'src/app/interfaces/banco.interface';
import { AuthService } from 'src/app/services/auth.service';
import { Globales } from 'src/app/services/globales.service';
import { IntegrationService } from 'src/app/services/integration.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-banco',
  templateUrl: './banco.page.html',
  styleUrls: ['./banco.page.scss'],
})
export class BancoPage implements OnInit {
  materiales: Banco[] = [];

  constructor(
    private authService: AuthService,
    private storage: StorageService,
    private menuCtrl: MenuController,
    private integrationService: IntegrationService,
    private navCtrl: NavController,
    private globales: Globales
  ) {
  }

  async ngOnInit() {
    this.globales.showLoading('Sincronizando ...');
    const username = await this.storage.get('Login');
    const password = await this.storage.get('Password');
    const token = await this.authService.login(username, password);
    this.materiales = await this.integrationService.getBanco(token);
    this.globales.hideLoading();
  }

  getImagen(idResiduo: string){
    return '../../../assets/img/bagblue.png';
  }

  redirectToInterlocutores(idResiduo: string){
    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdResiduo: idResiduo
      }
    }
    this.navCtrl.navigateForward('/chat-interlocutores', navigationExtras);
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();

    this.globales.showLoading('Sincronizando ...');
    const username = await this.storage.get('Login');
    const password = await this.storage.get('Password');
    const token = await this.authService.login(username, password);
    const materialesList : Banco[] = await this.integrationService.getBanco(token);

    this.materiales = materialesList.filter((mat) => mat.Nombre.toLowerCase().indexOf(query) > -1);

    this.globales.hideLoading();
  }

  async handleClear(){
    this.globales.showLoading('Sincronizando ...');
    const username = await this.storage.get('Login');
    const password = await this.storage.get('Password');
    const token = await this.authService.login(username, password);
    this.materiales = await this.integrationService.getBanco(token);
    this.globales.hideLoading();
  }
}
