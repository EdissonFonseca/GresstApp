import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, IonModal, ModalController, NavController } from '@ionic/angular';
import { ActivityApproveComponent } from 'src/app/components/activity-approve/activity-approve.component';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { ActividadesService } from 'src/app/services/actividades.service';
import { Estado } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { environment } from '../../../environments/environment';
import { TransaccionesService } from 'src/app/services/transacciones.service';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.page.html',
  styleUrls: ['./transacciones.page.scss'],
})
export class TransaccionesPage implements OnInit {
  transacciones: Transaccion[] = [];
  actividad: Actividad | undefined;
  idActividad: string = '';
  proceso: string = '';
  currentLocation: any;
  coordinates: string = '';
  showAdd: boolean = true;
  @ViewChild(IonModal) modal!: IonModal;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private globales:Globales,
    private actividadesService: ActividadesService,
    private transaccionesService: TransaccionesService,
    private modalCtrl: ModalController,
    private actionSheet: ActionSheetController,
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idActividad = params["IdActividad"]
    });
  }

  async ionViewWillEnter() {
    this.actividad = await this.actividadesService.get(this.idActividad);
    if (this.actividad) {
      this.proceso = await this.globales.getNombreServicio(this.actividad.IdServicio);
      this.actividad.Icono = this.globales.servicios.find((servicio) => this.actividad?.IdServicio == servicio.IdServicio)?.Icono ||'';
      this.showAdd = this.actividad.IdEstado == Estado.Pendiente;
    }
    this.transacciones = await this.transaccionesService.list(this.idActividad);
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();

    const puntosList = await this.transaccionesService.list(this.idActividad);
    this.transacciones = puntosList.filter((trx) => trx.Titulo.toLowerCase().indexOf(query) > -1);
  }

  goBack() {
    this.navCtrl.navigateBack('/home/actividades').then(() => {window.location.reload();});
  }

  getColorEstado(idEstado: string): string {
    return this.globales.getColorEstado(idEstado);
  }

  getImagen(idProceso: string) {
    return this.globales.getImagen(idProceso);
  }

  navigateToTareas(idTransaccion: string){
    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdActividad: this.idActividad,
        IdTransaccion: idTransaccion,
        Mode: 'T',
      }
    }
    this.navCtrl.navigateForward('/tareas', navigationExtras);
  }

  navigateToMap(){
    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdActividad: this.idActividad,
      }
    }
    this.navCtrl.navigateForward('/ruta', navigationExtras);
  }

  async showSupports() {
    var cuenta = await this.globales.getCuenta();
    const baseUrl = `${environment.filesUrl}/Cuentas/${cuenta.IdPersonaCuenta}/Soportes/Ordenes/${this.actividad?.IdOrden}/`;
    const documentsArray = this.actividad?.Soporte?.split(';');

    console.log(baseUrl);
    // Verificar si documentsArray es válido
    const buttons = documentsArray && documentsArray.length > 0
      ? documentsArray.map(doc => ({
          text: `${doc}`,
          icon: 'document',
          handler: () => {
            const fullUrl = `${baseUrl}${doc}`;
            window.open(fullUrl, '_blank');
          }
        }))
      : [{
          text: 'No hay documentos disponibles',
          icon: 'alert',
          handler: () => {
            console.log('Sin documentos para mostrar');
          }
        }];

    const actionSheet = await this.actionSheet.create({
      header: 'Documentos',
      buttons
    });

    await actionSheet.present();
  }

  async openAddTarea() {
    const origen: string = 'Transacciones';

    const modal =   await this.modalCtrl.create({
      component: TaskAddComponent,
      componentProps: {
        IdActividad: this.idActividad,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      //Viene una tarea, no una transaccion
      await this.globales.showLoading('Actualizando información');
      const transaccion = this.transacciones.find(x => x.IdTransaccion == data.IdTransaccion);
      if (!transaccion) {
          const newTransaccion = await this.transaccionesService.get(this.idActividad, data.IdTransaccion);
          if (newTransaccion)
          {
            console.log(newTransaccion);
            this.transacciones.push(newTransaccion);
          }
      } else {
        transaccion.Cantidad += data.Cantidad;
        transaccion.Peso += data.Peso;
        transaccion.Volumen += data.Volumen;
        transaccion.ItemsAprobados = (transaccion.ItemsAprobados ?? 0) + 1;
        transaccion.Cantidades = await this.globales.getResumenCantidadesTarea(transaccion.Cantidad ?? 0, transaccion.Peso ?? 0, transaccion.Volumen ?? 0);
      }
      await this.globales.hideLoading();
    }
  }

  async openApproveActividad() {
    const actividad = await this.actividadesService.get(this.idActividad);

    if (actividad == null) return;

    const modal =   await this.modalCtrl.create({
      component: ActivityApproveComponent,
      componentProps: {
        ActivityId: this.idActividad,
        Title: actividad.Titulo
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data != null && this.actividad)
    {
      await this.globales.showLoading('Actualizando información');
      this.actividad.IdEstado = Estado.Aprobado;
      this.showAdd = false;
      await this.globales.hideLoading();
    }
  }
}
