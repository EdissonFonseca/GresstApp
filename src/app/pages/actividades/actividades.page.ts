import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { Card } from '@app/interfaces/card';
import { CardService } from '@app/services/card.service';
import { ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { ActivityAddComponent } from 'src/app/components/activity-add/activity-add.component';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { ActividadesService } from 'src/app/services/actividades.service';
import { CRUDOperacion, Permisos, TipoServicio } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';

@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.page.html',
  styleUrls: ['./actividades.page.scss'],
})
export class ActividadesPage implements OnInit {
  activities: Card[] = [];
  showAdd: boolean = true;
  cantidadCombustible: number | null = null;
  kilometraje: number | null = null;

  constructor(
    private navCtrl: NavController,
    private globales: GlobalesService,
    private actividadesService: ActividadesService,
    private cardService: CardService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private actionSheet: ActionSheetController
    ) {
  }

  async ngOnInit() {
    this.showAdd = await this.globales.allowAddActivity();
  }

  async ionViewWillEnter() {
    let actividadesList = await this.actividadesService.list();
    this.activities = await this.cardService.mapActividades(actividadesList);
    this.cardService.setActivities(this.activities);
  }

  async handleInput(event: any) {
    const query = event.target.value.toLowerCase();

    let actividadesList = await this.actividadesService.list();
    actividadesList = actividadesList.filter((actividad) => actividad.Titulo.toLowerCase().indexOf(query) > -1);
    this.activities = await this.cardService.mapActividades(actividadesList);
  }

  async presentAlertPrompt(): Promise<boolean> {
    return new Promise(async (resolve) => {
      const alert = await this.alertCtrl.create({
        header: 'Datos del vehiculo',
        inputs: [
          {
            name: 'kilometraje',
            type: 'number',
            placeholder: 'Kilometraje',
            value: this.kilometraje ? Math.floor(this.kilometraje) : 0,
            min: 0,
            attributes: {
              'aria-label': 'Kilometraje'
            }
          },
          {
            name: 'cantidadCombustible',
            type: 'number',
            placeholder: 'Cantidad de Combustible',
            value: this.cantidadCombustible ? this.cantidadCombustible.toFixed(2).toString() : '0.00',
            min: 0,
            attributes: {
              'aria-label': 'Kilometraje'
            }
          }
        ],
        buttons: [
          {
            text: 'Aceptar',
            handler: (data) => {
              this.kilometraje = parseInt(data.kilometraje, 10);
              this.cantidadCombustible = parseFloat(parseFloat(data.cantidadCombustible).toFixed(2));
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
    const actividad: Actividad = await this.actividadesService.get(activity.id);

    switch(actividad.IdServicio)
    {
      case TipoServicio.Recoleccion:
      case TipoServicio.Transporte:
        if (actividad.FechaInicial == null) {
          const result = await this.presentAlertPrompt();
          if (result) {
            actividad.KilometrajeInicial = this.kilometraje;
            actividad.CantidadCombustibleInicial = this.cantidadCombustible;
          } else {
            return;
          }
          await this.globales.showLoading('Actualizando datos');
          await this.actividadesService.updateInicio(actividad);
          this.globales.hideLoading();
        }

        if (actividad.NavegarPorTransaccion) {
          const navigationExtras: NavigationExtras = {
            state: { activity: activity}
          };
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

  async openAddActivity(){
    const actionSheetDict: { [key: string]: { icon?: string, name?: string } } = {};

    const acopio = (await this.globales.getPermiso(Permisos.AppAcopio))?.includes(CRUDOperacion.Create);
    if (acopio) {
      var servicio = this.globales.servicios.find(x => x.IdServicio == TipoServicio.Acopio);
      if (servicio)
        actionSheetDict[TipoServicio.Acopio] = {icon: servicio.Icono , name: servicio.Nombre};
    }

    const transporte = (await this.globales.getPermiso(Permisos.AppTransporte))?.includes(CRUDOperacion.Create);
    if (transporte) {
      var servicio = this.globales.servicios.find(x => x.IdServicio == TipoServicio.Transporte);
      if (servicio)
        actionSheetDict[TipoServicio.Transporte] = {icon: servicio.Icono , name: servicio.Nombre};
    }

    const buttons = Object.keys(actionSheetDict).map(key => ({
      text: actionSheetDict[key].name,
      icon: actionSheetDict[key].icon,
      handler: async() => await this.presentModal(key)
    }));

    const actionSheet = await this.actionSheet.create({
      header: 'Servicios',
      buttons
    });

    await actionSheet.present();
  }

  async presentModal(key: string){
    const modal =  await this.modalCtrl.create({
      component: ActivityAddComponent,
      componentProps: {
        IdServicio: key
      },
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      await this.globales.showLoading('Actualizando información');
      let actividadesList = await this.actividadesService.list();
      this.activities = await this.cardService.mapActividades(actividadesList);
      await this.globales.hideLoading();
    }
  }

  getColorEstado(idEstado: string): string {
    return this.globales.getColorEstado(idEstado);
  }

}
