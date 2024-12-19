import { Component, Input, OnInit, signal } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { ActivityApproveComponent } from 'src/app/components/activity-approve/activity-approve.component';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { ActividadesService } from 'src/app/services/actividades.service';
import { Estado, TipoServicio } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { environment } from '../../../environments/environment';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { Card } from '@app/interfaces/card';
import { CardService } from '@app/services/card.service';
import { SynchronizationService } from '@app/services/synchronization.service';

@Component({
  selector: 'app-transacciones',
  templateUrl: './transacciones.page.html',
  styleUrls: ['./transacciones.page.scss'],
})
export class TransaccionesPage implements OnInit {
  activity = signal<Card>({id:'', title: '', status: Estado.Pendiente, type:'activity'});
  transactions = signal<Card[]>([]);
  showAdd: boolean = true;
  showNavigation: boolean = true;
  showSupport: boolean = true;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private globales:GlobalesService,
    private actividadesService: ActividadesService,
    private cardService: CardService,
    private transaccionesService: TransaccionesService,
    public synchronizationService: SynchronizationService,
    private modalCtrl: ModalController,
    private actionSheet: ActionSheetController,
  ) {}

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state){
      const newActivity = nav.extras.state['activity'];
      if (newActivity){
        this.activity.set(newActivity);
      }
      const actividad = await this.actividadesService.get(this.activity().id);
      if (actividad) {
        this.showAdd = actividad.IdEstado == Estado.Pendiente;
        this.showNavigation = actividad.IdServicio == TipoServicio.Transporte;
        this.showSupport = actividad.IdServicio == TipoServicio.Transporte;
      }
    }
  }

  async ionViewWillEnter() {
    const transacciones = await this.transaccionesService.list(this.activity().id);
    const mappedTransactions = await this.cardService.mapTransacciones(transacciones);
    this.transactions.set(mappedTransactions);
  }


  async handleInput(event: any){
    const query = event.target.value.toLowerCase();
    let transaccionesList = await this.transaccionesService.list(this.activity().id);
    const transaccionesFilter = transaccionesList.filter(trx =>
      (trx.Punto?.toLowerCase().includes(query) ||
       trx.Tercero?.toLowerCase().includes(query))
    );
    this.transactions.set(transaccionesFilter.length > 0
      ? await this.cardService.mapTransacciones(transaccionesFilter)
      : await this.cardService.mapTransacciones(transaccionesList)
    );
  }

  goBack() {
    //this.navCtrl.navigateBack('/home/actividades').then(() => {window.location.reload();});
    this.navCtrl.navigateBack('/home/actividades');
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
      state: { activity: this.activity() }
    };
    this.navCtrl.navigateForward('/tareas', navigationExtras);
  }

  navigateToMap(){
    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdActividad: this.activity().id,
      }
    }
    this.navCtrl.navigateForward('/ruta', navigationExtras);
  }

  async showSupports() {
    var cuenta = await this.globales.getCuenta();
    var actividad = await this.actividadesService.get(this.activity().id);
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
    const modal = await this.modalCtrl.create({
      component: TaskAddComponent,
      componentProps: {
        IdActividad: this.activity().id,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      await this.globales.showLoading('Actualizando información');

      this.transactions.update(transactions => {
        const card = transactions.find(x => x.id == data.IdTransaccion);
        if (!card) {
          this.transaccionesService.get(this.activity().id, data.IdTransaccion)
            .then(async newTransaccion => {
              if (newTransaccion) {
                const newTransaction = await this.cardService.mapTransaccion(newTransaccion);
                if (newTransaction) {
                  transactions.push(newTransaction);
                }
              }
            });
        } else {
          card.successItems = (card.successItems ?? 0) + 1;
        }

        return transactions;
      });

      this.activity.update(activity => {
        if (activity) {
          activity.successItems = (activity.successItems ?? 0) + 1;
          activity.quantity = (activity.quantity ?? 0) + (data.Cantidad ?? 0);
          activity.weight = (activity.weight ?? 0) + (data.Peso ?? 0);
          activity.volume = (activity.volume ?? 0) + (data.Volumen ?? 0);
        }
        this.cardService.updateVisibleProperties(activity);
        return activity;
      });

      await this.globales.hideLoading();

      //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
      this.synchronizationService.uploadTransactions();
    }
  }

  async openApproveActividad() {
    const modal = await this.modalCtrl.create({
      component: ActivityApproveComponent,
      componentProps: {
        activity: this.activity(),
        approveOrReject: 'approve',
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data != null) {
      this.activity.update(activity => {
        if (activity) {
          activity.status = Estado.Aprobado;
          this.cardService.updateVisibleProperties(activity);
        }
        return activity;
      });

      this.transactions.update(transactions => {
        const filteredTransactions = transactions.filter(x => x.parentId == this.activity().id && x.status == Estado.Pendiente);
        filteredTransactions.forEach(transaction => {
          transaction.status = Estado.Rechazado;
          this.cardService.updateVisibleProperties(transaction);
        });
        return transactions;
      });

      this.showAdd = false;

      //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
      this.synchronizationService.uploadTransactions();
    }
  }

  getColor() {
    return this.synchronizationService.pendingTransactions() > 0 ? 'danger' : 'success';
  }

  async synchronize() {
    if (await this.synchronizationService.refresh()){
      this.globales.presentToast('Sincronización exitosa', "middle");
    } else {
      this.globales.presentToast('Sincronización fallida. Intente de nuevo mas tarde', "middle");
    }
  }
}
