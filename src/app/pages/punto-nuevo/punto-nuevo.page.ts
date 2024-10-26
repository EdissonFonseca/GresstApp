import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { SynchronizationService } from '@app/services/synchronization.service';
import { NavController } from '@ionic/angular';
import { Punto } from 'src/app/interfaces/punto.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { EntradaSalida, Estado, TipoServicio } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { PuntosService } from 'src/app/services/puntos.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';

@Component({
  selector: 'app-punto-nuevo',
  templateUrl: './punto-nuevo.page.html',
  styleUrls: ['./punto-nuevo.page.scss'],
})
export class PuntoNuevoPage implements OnInit {
  puntos: Punto[] = [];
  idActividad: string = '';
  idPunto: string = '';
  punto: string = '';

  constructor(
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private transaccionesService: TransaccionesService,
    private puntosService: PuntosService,
    private synchronizationService: SynchronizationService,
    private globales: GlobalesService,
  ) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idActividad= params["IdActividad"]
    });
    this.idPunto = '';
    this.puntos = (await this.puntosService.list());
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();

    const puntos = await this.puntosService.list();
    this.puntos = puntos.filter((punto) => punto.Nombre.toLowerCase().indexOf(query) > -1);
  }

  select(idPunto: string, tercero: string, nombre: string) {
    this.idPunto = idPunto;
    this.punto = `${tercero} - ${nombre}`;
  }

   async confirm(){
    const transaccion: Transaccion = {
        IdActividad:this.idActividad,
        IdTransaccion: this.globales.newId(),
        EntradaSalida: EntradaSalida.Entrada,
        IdRecurso: "",
        IdServicio: TipoServicio.Recoleccion,
        IdEstado: Estado.Pendiente,
        Titulo: '' // TODO
      };
    await this.transaccionesService.create(transaccion);

    //Este llamado se hace sin await para que no bloquee la pantalla y se haga en segundo plano
    this.synchronizationService.uploadTransactions();

    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdActividad: this.idActividad
      }
    };
    this.navCtrl.navigateForward('/ruta', navigationExtras);


  }
}
