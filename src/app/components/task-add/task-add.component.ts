import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, NavigationExtras } from '@angular/router';
import { ModalController, NavController } from '@ionic/angular';
import { CRUDOperacion, EntradaSalida, Estado, TipoMedicion, TipoServicio } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { PackagesComponent } from '../packages/packages.component';
import { MaterialsComponent } from '../materials/materials.component';
import { PointsComponent } from '../points/points.component';
import { StakeholdersComponent } from '../stakeholders/stakeholders.component';
import { ResiduesComponent } from '../residues/residues.component';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { TreatmentsComponent } from '../treatments/treatments.component';
import { Cuenta } from 'src/app/interfaces/cuenta.interface';

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
  idPropietario: string = '';
  idPunto : string = '';
  idResiduo: string = '';
  idTransaccion: string = '';
  idTratamiento: string = '';
  idVehiculo: string = '';
  material: string = '';
  medicion: string = '';
  origen: string = '';
  photo: string = '';
  proceso: string = '';
  propietario: string = '';
  punto : string = '';
  residuo: string = '';
  showDetalles: boolean = false;
  solicitarPunto: boolean = false;
  solicitarPropietario: boolean = false;
  solicitarEmbalaje: boolean = false;
  solicitarTratamiento: boolean = false;
  tratamiento: string = '';
  unidadCantidad: string = '';
  unidadPeso: string = 'kg';
  unidadVolumen: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private globales: Globales,
    private modalCtrl: ModalController,
    private navCtrl: NavController
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
    this.route.queryParams.subscribe(params => {
      this.idActividad = params["IdActividad"],
      this.idTransaccion = params["IdTransaccion"]
    });
    const cuenta = await this.globales.getCuenta();
    if (cuenta) {
      this.unidadCantidad = cuenta.UnidadCantidad ?? '';
      this.unidadPeso = cuenta.UnidadPeso ?? '';
      this.unidadVolumen = cuenta.UnidadVolumen ?? '';
    }
    const actividad = await this.globales.getActividad(this.idActividad);
    if (actividad)
    {
      this.proceso = this.globales.getNombreServicio(actividad.IdServicio);
      if (actividad.IdServicio == TipoServicio.Recoleccion || actividad.IdServicio == TipoServicio.Transporte) {
        this.solicitarEmbalaje = true;
        this.idVehiculo = actividad.IdRecurso ?? '';
        if (this.idTransaccion)
        {
          const transaccion = await this.globales.getTransaccion(this.idActividad, this.idTransaccion);
          if (!transaccion){
            this.solicitarPunto = true;
          } else {
            this.idPunto = transaccion.IdPunto ?? '';
            this.idPropietario = transaccion.IdTercero ?? '';
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

   async selectPunto() {
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        IdTercero: ''
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.idPunto  = data.data.id;
        this.punto = data.data.name;
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
    const image = await Camera.getPhoto({
      quality: 90,
      allowEditing: false,
      resultType: CameraResultType.Uri,
      source: CameraSource.Camera,
    });
    this.photo = image.webPath || '';
  };

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  async submit() {
    const cuenta: Cuenta = await this.globales.getCuenta();
    const actividad = await this.globales.getActividad(this.idActividad);
    let tarea: Tarea | undefined = undefined;
    let idTransaccion: string | null = null;
    let idResiduo: string | null = null;

    if (!this.formData.valid) return;

    idTransaccion = this.idTransaccion;
    const data = this.formData.value;
    if (actividad.IdServicio == TipoServicio.Recoleccion || actividad.IdServicio == TipoServicio.Transporte || actividad.IdServicio === TipoServicio.Recepcion){
      const residuo: Residuo = {
        IdResiduo: this.globales.newId(),
        IdMaterial: this.idMaterial,
        IdPropietario: this.idPropietario,
        IdDepositoOrigen: this.idPunto,
        Aprovechable: true, //TODO
        Cantidad: data.Cantidad,
        Peso: data.Peso,
        IdEmbalaje: data.IdEmbalaje,
        CantidadEmbalaje: data.CantidadEmbalaje,
        IdEstado: Estado.Activo,
        Propietario: this.propietario,
        Material: this.material,
        DepositoOrigen: this.punto,
        EntradaSalida: EntradaSalida.Entrada,
        IdDeposito: actividad.IdServicio == TipoServicio.Recepcion? actividad.IdRecurso : '',
        IdRuta: actividad.IdServicio == TipoServicio.Recoleccion? actividad.IdRecurso : '',
        IdVehiculo: actividad.IdServicio == TipoServicio.Transporte? actividad.IdRecurso : '',
        Ubicacion: '' //TODO
      };
      await this.globales.createResiduo(residuo);
      idResiduo = residuo.IdResiduo;

      if (!this.idTransaccion) {
        if (actividad.IdServicio === TipoServicio.Recoleccion || actividad.IdServicio == TipoServicio.Transporte){
         const transaccionActual = await this.globales.getTransaccionByPunto(this.idActividad, this.idPunto);
          if (!transaccionActual) {
            const transaccion: Transaccion = {
              IdTransaccion: this.globales.newId(),
              IdEstado: Estado.Pendiente,
              EntradaSalida:EntradaSalida.Transferencia,
              IdPunto: this.idPunto,
              CRUD: CRUDOperacion.Create,
              Cantidad: data.Cantidad,
              Peso: data.Peso,
              Volumen: data.Volumen,
              ItemsAprobados: 1,
              ItemsPendientes: 0,
              ItemsRechazados: 0,
              Titulo: this.punto,
              Icono: 'location',
              Accion: this.globales.getAccionEntradaSalida(EntradaSalida.Transferencia),
              Cantidades: this.globales.getResumen(data.Cantidad ?? 0, cuenta.UnidadCantidad, data.Peso ?? 0, cuenta.UnidadPeso, data.Volumen ?? 0, cuenta.UnidadVolumen),
            };
            await this.globales.createTransaccion(this.idActividad, transaccion);
            idTransaccion = transaccion.IdTransaccion;
          } else {
            transaccionActual.CRUD = CRUDOperacion.Update;
            transaccionActual.Cantidad = data.Cantidad;
            transaccionActual.Peso = data.Peso;
            transaccionActual.Volumen = data.Volumen;
            await this.globales.updateTransaccion(this.idActividad, transaccionActual);
            idTransaccion = transaccionActual.IdTransaccion;
          }
        } else if (actividad.IdServicio == TipoServicio.Recepcion) {
          const transaccionActual = await this.globales.getTransaccionByTercero(this.idActividad, this.idPropietario);
          if (!transaccionActual) {
            const transaccion: Transaccion = {
              IdTransaccion: this.globales.newId(),
              IdEstado: Estado.Pendiente,
              EntradaSalida:EntradaSalida.Transferencia,
              IdTercero: this.idPropietario,
              CRUD: CRUDOperacion.Create,
              Cantidad: data.Cantidad,
              Peso: data.Peso,
              Volumen: data.Volumen,
              ItemsAprobados: 1,
              ItemsPendientes: 0,
              ItemsRechazados: 0,
              Titulo: this.propietario,
              Icono: 'person',
              Accion: this.globales.getAccionEntradaSalida(EntradaSalida.Transferencia),
              Cantidades: this.globales.getResumen(data.Cantidad ?? 0, cuenta.UnidadCantidad, data.Peso ?? 0, cuenta.UnidadPeso, data.Volumen ?? 0, cuenta.UnidadVolumen),
            };
            await this.globales.createTransaccion(this.idActividad, transaccion);
            idTransaccion = transaccion.IdTransaccion;
          } else {
            transaccionActual.CRUD = CRUDOperacion.Update;
            transaccionActual.Cantidad = data.Cantidad;
            transaccionActual.Peso = data.Peso;
            transaccionActual.Volumen = data.Volumen;
            await this.globales.updateTransaccion(this.idActividad, transaccionActual);
            idTransaccion = transaccionActual.IdTransaccion;
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
        IdTarea: this.globales.newId(),
        IdMaterial: this.idMaterial,
        Material : this.material,
        IdResiduo: idResiduo,
        IdPunto: this.idPunto,
        IdSolicitante: this.idPropietario,
        Accion: 'Recoger',
        CRUD: CRUDOperacion.Create,
        EntradaSalida: EntradaSalida.Entrada,
        IdServicio: actividad.IdServicio,
        IdTransaccion: idTransaccion,
        IdEstado: Estado.Aprobado,
        Cantidad: data.Cantidad,
        Peso: data.Peso,
        Volumen: data.Volumen,
        CantidadEmbalaje: data.CantidadEmbalaje,
        IdEmbalaje: data.IdEmbalaje,
        Cantidades: this.globales.getResumen(data.Cantidad ?? 0, cuenta.UnidadCantidad, data.Peso ?? 0, cuenta.UnidadPeso, data.Volumen ?? 0, cuenta.UnidadVolumen),
      };
      await this.globales.createTarea(this.idActividad, tarea);
    }
    this.modalCtrl.dismiss(tarea);
  }

  toggleShowDetalles() {
    this.showDetalles = !this.showDetalles;
  }
}
