import { Component, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, NavigationExtras, Router } from '@angular/router';
import { IonModal, ModalController, NavController } from '@ionic/angular';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { TransactionApproveComponent } from 'src/app/components/transaction-approve/transaction-approve.component';
import { TransactionRejectComponent } from 'src/app/components/transaction-reject/transaction-reject.component';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { ActividadesService } from 'src/app/services/actividades.service';
import { Estado } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.page.html',
  styleUrls: ['./transacciones.page.scss'],
})
export class TransaccionesPage implements OnInit {
  transacciones: Transaccion[] = [];
  idServicio?: string = '';
  idActividad: string = '';
  titulo: string = '';
  proceso: string = '';
  icono: string = '';
  currentLocation: any;
  coordinates: string = '';
  idEstado: string = 'P';
  showAdd: boolean = true;
  @ViewChild(IonModal) modal!: IonModal;

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private globales:Globales,
    private actividadesService: ActividadesService,
    private transaccionesService: TransaccionesService,
    private modalCtrl: ModalController,
    private router: Router,
  ) {}

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idActividad = params["IdActividad"]
    });
    const actividad = await this.actividadesService.get(this.idActividad);
    if (actividad){
      this.titulo = actividad.Titulo;
      this.idServicio = actividad.IdServicio;
      this.idEstado = actividad .IdEstado;
      this.proceso = await this.globales.getNombreServicio(actividad.IdServicio);
      this.icono = this.globales.servicios.find((p) => p.IdServicio == actividad.IdServicio)?.Icono!;
      this.showAdd = actividad.IdEstado == Estado.Pendiente;
    }
  }

  async ionViewWillEnter() {
    this.transacciones = await this.transaccionesService.list(this.idActividad);
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();

    const puntosList = await this.transaccionesService.list(this.idActividad);
    this.transacciones = puntosList.filter((trx) => trx.Titulo.toLowerCase().indexOf(query) > -1);
  }

  getColorEstado(idEstado: string): string {
    return this.globales.getColorEstado(idEstado);
  }

  getImagen(idProceso: string) {
    return this.globales.getImagen(idProceso);
  }

  goBack() {
    this.router.navigateByUrl('/actividades', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/home']);
    });  }

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

  async openApprove(id: string){
    const modal =   await this.modalCtrl.create({
      component: TransactionApproveComponent,
      componentProps: {
        title: `Finalizar ${this.proceso} ${this.titulo}`,
        ActivityId: this.idActividad,
        TransactionId: id,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data != null)
    {
      const card = this.transacciones.find((tarea) => tarea.IdTransaccion == id);
      if (card)
        card.IdEstado = Estado.Aprobado;
    }
  }

  async openReject(id: string){
    const modal =   await this.modalCtrl.create({
      component: TransactionRejectComponent,
      componentProps: {
        title: `Rechazar ${this.proceso} ${this.titulo}`,
        ActivityId: this.idActividad,
        TransactionId: id,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data != null)
    {
      const card = this.transacciones.find((transaccion) => transaccion.IdTransaccion == id);
      if (card)
        card.IdEstado = Estado.Rechazado;
    }
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
      const transaccion = this.transacciones.find(x => x.IdTransaccion == data.IdTransaccion);
      if (!transaccion) {
          const newTransaccion = await this.transaccionesService.get(this.idActividad, data.IdTransaccion);
          if (newTransaccion)
              this.transacciones.push(newTransaccion);
      } else {
        const cuenta = await this.globales.getCuenta();
        transaccion.Cantidad += data.Cantidad;
        transaccion.Peso += data.Peso;
        transaccion.Volumen += data.Volumen;
        transaccion.ItemsAprobados = (transaccion.ItemsAprobados ?? 0) + 1;
        transaccion.Cantidades = this.globales.getResumen(null,null, transaccion.Cantidad ?? 0, cuenta.UnidadCantidad, transaccion.Peso ?? 0, cuenta.UnidadPeso, transaccion.Volumen ?? 0, cuenta.UnidadVolumen);
      }
    }
  }
}
