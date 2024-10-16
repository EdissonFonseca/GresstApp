import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { Globales } from 'src/app/services/globales.service';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { StakeholdersComponent } from '../stakeholders/stakeholders.component';
import { PointsComponent } from '../points/points.component';
import { CRUDOperacion, EntradaSalida, Estado, TipoServicio } from 'src/app/services/constants.service';
import { Material } from 'src/app/interfaces/material.interface';
import { Cuenta } from 'src/app/interfaces/cuenta.interface';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { TareasService } from 'src/app/services/tareas.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { ActividadesService } from 'src/app/services/actividades.service';
import { InventarioService } from 'src/app/services/inventario.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { PuntosService } from 'src/app/services/puntos.service';

@Component({
  selector: 'app-residue-transfer',
  templateUrl: './residue-transfer.component.html',
  styleUrls: ['./residue-transfer.component.scss'],
})
export class ResidueTransferComponent  implements OnInit {
  colorSend: string = 'primary';
  colorCarry: string = 'medium';
  colorFind: string = 'medium';
  date: Date | null = null;
  material: Material | undefined = undefined;
  serviceId: string = '';
  point: string = '';
  pointId: string = '';
  residue: Residuo | undefined;
  residueId: string;
  stakeholder: string = '';
  stakeholderId: string = '';
  vehicleId: string = '';
  vehicle: string = '';
  unidadCantidad: string = 'un';
  unidadPeso: string = 'kg';
  unidadVolumen: string = 'lt';


  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private globales: Globales,
    private actividadesService: ActividadesService,
    private transaccionesService: TransaccionesService,
    private tareasService: TareasService,
    private materialesService: MaterialesService,
    private puntosService: PuntosService,
    private inventarioService: InventarioService
  ) {
    this.residueId = this.navParams.get("ResidueId");
  }

  async ngOnInit() {
    this.residue = await this.inventarioService.getResiduo(this.residueId);
    if (!this.residue) return;

    this.unidadCantidad = this.globales.unidadCantidad;
    this.unidadPeso = this.globales.unidadPeso;
    this.unidadVolumen = this.globales.unidadPeso;

    this.material = await this.materialesService.get(this.residue.IdMaterial);
  }

  async confirm() {
    let actividad: Actividad | undefined = undefined;
    let transaccion: Transaccion | undefined = undefined;
    const now = new Date();
    const isoDate = now.toISOString();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isoToday = today.toISOString();

    if (!this.residue) return;

    if (this.serviceId == TipoServicio.Entrega || this.serviceId == TipoServicio.Recoleccion) {
      const punto = await this.puntosService.get(this.residue.IdDeposito ?? '');
      if (this.serviceId == TipoServicio.Entrega){
        actividad = await this.actividadesService.getByServicio(TipoServicio.Entrega, this.residue.IdDeposito ?? '');
        if (!actividad) {
          if (punto){
            actividad = {IdActividad: this.globales.newId(), IdServicio: TipoServicio.Entrega, IdRecurso: this.residue.IdDeposito ?? '', Titulo: punto.Nombre, CRUD: CRUDOperacion.Create, IdEstado: Estado.Pendiente, NavegarPorTransaccion: false, FechaInicial: isoDate, FechaOrden: isoToday};
            await this.actividadesService.create(actividad);
          }
        }
        if (actividad){
          transaccion = await this.transaccionesService.getByTercero(actividad.IdActividad, this.stakeholderId);
          if (!transaccion) {
            transaccion = {
              IdActividad: actividad.IdActividad,
              IdTransaccion: this.globales.newId(),

              IdEstado: Estado.Pendiente,
              EntradaSalida: EntradaSalida.Salida,
              IdRecurso: actividad.IdRecurso,
              IdServicio: actividad.IdServicio,
              IdTercero: this.stakeholderId,
              CRUD: CRUDOperacion.Create,
              Titulo: '' // TODO
            };
            await this.transaccionesService.create(transaccion);
          }
        }
      } else {
        actividad = await this.actividadesService.getByServicio(TipoServicio.Transporte, this.residue.IdVehiculo ?? '');
        if (!actividad){
          actividad = {IdActividad: this.globales.newId(), IdServicio: TipoServicio.Transporte, IdRecurso: this.vehicleId ?? '', Titulo: this.vehicleId, CRUD: CRUDOperacion.Create, IdEstado: Estado.Pendiente, NavegarPorTransaccion: false, FechaInicial: isoDate, FechaOrden: isoToday};
          actividad.CRUD = CRUDOperacion.Create;
          await this.actividadesService.create(actividad);
        }
        if (actividad){
          transaccion = await this.transaccionesService.getByTercero(actividad.IdActividad, this.stakeholderId);
          if (!transaccion) {
            transaccion = {
              IdActividad: actividad.IdActividad,
              IdTransaccion: this.globales.newId(),

              IdEstado: Estado.Pendiente,
              EntradaSalida: EntradaSalida.Entrada,
              IdTercero: this.stakeholderId,
              IdDeposito: this.pointId,
              IdRecurso: actividad.IdRecurso,
              IdServicio: actividad.IdServicio,
              CRUD: CRUDOperacion.Create,
              Titulo: '' // TODO
            };
            await this.transaccionesService.create(transaccion);
          }
        }
      }
      if (actividad) {
        const tarea: Tarea = {
          IdActividad: actividad.IdActividad,
          IdTransaccion: transaccion?.IdTransaccion,
          IdTarea: this.globales.newId(),

          IdMaterial: this.residue.IdMaterial,
          IdResiduo: this.residue.IdResiduo,
          IdRecurso: actividad.IdRecurso,
          IdServicio: actividad.IdServicio,
          FechaEjecucion: isoDate,
          IdDeposito: this.pointId,
          IdTercero: this.stakeholderId,
          IdEstado: Estado.Aprobado,
          CRUD: CRUDOperacion.Create,
          EntradaSalida: EntradaSalida.Salida,
          Cantidad: this.residue.Cantidad,
          Peso: this.residue.Peso,
          Volumen: this.residue.Volumen,
          Fotos: [],
          Cantidades: await this.globales.getResumenCantidadesTarea(this.residue.Cantidad ?? 0, this.residue.Peso ?? 0, this.residue.Volumen ?? 0),
        };
        await this.tareasService.create(actividad.IdActividad, tarea);
      }
      this.residue.IdEstado = Estado.Inactivo;
      this.residue.IdDeposito = this.pointId;
      await this.inventarioService.updateResiduo(this.residue);
    } else {

    }
    this.modalCtrl.dismiss({ActivityId: actividad?.IdActividad });
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  changeService(serviceId: string) {
    this.serviceId = serviceId;
  }

  dateTimeChanged(event: any) {
    this.date = event.detail.value;
  }

  async selectPoint() {
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
