import { Component, OnInit } from '@angular/core';
import { NavigationExtras } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { ActivityAddComponent } from 'src/app/components/activity-add/activity-add.component';
import { ApproveComponent } from 'src/app/components/approve/approve.component';
import { RejectComponent } from 'src/app/components/reject/reject.component';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { Estado, TipoServicio } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';

@Component({
  selector: 'app-actividades',
  templateUrl: './actividades.page.html',
  styleUrls: ['./actividades.page.scss'],
})
export class ActividadesPage implements OnInit {
  actividades: Actividad[] = [];

  constructor(
    private navCtrl: NavController,
    private globales: Globales,
    private modalCtrl: ModalController,
  ) {
  }

  async ngOnInit() {
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

  async handleInput(event: any) {
    const query = event.target.value.toLowerCase();

    const actividadesList = await this.globales.getActividades();
    this.actividades = actividadesList.filter((actividad) => actividad.Titulo.toLowerCase().indexOf(query) > -1);
  }

  async ionViewWillEnter() {
    this.actividades = await this.globales.getActividades();
  }

  async navigateToTarget(idActividad: string){
    const actividad: Actividad = await this.globales.getActividad(idActividad);

    switch(actividad.IdServicio)
    {
      case TipoServicio.Recoleccion:
      case TipoServicio.Transporte:
        const navigationExtras: NavigationExtras = {
          queryParams: {
            IdActividad: idActividad,
            Mode: 'T',
          }
        }
        if (actividad.NavegarPorTransaccion)
          this.navCtrl.navigateForward('/transacciones', navigationExtras);
        else
          this.navCtrl.navigateForward('/tareas', navigationExtras);
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

    this.actividades = await this.globales.getActividades();
  }

  async openApprove(idActividad: string){
    const modal =   await this.modalCtrl.create({
      component: ApproveComponent,
      componentProps: {
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data != null)
    {
      const actividad = await this.globales.getActividad(idActividad);
      if (actividad)
      {
        actividad.IdEstado = Estado.Aprobado;
        this.globales.updateActividad(actividad);
      }
    }
  }

  async openReject(idActividad: string){
    const modal =   await this.modalCtrl.create({
      component: RejectComponent,
      componentProps: {
        //title: `Rechazar ${this.proceso} ${this.titulo}`
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data != null)
    {
      const actividad = await this.globales.getActividad(idActividad);
      if (actividad)
      {
        actividad.IdEstado = Estado.Rechazado;
        this.globales.updateActividad(actividad);
      }
    }
  }
}
