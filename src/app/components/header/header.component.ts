import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { Utils } from '@app/utils/utils';
import { SessionService } from '@app/services/core/session.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {
  @Input() pageTitle: string = 'Gresst';
  @Input() helpPopup: string = '';
  isOpen = false;

  constructor(
    public synchronizationService: SynchronizationService,
    private modalCtrl: ModalController,
    private sessionService: SessionService
  ) { }

  ngOnInit() {}

  async synchronize(){
    if (await this.sessionService.refresh()){
      Utils.presentToast('Sincronización exitosa', "middle");
    } else {
      Utils.presentToast('Sincronización fallida. Intente de nuevo mas tarde', "middle");
    }
  }

  getColor() {
    return this.synchronizationService.pendingTransactions() > 0 ? 'danger' : 'success';
  }

  async showHelp() {
    if (this.helpPopup) {
      const modal = await this.modalCtrl.create({
        component: 'app-help-popup',
        componentProps: {
          popupId: this.helpPopup
        }
      });
      await modal.present();
    }
  }
}
