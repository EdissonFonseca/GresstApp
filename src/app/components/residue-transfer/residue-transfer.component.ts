import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { StakeholdersComponent } from '../stakeholders/stakeholders.component';
import { PointsComponent } from '../points/points.component';
import { CRUDOperacion, EntradaSalida, Estado, TipoServicio } from '@app/constants/constants';
import { Material } from 'src/app/interfaces/material.interface';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { TasksService } from '@app/services/transactions/tasks.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { PointsService } from '@app/services/masterdata/points.service';
import { Utils } from '@app/utils/utils';

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
    private activitiesService: ActivitiesService,
    private transactionsService: TransactionsService,
    private tasksService: TasksService,
    private materialsService: MaterialsService,
    private pointsService: PointsService,
    private inventoryService: InventoryService
  ) {
    this.residueId = this.navParams.get("ResidueId");
  }

  async ngOnInit() {
    this.residue = await this.inventoryService.getResiduo(this.residueId);
    if (!this.residue) return;

    this.unidadCantidad = Utils.unidadCantidad;
    this.unidadPeso = Utils.unidadPeso;
    this.unidadVolumen = Utils.unidadPeso;

    this.material = await this.materialsService.get(this.residue.IdMaterial);
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
      const punto = await this.pointsService.get(this.residue.IdDeposito ?? '');
      if (this.serviceId == TipoServicio.Entrega){
        actividad = await this.activitiesService.getByServicio(TipoServicio.Entrega, this.residue.IdDeposito ?? '');
        if (!actividad) {
          if (punto){
            actividad = {IdActividad: Utils.generateId(), IdServicio: TipoServicio.Entrega, IdRecurso: this.residue.IdDeposito ?? '', Titulo: punto.Nombre, CRUD: CRUDOperacion.Create, IdEstado: Estado.Pendiente, NavegarPorTransaccion: false, FechaInicial: isoDate, FechaOrden: isoToday};
            await this.activitiesService.create(actividad);
          }
        }
        if (actividad){
          transaccion = await this.transactionsService.getByTercero(actividad.IdActividad, this.stakeholderId);
          if (!transaccion) {
            transaccion = {
              IdActividad: actividad.IdActividad,
              IdTransaccion: Utils.generateId(),

              IdEstado: Estado.Pendiente,
              EntradaSalida: EntradaSalida.Salida,
              IdRecurso: actividad.IdRecurso,
              IdServicio: actividad.IdServicio,
              IdTercero: this.stakeholderId,
              CRUD: CRUDOperacion.Create,
              Titulo: '' // TODO
            };
            await this.transactionsService.create(transaccion);
          }
        }
      } else {
        actividad = await this.activitiesService.getByServicio(TipoServicio.Transporte, this.residue.IdVehiculo ?? '');
        if (!actividad){
          actividad = {IdActividad: Utils.generateId(), IdServicio: TipoServicio.Transporte, IdRecurso: this.vehicleId ?? '', Titulo: this.vehicleId, CRUD: CRUDOperacion.Create, IdEstado: Estado.Pendiente, NavegarPorTransaccion: false, FechaInicial: isoDate, FechaOrden: isoToday};
          actividad.CRUD = CRUDOperacion.Create;
          await this.activitiesService.create(actividad);
        }
        if (actividad){
          transaccion = await this.transactionsService.getByTercero(actividad.IdActividad, this.stakeholderId);
          if (!transaccion) {
            transaccion = {
              IdActividad: actividad.IdActividad,
              IdTransaccion: Utils.generateId(),

              IdEstado: Estado.Pendiente,
              EntradaSalida: EntradaSalida.Entrada,
              IdTercero: this.stakeholderId,
              IdDeposito: this.pointId,
              IdRecurso: actividad.IdRecurso,
              IdServicio: actividad.IdServicio,
              CRUD: CRUDOperacion.Create,
              Titulo: '' // TODO
            };
            await this.transactionsService.create(transaccion);
          }
        }
      }
      if (actividad) {
        const tarea: Tarea = {
          IdActividad: actividad.IdActividad,
          IdTransaccion: transaccion?.IdTransaccion,
          IdTarea: Utils.generateId(),

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
        };
        await this.tasksService.create(tarea);
      }
      this.residue.IdEstado = Estado.Inactivo;
      this.residue.IdDeposito = this.pointId;
      await this.inventoryService.updateResiduo(this.residue);
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
