import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { RouterModule } from '@angular/router';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { SynchronizationService } from '@app/infrastructure/services/synchronization.service';
import { NavController } from '@ionic/angular';
import { Punto } from '@app/domain/entities/punto.entity';
import { Transaccion } from '@app/domain/entities/transaccion.entity';
import { INPUT_OUTPUT, STATUS, SERVICE_TYPES } from '@app/core/constants';
import { PointsService } from '@app/infrastructure/repositories/masterdata/points.repository';
import { TransactionsService } from '@app/infrastructure/repositories/transactions/transactions.repository';
import { Utils } from '@app/core/utils';
import { ComponentsModule } from '@app/presentation/components/components.module';

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
        IdProceso: this.idActividad,
        IdTransaccion: Utils.generateId(),
        EntradaSalida: INPUT_OUTPUT.INPUT,
        IdRecurso: "",
        IdServicio: SERVICE_TYPES.COLLECTION,
        IdEstado: STATUS.PENDING,
        Titulo: '', // TODO
      };
    await this.transactionsService.create(transaccion);

    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdActividad: this.idActividad
      }
    };
    this.navCtrl.navigateForward('/route', navigationExtras);


  }
}
