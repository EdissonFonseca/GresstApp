import { Component, OnInit } from '@angular/core';
import { AlertController, ModalController } from '@ionic/angular';
import { Insumo } from '@app/interfaces/insumo.interface';
import { SuppliesService } from '@app/services/masterdata/supplies.service';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/constants/constants';
import { SuppliesComponent } from '@app/components/supplies/supplies.component';
import { AuthorizationService } from '@app/services/core/authorization.services';

/**
 * Supplies page component
 * Displays and manages supplies information
 */
@Component({
  selector: 'app-supply',
  templateUrl: './supply.page.html',
  styleUrls: ['./supply.page.scss'],
})
export class SupplyPage implements OnInit {
  supplies: Insumo[] = [];
  enableNew: boolean = false;

  constructor(
    private modalCtrl: ModalController,
    private suppliesService: SuppliesService,
    private alertController: AlertController,
    private authorizationService: AuthorizationService
  ) {}

  /**
   * Initialize the page
   */
  async ngOnInit() {
    this.supplies = await this.suppliesService.list();
    this.enableNew = (await this.authorizationService.getPermission(PERMISSIONS.APP_SUPPLY))?.includes(CRUD_OPERATIONS.CREATE);
  }

  async openAddSupply() {
    const modal = await this.modalCtrl.create({
      component: SuppliesComponent
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      this.supplies = await this.suppliesService.list();
    }
  }

  async deleteSupply(supply: Insumo) {
    const alert = await this.alertController.create({
      header: 'Confirm',
      message: 'Are you sure you want to delete this supply?',
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        },
        {
          text: 'Delete',
          handler: async () => {
//            await this.suppliesService.create(supply);
            this.supplies = await this.suppliesService.list();
          }
        }
      ]
    });

    await alert.present();
  }
}
