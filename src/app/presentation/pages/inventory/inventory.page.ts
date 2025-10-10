import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActionSheetButton, ActionSheetController, MenuController, ModalController, NavController } from '@ionic/angular';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { CRUD_OPERATIONS, STATUS, PERMISSIONS } from '@app/core/constants';
import { Waste } from '@app/domain/entities/waste.entity';
import { InventoryRepository } from '@app/infrastructure/repositories/inventory.repository';
import { MaterialRepository } from '@app/infrastructure/repositories/material.repository';
import { Utils } from '@app/core/utils';
import { AuthorizationRepository } from '@app/infrastructure/repositories/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class InventoryPage implements OnInit {
  residuos: Waste[] = [];
  imagePath: string = '';
  permiteAgregar: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private menuCtrl: MenuController,
    private inventoryService: InventoryRepository,
    private materialsService: MaterialRepository,
    private actionSheetCtrl: ActionSheetController,
    private authorizationService: AuthorizationRepository,
    private userNotificationService: UserNotificationService
    ) {
    }

  async ngOnInit() {
    var cuenta = await this.authorizationService.getAccount();

    if (!cuenta) return;

    this.permiteAgregar = (await this.authorizationService.getPermission(PERMISSIONS.APP_INVENTORY))?.includes(CRUD_OPERATIONS.CREATE);
    this.menuCtrl.enable(true);
  }

  async ionViewWillEnter(){
    this.residuos = await this.inventoryService.list();
  }

  async checkImageExists() {
    try {
      const response: HttpResponse = await CapacitorHttp.request({
        url: this.imagePath,
        method: 'head',
      });
      this.imagePath = this.imagePath;
    } catch (error) {
      this.imagePath = '../../../assets/img/bagblue.png';
    }
  }
  isNumeric(value: any): boolean {
    return !isNaN(value);
  }
  getImagen(idResiduo: string) {
    //if (this.checkImageExists())
    const imageSrc: string = '../../../assets/img/bagblue.png';
    return imageSrc;

  }

  async openMenu(idResiduo: string) {
    const residuo = await this.inventoryService.getResidue(idResiduo);
    if (!residuo) return;

    const material = await this.materialsService.get(residuo.MaterialId);
    if (!material) return;

    let actionButtons: ActionSheetButton[] = [];
    if (residuo?.StatusId == STATUS.ACTIVE ){
      if (material.IsRecyclable) {
        actionButtons = [
          {
            icon: "move-outline",
            text: 'Mover',
            role: 'admin',
            data: {
              action: 'move',
            },
          },
          {
            icon: "construct-outline",
            text: 'Transformar',
            role: 'admin',
            data: {
              action: 'transform',
            },
          },
          {
            icon: "open-outline",
            text: 'Transferir',
            role: 'admin',
            data: {
              action: 'transfer',
            },
          },
          {
            icon:"share-social-outline",
            text: 'Publicar',
            role: 'admin',
            data: {
              action: 'share',
            },
          },
          {
            icon: "remove-outline",
            text: 'Eliminar',
            role: 'admin',
            data: {
              action: 'delete',
            },
          },
          {
            text: 'Cancelar',
            data: {
              action: 'cancel',
            },
          },
        ];
      } else {
        actionButtons = [
          {
            icon: "move-outline",
            text: 'Mover',
            role: 'admin',
            data: {
              action: 'move',
            },
          },
          {
            icon: "construct-outline",
            text: 'Transformar',
            role: 'admin',
            data: {
              action: 'transform',
            },
          },
          {
            icon: "open-outline",
            text: 'Transferir',
            role: 'admin',
            data: {
              action: 'transfer',
            },
          },
          {
            icon: "remove-outline",
            text: 'Eliminar',
            role: 'admin',
            data: {
              action: 'delete',
            },
          },
          {
            text: 'Cancelar',
            data: {
              action: 'cancel',
            },
          },
        ];
      }
      const actionSheet = await this.actionSheetCtrl.create({
        header: 'Qué quiere hacer con el residuo?',
        buttons: actionButtons,
      });

      await actionSheet.present();

      const { data } = await actionSheet.onDidDismiss();
      if (data.action != null)
      {
        switch(data.action){
          case "move":
            break;
          case "transfer":
            break;
          case "delete":
            break;
          case "transform":
            break;
          case "share":
            break;
          default:
            break;
        }
      }
    } else if (residuo.StatusId == STATUS.PENDING) {
    }
  }
}
