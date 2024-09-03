import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
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

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private globales: Globales,
    private actividadesService: ActividadesService,
    private modalCtrl: ModalController ) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {});
    var cuenta = await this.globales.getCuenta();

    if (!cuenta) return;

    this.permiteAgregar = (await this.globales.getPermiso(Permisos.AppActividad))?.includes(CRUDOperacion.Create);
  }

  async handleInput(event: any) {
    const query = event.target.value.toLowerCase();

    const actividadesList = await this.actividadesService.list();
    this.actividades = actividadesList.filter((actividad) => actividad.Titulo.toLowerCase().indexOf(query) > -1);
  }

  async ionViewWillEnter() {
    this.actividades = await this.actividadesService.list();
  }

  async navigateToTarget(idActividad: string){
    const actividad: Actividad = await this.actividadesService.get(idActividad);

    switch(actividad.IdServicio)
    {
      case TipoServicio.Recoleccion:
      case TipoServicio.Transporte:
        if (actividad.NavegarPorTransaccion) {
          const navigationExtras: NavigationExtras = {
            queryParams: {
              IdActividad: idActividad,
              Mode: 'T',
            }
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
    const modal =  await this.modalCtrl.create({
      component: ActivityAddComponent,
      componentProps: {},
    });
    await modal.present();

    const { data } = await modal.onDidDismiss();

    this.actividades = await this.actividadesService.list();
  }

  getColorEstado(idEstado: string): string {
    return this.globales.getColorEstado(idEstado);
  }

  formatJornada(idActividad: string) {
    let jornada: string = '';
    const hoy = this.globales.today();
    const actividad = this.actividades.find(x => x.IdActividad == idActividad);

    if (!actividad) return;

    if (actividad.FechaInicio){
      const fechaInicio = new Date(actividad.FechaInicio);
      const diaInicio = new Date(fechaInicio.getFullYear(), fechaInicio.getMonth(), fechaInicio.getDay());
      if (actividad.FechaFin) {
        const fechaFin = new Date(actividad.FechaFin);
        const diaFin = new Date(fechaFin.getFullYear(), fechaFin.getMonth(), fechaFin.getDay());
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
