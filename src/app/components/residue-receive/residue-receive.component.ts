import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { Globales } from 'src/app/services/globales.service';
import { MaterialsComponent } from '../materials/materials.component';
import { PackagesComponent } from '../packages/packages.component';
import { StakeholdersComponent } from '../stakeholders/stakeholders.component';
import { PointsComponent } from '../points/points.component';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { EntradaSalida, Estado, TipoProceso } from 'src/app/services/constants.service';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Actividad } from 'src/app/interfaces/actividad.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';

@Component({
  selector: 'app-residue-receive',
  templateUrl: './residue-receive.component.html',
  styleUrls: ['./residue-receive.component.scss'],
})
export class ResidueReceiveComponent  implements OnInit {
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
  colorRecoleccion: string = 'medium';
  colorRecepcion: string = 'medium';
  colorGeneracion: string = 'primary';
  residue: Residuo | undefined = undefined;
  mode: string = 'G';
  showDetails: boolean = false;

  constructor (
    private formBuilder: FormBuilder,
    private globales: Globales,
    private modalCtrl: ModalController,
    private sanitizer: DomSanitizer
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
  }

  async confirm() {
    if (!this.formData.valid) return;

    let actividad: Actividad | undefined;
    let transaccion: Transaccion | undefined;
    let tarea: Tarea;
    let tipoProceso: string = '';
    let idRecurso: string = '';
    let titulo: string = '';
    let idTransaccion: string = '';
    let entradaSalida: string = EntradaSalida.Transferencia;
    let estaEnJornada: boolean = true;
    const data = this.formData.value;

    if (this.fecha == null){
      this.fecha = new Date();
    }

    if (this.mode == TipoProceso.Generacion)
      this.idPropietario = await this.globales.getIdPersona() ?? '';
    if (this.mode == TipoProceso.Entrada || this.mode == TipoProceso.Generacion)
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
    await this.globales.createResiduo(residuo);

    switch(this.mode){
      case TipoProceso.Generacion:
      case TipoProceso.Entrada:
        tipoProceso = this.mode;
        idRecurso = this.idPuntoRecepcion;
        titulo = this.puntoRecepcion;
        entradaSalida = EntradaSalida.Entrada;
        break;
      case TipoProceso.Recoleccion:
        if (this.idVehiculo) {
          tipoProceso = TipoProceso.Transporte;
          idRecurso = this.idVehiculo;
          titulo = this.idVehiculo;
        } else {
          tipoProceso = this.mode;
          idRecurso = this.idPuntoRecepcion;
          titulo = this.puntoRecepcion;
        }
        break;
    }
    actividad = await this.globales.getActividadByProceso(tipoProceso, idRecurso);
    if (!actividad)
    {
      const ahora = new Date();
      const hoy = new Date(ahora.getFullYear(), ahora.getMonth(),ahora.getDay());
      if (this.fecha >= hoy){
        actividad = {
          IdActividad: this.globales.newId(),
          IdEstado: Estado.Aprobado,
          IdProceso: tipoProceso,
          IdRecurso: idRecurso,
          NavegarPorTransaccion: false,
          FechaInicio: hoy,
          Titulo: titulo,
          Tareas: [],
          Transacciones: []
        };
        await this.globales.createActividad(actividad);
      } else {
        estaEnJornada = false;
      }
    } else {
      estaEnJornada = this.globales.verificarFechaJornada(actividad.FechaInicio ?? null, actividad.FechaFin ?? null, this.fecha);
    }

    if (estaEnJornada && actividad){
      idTransaccion = '';
      if (tipoProceso == TipoProceso.Entrada){
        transaccion = await this.globales.getTransaccionByTercero(actividad.IdActividad, this.idPropietario);
        if (!transaccion) {
          transaccion = {
            IdTransaccion: this.globales.newId(),
            IdEstado: Estado.Aprobado,
            Titulo: this.propietario,
            IdTercero: this.idPropietario,
            EntradaSalida: entradaSalida,
          }
          await this.globales.createTransaccion(actividad.IdActividad, transaccion);
          idTransaccion = transaccion.IdTransaccion;
        }
      } else if (tipoProceso == TipoProceso.Recoleccion || tipoProceso == TipoProceso.Transporte) {
        transaccion = await this.globales.getTransaccionByPunto(actividad.IdActividad, this.idPuntoRecoleccion);
        if (!transaccion) {
          transaccion = {
            IdTransaccion: this.globales.newId(),
            IdEstado: Estado.Aprobado,
            Titulo: this.puntoRecoleccion,
            IdTercero: this.idPropietario,
            IdPunto: this.idPuntoRecoleccion,
            EntradaSalida: entradaSalida,
          }
          await this.globales.createTransaccion(actividad.IdActividad, transaccion);
          idTransaccion = transaccion.IdTransaccion;
        }
      }
      tarea = {
        IdTarea: this.globales.newId(),
        IdTransaccion: idTransaccion,
        IdProceso: tipoProceso,
        IdEstado: Estado.Aprobado,
        IdMaterial: this.idMaterial,
        IdResiduo: residuo.IdResiduo,
        EntradaSalida: EntradaSalida.Entrada,
        Cantidad: residuo.Cantidad,
        Peso: residuo.Peso,
        Volumen: residuo.Volumen,
      };
      await this.globales.createTarea(actividad.IdActividad, tarea);
    }

    this.modalCtrl.dismiss(residuo);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  changeNotesColor(type: string) {
    this.mode = type;
    if (type === TipoProceso.Generacion){
      this.colorGeneracion = 'primary';
      this.colorRecepcion = 'medium';
      this.colorRecoleccion = 'medium';
    } else if(type == TipoProceso.Entrada) {
      this.colorGeneracion = 'medium';
      this.colorRecepcion = 'primary';
      this.colorRecoleccion = 'medium';
    } else {
      this.colorGeneracion = 'medium';
      this.colorRecepcion = 'medium';
      this.colorRecoleccion = 'primary';
    }
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
