import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActionSheetButton, ActionSheetController, MenuController, ModalController, NavController } from '@ionic/angular';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { ResidueMoveComponent } from 'src/app/components/residue-move/residue-move.component';
import { ResidueDismissComponent } from 'src/app/components/residue-dismiss/residue-dismiss.component';
import { ResidueTransformComponent } from 'src/app/components/residue-transform/residue-transform.component';
import { ResiduePublishComponent } from 'src/app/components/residue-publish/residue-publish.component';
import { ResidueReceiveComponent } from 'src/app/components/residue-receive/residue-receive.component';
import { ResidueTransferComponent } from 'src/app/components/residue-transfer/residue-transfer.component';
import { CRUD_OPERATIONS, STATUS, PERMISSIONS } from '@app/constants/constants';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { Utils } from '@app/utils/utils';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
@Component({
  selector: 'app-inventory',
  templateUrl: './inventory.page.html',
  styleUrls: ['./inventory.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule]
})
export class InventoryPage implements OnInit {
  residuos: Residuo[] = [];
  imagePath: string = '';
  permiteAgregar: boolean = true;

  constructor(
    private modalCtrl: ModalController,
    private menuCtrl: MenuController,
    private inventoryService: InventoryService,
    private materialsService: MaterialsService,
    private actionSheetCtrl: ActionSheetController,
    private authorizationService: AuthorizationService,
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

  async deleteResiduo(idResiduo: string){
    const modal =  await this.modalCtrl.create({
      component: ResidueDismissComponent,
      componentProps: {
        ResidueId: idResiduo
      },
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data){
      // const card = this.residuos.find(x => x.IdResiduo == idResiduo);
      // if (card) {
      //   card.Description = data.Target;
      // }
    }

    await this.userNotificationService.showToast('Residuo eliminado','middle');
  }

  async moveResiduo(idResiduo: string){
    const modal =  await this.modalCtrl.create({
      component: ResidueMoveComponent,
      componentProps: {
        ResidueId: idResiduo
        },
      });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data){
      const card = this.residuos.find(x => x.IdResiduo == idResiduo);
      if (card) {
        card.Ubicacion = data.Target;
      }
    }

    await this.userNotificationService.showToast('Residuo trasladado','middle');
  }

  async receiveResiduo(){
    const modal =   await this.modalCtrl.create({
      component: ResidueReceiveComponent,
      componentProps: {
        },
      });
      await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      // const card = new Card().fromResiduo(data);
      // if (card){
        this.residuos.push(data);
      //}
    }

    await this.userNotificationService.showToast('Residuo recibido','middle');
  }

  async shareResiduo(idResiduo: string){
    const modal =   await this.modalCtrl.create({
      component: ResiduePublishComponent,
      componentProps: {
        ResidueId: idResiduo
      },
      });
      await modal.present();
  }

  async transferResiduo(idResiduo: string){
    const modal =   await this.modalCtrl.create({
      component: ResidueTransferComponent,
      componentProps: {
        ResidueId: idResiduo
      },
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      if (data.ActivityId)
      {
        // const card = this.residuos.find(x => x.IdResiduo == idResiduo)
        // if (card)
        //   this.residuos = this.residuos.filter(item => item.Id != idResiduo);
      }
    }

    await Utils
  }

  async transformResiduo(idResiduo: string) {
    const modal =   await this.modalCtrl.create({
      component: ResidueTransformComponent,
      componentProps: {
        ResidueId: idResiduo
      },
    });
    await modal.present();
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();

    const materialesList = await this.inventoryService.list();
    this.residuos = materialesList.filter((mat) => mat.Material??''.toLowerCase().indexOf(query) > -1);
  }

  // onDrag(event: any, id:string) {
  //   const distance = event.detail.amount;
  //   if (distance > 0) {
  //     this.transformResiduo(id);
  //   } else if (distance < 0) {
  //     this.dismissResiduo(id);
  //   }
  // }

  async openMenu(idResiduo: string) {
    const residuo = await this.inventoryService.getResiduo(idResiduo);
    if (!residuo) return;

      const material = await this.materialsService.get(residuo.IdMaterial);
    if (!material) return;

    let actionButtons: ActionSheetButton[] = [];
    if (residuo?.IdEstado == STATUS.ACTIVE ){
      if (material.Aprovechable) {
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
            await this.moveResiduo(idResiduo);
            break;
          case "transfer":
            await this.transferResiduo(idResiduo);
            break;
          case "delete":
            await this.deleteResiduo(idResiduo);
            break;
          case "transform":
            await this.transformResiduo(idResiduo);
            break;
          case "share":
            await this.shareResiduo(idResiduo);
            break;
          default:
            break;
        }
      }
    } else if (residuo.IdEstado == STATUS.PENDING) {
    await this.transferResiduo(idResiduo);
    }
  }
}
