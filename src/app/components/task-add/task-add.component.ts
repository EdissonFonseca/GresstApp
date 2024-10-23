import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController } from '@ionic/angular';
import { ClienteProveedorInterno, CRUDOperacion, EntradaSalida, Estado, TipoMedicion, TipoServicio } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { PackagesComponent } from '../packages/packages.component';
import { MaterialsComponent } from '../materials/materials.component';
import { PointsComponent } from '../points/points.component';
import { ResiduesComponent } from '../residues/residues.component';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { TreatmentsComponent } from '../treatments/treatments.component';
import { TareasService } from 'src/app/services/tareas.service';
import { ActividadesService } from 'src/app/services/actividades.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { InventarioService } from 'src/app/services/inventario.service';
import { NavParams } from '@ionic/angular';

@Component({
  selector: 'app-task-add',
  templateUrl: './task-add.component.html',
  styleUrls: ['./task-add.component.scss'],
})
export class TaskAddComponent  implements OnInit {
  formData: FormGroup;
  captura: string = '';
  colorReceive: string = 'primary';
  colorSend: string = 'medium';
  embalaje: string = '';
  factor: number | null = null;
  idActividad: string = '';
  idDeposito: string = '';
  idEmbalaje: string = '';
  idMaterial: string = '';
  idPuntoEntrada: string = '';
  idPuntoSalida: string = '';
  idResiduo: string = '';
  idTransaccion: string = '';
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
    private route: ActivatedRoute,
    private globales: GlobalesService,
    private modalCtrl: ModalController,
    private actividadesService: ActividadesService,
    private transaccionesService: TransaccionesService,
    private navParams: NavParams,
    private tareasService: TareasService,
    private inventarioService: InventarioService,
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
    this.idActividad = this.navParams.get("IdActividad");
    this.idTransaccion = this.navParams.get("IdTransaccion");
    this.unidadCantidad = this.globales.unidadCantidad ?? '';
    this.unidadPeso = this.globales.unidadPeso ?? '';
    this.unidadVolumen = this.globales.unidadVolumen ?? '';
    this.fotosPorMaterial = this.globales.fotosPorMaterial ?? 2;

    const actividad = await this.actividadesService.get(this.idActividad);
    if (actividad)
    {
      this.proceso = this.globales.getNombreServicio(actividad.IdServicio);
      console.log(this.proceso);
      if (actividad.IdServicio == TipoServicio.Recoleccion || actividad.IdServicio == TipoServicio.Transporte) {
        this.solicitarEmbalaje = true;
        this.idVehiculo = actividad.IdRecurso ?? '';
        if (this.idTransaccion)
        {
          const transaccion = await this.transaccionesService.get(this.idActividad, this.idTransaccion);
          if (!transaccion){
            this.solicitarPunto = true;
          } else {
            this.idPuntoEntrada = transaccion.IdDeposito ?? '';
            this.idTerceroEntrada = transaccion.IdTercero ?? '';
          }
        } else {
          this.solicitarPunto = true;
        }
      } else if (actividad.IdServicio == TipoServicio.Recepcion) {
        this.solicitarPropietario = true;
      }
    }
  }

  calculateFromCantidad(event:any){
    const enteredValue = (event.target as HTMLInputElement).value;
    const resultValue = Number(enteredValue) * (this.factor ?? 1);

    if (this.medicion == TipoMedicion.Peso)
      this.formData.patchValue({Peso: resultValue});
    else if (this.medicion == TipoMedicion.Volumen)
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

    await modal.present();
   }

   async selectPuntoRecoleccion() {
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        tipoTercero: ClienteProveedorInterno.Cliente,
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
        tipoTercero: ClienteProveedorInterno.Proveedor,
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
    const actividad = await this.actividadesService.get(this.idActividad);
    let tarea: Tarea | undefined = undefined;
    let idTransaccion: string | null = null;
    let idResiduo: string | null = null;
    const now = new Date();
    const isoDate = now.toISOString();
    let fecha: string = isoDate;

    if (!this.formData.valid) return;

    idTransaccion = this.idTransaccion;
    const data = this.formData.value;
    if (actividad.IdServicio == TipoServicio.Recoleccion || actividad.IdServicio == TipoServicio.Transporte || actividad.IdServicio === TipoServicio.Recepcion){
      const residuo: Residuo = {
        IdResiduo: this.globales.newId(),
        IdMaterial: this.idMaterial,
        IdPropietario: this.idTerceroEntrada,
        IdDepositoOrigen: this.idPuntoEntrada,
        Aprovechable: true, //TODO
        Cantidad: data.Cantidad,
        Peso: data.Peso,
        IdEmbalaje: data.IdEmbalaje,
        CantidadEmbalaje: data.CantidadEmbalaje,
        IdEstado: Estado.Activo,
        Propietario: this.propietario,
        Material: this.material,
        DepositoOrigen: this.puntoEntrada,
        EntradaSalida: EntradaSalida.Entrada,
        IdDeposito: actividad.IdServicio == TipoServicio.Recepcion? actividad.IdRecurso : '',
        IdRuta: actividad.IdServicio == TipoServicio.Recoleccion? actividad.IdRecurso : '',
        IdVehiculo: actividad.IdServicio == TipoServicio.Transporte? actividad.IdRecurso : '',
        Imagen: this.imageUrl,
        Ubicacion: '' //TODO
      };
      await this.inventarioService.createResiduo(residuo);
      idResiduo = residuo.IdResiduo;

      if (!this.idTransaccion) {
        if (actividad.IdServicio === TipoServicio.Recoleccion || actividad.IdServicio == TipoServicio.Transporte){
          const transaccionActual = await this.transaccionesService.getByPunto(this.idActividad, this.idPuntoEntrada);
          if (!transaccionActual) {
            const transaccion: Transaccion = {
              IdActividad: this.idActividad,
              IdTransaccion: this.globales.newId(),

              IdEstado: Estado.Pendiente,
              EntradaSalida: EntradaSalida.Entrada,
              IdTercero: this.idTerceroEntrada,
              IdDeposito: this.idPuntoEntrada,
              IdDepositoDestino: this.idPuntoSalida,
              IdTerceroDestino: this.idTerceroSalida,
              Punto: this.puntoEntrada,
              Tercero: this.terceroEntrada,
              Titulo: 'Nueva - ' + (this.puntoEntrada ?? '') + (this.terceroEntrada ?? ''),
              Solicitudes: 'Nueva',
              Icono: 'location',
              IdRecurso: actividad.IdRecurso,
              IdServicio: actividad.IdServicio,
              FechaInicial: isoDate,
              FechaFinal: isoDate,
              Accion: this.globales.getAccionEntradaSalida(EntradaSalida.Transferencia),
            };
            fecha = isoDate;
            await this.transaccionesService.create(transaccion);
            idTransaccion = transaccion.IdTransaccion;
          } else {
            if (transaccionActual.IdEstado == Estado.Pendiente) {
              await this.transaccionesService.update(transaccionActual);
              idTransaccion = transaccionActual.IdTransaccion;
              fecha = transaccionActual.FechaInicial ?? isoDate;
            } else {
              this.globales.presentToast('Ya se ha agregado y aprobado/rechazado una transaccion en este punto. No se puede volver a crear','middle');
              return;
            }
          }
        } else if (actividad.IdServicio == TipoServicio.Recepcion) {
          const transaccionActual = await this.transaccionesService.getByTercero(this.idActividad, this.idTerceroEntrada);
          if (!transaccionActual) {
            const transaccion: Transaccion = {
              IdActividad: this.idActividad,
              IdTransaccion: this.globales.newId(),

              IdEstado: Estado.Pendiente,
              EntradaSalida: EntradaSalida.Entrada,
              IdTercero: this.idTerceroEntrada,
              IdRecurso: actividad.IdRecurso,
              IdServicio: actividad.IdServicio,
              IdDeposito: this.idPuntoEntrada,
              IdDepositoDestino: this.idPuntoSalida,
              IdTerceroDestino: this.idTerceroSalida,
              Titulo: this.propietario,
              Icono: 'person',
              Accion: this.globales.getAccionEntradaSalida(EntradaSalida.Transferencia),
            };
            await this.transaccionesService.create(transaccion);
            idTransaccion = transaccion.IdTransaccion;
            fecha = isoDate;
          } else {
            transaccionActual.CRUD = CRUDOperacion.Update;
            await this.transaccionesService.update(transaccionActual);
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
        IdTarea: this.globales.newId(),

        IdMaterial: this.idMaterial,
        Material : this.material,
        IdResiduo: idResiduo,
        IdDeposito: this.idPuntoEntrada,
        IdTercero: this.idTerceroEntrada,
        IdDepositoDestino: this.idPuntoSalida,
        IdTerceroDestino: this.idTerceroSalida,
        Accion: 'Ver',
        EntradaSalida: EntradaSalida.Entrada,
        IdServicio: actividad.IdServicio,
        IdEstado: Estado.Aprobado,
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
      await this.tareasService.create(this.idActividad, tarea);
    }
    console.log(tarea);
    this.modalCtrl.dismiss(tarea);
  }
}
