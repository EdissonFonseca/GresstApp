import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { THIRD_PARTY_TYPES, CRUD_OPERATIONS, INPUT_OUTPUT, STATUS, MEASUREMENTS, SERVICE_TYPES } from '@app/constants/constants';
import { PackagesComponent } from '../packages/packages.component';
import { MaterialsComponent } from '../materials/materials.component';
import { PointsComponent } from '../points/points.component';
import { ResiduesComponent } from '../residues/residues.component';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { TreatmentsComponent } from '../treatments/treatments.component';
import { TasksService } from '@app/services/transactions/tasks.service';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { Utils } from '@app/utils/utils';
import { UserNotificationService } from '@app/services/core/user-notification.service';
@Component({
  selector: 'app-task-add',
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.scss'],
})
export class TaskAddComponent implements OnInit {
  @Input() idActividad: string = '';
  @Input() idTransaccion: string = '';

  formData: FormGroup;
  captura: string = '';
  colorReceive: string = 'primary';
  colorSend: string = 'medium';
  embalaje: string = '';
  factor: number | null = null;
  idDeposito: string = '';
  idEmbalaje: string = '';
  idMaterial: string = '';
  idPuntoEntrada: string = '';
  idPuntoSalida: string = '';
  idResiduo: string = '';
  idTratamiento: string = '';
  idVehiculo: string = '';
  material: string = '';
  medicion: string = '';
  proceso: string = '';
  propietario: string = '';
  puntoEntrada : string = '';
  puntoSalida : string = '';
  residuo: string = '';
  idTerceroEntrada: string ='';
  terceroEntrada: string = '';
  idTerceroSalida: string ='';
  terceroSalida: string = '';
  solicitarPunto: boolean = false;
  solicitarPropietario: boolean = false;
  solicitarEmbalaje: boolean = false;
  solicitarTratamiento: boolean = false;
  tratamiento: string = '';
  unidadCantidad: string = '';
  unidadPeso: string = 'kg';
  unidadVolumen: string = '';
  fotos: string[] = [];
  imageUrl: string = '';
  fotosPorMaterial: number = 2;

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private activitiesService: ActivitiesService,
    private transactionsService: TransactionsService,
    private tasksService: TasksService,
    private inventoryService: InventoryService,
    private userNotificationService: UserNotificationService
  ) {
    this.formData = this.formBuilder.group({
      Cantidad: [],
      CantidadEmbalaje: [],
      Foto: [],
      IdEmbalaje: [],
      Observaciones: [],
      Peso: [],
      Precio: [],
      Volumen: [],
    });
  }

  async ngOnInit() {
    this.unidadCantidad = Utils.quantityUnit ?? '';
    this.unidadPeso = Utils.weightUnit ?? '';
    this.unidadVolumen = Utils.volumeUnit ?? '';
    this.fotosPorMaterial = Utils.photosByMaterial ?? 2;

    const actividad = await this.activitiesService.get(this.idActividad);
    if (actividad)
    {
      this.proceso = Utils.getServiceName(actividad.IdServicio);
      if (actividad.IdServicio == SERVICE_TYPES.COLLECTION || actividad.IdServicio == SERVICE_TYPES.TRANSPORT) {
        this.solicitarEmbalaje = true;
        this.idVehiculo = actividad.IdRecurso ?? '';
        if (this.idTransaccion)
        {
          const transaccion = await this.transactionsService.get(this.idActividad, this.idTransaccion);
          if (!transaccion){
            this.solicitarPunto = true;
          } else {
            this.idPuntoEntrada = transaccion.IdDeposito ?? '';
            this.idTerceroEntrada = transaccion.IdTercero ?? '';
          }
        } else {
          this.solicitarPunto = true;
        }
      } else if (actividad.IdServicio == SERVICE_TYPES.RECEPTION) {
        this.solicitarPropietario = true;
      }
    }
  }

  calculateFromCantidad(event:any){
    const enteredValue = (event.target as HTMLInputElement).value;
    const resultValue = Number(enteredValue) * (this.factor ?? 1);

    if (this.medicion == MEASUREMENTS.WEIGHT)
      this.formData.patchValue({Peso: resultValue});
    else if (this.medicion == MEASUREMENTS.VOLUME)
      this.formData.patchValue({Volumen: resultValue});
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
        this.captura = data.data.capture;
        this.medicion = data.data.measure;
        this.factor = data.data.factor;
      }
    });

    console.log(this.medicion);
    console.log(this.captura);

    await modal.present();
   }

   async selectPuntoRecoleccion() {
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        tipoTercero: THIRD_PARTY_TYPES.CLIENT,
        includeMe: false,
      },
    });
    await modal.present();

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idPuntoEntrada  = data.data.id;
        this.puntoEntrada = data.data.name;
        this.idTerceroEntrada = data.data.owner;
        this.terceroEntrada = data.data.ownerName;
      }
    });
  }

  async selectPuntoEntrega() {
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        tipoTercero: THIRD_PARTY_TYPES.SUPPLIER,
        includeMe: true,
      },
    });
    await modal.present();

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idPuntoSalida  = data.data.id;
        this.puntoSalida = data.data.name;
        this.idTerceroSalida = data.data.owner;
        this.terceroSalida = data.data.ownerName;
      }
    });
  }

  async selectResiduo() {
    const modal =   await this.modalCtrl.create({
      component: ResiduesComponent,
      componentProps: {
      },
    });
    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idResiduo = data.data.id;
        this.residuo = data.data.name;
      }
    });

    return await modal.present();
   }

   async selectTratamiento() {
    const modal =   await this.modalCtrl.create({
      component: TreatmentsComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idTratamiento = data.data.id;
        this.tratamiento = data.data.name;
      }
    });

    return await modal.present();
   }

   async takePhoto() {
    try {
      const image = await Camera.getPhoto({
        quality: 90,
        allowEditing: false,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
      });

      if (image.base64String) {
        const base64Image = `data:image/jpeg;base64,${image.base64String}`;
        this.fotos.push(base64Image);
      } else {
        console.error('No se recibió una cadena Base64 de la imagen.');
      }
    } catch (error) {
      console.error('Error al tomar la foto:', error);
    }
  }

  deletePhoto(index: number) {
    this.fotos.splice(index, 1);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  async submit() {
    const actividad = await this.activitiesService.get(this.idActividad);
    if (!actividad) {
      this.userNotificationService.showToast('No se encontró la actividad','middle');
      return;
    }

    let tarea: Tarea | undefined = undefined;
    let idTransaccion: string | null = null;
    let idResiduo: string | null = null;
    const now = new Date();
    const isoDate = now.toISOString();
    let fecha: string = isoDate;

    if (!this.formData.valid) return;

    idTransaccion = this.idTransaccion;
    const data = this.formData.value;
    if (actividad.IdServicio == SERVICE_TYPES.COLLECTION || actividad.IdServicio == SERVICE_TYPES.TRANSPORT || actividad.IdServicio === SERVICE_TYPES.RECEPTION){
      const residuo: Residuo = {
        IdResiduo: Utils.generateId(),
        IdMaterial: this.idMaterial,
        IdPropietario: this.idTerceroEntrada,
        IdDepositoOrigen: this.idPuntoEntrada,
        Aprovechable: true, //TODO
        Cantidad: data.Cantidad,
        Peso: data.Peso,
        Volumen: data.Volumen,
        IdEmbalaje: data.IdEmbalaje,
        CantidadEmbalaje: data.Cantidad,
        IdEstado: STATUS.ACTIVE,
        Propietario: this.propietario,
        Material: this.material,
        DepositoOrigen: this.puntoEntrada,
        EntradaSalida: INPUT_OUTPUT.INPUT,
        IdDeposito: actividad.IdServicio == SERVICE_TYPES.RECEPTION? actividad.IdRecurso : '',
        IdRuta: actividad.IdServicio == SERVICE_TYPES.COLLECTION? actividad.IdRecurso : '',
        IdVehiculo: actividad.IdServicio == SERVICE_TYPES.TRANSPORT? actividad.IdRecurso : '',
        Imagen: this.imageUrl,
        Ubicacion: '' //TODO
      };
      await this.inventoryService.createResidue(residuo);
      idResiduo = residuo.IdResiduo;

      if (!this.idTransaccion) {
        if (actividad.IdServicio === SERVICE_TYPES.COLLECTION || actividad.IdServicio == SERVICE_TYPES.TRANSPORT){
          const transaccionActual = await this.transactionsService.getByPoint(this.idActividad, this.idPuntoEntrada);
          if (!transaccionActual) {
            const transaccion: Transaccion = {
              IdActividad: this.idActividad,
              IdTransaccion: Utils.generateId(),

              IdEstado: STATUS.PENDING,
              EntradaSalida: INPUT_OUTPUT.INPUT,
              IdTercero: this.idTerceroEntrada,
              IdDeposito: this.idPuntoEntrada,
              IdDepositoDestino: this.idPuntoSalida,
              IdTerceroDestino: this.idTerceroSalida,
              IdOrden: actividad.IdOrden,
              Punto: this.puntoEntrada,
              Tercero: this.terceroEntrada,
              Titulo: 'Nueva - ' + (this.puntoEntrada ?? '') + (this.terceroEntrada ?? ''),
              Solicitudes: 'Nueva',
              Icono: 'location',
              IdRecurso: actividad.IdRecurso,
              IdServicio: actividad.IdServicio,
              FechaInicial: isoDate,
              FechaFinal: isoDate,
              Accion: Utils.getInputOutputAction(INPUT_OUTPUT.TRANSFERENCE),
            };
            fecha = isoDate;
            await this.transactionsService.create(transaccion);
            idTransaccion = transaccion.IdTransaccion;
          } else {
            if (transaccionActual.IdEstado == STATUS.PENDING) {
              await this.transactionsService.update(transaccionActual);
              idTransaccion = transaccionActual.IdTransaccion;
              fecha = transaccionActual.FechaInicial ?? isoDate;
            } else {
              this.userNotificationService.showToast('Ya se ha agregado y aprobado/rechazado una transaccion en este punto. No se puede volver a crear','middle');
              return;
            }
          }
        } else if (actividad.IdServicio == SERVICE_TYPES.RECEPTION) {
          const transaccionActual = await this.transactionsService.getByThirdParty(this.idActividad, this.idTerceroEntrada);
          if (!transaccionActual) {
            const transaccion: Transaccion = {
              IdActividad: this.idActividad,
              IdTransaccion: Utils.generateId(),

              IdEstado: STATUS.PENDING,
              EntradaSalida: INPUT_OUTPUT.INPUT,
              IdOrden: actividad.IdOrden,
              IdTercero: this.idTerceroEntrada,
              IdRecurso: actividad.IdRecurso,
              IdServicio: actividad.IdServicio,
              IdDeposito: this.idPuntoEntrada,
              IdDepositoDestino: this.idPuntoSalida,
              IdTerceroDestino: this.idTerceroSalida,
              Titulo: this.propietario,
              Icono: 'person',
              Accion: Utils.getInputOutputAction(INPUT_OUTPUT.TRANSFERENCE),
            };
            await this.transactionsService.create(transaccion);
            idTransaccion = transaccion.IdTransaccion;
            fecha = isoDate;
          } else {
            await this.transactionsService.update(transaccionActual);
            idTransaccion = transaccionActual.IdTransaccion;
            fecha = transaccionActual.FechaInicial ?? isoDate;
          }
        }
      } else {
        idTransaccion = this.idTransaccion;
      }
    } else {
      idResiduo = '';
    }
    if (idResiduo != null)
    {
      tarea = {
        IdActividad: this.idActividad,
        IdTransaccion: idTransaccion,
        IdTarea: Utils.generateId(),

        IdMaterial: this.idMaterial,
        Material : this.material,
        IdResiduo: idResiduo,
        IdDeposito: this.idPuntoEntrada,
        IdTercero: this.idTerceroEntrada,
        IdDepositoDestino: this.idPuntoSalida,
        IdTerceroDestino: this.idTerceroSalida,
        Accion: 'Ver',
        EntradaSalida: INPUT_OUTPUT.INPUT,
        IdServicio: actividad.IdServicio,
        IdEstado: STATUS.APPROVED,
        IdRecurso: actividad.IdRecurso,
        FechaEjecucion: isoDate,
        FechaSolicitud: isoDate,
        Cantidad: data.Cantidad,
        Peso: data.Peso,
        Volumen: data.Volumen,
        IdEmbalaje: data.IdEmbalaje,
        FechaProgramada: fecha,
        Fotos: this.fotos,
      };
      await this.tasksService.create(tarea);
    }
    this.modalCtrl.dismiss(tarea);
  }
}
