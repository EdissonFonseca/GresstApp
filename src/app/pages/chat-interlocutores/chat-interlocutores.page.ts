import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Interlocutor } from 'src/app/interfaces/interlocutor.interface';
import { Globales } from 'src/app/services/globales.service';
import { IntegrationService } from 'src/app/services/integration.service';

@Component({
  selector: 'app-chat-interlocutores',
  templateUrl: './chat-interlocutores.page.html',
  styleUrls: ['./chat-interlocutores.page.scss'],
})
export class ChatInterlocutoresPage implements OnInit {
  interlocutores: Interlocutor[] = [];
  idResiduo: string = '';

  constructor(
    private integrationService: IntegrationService,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private globales: Globales
  ) {

  }

  async ngOnInit() {
    this.globales.showLoading('Sincronizando ...');
    this.route.queryParams.subscribe(params => {
      this.idResiduo = params["IdResiduo"]
    });
    this.interlocutores = await this.integrationService.getInterlocutores(this.idResiduo);
    this.globales.hideLoading();
  }

  async navigateToChat(idInterlocutor: string, interlocutor: string){
    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdResiduo: this.idResiduo,
        IdInterlocutor: idInterlocutor,
        Interlocutor: interlocutor
      }
    }
    this.navCtrl.navigateForward('/chat', navigationExtras);
  }
}
