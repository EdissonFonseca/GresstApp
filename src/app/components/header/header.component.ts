import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';
import { LocationSelectComponent } from '../location-select/location-select.component';
import { SynchronizationService } from '@app/services/synchronization.service';
import { GlobalesService } from '@app/services/globales.service';

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
    private globalesService: GlobalesService,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  async synchronize(){
    if (await this.synchronizationService.refresh()){
      this.globalesService.presentToast('Sincronización exitosa', "middle");
    } else {
      this.globalesService.presentToast('Sincronización fallida. Intente de nuevo mas tarde', "middle");
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
