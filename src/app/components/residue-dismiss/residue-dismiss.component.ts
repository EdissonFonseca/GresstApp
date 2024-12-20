import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { CRUDOperacion, EntradaSalida, Estado, TipoServicio } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { PointsComponent } from '../points/points.component';
import { TreatmentsComponent } from '../treatments/treatments.component';
import { Material } from 'src/app/interfaces/material.interface';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { ActividadesService } from 'src/app/services/actividades.service';
import { TareasService } from 'src/app/services/tareas.service';
import { InventarioService } from 'src/app/services/inventario.service';
import { MaterialesService } from 'src/app/services/materiales.service';

@Component({
  selector: 'app-residue-dismiss',
  templateUrl: './residue-dismiss.component.html',
  styleUrls: ['./residue-dismiss.component.scss'],
})
export class ResidueDismissComponent  implements OnInit {
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
    private globales: GlobalesService,
    private actividadesService: ActividadesService,
    private tareasService: TareasService,
    private inventarioService: InventarioService,
    private materialesService: MaterialesService,
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
    const now = new Date();
    const isoDate = now.toISOString();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isoToday = today.toISOString();

    if (!this.residue) return;

    const personId = await this.globales.getIdPersona();
    actividad = await this.actividadesService.getByServicio(this.serviceId, this.pointId);
    if (!actividad) {
      actividad = {IdActividad: this.globales.newId(), IdServicio: this.serviceId, IdRecurso: this.pointId, Titulo: this.point, CRUD: CRUDOperacion.Create, IdEstado: Estado.Pendiente, NavegarPorTransaccion: false, FechaInicial: isoDate, FechaOrden: isoToday};
      await this.actividadesService.create(actividad);
    }
    if (actividad) {
      const tarea: Tarea = {
          IdTarea: this.globales.newId(),
          IdActividad: actividad.IdActividad,

          IdMaterial: this.residue.IdMaterial,
          IdResiduo: this.residue.IdResiduo,
          IdDeposito: this.pointId,
          IdTercero: this.stakeholderId,
          IdEstado: Estado.Aprobado,
          IdRecurso: actividad.IdRecurso,
          FechaEjecucion: isoDate,
          CRUD: CRUDOperacion.Create,
          EntradaSalida: EntradaSalida.Salida,
          Cantidad: this.residue.Cantidad,
          Peso: this.residue.Peso,
          Volumen: this.residue.Volumen,
          IdServicio: actividad.IdServicio,
          Fotos: [],
        };
      await this.tareasService.create(tarea);
    }
    this.residue.IdEstado = Estado.Inactivo;
    this.residue.IdDeposito = this.pointId;
    await this.inventarioService.updateResiduo(this.residue);
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
