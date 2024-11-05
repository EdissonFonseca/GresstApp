import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { GlobalesService } from 'src/app/services/globales.service';
import { MaterialsComponent } from '../materials/materials.component';
import { PackagesComponent } from '../packages/packages.component';
import { StakeholdersComponent } from '../stakeholders/stakeholders.component';
import { PointsComponent } from '../points/points.component';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { EntradaSalida, Estado, TipoServicio } from 'src/app/services/constants.service';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { ActividadesService } from 'src/app/services/actividades.service';
import { TareasService } from 'src/app/services/tareas.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { InventarioService } from 'src/app/services/inventario.service';

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
    private globales: GlobalesService,
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer,
    private actividadesService: ActividadesService,
    private transaccionesService: TransaccionesService,
    private tareasService: TareasService,
    private inventarioService: InventarioService
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
    this.showTransport = await this.globales.allowServicio(TipoServicio.Transporte);
    this.showCollect = await this.globales.allowServicio(TipoServicio.Recoleccion);
    this.showProduce = await this.globales.allowServicio(TipoServicio.Generacion);
    this.showReceive = await this.globales.allowServicio(TipoServicio.Recepcion);
  }

  async confirm() {
    if (!this.formData.valid) return;

    let actividad: Actividad | undefined;
    let transaccion: Transaccion | undefined;
    let tarea: Tarea;
    let idRecurso: string = '';
    let titulo: string = '';
    let idTransaccion: string = '';
    let entradaSalida: string = EntradaSalida.Transferencia;
    let estaEnJornada: boolean = true;
    const data = this.formData.value;
    const now = new Date();
    const isoDate = now.toISOString();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const isoToday = today.toISOString();

    if (this.fecha == null){
      this.fecha = new Date();
    }

    if (this.serviceId == TipoServicio.Generacion)
      this.idPropietario = await this.globales.getIdPersona() ?? '';
    if (this.serviceId == TipoServicio.Recepcion || this.serviceId == TipoServicio.Generacion)
      this.idPuntoRecoleccion = this.idPuntoRecepcion;

    const residuo: Residuo = {
      IdResiduo: this.globales.newId(),
      IdMaterial: this.idMaterial,
      IdPropietario: this.idPropietario,
      IdDeposito: this.idPuntoRecepcion,
      IdVehiculo: this.idVehiculo,
      IdDepositoOrigen: this.idPuntoRecoleccion,
      Aprovechable: true, //TODO
      Cantidad: data.Cantidad,
      Peso: data.Peso,
      IdEmbalaje: this.idEmbalaje,
      CantidadEmbalaje: data.CantidadEmbalaje,
      IdEstado: Estado.Activo,
      Material: this.material,
      Ubicacion: '', //TODO
      Volumen: data.Volumen,
    };
    await this.inventarioService.createResiduo(residuo);

    switch(this.serviceId){
      case TipoServicio.Generacion:
      case TipoServicio.Recepcion:
        idRecurso = this.idPuntoRecepcion;
        titulo = this.puntoRecepcion;
        entradaSalida = EntradaSalida.Entrada;
        break;
      case TipoServicio.Recoleccion:
        if (this.idVehiculo) {
          idRecurso = this.idVehiculo;
          titulo = this.idVehiculo;
        } else {
          idRecurso = this.idPuntoRecepcion;
          titulo = this.puntoRecepcion;
        }
        break;
    }
    actividad = await this.actividadesService.getByServicio(this.serviceId, idRecurso);
    if (!actividad)
    {
      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(),ahora.getDate());
      if (this.fecha >= hoy){
        actividad = {
          IdActividad: this.globales.newId(),
          IdEstado: Estado.Aprobado,
          IdServicio: this.serviceId,
          IdRecurso: idRecurso,
          NavegarPorTransaccion: false,
          FechaInicial: isoDate,
          FechaOrden: isoToday,
          Titulo: titulo,
        };
        await this.actividadesService.create(actividad);
      } else {
        estaEnJornada = false;
      }
    } else {
      estaEnJornada = this.globales.verificarFechaJornada(today ?? null, today, this.fecha);
    }

    if (estaEnJornada && actividad){
      idTransaccion = '';
      if (this.serviceId == TipoServicio.Recepcion){
        transaccion = await this.transaccionesService.getByTercero(actividad.IdActividad, this.idPropietario);
        if (!transaccion) {
          transaccion = {
            IdActividad: actividad.IdActividad,
            IdTransaccion: this.globales.newId(),

            IdServicio: actividad.IdServicio,
            IdRecurso: actividad.IdRecurso,
            EntradaSalida: EntradaSalida.Entrada,
            IdEstado: Estado.Aprobado,
            Titulo: this.propietario,
            IdTercero: this.idPropietario,
          }
          await this.transaccionesService.create(transaccion);
          idTransaccion = transaccion.IdTransaccion;
        }
      } else if (this.serviceId == TipoServicio.Recoleccion || this.serviceId == TipoServicio.Transporte) {
        transaccion = await this.transaccionesService.getByPunto(actividad.IdActividad, this.idPuntoRecoleccion);
        if (!transaccion) {
          transaccion = {
            IdActividad: actividad.IdActividad,
            IdTransaccion: this.globales.newId(),

            IdEstado: Estado.Aprobado,
            EntradaSalida: EntradaSalida.Entrada,
            IdRecurso: actividad.IdRecurso,
            IdServicio: actividad.IdServicio,
            Titulo: this.puntoRecoleccion,
            IdTercero: this.idPropietario,
            IdDeposito: this.idPuntoRecoleccion,
          }
          await this.transaccionesService.create(transaccion);
          idTransaccion = transaccion.IdTransaccion;
        }
      }
      tarea = {
        IdActividad: actividad.IdActividad,
        IdTransaccion: idTransaccion,
        IdTarea: this.globales.newId(),

        IdServicio: this.serviceId,
        IdEstado: Estado.Aprobado,
        IdMaterial: this.idMaterial,
        IdResiduo: residuo.IdResiduo,
        IdRecurso: actividad.IdRecurso,
        FechaEjecucion: isoDate,
        EntradaSalida: EntradaSalida.Entrada,
        Cantidad: residuo.Cantidad,
        Peso: residuo.Peso,
        Volumen: residuo.Volumen,
        Fotos: []
      };
      await this.tareasService.create(tarea);
    }

    this.modalCtrl.dismiss(residuo);
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
    const idPersona = await this.globales.getIdPersona();

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
