import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Interlocutor } from 'src/app/interfaces/interlocutor.interface';
import { MasterDataApiService } from '@app/services/api/masterdataApi.service';
import { UserNotificationService } from '@app/services/core/user-notification.service';
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
    private masterdataService: MasterDataApiService,
    private userNotificationService: UserNotificationService
  ) {
  }

  async ngOnInit() {
    await this.userNotificationService.showLoading('Sincronizando ...');
    this.route.queryParams.subscribe(params => {
      this.idResiduo = params["IdResiduo"]
    });
    this.interlocutores = await this.masterdataService.getCounterparts(this.idResiduo);
    await this.userNotificationService.hideLoading();
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
