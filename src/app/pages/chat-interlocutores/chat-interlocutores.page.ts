import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Interlocutor } from 'src/app/interfaces/interlocutor.interface';
import { GlobalesService } from 'src/app/services/globales.service';
import { MasterDataService } from 'src/app/services/masterdata.service';

@Component({
  selector: 'app-chat-interlocutores',
  templateUrl: './chat-interlocutores.page.html',
  styleUrls: ['./chat-interlocutores.page.scss'],
})
export class ChatInterlocutoresPage implements OnInit {
  interlocutores: Interlocutor[] = [];
  idResiduo: string = '';

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private globales: GlobalesService,
    private masterdataService: MasterDataService,
  ) {

  }

  async ngOnInit() {
    this.globales.showLoading('Sincronizando ...');
    this.route.queryParams.subscribe(params => {
      this.idResiduo = params["IdResiduo"]
    });
    this.interlocutores = await this.masterdataService.getInterlocutores(this.idResiduo);
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
