import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Banco } from 'src/app/interfaces/banco.interface';
import { InventoryApiService } from '@app/services/api/inventoryApi.service';
import { StorageService } from '@app/services/core/storage.service';
import { AuthenticationApiService } from '@app/services/api/authenticationApi.service';
import { Utils } from '@app/utils/utils';
import { UserNotificationService } from '@app/services/core/user-notification.service';
@Component({
  selector: 'app-bank',
  templateUrl: './bank.page.html',
  styleUrls: ['./bank.page.scss'],
})
export class BankPage implements OnInit {
  materiales: Banco[] = [];

  constructor(
    private storage: StorageService,
    private navCtrl: NavController,
    private inventoryService: InventoryApiService,
    private authenticationService: AuthenticationApiService,
    private userNotificationService: UserNotificationService
  ) {
  }

  async ngOnInit() {
    await this.userNotificationService.showLoading('Sincronizando ...');
    this.materiales = await this.inventoryService.getBank();
    await this.userNotificationService.hideLoading();
  }

  getImagen(idResiduo: string){
    return Utils.getImage(idResiduo);
  }

  redirectToInterlocutores(idResiduo: string){
    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdResiduo: idResiduo
      }
    }
    this.navCtrl.navigateForward('/chat-interlocutors', navigationExtras);
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();

    await this.userNotificationService.showLoading('Sincronizando ...');
    const materialesList : Banco[] = await this.inventoryService.getBank();

    this.materiales = materialesList.filter((mat) => mat.Nombre.toLowerCase().indexOf(query) > -1);

    await this.userNotificationService.hideLoading();
  }

  async handleClear(){
  }
}
