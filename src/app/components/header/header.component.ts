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
  @Input() pendingTransactions: number = 1;
  @Input() helpPopup: string = 'help';
  @ViewChild('popJornada') popJornada!: ElementRef;
  @ViewChild('popInventario') popInventario!: ElementRef;

  isOpen = false;

  constructor(
    private menuCtrl: MenuController,
    private modalCtrl: ModalController,
    private synchronizationService: SynchronizationService,
    private globalesService: GlobalesService
  ) { }

  ngOnInit() {}

  presentPopover(e: Event) {
    // if (this.helpPopup == 'jornada' && this.popJornada){
    //   this.popJornada.event = e;
    //   this.isOpen = true;
    //   }
  }

  async synchronize(){
    if (await this.synchronizationService.refresh()){
      this.globalesService.presentToast('Sincronización exitosa', "middle");
    } else {
      this.globalesService.presentToast('Sincronización fallida. Intente de nuevo mas tarde', "middle");
    }
  }
}
