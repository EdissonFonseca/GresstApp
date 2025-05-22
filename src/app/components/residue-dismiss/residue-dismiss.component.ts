import { Component, OnInit } from '@angular/core';
import { IonicModule, ModalController, NavParams } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CRUD_OPERATIONS, INPUT_OUTPUT, STATUS } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';
import { PointsComponent } from '../points/points.component';
import { TreatmentsComponent } from '../treatments/treatments.component';
import { Material } from 'src/app/interfaces/material.interface';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TasksService } from '@app/services/transactions/tasks.service';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
@Component({
  selector: 'app-residue-dismiss',
  templateUrl: './residue-dismiss.component.html',
  styleUrls: ['./residue-dismiss.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule
  ]
})
export class ResidueDismissComponent implements OnInit {
  colorDismiss: string = 'primary';
  colorDispose: string = 'medium';
  colorStore: string = 'medium';
  date: Date | null = null;
  material: Material | undefined = undefined;
  serviceId: string = '';
  point: string = '';
  pointId: string = '';
  residue: Residuo | undefined;
  residueId: string;
  stakeholderId: string = '';
  treatment: string = '';
  treatmentId: string = '';
  unidadCantidad: string = 'un';
  unidadPeso: string = 'kg';
  unidadVolumen: string = 'lt';

  constructor(
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private activitiesService: ActivitiesService,
    private tasksService: TasksService,
    private inventoryService: InventoryService,
    private materialsService: MaterialsService,
    private authorizationService: AuthorizationService,
    private userNotificationService: UserNotificationService
  ) {
    this.residueId = this.navParams.get("ResidueId") || '';
  }

  async ngOnInit() {
    try {
      this.residue = await this.inventoryService.getResiduo(this.residueId);
      if (!this.residue) {
        this.userNotificationService.showToast('No se encontró el residuo', 'top');
        this.cancel();
        return;
      }

      this.unidadCantidad = Utils.quantityUnit;
      this.unidadPeso = Utils.weightUnit;
      this.unidadVolumen = Utils.volumeUnit;
      this.material = await this.materialsService.get(this.residue.IdMaterial);
    } catch (error) {
      console.error('Error initializing component:', error);
      this.userNotificationService.showToast('Error al cargar los datos del residuo', 'top');
      this.cancel();
    }
  }

  async confirm() {
    try {
      if (!this.residue) {
        this.userNotificationService.showToast('No hay residuo seleccionado', 'top');
        return;
      }

      if (!this.date) {
        this.userNotificationService.showToast('Debe seleccionar una fecha', 'top');
        return;
      }

      if (!this.pointId) {
        this.userNotificationService.showToast('Debe seleccionar un punto', 'top');
        return;
      }

      let actividad: Actividad | undefined = undefined;
      const now = new Date();
      const isoDate = now.toISOString();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const isoToday = today.toISOString();

      const personId = await this.authorizationService.getPersonId();
      actividad = await this.activitiesService.getByServicio(this.serviceId, this.pointId);

      if (!actividad) {
        actividad = {
          IdActividad: Utils.generateId(),
          IdServicio: this.serviceId,
          IdRecurso: this.pointId,
          Titulo: this.point,
          IdEstado: STATUS.PENDING,
          NavegarPorTransaccion: false,
          FechaInicial: isoDate,
          FechaOrden: isoToday
        };
        await this.activitiesService.create(actividad);
      }

      if (actividad) {
        const tarea: Tarea = {
          IdTarea: Utils.generateId(),
          IdActividad: actividad.IdActividad,
          IdMaterial: this.residue.IdMaterial,
          IdResiduo: this.residue.IdResiduo,
          IdDeposito: this.pointId,
          IdTercero: this.stakeholderId,
          IdEstado: STATUS.APPROVED,
          IdRecurso: actividad.IdRecurso,
          FechaEjecucion: isoDate,
          EntradaSalida: INPUT_OUTPUT.OUTPUT,
          Cantidad: this.residue.Cantidad,
          Peso: this.residue.Peso,
          Volumen: this.residue.Volumen,
          IdServicio: actividad.IdServicio,
          Fotos: []
        };
        await this.tasksService.create(tarea);
      }

      this.residue.IdEstado = STATUS.INACTIVE;
      this.residue.IdDeposito = this.pointId;
      await this.inventoryService.updateResiduo(this.residue);
      this.modalCtrl.dismiss({ ActivityId: actividad?.IdActividad });
    } catch (error) {
      console.error('Error confirming residue dismiss:', error);
      this.userNotificationService.showToast('Error al procesar la solicitud', 'top');
    }
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  changeService(serviceId: string) {
    this.serviceId = serviceId;
    this.point = '';
    this.pointId = '';
    this.treatment = '';
    this.treatmentId = '';
  }

  dateTimeChanged(event: any) {
    this.date = event.detail.value;
  }

  async selectPlant() {
    try {
      const idTercero = await this.authorizationService.getPersonId();
      const modal = await this.modalCtrl.create({
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
    } catch (error) {
      console.error('Error selecting plant:', error);
      this.userNotificationService.showToast('Error al seleccionar la planta', 'top');
    }
  }

  async selectStore() {
    try {
      const idTercero = await this.authorizationService.getPersonId();
      const modal = await this.modalCtrl.create({
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
    } catch (error) {
      console.error('Error selecting store:', error);
      this.userNotificationService.showToast('Error al seleccionar el almacén', 'top');
    }
  }

  async selectTreatment() {
    try {
      const idTercero = await this.authorizationService.getPersonId();
      const modal = await this.modalCtrl.create({
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
    } catch (error) {
      console.error('Error selecting treatment:', error);
      this.userNotificationService.showToast('Error al seleccionar el tratamiento', 'top');
    }
  }
}
