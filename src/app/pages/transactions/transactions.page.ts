import { Component, Input, OnInit, signal } from '@angular/core';
import { NavigationExtras, Router } from '@angular/router';
import { ActionSheetController, ModalController, NavController } from '@ionic/angular';
import { ActivityApproveComponent } from 'src/app/components/activity-approve/activity-approve.component';
import { TaskAddComponent } from 'src/app/components/task-add/task-add.component';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { STATUS, SERVICE_TYPES } from '@app/constants/constants';
import { environment } from '../../../environments/environment';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { Card } from '@app/interfaces/card';
import { CardService } from '@app/services/core/card.service';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { SessionService } from '@app/services/core/session.service';
import { Utils } from '@app/utils/utils';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ComponentsModule } from '@app/components/components.module';
import { AuthorizationService } from '@app/services/core/authorization.services';

@Component({
  selector: 'app-transactions',
  templateUrl: './transactions.page.html',
  styleUrls: ['./transactions.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ComponentsModule]
})
export class TransactionsPage implements OnInit {
  activity = signal<Card>({id:'', title: '', status: STATUS.PENDING, type:'activity'});
  transactions = signal<Card[]>([]);
  showAdd: boolean = true;
  showNavigation: boolean = true;
  showSupport: boolean = true;

  constructor(
    private navCtrl: NavController,
    private router: Router,
    private activitiesService: ActivitiesService,
    private cardService: CardService,
    private transactionsService: TransactionsService,
    public synchronizationService: SynchronizationService,
    public sessionService: SessionService,
    private modalCtrl: ModalController,
    private actionSheet: ActionSheetController,
    private authorizationService: AuthorizationService
  ) {}

  async ngOnInit() {
    const nav = this.router.getCurrentNavigation();
    if (nav?.extras.state){
      const newActivity = nav.extras.state['activity'];
      if (newActivity){
        this.activity.set(newActivity);
      }
      const actividad = await this.activitiesService.get(this.activity().id);
      if (actividad) {
        this.showAdd = actividad.IdEstado == STATUS.PENDING;
        this.showNavigation = actividad.IdServicio == SERVICE_TYPES.TRANSPORT;
        this.showSupport = actividad.IdServicio == SERVICE_TYPES.TRANSPORT;
      }
    }
  }

  async ionViewWillEnter() {
    const transacciones = await this.transactionsService.list(this.activity().id);
    const mappedTransactions = await this.cardService.mapTransacciones(transacciones);
    this.transactions.set(mappedTransactions);
  }


  async handleInput(event: any){
    const query = event.target.value.toLowerCase();
    let transaccionesList = await this.transactionsService.list(this.activity().id);
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
    return Utils.getStateColor(idEstado);
  }

  getImagen(idProceso: string) {
    return Utils.getImage(idProceso);
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
    var cuenta = await this.authorizationService.getAccount();
    var actividad = await this.activitiesService.get(this.activity().id);
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
        idActividad: this.activity().id,
      },
    });

    await modal.present();

    const { data } = await modal.onDidDismiss();
    if (data) {
      await Utils.showLoading('Actualizando información');

      this.transactions.update(transactions => {
        const card = transactions.find(x => x.id == data.IdTransaccion);
        if (!card) {
            this.transactionsService.get(this.activity().id, data.IdTransaccion)
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

      await Utils.hideLoading();

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
          activity.status = STATUS.APPROVED;
          this.cardService.updateVisibleProperties(activity);
        }
        return activity;
      });

      this.transactions.update(transactions => {
          const filteredTransactions = transactions.filter(x => x.parentId == this.activity().id && x.status == STATUS.PENDING);
        filteredTransactions.forEach(transaction => {
          transaction.status = STATUS.REJECTED;
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
    if (await this.sessionService.refresh()){
      await Utils.showToast('Sincronización exitosa', "middle");
    } else {
      await Utils.showToast('Sincronización fallida. Intente de nuevo mas tarde', "middle");
    }
  }
}
