import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ActionSheetController, AlertController, ModalController, NavController } from '@ionic/angular';
import { ActivityAddComponent } from 'src/app/components/activity-add/activity-add.component';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { ActividadesService } from 'src/app/services/actividades.service';
import { CRUDOperacion, Estado, Permisos, TipoServicio } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';

@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.page.html',
  styleUrls: ['./actividades.page.scss'],
})
export class ActividadesPage implements OnInit {
  actividades: Actividad[] = [];
  permiteAgregar: boolean = true;
  cantidadCombustible: number | null = null;
  kilometraje: number | null = null;

  constructor(
    private navCtrl: NavController,
    private globales: Globales,
    private actividadesService: ActividadesService,
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private actionSheet: ActionSheetController
    ) {
  }

  async ngOnInit() {
    this.permiteAgregar = await this.globales.allowAddActivity();
  }

  async ionViewWillEnter() {
    this.actividades = await this.actividadesService.list();
  }

  async handleInput(event: any) {
    const query = event.target.value.toLowerCase();

    const actividadesList = await this.actividadesService.list();
    this.actividades = actividadesList.filter((actividad) => actividad.Titulo.toLowerCase().indexOf(query) > -1);
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
          },
          {
            name: 'cantidadCombustible',
            type: 'number',
            placeholder: 'Cantidad de Combustible',
          }
        ],
        buttons: [
          {
            text: 'Aceptar',
            handler: (data) => {
              this.kilometraje = data.kilometraje;
              this.cantidadCombustible = data.cantidadCombustible;
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

  async navigateToTarget(idActividad: string){
    const actividad: Actividad = await this.actividadesService.get(idActividad);

    switch(actividad.IdServicio)
    {
      case TipoServicio.Recoleccion:
      case TipoServicio.Transporte:
        console.log(actividad);
        if (!(actividad.Iniciado ?? false)) {
          const result = await this.presentAlertPrompt();
          if (result) {
            actividad.KilometrajeInicial = this.kilometraje;
            actividad.CantidadCombustibleInicial = this.cantidadCombustible;
          } else {
            return;
          }
          actividad.Iniciado = true;
          await this.actividadesService.updateInicio(actividad);
        }

        if (actividad.NavegarPorTransaccion) {
          const navigationExtras: NavigationExtras = {
            queryParams: { IdActividad: idActividad, Mode: 'T'}
          }
          this.navCtrl.navigateForward('/transacciones', navigationExtras);
        } else {
          const navigationExtras: NavigationExtras = {
            queryParams: {
              IdActividad: idActividad,
              Mode: 'A',
            }
          }
            this.navCtrl.navigateForward('/tareas', navigationExtras);
        }
        //this.globales.hideLoading();
        break;
      default:
        const navigationExtrasD: NavigationExtras = {
          queryParams: {
            IdActividad: idActividad,
            Mode: 'A',
          }
        }
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
      this.actividades = await this.actividadesService.list();
      await this.globales.hideLoading();
    }
  }

  getColorEstado(idEstado: string): string {
    return this.globales.getColorEstado(idEstado);
  }

  formatJornada(idActividad: string) {
    let jornada: string = '';
    const hoy = this.globales.today();
    const actividad = this.actividades.find(x => x.IdActividad == idActividad);

    if (!actividad) return;

    if (actividad.FechaInicial){
      const fechaInicio = new Date(actividad.FechaInicial);
      const diaInicio = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDate());
      if (actividad.FechaFinal) {
        const fechaFin = new Date(actividad.FechaFinal);
        const diaFin = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDate());
        if (diaInicio == hoy && diaFin == hoy){
          jornada = 'Todo el dia';
        } else if (diaInicio < hoy){
          jornada = ""; //format(fechaInicio, 'dd/MM/yyyy') + '-'+format(fechaFin, 'dd/MM/yyyy');
        } else {
          jornada = ""; //format(fechaInicio, 'hh:mm') + '-'+format(fechaFin, 'hh:mm');
        }
      }
    }
    return jornada;
  }
}
