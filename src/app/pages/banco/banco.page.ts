import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Banco } from 'src/app/interfaces/banco.interface';
import { AuthorizationService } from 'src/app/services/authorization.service';
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
    private authorizationService: AuthorizationService,
    private storage: StorageService,
    private integrationService: IntegrationService,
    private navCtrl: NavController,
    private globales: Globales
  ) {
  }

  async ngOnInit() {
    this.globales.showLoading('Sincronizando ...');
    this.materiales = await this.integrationService.getBanco();
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
    const materialesList : Banco[] = await this.integrationService.getBanco();

    this.materiales = materialesList.filter((mat) => mat.Nombre.toLowerCase().indexOf(query) > -1);

    this.globales.hideLoading();
  }

  async handleClear(){
    this.globales.showLoading('Sincronizando ...');
    const username = await this.storage.get('Login');
    const password = await this.storage.get('Password');
    const token = await this.authorizationService.login(username, password);
    this.materiales = await this.integrationService.getBanco();
    this.globales.hideLoading();
  }
}
