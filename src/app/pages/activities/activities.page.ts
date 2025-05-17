import { Component, OnInit, signal } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Card } from '@app/interfaces/card';
import { CardService } from '@app/services/core/card.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { ActivityAddComponent } from 'src/app/components/activity-add/activity-add.component';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { CRUDOperacion, Permisos, SERVICIOS, TipoServicio } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/components/components.module';

@Component({
  selector: 'app-activities',
  templateUrl: './activities.page.html',
  styleUrls: ['./activities.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ComponentsModule]
})
export class ActivitiesPage implements OnInit {
  activities = signal<Card[]>([]);
  showAdd: boolean = true;
  cantidadCombustible: number | null = null;
  kilometraje: number | null = null;

  constructor(
    private navCtrl: NavController,
    private activitiesService: ActivitiesService,
    private cardService: CardService,
    private synchronizationService: SynchronizationService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private actionSheet: ActionSheetController
    ) {
  }

  async ngOnInit() {
    this.showAdd = await Utils.allowAddActivity();
  }

  async ionViewWillEnter() {
    let actividadesList = await this.activitiesService.list();
    const mappedActivities = await this.cardService.mapActividades(actividadesList);
    this.activities.set(mappedActivities);
  }

  async handleInput(event: any) {
    const query = event.target.value.toLowerCase();

    let actividadesList = await this.activitiesService.list();
    actividadesList = actividadesList.filter((actividad) => actividad.Titulo.toLowerCase().indexOf(query) > -1);
    const mappedActivities = await this.cardService.mapActividades(actividadesList);
    this.activities.set(mappedActivities);
  }

  async requestMileagePrompt(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: 'Kilometraje inicial',
        inputs: [
          {
            name: 'kilometraje',
            type: 'number',
            placeholder: 'Kilometraje',
            value: this.kilometraje ? Math.floor(this.kilometraje) : 0,
            min: 0,
            attributes: {
              'label': 'Kilometraje'
            }
          },
        ],
        buttons: [
          {
            text: 'Aceptar',
            handler: (data) => {
              this.kilometraje = parseInt(data.kilometraje, 10);
              resolve(true);
            }
          },
          {
            text: 'Cancelar',
            role: 'cancel',
            handler: () => {
              resolve(false);
            }
          }
        ]
      });

      await alert.present();
    });
  }

  async navigateToTarget(activity: Card) {
    const actividad: Actividad = await this.activitiesService.get(activity.id);

    if (!actividad) return;

    switch(actividad.IdServicio)
    {
      case TipoServicio.Recoleccion:
      case TipoServicio.Transporte:
        if (actividad.FechaInicial == null) {
          if (Utils.solicitarKilometraje) {
            const result = await this.requestMileagePrompt();
            if (result) {
              actividad.KilometrajeInicial = this.kilometraje;
            } else {
              return;
            }
          }
          await Utils.showLoading('Iniciando ruta');
          await this.activitiesService.updateInicio(actividad);
          await Utils.hideLoading();
          //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
          this.synchronizationService.uploadTransactions();
        }

        if (actividad.NavegarPorTransaccion) {
          const navigationExtras: NavigationExtras = { state: { activity: activity} };
          this.navCtrl.navigateForward('/transacciones', navigationExtras);
        } else {
          const navigationExtras: NavigationExtras = {
            queryParams: { Mode:'A' },
            state: { activity: activity}
          };
          this.navCtrl.navigateForward('/tareas', navigationExtras);
        }

        break;
      default:
        const navigationExtrasD: NavigationExtras = {
          queryParams: { Mode:'T' },
          state: { activity: activity}
      };
        this.navCtrl.navigateForward('/tareas', navigationExtrasD);
        break;
    }
  }

  async openAddActivity() {
    const actionSheetDict: { [key: string]: { icon?: string, name?: string } } = {};

    const acopio = (await Utils.getPermission(Permisos.AppAcopio))?.includes(CRUDOperacion.Create);
    if (acopio) {
      var servicio = SERVICIOS.find(x => x.IdServicio == TipoServicio.Acopio);
      if (servicio)
        actionSheetDict[TipoServicio.Acopio] = { icon: servicio.Icono, name: servicio.Nombre };
    }

    const transporte = (await Utils.getPermission(Permisos.AppTransporte))?.includes(CRUDOperacion.Create);
    if (transporte) {
      var servicio = SERVICIOS.find(x => x.IdServicio == TipoServicio.Transporte);
      if (servicio)
        actionSheetDict[TipoServicio.Transporte] = { icon: servicio.Icono, name: servicio.Nombre };
    }

    const buttons = Object.keys(actionSheetDict).map(key => ({
      text: actionSheetDict[key].name,
      icon: actionSheetDict[key].icon,
      handler: async () => await this.presentModal(key)
    }));

    const actionSheet = await this.actionSheet.create({
      header: 'Servicios',
      buttons
    });

    await actionSheet.present();
  }

  async presentModal(key: string) {
    const modal = await this.modalCtrl.create({
      component: ActivityAddComponent,
      componentProps: {
        IdServicio: key
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      await Utils.showLoading('Actualizando información');

      this.activities.update(activities => {
        const card = activities.find(x => x.id == data.IdActividad);
        if (!card) {
            this.activitiesService.get(data.IdActividad)
            .then(async newActividad => {
              if (newActividad) {
                const newActivity = await this.cardService.mapActividad(newActividad);
                if (newActivity) {
                  activities.push(newActivity);
                }
              }
            });
        } else {
          card.successItems = (card.successItems ?? 0) + 1;
        }

        return activities;
      });
      await Utils.hideLoading();

      //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
      this.synchronizationService.uploadTransactions();
    }
  }

  getColorEstado(idEstado: string): string {
    return Utils.getStateColor(idEstado);
  }
}
