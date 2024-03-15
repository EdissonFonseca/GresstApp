import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { Punto } from 'src/app/interfaces/punto.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { Estado } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';

@Component({
  selector: 'app-punto-nuevo',
  templateUrl: './punto-nuevo.page.html',
  styleUrls: ['./punto-nuevo.page.scss'],
})
export class PuntoNuevoPage implements OnInit {
  puntos: Punto[] = [];
  idTarea: string = '';
  idPunto: string = '';
  punto: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private route: ActivatedRoute,
    private navCtrl: NavController,
    private globales: Globales,
  ) {
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
      this.idTarea= params["IdTarea"]
    });
    this.idPunto = '';
    this.puntos = (await this.globales.getPuntos());
  }

  async handleInput(event: any){
    const query = event.target.value.toLowerCase();

    const puntos = await this.globales.getPuntos();
    this.puntos = puntos.filter((punto) => punto.Nombre.toLowerCase().indexOf(query) > -1);
  }

  select(idPunto: string, tercero: string, nombre: string) {
    this.idPunto = idPunto;
    this.punto = `${tercero} - ${nombre}`;
  }

   async confirm(){
    const transaccion: Transaccion = {
        IdTransaccion: this.globales.newId(),
        IdEstado: Estado.Pendiente,
        Titulo: '' // TODO
      };
    await this.globales.createTransaccion(this.idTarea, transaccion);

    const navigationExtras: NavigationExtras = {
      queryParams: {
        IdTarea: this.idTarea
      }
    };
    this.navCtrl.navigateForward('/ruta', navigationExtras);
  }
}
