import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { CRUDOperacion, EntradaSalida, Estado, TipoServicio } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { PointsComponent } from '../points/points.component';
import { TreatmentsComponent } from '../treatments/treatments.component';
import { Cuenta } from 'src/app/interfaces/cuenta.interface';
import { Material } from 'src/app/interfaces/material.interface';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';

@Component({
  selector: 'app-residue-dismiss',
  templateUrl: './residue-dismiss.component.html',
  styleUrls: ['./residue-dismiss.component.scss'],
})
export class ResidueDismissComponent  implements OnInit {
  colorDismiss: string = 'primary';
  colorDispose: string = 'medium';
  colorStore: string = 'medium';
  cuenta: Cuenta | undefined = undefined;
  date: Date | null = null;
  material: Material | undefined = undefined;
  mode: string = '';
  point: string = '';
  pointId: string = '';
  residue: Residuo | undefined;
  residueId: string;
  stakeholderId: string = '';
  treatment: string = '';
  treatmentId: string = '';

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private globales: Globales,
    private formBuilder: FormBuilder
  ) {
    this.residueId = this.navParams.get("ResidueId");
  }

  async ngOnInit() {
    this.cuenta = await this.globales.getCuenta();
    this.residue = await this.globales.getResiduo(this.residueId);
    if (!this.residue) return;

    this.material = await this.globales.getMaterial(this.residue.IdMaterial);
  }

  async confirm() {
    const cuenta = await this.globales.getCuenta();
    let actividad: Actividad | undefined = undefined;
    let transaccion: Transaccion | undefined = undefined;

    if (!this.residue) return;

    const personId = await this.globales.getIdPersona();
    if (this.mode == TipoServicio.Almacenamiento) {
      actividad = await this.globales.getActividadByProceso(TipoServicio.Almacenamiento, this.pointId);
      if (!actividad) {
        actividad = {IdActividad: this.globales.newId(), IdServicio: TipoServicio.Almacenamiento, IdRecurso: this.pointId, Titulo: this.point, CRUD: CRUDOperacion.Create, IdEstado: Estado.Pendiente, NavegarPorTransaccion: false, Transacciones: [], Tareas: []};
        await this.globales.createActividad(actividad);
      }
    } else if (this.mode == TipoServicio.Disposicion) {
      actividad = await this.globales.getActividadByProceso(TipoServicio.Disposicion, this.pointId);
      if (!actividad) {
        actividad = {IdActividad: this.globales.newId(), IdServicio : TipoServicio.Disposicion, IdRecurso: this.pointId, Titulo: this.point, CRUD: CRUDOperacion.Create, IdEstado: Estado.Pendiente, NavegarPorTransaccion: false, Transacciones: [], Tareas: []};
        await this.globales.createActividad(actividad);
      }
    } else { //Perdida
      actividad = await this.globales.getActividadByProceso(TipoServicio.Perdida, personId ?? '');
      if (!actividad) {
        actividad = {IdActividad: this.globales.newId(), IdServicio: TipoServicio.Perdida, IdRecurso: this.pointId, Titulo: this.point, CRUD: CRUDOperacion.Create, IdEstado: Estado.Pendiente, NavegarPorTransaccion: false, Transacciones: [], Tareas: []};
        await this.globales.createActividad(actividad);
      }
    }
    if (actividad) {
      const tarea: Tarea = {
          IdTarea: this.globales.newId(),
          IdMaterial: this.residue.IdMaterial,
          IdResiduo: this.residue.IdResiduo,
          IdPunto: this.pointId,
          IdSolicitante: this.stakeholderId,
          IdEstado: Estado.Aprobado,
          CRUD: CRUDOperacion.Create,
          EntradaSalida: EntradaSalida.Salida,
          Cantidad: this.residue.Cantidad,
          Peso: this.residue.Peso,
          Volumen: this.residue.Volumen,
          IdServicio: actividad.IdServicio,
          Cantidades: this.globales.getResumen(this.residue.Cantidad ?? 0, cuenta.UnidadCantidad, this.residue.Peso ?? 0, cuenta.UnidadPeso, this.residue.Volumen ?? 0, cuenta.UnidadVolumen),
        };
      await this.globales.createTarea(actividad.IdActividad, tarea);
    }
    this.residue.IdEstado = Estado.Inactivo;
    this.residue.IdDeposito = this.pointId;
    await this.globales.updateResiduo(this.residue);
    this.modalCtrl.dismiss({ActivityId: actividad?.IdActividad });
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  changeNotesColor(type: string) {
    this.mode = type;
    if (type === TipoServicio.Disposicion){
      this.colorDismiss = 'medium';
      this.colorDispose = 'primary';
      this.colorStore = 'medium';
    } else if (type == TipoServicio.Almacenamiento){
      this.colorDismiss = 'medium';
      this.colorDispose = 'medium';
      this.colorStore = 'primary';
    } else { //Perdida
      this.colorDismiss = 'primary';
      this.colorDispose = 'medium';
      this.colorStore = 'medium';
   }
  }

  dateTimeChanged(event: any) {
    this.date = event.detail.value;
  }

   async selectPlant() {
    const idTercero = await this.globales.getIdPersona();
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        IdTercero: idTercero,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.pointId = data.data.id;
        this.point = data.data.name;
        this.stakeholderId = data.data.owner;
      }
    });

    return await modal.present();
   }

   async selectStore() {
    const idTercero = await this.globales.getIdPersona();
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        IdTercero: idTercero,
        Almacenamiento: true,
        Disposicion: true,
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.pointId = data.data.id;
        this.point = data.data.name;
        this.stakeholderId = data.data.owner;
      }
    });

    return await modal.present();
   }

   async selectTreatment() {
    const idTercero = await this.globales.getIdPersona();
    const modal =   await this.modalCtrl.create({
      component: TreatmentsComponent,
      componentProps: {
        IdTercero: idTercero
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.treatmentId = data.data.id;
        this.treatment = data.data.name;
      }
    });

    return await modal.present();
   }
  }
