import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { StakeholdersComponent } from '../stakeholders/stakeholders.component';
import { PointsComponent } from '../points/points.component';
import { CRUD_OPERATIONS, INPUT_OUTPUT, STATUS, SERVICE_TYPES } from '@app/constants/constants';
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

    this.unidadCantidad = Utils.quantityUnit;
    this.unidadPeso = Utils.weightUnit;
    this.unidadVolumen = Utils.volumeUnit;

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

    if (this.serviceId == SERVICE_TYPES.DELIVERY || this.serviceId == SERVICE_TYPES.TRANSPORT) {
      const punto = await this.pointsService.get(this.residue.IdDeposito ?? '');
      if (this.serviceId == SERVICE_TYPES.DELIVERY){
        actividad = await this.activitiesService.getByServicio(SERVICE_TYPES.DELIVERY, this.residue.IdDeposito ?? '');
        if (!actividad) {
          if (punto){
            actividad = {IdActividad: Utils.generateId(), IdServicio: SERVICE_TYPES.DELIVERY, IdRecurso: this.residue.IdDeposito ?? '', Titulo: punto.Nombre, CRUD: CRUD_OPERATIONS.CREATE, IdEstado: STATUS.PENDING, NavegarPorTransaccion: false, FechaInicial: isoDate, FechaOrden: isoToday};
            await this.activitiesService.create(actividad);
          }
        }
        if (actividad){
          transaccion = await this.transactionsService.getByTercero(actividad.IdActividad, this.stakeholderId);
          if (!transaccion) {
            transaccion = {
              IdActividad: actividad.IdActividad,
              IdTransaccion: Utils.generateId(),

              IdEstado: STATUS.PENDING,
              EntradaSalida: INPUT_OUTPUT.OUTPUT,
              IdRecurso: actividad.IdRecurso,
              IdServicio: actividad.IdServicio,
              IdTercero: this.stakeholderId,
              CRUD: CRUD_OPERATIONS.CREATE,
              Titulo: '' // TODO
            };
            await this.transactionsService.create(transaccion);
          }
        }
      } else {
        actividad = await this.activitiesService.getByServicio(SERVICE_TYPES.TRANSPORT, this.residue.IdVehiculo ?? '');
        if (!actividad){
          actividad = {IdActividad: Utils.generateId(), IdServicio: SERVICE_TYPES.TRANSPORT, IdRecurso: this.vehicleId ?? '', Titulo: this.vehicleId, CRUD: CRUD_OPERATIONS.CREATE, IdEstado: STATUS.PENDING, NavegarPorTransaccion: false, FechaInicial: isoDate, FechaOrden: isoToday};
          actividad.CRUD = CRUD_OPERATIONS.CREATE;
          await this.activitiesService.create(actividad);
        }
        if (actividad){
          transaccion = await this.transactionsService.getByTercero(actividad.IdActividad, this.stakeholderId);
          if (!transaccion) {
            transaccion = {
              IdActividad: actividad.IdActividad,
              IdTransaccion: Utils.generateId(),

              IdEstado: STATUS.PENDING,
              EntradaSalida: INPUT_OUTPUT.INPUT,
              IdTercero: this.stakeholderId,
              IdDeposito: this.pointId,
              IdRecurso: actividad.IdRecurso,
              IdServicio: actividad.IdServicio,
              CRUD: CRUD_OPERATIONS.CREATE,
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
          IdEstado: STATUS.APPROVED,
          CRUD: CRUD_OPERATIONS.CREATE,
          EntradaSalida: INPUT_OUTPUT.OUTPUT,
          Cantidad: this.residue.Cantidad,
          Peso: this.residue.Peso,
          Volumen: this.residue.Volumen,
          Fotos: [],
        };
        await this.tasksService.create(tarea);
      }
      this.residue.IdEstado = STATUS.INACTIVE;
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
