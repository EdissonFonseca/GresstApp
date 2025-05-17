import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { SynchronizationService } from '@app/services/core/synchronization.service';
import { NavController } from '@ionic/angular';
import { Punto } from 'src/app/interfaces/punto.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { EntradaSalida, Estado, TipoServicio } from '@app/constants/constants';
import { PointsService } from '@app/services/masterdata/points.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { Utils } from '@app/utils/utils';
import { ComponentsModule } from '@app/components/components.module';

@Component({
  selector: 'app-point-new',
  templateUrl: './point-new.page.html',
  styleUrls: ['./point-new.page.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, IonicModule, RouterModule, ComponentsModule]
})
export class PointNewPage implements OnInit {
  puntos: Punto[] = [];
  idActividad: string = '';
  idPunto: string = '';
  punto: string = '';

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private transactionsService: TransactionsService,
    private pointsService: PointsService,
    private synchronizationService: SynchronizationService,
  ) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idActividad= params["IdActividad"]
    });
    this.idPunto = '';
    this.puntos = (await this.pointsService.list());
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();

    const puntos = await this.pointsService.list();
    this.puntos = puntos.filter((punto: Punto) => punto.Nombre.toLowerCase().indexOf(query) > -1);
  }

  select(idPunto: string, tercero: string, nombre: string) {
    this.idPunto = idPunto;
    this.punto = `${tercero} - ${nombre}`;
  }

   async confirm(){
    const transaccion: Transaccion = {
        IdActividad: this.idActividad,
        IdTransaccion: Utils.newId(),
        EntradaSalida: EntradaSalida.Entrada,
        IdRecurso: "",
        IdServicio: TipoServicio.Recoleccion,
        IdEstado: Estado.Pendiente,
        Titulo: '' // TODO
      };
    await this.transactionsService.create(transaccion);

    //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
    this.synchronizationService.uploadTransactions();

    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdActividad: this.idActividad
      }
    };
    this.navCtrl.navigateForward('/route', navigationExtras);


  }
}
