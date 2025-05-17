import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Interlocutor } from 'src/app/interfaces/interlocutor.interface';
import { Utils } from '@app/utils/utils';

@Component({
  selector: 'app-chat-interlocutors',
  templateUrl: './chat-interlocutors.page.html',
  styleUrls: ['./chat-interlocutors.page.scss'],
})
export class ChatInterlocutorsPage implements OnInit {
  interlocutores: Interlocutor[] = [];
  idResiduo: string = '';

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
  ) {
  }

  async ngOnInit() {
    await Utils.showLoading('Sincronizando ...');
    this.route.queryParams.subscribe(params => {
      this.idResiduo = params["IdResiduo"]
    });
    this.interlocutores = await Utils.getInterlocutors(this.idResiduo);
    await Utils.hideLoading();
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
