import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ModalController, NavParams } from '@ionic/angular';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { ActividadesService } from 'src/app/services/actividades.service';
import { EntradaSalida, Estado, TipoServicio } from 'src/app/services/constants.service';
import { GlobalesService } from 'src/app/services/globales.service';
import { InventarioService } from 'src/app/services/inventario.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { PuntosService } from 'src/app/services/puntos.service';
import { TareasService } from 'src/app/services/tareas.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';
import { PackagesComponent } from '../packages/packages.component';
import { TreatmentsComponent } from '../treatments/treatments.component';
import { EmbalajesService } from 'src/app/services/embalajes.service';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss'],
})
export class TaskEditComponent  implements OnInit {
  @Input() showName: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showNotes: boolean = true;
  @Input() showSignPad: boolean = true;
  @Input() notesText: string = 'Al aprobar la operacion, todos los pendientes quedan descartados';
  frmTarea: FormGroup;
  activityId: string = '';
  captura: string = '';
  material: string = '';
  materialId: string = '';
  medicion: string = '';
  inputOutput: string = '';
  package: string = '';
  packageId: string = '';
  photo!: SafeResourceUrl;
  point: string = '';
  pointTarget: string = '';
  pointId: string = '';
  residueId: string = '';
  stakeholder: string = '';
  stakeholderId: string = '';
  stakeholderTarget: string = '';
  status: string = '';
  showDetails: boolean = false;
  showTratamiento: boolean = false;
  task: Tarea | undefined = undefined;
  taskId: string = '';
  transactionId: string = '';
  target: string = '';
  targetId: string = '';
  treatmentId: string = '';
  treatment: string = '';
  fotosPorMaterial: number = 2;
  fotos: string[] = []; //Photo[] = [];
  imageUrl: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private actividadesService: ActividadesService,
    private embalajesService: EmbalajesService,
    private transaccionesService: TransaccionesService,
    private tareasService: TareasService,
    private inventarioService: InventarioService,
    private materialesService: MaterialesService,
    private puntosService: PuntosService,
    private tercerosService: TercerosService,
    private globales: GlobalesService,
  ) {
    this.activityId = this.navParams.get("ActivityId");
    this.transactionId = this.navParams.get("TransactionId");
    this.taskId = this.navParams.get("TaskId");
    this.materialId = this.navParams.get("MaterialId");
    this.residueId = this.navParams.get("ResidueId");
    this.inputOutput = this.navParams.get("InputOutput");

    this.frmTarea = this.formBuilder.group({
      Cantidad: [],
      Peso: [],
      IdEmbalaje: [],
      Observaciones: [],
      Valor: [],
      Volumen: [],
    });
  }

  /**
   * Inicializacion de formulario
   */
  async ngOnInit() {
    let cantidad: number | null = null;
    let peso: number | null = null;
    let volumen: number | null = null;

    this.fotosPorMaterial = this.globales.fotosPorMaterial;
    this.task = await this.tareasService.get(this.activityId, this.transactionId, this.taskId);
    if (this.task)
    {
      this.status = this.task.IdEstado;
      cantidad = this.task.Cantidad ?? 0;
      peso = this.task.Peso ?? 0;
      volumen = this.task.Volumen ?? 0;
      this.fotos= this.task.Fotos ?? [];

      const materialItem = await this.materialesService.get(this.task.IdMaterial);
      if (materialItem) {
        this.material = materialItem.Nombre;
        this.medicion = materialItem.TipoMedicion;
        this.captura = materialItem.TipoCaptura;
      }

      if (this.task.IdDeposito) {
        const puntoItem = await this.puntosService.get(this.task.IdDeposito);
        this.point = puntoItem?.Nombre ?? '';
        this.pointId = puntoItem?.IdDeposito ?? '';
      }

      if (this.task.IdDepositoDestino) {
        const puntoItem = await this.puntosService.get(this.task.IdDepositoDestino);
        this.pointTarget = puntoItem?.Nombre ?? '';
        if (puntoItem?.IdPersona) {
          const tercero = await this.tercerosService.get(puntoItem.IdPersona);
          this.stakeholderTarget = tercero?.Nombre ?? '';
        }
      }

      if (this.task.IdTercero) {
        const solicitante = await this.tercerosService.get(this.task.IdTercero);
        this.stakeholder = solicitante?.Nombre ?? '';
        this.stakeholderId = solicitante?.IdPersona ?? '';
      }

      if (this.task.IdTerceroDestino) {
        const tercero = await this.tercerosService.get(this.task.IdTerceroDestino);
        this.stakeholderTarget = tercero?.Nombre ?? '';
      }

      if (this.task.IdEmbalaje) {
        const embalaje = await this.embalajesService.get(this.task.IdEmbalaje);
        this.packageId = this.task.IdEmbalaje;
        this.package = embalaje?.Nombre ?? '';
      }

      if (this.inputOutput == EntradaSalida.Salida) {
        const residuo = await this.inventarioService.getResiduo(this.residueId);
        if (residuo) {
          cantidad = residuo.Cantidad ?? 0;
          peso = residuo.Peso ?? 0;
          volumen = residuo.Volumen ?? 0;
        }
      }

      this.frmTarea.patchValue({
        Cantidad: cantidad,
        Peso: peso,
        volumen: volumen,
        IdEmbalaje: this.task?.IdEmbalaje,
      });
    } else {
      let materialNombre: string = '';
      let puntoNombre: string = '';
      let terceroNombre: string = '';
      let terceroId: string = '';
      let puntoId: string = '';
      let embalajeId: string = '';

      if (this.transactionId) {
        const transaccion = await this.transaccionesService.get(this.activityId, this.transactionId);
        if (transaccion) {
          const punto = await this.puntosService.get(transaccion.IdDeposito ?? '');
          if (punto){
            puntoNombre = punto.Nombre;
            puntoId = punto.IdDeposito;
            const propietario = await this.tercerosService.get(punto.IdPersona ?? '');
            if (propietario) {
              terceroNombre = propietario.Nombre;
              terceroId = propietario.IdPersona;
            }
          }
        }
      }
      const material = await this.materialesService.get(this.materialId);
      if (material) {
        materialNombre = material.Nombre;
        this.medicion = material.TipoMedicion;
        this.captura = material.TipoCaptura;
      }

      const residuo = await this.inventarioService.getResiduo(this.residueId);
      if (residuo) {
        cantidad = residuo.Cantidad ?? 0;
        peso = residuo.Peso ?? 0;
        volumen = residuo.Volumen ?? 0;
      }

      if (this.packageId) {
        const embalaje = await this.embalajesService.get(this.packageId);
        this.package = embalaje?.Nombre ?? '';
      }

      this.material = materialNombre;
      this.point = puntoNombre;
      this.pointId = puntoId;
      this.stakeholder = terceroNombre;
      this.stakeholderId = terceroId;
      this.frmTarea.patchValue({
        Cantidad: cantidad,
        Peso: peso,
        volumen: volumen,
        IdEmbalaje: embalajeId,
      });
    }
  }

  /**
   * Confirmar la tarea
   */
  async confirm() {
    const now = new Date();
    const isoDate = now.toISOString();

    if (!this.frmTarea.valid) return;

    let idResiduo: string | null = null;
    let tarea: Tarea | undefined;
    const data = this.frmTarea.value;
    const actividad = await this.actividadesService.get(this.activityId);

    if (!actividad) return;

    tarea = await this.tareasService.get(this.activityId, this.transactionId, this.taskId);
    if (tarea) { //Si hay tarea
      tarea.Cantidad = data.Cantidad;
      tarea.FechaEjecucion = isoDate;
      tarea.IdEmbalaje = data.IdEmbalaje;
      tarea.IdEstado = Estado.Aprobado;
      tarea.Observaciones = data.Observaciones;
      tarea.Peso = data.Peso;
      tarea.Volumen = data.Volumen;
      tarea.Valor = data.Valor;
      tarea.Fotos = this.fotos;
      this.tareasService.update(this.activityId, this.transactionId, tarea);

      if (this.inputOutput == EntradaSalida.Entrada) { //Tarea -> Entrada
        idResiduo = this.globales.newId();
        const residuo: Residuo = {
          IdResiduo: idResiduo,
          IdMaterial: tarea.IdMaterial,
          IdPropietario: this.stakeholderId,
          IdDeposito: actividad.IdServicio == TipoServicio.Recepcion ? actividad.IdRecurso: '',
          IdRuta: actividad.IdServicio == TipoServicio.Recoleccion? actividad.IdRecurso : '',
          IdVehiculo: actividad.IdServicio == TipoServicio.Transporte? actividad.IdRecurso : '',
          IdDepositoOrigen: tarea.IdDeposito,
          Aprovechable: true, //TODO
          Cantidad: data.Cantidad,
          Peso: data.Peso,
          Volumen: data.Volumen,
          IdEmbalaje: data.IdEmbalaje,
          CantidadEmbalaje: data.CantidadEmbalaje,
          Propietario: this.stakeholder,
          Material: this.material,
          DepositoOrigen: this.point,
          EntradaSalida: EntradaSalida.Entrada,
          IdEstado: Estado.Pendiente,
          FechaIngreso: isoDate,
          Imagen: this.imageUrl,
          Ubicacion: '' //TODO
        };
        await this.inventarioService.createResiduo(residuo);
      } else { //Tarea -> Salida
        idResiduo = this.residueId;
        const residuo = await this.inventarioService.getResiduo(idResiduo);
        if (residuo){
          residuo.IdEstado = Estado.Inactivo;
          this.inventarioService.updateResiduo(residuo);
        }
      }
    } else { //No hay tarea - Agregado
      const transaccion = await this.transaccionesService.get(this.activityId, this.transactionId);
      if (transaccion){
        const punto = await this.puntosService.get(transaccion.IdDeposito ?? '');
        if (punto?.Recepcion) { //No hay tarea -> Entrada
          const residuo: Residuo = {
            IdResiduo: this.globales.newId(),
            IdMaterial: this.materialId,
            IdPropietario: this.stakeholderId,
            IdDeposito: actividad.IdServicio == TipoServicio.Recepcion ? actividad.IdRecurso: '',
            IdRuta: actividad.IdServicio == TipoServicio.Recoleccion? actividad.IdRecurso : '',
            IdVehiculo: actividad.IdServicio == TipoServicio.Transporte? actividad.IdRecurso : '',
            IdDepositoOrigen: transaccion.IdDeposito,
            Aprovechable: true, //TODO
            Cantidad: data.Cantidad,
            Peso: data.Peso,
            IdEmbalaje: data.IdEmbalaje,
            CantidadEmbalaje: data.CantidadEmbalaje,
            Propietario: this.stakeholder,
            Material: this.material,
            DepositoOrigen: this.point,
            IdEstado: Estado.Activo,
            FechaIngreso: isoDate,
            Ubicacion: '' //TODO
          };
          await this.inventarioService.createResiduo(residuo);
          tarea = {
            IdActividad: this.activityId,
            IdTransaccion: this.transactionId,
            IdTarea: this.globales.newId(),

            IdMaterial: this.materialId,
            IdResiduo: residuo.IdResiduo,
            Cantidad: data.Cantidad,
            Peso: data.Peso,
            Volumen: data.Volumen,
            FechaEjecucion: isoDate,
            IdRecurso: actividad.IdRecurso,
            IdServicio: actividad.IdServicio,
            IdEmbalaje: data.IdEmbalaje,
            Observaciones: data.Observaciones,
            EntradaSalida: EntradaSalida.Entrada,
            IdEstado: Estado.Aprobado,
            Fotos: this.fotos,
          };
          await this.tareasService.create(tarea);
        } else { //No hay tarea -> Salida
          const residuo = await this.inventarioService.getResiduo(this.residueId);
          if (residuo) {
            tarea = {
              IdActividad: this.activityId,
              IdTransaccion: this.transactionId,
              IdTarea: this.globales.newId(),

              IdMaterial: this.materialId,
              IdResiduo: residuo.IdResiduo,
              Cantidad: data.Cantidad,
              FechaEjecucion: isoDate,
              IdRecurso: actividad.IdRecurso,
              IdServicio: actividad.IdServicio,
              Peso: data.Peso,
              Volumen: data.Volumen,
              IdEmbalaje: data.IdEmbalaje,
              Observaciones: data.Observaciones,
              EntradaSalida: EntradaSalida.Entrada,
              Fotos: this.fotos,
              IdEstado: Estado.Aprobado,
              };
            await this.tareasService.create(tarea);

            residuo.IdEstado = Estado.Inactivo;
            await this.inventarioService.updateResiduo(residuo);
          }
        }
      }
    }
    this.modalCtrl.dismiss(tarea);
  }

  async reject() {
    const now = new Date();
    const isoDate = now.toISOString();

    const data = this.frmTarea.value;
    const tarea = await this.tareasService.get(this.activityId, this.transactionId, this.taskId);
    if (tarea)
    {
      tarea.Observaciones = data.Observaciones;
      tarea.IdEstado = Estado.Rechazado;
      tarea.FechaEjecucion = isoDate;
      this.tareasService.update(this.activityId, this.transactionId, tarea);
    }
    this.modalCtrl.dismiss(tarea);
  }
    /**
   * Retornar a la página inicial
   */
  cancel() {
    this.modalCtrl.dismiss();
  }

  /**
   * Selecciona el embalaje y pone los valores en variables de la página
   * @returns
   */
  async selectEmbalaje() {
    const modal =   await this.modalCtrl.create({
      component: PackagesComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.packageId = data.data.id;
        this.package = data.data.name;
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
        this.treatmentId = data.data.id;
        this.treatment = data.data.name;
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
}
