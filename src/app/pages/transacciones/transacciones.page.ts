import { Component, OnInit, ViewChild } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, IonModal, ModalController, NavController } from '@ionic/angular';
import { ActivityApproveComponent } from 'src/app/components/activity-approve/activity-approve.component';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { ActividadesService } from 'src/app/services/actividades.service';
import { Estado, TipoServicio } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { environment } from '../../../environments/environment';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { Card } from '@app/interfaces/card';
import { CardService } from '@app/services/card.service';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.page.html',
  styleUrls: ['./transacciones.page.scss'],
})
export class TransaccionesPage implements OnInit {
  transactions: Card[] = [];
  activity!: Card;
  showAdd: boolean = true;
  showNavigation: boolean = true;
  showSupport: boolean = true;
  @ViewChild(IonModal) modal!: IonModal;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private globales:GlobalesService,
    private actividadesService: ActividadesService,
    private cardService: CardService,
    private transaccionesService: TransaccionesService,
    private modalCtrl: ModalController,
    private actionSheet: ActionSheetController,
  ) {}

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state){
      this.activity = nav.extras.state['activity'];
      this.showAdd = this.activity.status == Estado.Pendiente;
      const actividad = await this.actividadesService.get(this.activity.id);
      if (actividad) {
        this.showNavigation = actividad.IdServicio == TipoServicio.Transporte;
        this.showSupport = actividad.IdServicio == TipoServicio.Transporte;
      }
    }
    const transacciones = await this.transaccionesService.list(this.activity.id);
    this.transactions = await this.cardService.mapTransacciones(transacciones);
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();
    const puntosList = await this.transaccionesService.list(this.activity.id);
    const transacciones = puntosList.filter((trx) => trx.Titulo.toLowerCase().indexOf(query) > -1);
    this.transactions = await this.cardService.mapTransacciones(transacciones);
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

  navigateToTareas(transaction: Card){
    const navigationExtras: NavigationExtras = {
      queryParams: { Mode: 'T', TransactionId: transaction.id },
      state: { activity: this.activity }
    };
    this.navCtrl.navigateForward('/tareas', navigationExtras);
  }

  navigateToMap(){
    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdActividad: this.activity.id,
      }
    }
    this.navCtrl.navigateForward('/ruta', navigationExtras);
  }

  async showSupports() {
    var cuenta = await this.globales.getCuenta();
    var actividad = await this.actividadesService.get(this.activity.id);
    const baseUrl = `${environment.filesUrl}/Cuentas/${cuenta.IdPersonaCuenta}/Soportes/Ordenes/${actividad?.IdOrden}/`;
    const documentsArray = actividad?.Soporte?.split(';');

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
        IdActividad: this.activity.id,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      await this.globales.showLoading('Actualizando información');
      const card = this.transactions.find(x => x.id == data.IdTransaccion);
      if (!card) {
          const newTransaccion = await this.transaccionesService.get(this.activity.id, data.IdTransaccion);
          if (newTransaccion){
            var newTransaction = await this.cardService.mapTransaccion(newTransaccion);
            if (newTransaction)
              this.transactions.push(newTransaction);
          }
      } else {
        card.successItems = (card.successItems ?? 0) + 1;
        //card.summary = await this.globales.getResumenCantidadesTarea(data);
      }
      await this.globales.hideLoading();
    }
  }

  async openApproveActividad() {
    const actividad = await this.actividadesService.get(this.activity.id);

    if (actividad == null) return;

    const modal =   await this.modalCtrl.create({
      component: ActivityApproveComponent,
      componentProps: {
        ActivityId: this.activity.id,
        Title: actividad.Titulo
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data != null) {
      this.activity.status = Estado.Aprobado;
      this.cardService.updateActivity(this.activity);
      this.showAdd = false;
    }
  }
}
