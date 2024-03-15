import { Component, Input, OnInit, ViewChild, ElementRef } from '@angular/core';
import { MenuController, ModalController } from '@ionic/angular';
import { LocationSelectComponent } from '../location-select/location-select.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent  implements OnInit {
  @Input() pageTitle: string = 'Gresst';
  @Input() helpPopup: string = 'help';
  @ViewChild('popJornada') popJornada!: ElementRef;
  @ViewChild('popInventario') popInventario!: ElementRef;

  isOpen = false;

  constructor(
    private menuCtrl: MenuController,
    private modalCtrl: ModalController
  ) { }

  ngOnInit() {}

  presentPopover(e: Event) {
    // if (this.helpPopup == 'jornada' && this.popJornada){
    //   this.popJornada.event = e;
    //   this.isOpen = true;
    //   }
  }
}
