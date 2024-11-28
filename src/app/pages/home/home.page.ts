import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { SynchronizationService } from '@app/services/synchronization.service';
import { IonTabs } from '@ionic/angular';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage implements OnInit {
  @Input() title = 'Jornada';
  @Input() helpPopup = 'help-inventario';
  @ViewChild('tabs', { static: true }) tabs: IonTabs | undefined;
  nombreCuenta: string = '';
  nombreUsuario: string = '';

  constructor(
    public synchronizationService: SynchronizationService,
  ) {}

  async ngOnInit() {
    this.synchronizationService.countPendingTransactions();
  }

  setHeader(title: string, helpPopup: string){
    this.title = title;
    this.helpPopup = helpPopup;
  }
}
