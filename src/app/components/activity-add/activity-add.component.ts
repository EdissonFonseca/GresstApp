import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, RequiredValidator, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { Estado, TipoProceso } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { PointsComponent } from '../points/points.component';
import { Actividad } from 'src/app/interfaces/actividad.interface';

@Component({
  selector: 'app-activity-add',
  templateUrl: './activity-add.component.html',
  styleUrls: ['./activity-add.component.scss'],
})
export class ActivityAddComponent  implements OnInit {
  modo: string = TipoProceso.Recoleccion;
  colorGeneracion: string = 'medium';
  colorEntrega: string = 'medium';
  colorRecepcion: string = 'medium';
  colorRecoleccion: string = 'primary';
  idRecurso: string ='';
  recurso: string = '';
  frmActivity: FormGroup;

  constructor(
    private modalCtrl: ModalController,
    private globales: Globales,
    private formBuilder: FormBuilder,
  ) {
    this.frmActivity = this.formBuilder.group({
      Description: ['', [Validators.required]],
      IdRecurso: []
    });
  }

  ngOnInit() {}

  async confirm() {
    const description: string = this.frmActivity.get('Description')?.value;
    const ahora = new Date();
    const hoy = new Date(ahora.getFullYear(), ahora.getMonth(),ahora.getDay());
    let titulo: string = '';

    if (this.modo == TipoProceso.Recoleccion && this.idRecurso != ''){
      this.modo = TipoProceso.Transporte;
      titulo = this.idRecurso;
    } else {
      titulo = description;
    }
    const actividad: Actividad = {
      IdActividad: this.globales.newId(),
      IdProceso: this.modo,
      IdRecurso: this.idRecurso,
      Titulo: titulo,
      FechaInicio: hoy,
      IdEstado: Estado.Pendiente,
      NavegarPorTransaccion: false,
      Transacciones: [],
      Tareas: []
    };
    await this.globales.createActividad(actividad);

    this.modalCtrl.dismiss('ok');
  }
  cancel() {
    this.modalCtrl.dismiss(null);
  }

  changeNotesColor(type: string) {
    this.modo = type;
    if (type === TipoProceso.Recoleccion){
      this.colorRecoleccion = 'primary';
      this.colorRecepcion = 'medium';
      this.colorEntrega = 'medium';
      this.colorGeneracion = 'medium';
    } else if (type == TipoProceso.Entrada) {
      this.colorRecoleccion = 'medium';
      this.colorRecepcion = 'primary';
      this.colorEntrega = 'medium';
      this.colorGeneracion = 'medium';
    } else if (type == TipoProceso.Salida) {
      this.colorRecoleccion = 'medium';
      this.colorRecepcion = 'medium';
      this.colorEntrega = 'primary';
      this.colorGeneracion = 'medium';
    } else if (type == TipoProceso.Inventario) {
      this.colorRecoleccion = 'medium';
      this.colorRecepcion = 'medium';
      this.colorEntrega = 'medium';
      this.colorGeneracion = 'primary';
    }
  }

  async selectVehicle() {
    const idTercero = await this.globales.getIdPersona();
    const modal =   await this.modalCtrl.create({
      component: VehiclesComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idRecurso = data.data.id;
        this.recurso = data.data.name;

        this.frmActivity.patchValue({
          IdRecurso: data.data.id
        });
      }
    });

    return await modal.present();
   }

   async selectTarget() {
    const idTercero = await this.globales.getIdPersona();
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        IdTercero: idTercero
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idRecurso = data.data.id;
        this.recurso = data.data.name;

        this.frmActivity.patchValue({
          IdRecurso: data.data.id
        });
      }
    });

    return await modal.present();
   }

   async selectSource() {
    const idTercero = await this.globales.getIdPersona();
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idRecurso = data.data.id;
        this.recurso = data.data.name;

        this.frmActivity.patchValue({
          IdRecurso: data.data.id
        });
      }
    });

    return await modal.present();
   }
}
