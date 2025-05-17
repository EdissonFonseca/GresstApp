import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { MaterialsComponent } from '../materials/materials.component';
import { PackagesComponent } from '../packages/packages.component';
import { StakeholdersComponent } from '../stakeholders/stakeholders.component';
import { PointsComponent } from '../points/points.component';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { INPUT_OUTPUT, STATUS, SERVICE_TYPES } from '@app/constants/constants';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TasksService } from '@app/services/transactions/tasks.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { CRUD_OPERATIONS } from '@app/constants/constants';
import { Utils } from '@app/utils/utils';

@Component({
  selector: 'app-residue-receive',
  templateUrl: './residue-receive.component.html',
  styleUrls: ['./residue-receive.component.scss'],
})
export class ResidueReceiveComponent implements OnInit {
  formData: FormGroup;
  photo!: SafeResourceUrl;
  fecha: Date | null = null;
  idEmbalaje: string = '';
  idPropietario!: string;
  idPuntoRecepcion!: string;
  idPuntoRecoleccion!: string;
  idMaterial!: string;
  idVehiculo!: string;
  embalaje: string = '';
  propietario!: string;
  puntoRecepcion!: string;
  puntoRecoleccion!: string;
  material!: string;
  medicion:string = '';
  vehiculo!: string;
  residue: Residuo | undefined = undefined;
  serviceId: string = '';
  showDetails: boolean = false;
  showReceive: boolean = true;
  showTransport: boolean = true;
  showCollect: boolean = true;
  showProduce: boolean = true;

  constructor (
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private activitiesService: ActivitiesService,
    private transactionsService: TransactionsService,
    private tasksService: TasksService,
    private inventoryService: InventoryService
  ) {
    this.formData = this.formBuilder.group({
      Cantidad: [],
      CantidadEmbalaje: [],
      Peso: ['', Validators.required],
      Valor: [],
      Observaciones: [],
      Foto: [],
    });
  }

  async ngOnInit() {
    this.showTransport = await Utils.allowService(SERVICE_TYPES.TRANSPORT);
    this.showCollect = await Utils.allowService(SERVICE_TYPES.RELOCATION);
    this.showProduce = await Utils.allowService(SERVICE_TYPES.GENERATION);
    this.showReceive = await Utils.allowService(SERVICE_TYPES.RECEPTION);
  }

  async confirm() {
    if (!this.formData.valid) return;

    let actividad: Actividad | undefined;
    let transaccion: Transaccion | undefined;
    let tarea: Tarea;
    let idRecurso: string = '';
    let titulo: string = '';
    let idTransaccion: string = '';
    let entradaSalida: string = INPUT_OUTPUT.TRANSFERENCE;
    let estaEnJornada: boolean = true;
    const data = this.formData.value;
    const now = new Date();
    const isoDate = now.toISOString();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isoToday = today.toISOString();

    if (this.fecha == null){
      this.fecha = new Date();
    }

    if (this.serviceId == SERVICE_TYPES.GENERATION)
      this.idPropietario = await Utils.getPersonId() ?? '';
    if (this.serviceId == SERVICE_TYPES.RECEPTION || this.serviceId == SERVICE_TYPES.GENERATION)
      this.idPuntoRecoleccion = this.idPuntoRecepcion;

    const residuo: Residuo = {
      IdResiduo: Utils.generateId(),
      IdMaterial: this.idMaterial,
      IdPropietario: this.idPropietario,
      IdDeposito: this.idPuntoRecepcion,
      IdVehiculo: this.idVehiculo,
      IdDepositoOrigen: this.idPuntoRecoleccion,
      Aprovechable: true,
      Cantidad: data.Cantidad,
      Peso: data.Peso,
      IdEmbalaje: this.idEmbalaje,
      CantidadEmbalaje: data.CantidadEmbalaje,
      IdEstado: STATUS.ACTIVE,
      Material: this.material,
      Ubicacion: '',
      Volumen: data.Volumen,
    };

    await this.inventoryService.createResiduo(residuo);

    if (this.serviceId == SERVICE_TYPES.GENERATION) {
      actividad = {
        IdActividad: Utils.generateId(),
        IdServicio: this.serviceId,
        IdRecurso: this.idPuntoRecoleccion,
        Titulo: this.puntoRecoleccion,
        CRUD: CRUD_OPERATIONS.CREATE,
        IdEstado: STATUS.PENDING,
        NavegarPorTransaccion: false,
        FechaInicial: isoDate,
        FechaOrden: isoToday
      };
      await this.activitiesService.create(actividad);
    }

    if (actividad) {
      estaEnJornada = Utils.verifyWorkDay(today ?? null, today, this.fecha);
      if (estaEnJornada) {
        const tarea: Tarea = {
          IdTarea: Utils.generateId(),
          IdActividad: actividad.IdActividad,
          IdMaterial: this.idMaterial,
          IdResiduo: residuo.IdResiduo,
          IdDeposito: this.idPuntoRecepcion,
          IdTercero: this.idPropietario,
          IdEstado: STATUS.APPROVED,
          IdRecurso: actividad.IdRecurso,
          FechaEjecucion: isoDate,
          CRUD: CRUD_OPERATIONS.CREATE,
          EntradaSalida: INPUT_OUTPUT.INPUT,
          Cantidad: data.Cantidad,
          Peso: data.Peso,
          Volumen: data.Volumen,
          IdServicio: actividad.IdServicio,
          Fotos: [],
        };
        await this.tasksService.create(tarea);
      } else {
        const transaccion: Transaccion = {
          IdTransaccion: Utils.generateId(),
          IdActividad: actividad.IdActividad,
          //IdMaterial: this.idMaterial,
          //IdResiduo: residuo.IdResiduo,
          //IdDeposito: this.idPuntoRecepcion,
          //IdTercero: this.idPropietario,
          //IdTransaccion: Utils.newId(),
          //IdActividad: actividad.IdActividad,
          //IdDeposito: this.idPuntoRecepcion,
          //IdTercero: this.idPropietario,
          IdEstado: STATUS.PENDING,
          IdRecurso: actividad.IdRecurso,
          //FechaEjecucion: isoDate,
          CRUD: CRUD_OPERATIONS.CREATE,
          EntradaSalida: INPUT_OUTPUT.INPUT,
          //Cantidad: data.Cantidad,
          //Peso: data.Peso,
          //Volumen: data.Volumen,
          IdServicio: actividad.IdServicio,
          //Fotos: [],
          Titulo: this.puntoRecepcion,
        };
        await this.transactionsService.create(transaccion);
      }
    }

    if (this.serviceId == SERVICE_TYPES.TRANSPORT) {
      actividad = {
        IdActividad: Utils.generateId(),
        IdServicio: SERVICE_TYPES.TRANSPORT,
        IdRecurso: this.idVehiculo ?? '',
        Titulo: this.vehiculo,
        CRUD: CRUD_OPERATIONS.CREATE,
        IdEstado: STATUS.PENDING,
        NavegarPorTransaccion: false,
        FechaInicial: isoDate,
        FechaOrden: isoToday
      };
      await this.activitiesService.create(actividad);

      const transaccion: Transaccion = {
        IdTransaccion: Utils.generateId(),
        IdActividad: actividad.IdActividad,
        //IdMaterial: this.idMaterial,
        //IdResiduo: residuo.IdResiduo,
        //IdDeposito: this.idPuntoRecepcion,
        //IdTercero: this.idPropietario,
          IdEstado: STATUS.PENDING,
        IdRecurso: actividad.IdRecurso,
        //FechaEjecucion: isoDate,
        CRUD: CRUD_OPERATIONS.CREATE,
        EntradaSalida: INPUT_OUTPUT.INPUT,
        //Cantidad: data.Cantidad,
        //Peso: data.Peso,
        //Volumen: data.Volumen,
        IdServicio: actividad.IdServicio,
        //Fotos: [],
        Titulo: this.vehiculo,
      };
      await this.transactionsService.create(transaccion);
    }

    this.modalCtrl.dismiss({ActivityId: actividad?.IdActividad});
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  changeService(serviceId: string) {
    this.serviceId = serviceId;
   }

   dateTimeChanged(event: any) {
    this.fecha = event.detail.value;
  }

  async selectEmbalaje() {
    const modal =   await this.modalCtrl.create({
      component: PackagesComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idEmbalaje = data.data.id;
        this.embalaje = data.data.name;
      }
    });

    return await modal.present();
   }

   async selectMaterial() {
    const modal =   await this.modalCtrl.create({
      component: MaterialsComponent,
      componentProps: {
      },
    });
    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idMaterial = data.data.id;
        this.material = data.data.name;
        this.medicion = data.data.unit;
      }
    });

    return await modal.present();
   }

   async selectPuntoRecepcion() {
    const idPersona = await Utils.getPersonId();

    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        IdTercero: idPersona
      },
    });

    await modal.present();

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idPuntoRecepcion = data.data.id;
        this.puntoRecepcion = data.data.name;
      }
    });
   }

   async selectPuntoRecoleccion() {
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        IdTercero: '',
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idPuntoRecoleccion = data.data.id;
        this.puntoRecoleccion = data.data.name;
        this.idPropietario = data.data.owner;
      }
    });

    return await modal.present();
   }

   async selectPropietario() {
    const modal =   await this.modalCtrl.create({
      component: StakeholdersComponent,
      componentProps: {
        IdTercero: ''
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idPropietario = data.data.id;
        this.propietario = data.data.name;
      }
    });

    return await modal.present();
   }

   async selectVehiculo() {
    const modal =   await this.modalCtrl.create({
      component: VehiclesComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idVehiculo = data.data.id;
        this.vehiculo = data.data.name;

        this.formData.patchValue({
          VehicleId: data.data.id
        });
      }
    });

    return await modal.present();
   }

   async takePhoto() {
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: true,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });
    this.photo = this.sanitizer.bypassSecurityTrustResourceUrl(image.webPath || '');
  };

  toggleShowDetails() {
    this.showDetails = !this.showDetails;
  }
}
