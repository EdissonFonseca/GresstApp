import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Globales } from 'src/app/services/globales.service';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { StakeholdersComponent } from '../stakeholders/stakeholders.component';
import { PointsComponent } from '../points/points.component';
import { CRUDOperacion, EntradaSalida, Estado, TipoProceso } from 'src/app/services/constants.service';
import { Material } from 'src/app/interfaces/material.interface';
import { Cuenta } from 'src/app/interfaces/cuenta.interface';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';

@Component({
  selector: 'app-residue-transfer',
  templateUrl: './residue-transfer.component.html',
  styleUrls: ['./residue-transfer.component.scss'],
})
export class ResidueTransferComponent  implements OnInit {
  colorSend: string = 'primary';
  colorCarry: string = 'medium';
  colorFind: string = 'medium';
  cuenta: Cuenta | undefined = undefined;
  date: Date | null = null;
  material: Material | undefined = undefined;
  mode: string = 'S';
  point: string = '';
  pointId: string = '';
  residue: Residuo | undefined;
  residueId: string;
  stakeholder: string = '';
  stakeholderId: string = '';
  vehicleId: string = '';
  vehicle: string = '';

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private globales: Globales,
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

    if (this.mode == 'S' || this.mode =='C') {
      const punto = await this.globales.getPunto(this.residue.IdDeposito ?? '');
      if (this.mode == "S"){
        actividad = await this.globales.getActividadByProceso(TipoProceso.Salida, this.residue.IdDeposito ?? '');
        if (!actividad) {
          if (punto){
            actividad = {IdActividad: this.globales.newId(), IdProceso: TipoProceso.Salida, IdRecurso: this.residue.IdDeposito ?? '', Titulo: punto.Nombre, CRUD: CRUDOperacion.Create, IdEstado: Estado.Pendiente, NavegarPorTransaccion: false, Transacciones: [], Tareas: []};
            await this.globales.createActividad(actividad);
          }
        }
        if (actividad){
          transaccion = await this.globales.getTransaccionByTercero(actividad.IdActividad, this.stakeholderId);
          if (!transaccion) {
            transaccion = {
              IdTransaccion: this.globales.newId(),
              EntradaSalida: EntradaSalida.Salida,
              IdEstado: Estado.Pendiente,
              IdTercero: this.stakeholderId,
              CRUD: CRUDOperacion.Create,
              Titulo: '' // TODO
            };
            await this.globales.createTransaccion(actividad.IdActividad, transaccion);
          }
        }
      } else {
        actividad = await this.globales.getActividadByProceso(TipoProceso.Transporte, this.residue.IdVehiculo ?? '');
        if (!actividad){
          actividad = {IdActividad: this.globales.newId(), IdProceso: TipoProceso.Transporte, IdRecurso: this.vehicleId ?? '', Titulo: this.vehicleId, CRUD: CRUDOperacion.Create, IdEstado: Estado.Pendiente, NavegarPorTransaccion: false, Transacciones: [], Tareas: []};
          actividad.CRUD = CRUDOperacion.Create;
          await this.globales.createActividad(actividad);
        }
        if (actividad){
          transaccion = await this.globales.getTransaccionByTercero(actividad.IdActividad, this.stakeholderId);
          if (!transaccion) {
            transaccion = {
              IdTransaccion: this.globales.newId(),
              EntradaSalida: EntradaSalida.Salida,
              IdEstado: Estado.Pendiente, IdTercero:
              this.stakeholderId, IdPunto:
              this.pointId,
              CRUD: CRUDOperacion.Create,
              Titulo: '' // TODO
            };
            await this.globales.createTransaccion(actividad.IdActividad, transaccion);
          }
        }
      }
      if (actividad) {
        const tarea: Tarea = {
          IdTarea: this.globales.newId(),
          IdTransaccion: transaccion?.IdTransaccion,
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
          Cantidades: this.globales.getResumen(this.residue.Cantidad ?? 0, cuenta.UnidadCantidad, this.residue.Peso ?? 0, cuenta.UnidadPeso, this.residue.Volumen ?? 0, cuenta.UnidadVolumen),
        };
        await this.globales.createTarea(actividad.IdActividad, tarea);
      }
      this.residue.IdEstado = Estado.Inactivo;
      this.residue.IdDeposito = this.pointId;
      await this.globales.updateResiduo(this.residue);
    } else {

    }
    this.modalCtrl.dismiss({ActivityId: actividad?.IdActividad });
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  changeNotesColor(type: string) {
    this.mode = type;
    if (type === 'S'){
      this.colorSend = 'primary';
      this.colorCarry = 'medium';
      this.colorFind = 'medium';
    } else if (type == 'C') {
      this.colorSend = 'medium';
      this.colorCarry = 'primary';
      this.colorFind = 'medium';
    }
    else {
      this.colorSend = 'medium';
      this.colorCarry = 'medium';
      this.colorFind = 'primary';
    }
  }

  dateTimeChanged(event: any) {
    this.date = event.detail.value;
  }

  async selectPoint() {
    const idTercero = await this.globales.getIdPersona();
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
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

  async selectStakeholder() {
    const modal =   await this.modalCtrl.create({
      component: StakeholdersComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.stakeholderId = data.data.id;
        this.stakeholder = data.data.name;
      }
    });

    return await modal.present();
   }

   async selectVehicle() {
    const modal =   await this.modalCtrl.create({
      component: VehiclesComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.vehicleId = data.data.id;
        this.vehicle = data.data.name;
      }
    });

    return await modal.present();
   }
}
