import { Component, OnInit } from '@angular/core';
import { ActionSheetButton, ActionSheetController, ActionSheetOptions, MenuController, ModalController, NavController } from '@ionic/angular';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { ResidueMoveComponent } from 'src/app/components/residue-move/residue-move.component';
import { ResidueDismissComponent } from 'src/app/components/residue-dismiss/residue-dismiss.component';
import { Globales } from 'src/app/services/globales.service';
import { ResidueTransformComponent } from 'src/app/components/residue-transform/residue-transform.component';
import { ResiduePublishComponent } from 'src/app/components/residue-publish/residue-publish.component';
import { ResidueReceiveComponent } from 'src/app/components/residue-receive/residue-receive.component';
import { ResidueTransferComponent } from 'src/app/components/residue-transfer/residue-transfer.component';
import { Estado } from 'src/app/services/constants.service';
import { Residuo } from 'src/app/interfaces/residuo.interface';

@Component({
  selector: 'app-inventario',
  templateUrl: './inventario.page.html',
  styleUrls: ['./inventario.page.scss'],
})
export class InventarioPage implements OnInit {
  residuos: Residuo[] = [];
  imagePath: string = '';

  constructor(
    private navCtrl: NavController,
    private modalCtrl: ModalController,
    private menuCtrl: MenuController,
    private globales: Globales,
    private actionSheetCtrl: ActionSheetController,
    ) {
    }

  async ngOnInit() {
    this.menuCtrl.enable(true);
  }

  async ionViewWillEnter(){
    this.residuos = await this.globales.getInventario();
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

    await this.globales.presentToast('Residuo eliminado','middle');
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

    await this.globales.presentToast('Residuo trasladado','middle');
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

    await this.globales.presentToast('Residuo recibido','middle');
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

    await this.globales.presentToast('Residuo transferido','middle');
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

    const materialesList = await this.globales.getInventario();
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
    const residuo = await this.globales.getResiduo(idResiduo);
    if (!residuo) return;

    const material = await this.globales.getMaterial(residuo.IdMaterial);
    if (!material) return;

    let actionButtons: ActionSheetButton[] = [];
    if (residuo?.IdEstado == Estado.Activo ){
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
    } else if (residuo.IdEstado == Estado.Pendiente) {
    await this.transferResiduo(idResiduo);
    }
  }
}
