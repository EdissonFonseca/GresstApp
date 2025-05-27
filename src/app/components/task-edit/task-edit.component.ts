import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { SafeResourceUrl } from '@angular/platform-browser';
import { Camera, CameraResultType, CameraSource, Photo } from '@capacitor/camera';
import { ModalController } from '@ionic/angular';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { ActivitiesService } from '@app/services/transactions/activities.service';
import { INPUT_OUTPUT, STATUS, MEASUREMENTS, SERVICE_TYPES } from '@app/constants/constants';
import { InventoryService } from '@app/services/transactions/inventory.service';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { PointsService } from '@app/services/masterdata/points.service';
import { TasksService } from '@app/services/transactions/tasks.service';
import { ThirdpartiesService } from '@app/services/masterdata/thirdparties.service';
import { TransactionsService } from '@app/services/transactions/transactions.service';
import { PackagesComponent } from '../packages/packages.component';
import { TreatmentsComponent } from '../treatments/treatments.component';
import { PackagingService } from '@app/services/masterdata/packaging.service';
import { Utils } from '@app/utils/utils';
import { Residuo } from 'src/app/interfaces/residuo.interface';

@Component({
  selector: 'app-task-edit',
  templateUrl: './task-edit.component.html',
  styleUrls: ['./task-edit.component.scss'],
})
export class TaskEditComponent implements OnInit {
  @Input() showName: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showNotes: boolean = true;
  @Input() showSignPad: boolean = true;
  @Input() notesText: string = 'Al aprobar la operacion, todos los pendientes quedan descartados';
  @Input() activityId: string = '';
  @Input() transactionId: string = '';
  @Input() taskId: string = '';
  @Input() materialId: string = '';
  @Input() residueId: string = '';
  @Input() inputOutput: string = '';

  frmTarea: FormGroup;
  captura: string = '';
  factor: number | null = null;
  medicion: string = '';
  photo!: SafeResourceUrl;
  status: string = '';
  showDetails: boolean = false;
  showTratamiento: boolean = false;
  task: Tarea | undefined = undefined;
  fotosPorMaterial: number = 2;
  fotos: string[] = [];
  imageUrl: string = '';

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private activitiesService: ActivitiesService,
    private packagingService: PackagingService,
    private transactionsService: TransactionsService,
    private tasksService: TasksService,
    private inventoryService: InventoryService,
    private materialsService: MaterialsService,
    private pointsService: PointsService,
    private thirdpartiesService: ThirdpartiesService
  ) {
    this.frmTarea = this.formBuilder.group({
      Cantidad: [null],
      Peso: [null],
      Volumen: [null],
      Valor: [null],
      IdEmbalaje: [null],
      Observaciones: [null],
      IdDeposito: [null],
      IdDepositoDestino: [null],
      IdTercero: [null],
      IdTerceroDestino: [null],
      IdTratamiento: [null],
      Material: [null],
      Deposito: [null],
      DepositoDestino: [null],
      Tercero: [null],
      TerceroDestino: [null],
      Tratamiento: [null],
      Embalaje: [null]
    });
  }

  /**
   * Inicializacion de formulario
   */
  async ngOnInit() {
    this.fotosPorMaterial = Utils.photosByMaterial;
    this.task = await this.tasksService.get(this.taskId);

    if (this.task) {
      this.status = this.task.IdEstado;
      this.fotos = this.task.Fotos ?? [];

      const materialItem = await this.materialsService.get(this.task.IdMaterial);
      if (materialItem) {
        this.medicion = materialItem.TipoMedicion;
        this.captura = materialItem.TipoCaptura;
        this.factor = materialItem.Factor ?? 1;
        this.frmTarea.patchValue({
          Material: materialItem.Nombre
        });
      }

      if (this.task.IdDeposito) {
        const puntoItem = await this.pointsService.get(this.task.IdDeposito);
        if (puntoItem) {
          this.frmTarea.patchValue({
            IdDeposito: puntoItem.IdDeposito,
            Deposito: puntoItem.Nombre
          });
        }
      }

      if (this.task.IdDepositoDestino) {
        const puntoItem = await this.pointsService.get(this.task.IdDepositoDestino);
        if (puntoItem) {
          this.frmTarea.patchValue({
            IdDepositoDestino: puntoItem.IdDeposito,
            DepositoDestino: puntoItem.Nombre
          });
          if (puntoItem.IdPersona) {
            const tercero = await this.thirdpartiesService.get(puntoItem.IdPersona);
            if (tercero) {
              this.frmTarea.patchValue({
                IdTerceroDestino: tercero.IdPersona,
                TerceroDestino: tercero.Nombre
              });
            }
          }
        }
      }

      if (this.task.IdTercero) {
        const solicitante = await this.thirdpartiesService.get(this.task.IdTercero);
        if (solicitante) {
          this.frmTarea.patchValue({
            IdTercero: solicitante.IdPersona,
            Tercero: solicitante.Nombre
          });
        }
      }

      if (this.task.IdEmbalaje) {
        const embalaje = await this.packagingService.get(this.task.IdEmbalaje);
        if (embalaje) {
          this.frmTarea.patchValue({
            IdEmbalaje: this.task.IdEmbalaje,
            Embalaje: embalaje.Nombre
          });
        }
      }

      if (this.inputOutput == INPUT_OUTPUT.OUTPUT) {
        const residuo = await this.inventoryService.getResidue(this.residueId);
        if (residuo) {
          this.frmTarea.patchValue({
            Cantidad: residuo.Cantidad ?? 0,
            Peso: residuo.Peso ?? 0,
            Volumen: residuo.Volumen ?? 0
          });
        }
      }

      this.frmTarea.patchValue({
        Cantidad: this.task.Cantidad ?? 0,
        Peso: this.task.Peso ?? 0,
        Volumen: this.task.Volumen ?? 0,
        Valor: this.task.Valor,
        Observaciones: this.task.Observaciones
      });
    } else {
      if (this.transactionId) {
        const transaccion = await this.transactionsService.get(this.activityId, this.transactionId);
        if (transaccion) {
          const punto = await this.pointsService.get(transaccion.IdDeposito ?? '');
          if (punto) {
            this.frmTarea.patchValue({
              IdDeposito: punto.IdDeposito,
              Deposito: punto.Nombre
            });
            if (punto.IdPersona) {
              const propietario = await this.thirdpartiesService.get(punto.IdPersona);
              if (propietario) {
                this.frmTarea.patchValue({
                  IdTercero: propietario.IdPersona,
                  Tercero: propietario.Nombre
                });
              }
            }
          }
        }
      }

      const material = await this.materialsService.get(this.materialId);
      if (material) {
        this.medicion = material.TipoMedicion;
        this.captura = material.TipoCaptura;
        this.frmTarea.patchValue({
          Material: material.Nombre
        });
      }

      const residuo = await this.inventoryService.getResidue(this.residueId);
      if (residuo) {
        this.frmTarea.patchValue({
          Cantidad: residuo.Cantidad ?? 0,
          Peso: residuo.Peso ?? 0,
          Volumen: residuo.Volumen ?? 0
        });
      }
    }
  }

  /**
   * Mapea el formulario a la interfaz Tarea
   */
  private mapFormToTask(): Tarea {
    const formValue = this.frmTarea.value;
    const now = new Date().toISOString();

    return {
      IdTarea: this.taskId || Utils.generateId(),
      IdActividad: this.activityId,
      IdTransaccion: this.transactionId,
      IdMaterial: this.materialId,
      IdResiduo: this.residueId,
      Cantidad: formValue.Cantidad,
      Peso: formValue.Peso,
      Volumen: formValue.Volumen,
      Valor: formValue.Valor,
      IdEmbalaje: formValue.IdEmbalaje,
      IdDeposito: formValue.IdDeposito,
      IdDepositoDestino: formValue.IdDepositoDestino,
      IdTercero: formValue.IdTercero,
      IdTerceroDestino: formValue.IdTerceroDestino,
      IdTratamiento: formValue.IdTratamiento,
      FechaEjecucion: now,
      Fotos: this.fotos,
      Observaciones: formValue.Observaciones,
      IdEstado: STATUS.APPROVED,
      EntradaSalida: this.inputOutput,
      IdRecurso: this.task?.IdRecurso || '',
      IdServicio: this.task?.IdServicio || ''
    };
  }

  /**
   * Mapea la tarea a un residuo
   */
  private mapResiduoFromTask(tarea: Tarea): Residuo {
    return {
      IdResiduo: Utils.generateId(),
      IdMaterial: this.materialId,
      IdPropietario: tarea.IdTercero || '',
      IdDeposito: tarea.IdDeposito || '',
      IdVehiculo: '',
      IdDepositoOrigen: tarea.IdDeposito || '',
      Aprovechable: true,
      Cantidad: tarea.Cantidad || 0,
      Peso: tarea.Peso || 0,
      IdEmbalaje: tarea.IdEmbalaje || '',
      CantidadEmbalaje: 0,
      IdEstado: STATUS.APPROVED,
      Material: this.frmTarea.value.Material || '',
      Ubicacion: '',
      Volumen: tarea.Volumen || 0,
    };
  }

  /**
   * Confirmar la tarea
   */
  async confirm() {
    if (!this.frmTarea.valid) return;

    const actividad = await this.activitiesService.get(this.activityId);
    if (!actividad) return;

    let tarea: Tarea = this.mapFormToTask();
    if (this.task) {
      await this.tasksService.update(tarea);
    } else {
      const transaccion = await this.transactionsService.get(this.activityId, this.transactionId);
      if (transaccion) {
        const punto = await this.pointsService.get(transaccion.IdDeposito ?? '');
        tarea.IdRecurso = actividad.IdRecurso;
        tarea.IdServicio = actividad.IdServicio;

        if (punto?.Recepcion) { //No hay tarea -> Entrada
          tarea.IdResiduo = '';
          tarea.EntradaSalida = INPUT_OUTPUT.INPUT;
          await this.tasksService.create(tarea);
        } else { //No hay tarea -> Salida
          tarea.IdResiduo = this.residueId;
          tarea.EntradaSalida = INPUT_OUTPUT.OUTPUT;
          await this.tasksService.create(tarea);

          // Crear el residuo
          const residuo = this.mapResiduoFromTask(tarea);
          await this.inventoryService.createResidue(residuo);
        }
      }
    }

    this.modalCtrl.dismiss(tarea);
  }

  async reject() {
    const tarea = await this.tasksService.get(this.taskId);
    if (tarea) {
      tarea.Observaciones = this.frmTarea.value.Observaciones;
      tarea.IdEstado = STATUS.REJECTED;
      tarea.FechaEjecucion = new Date().toISOString();
      await this.tasksService.update(tarea);
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
   */
  async selectEmbalaje() {
    const modal = await this.modalCtrl.create({
      component: PackagesComponent,
      componentProps: {},
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.frmTarea.patchValue({
          IdEmbalaje: data.data.id,
          Embalaje: data.data.name
        });
      }
    });

    return await modal.present();
  }

  async selectTratamiento() {
    const modal = await this.modalCtrl.create({
      component: TreatmentsComponent,
      componentProps: {},
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.frmTarea.patchValue({
          IdTratamiento: data.data.id,
          Tratamiento: data.data.name
        });
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

  calculateFromCantidad(event: any) {
    const enteredValue = (event.target as HTMLInputElement).value;
    const resultValue = Number(enteredValue) * (this.factor ?? 1);

    if (this.medicion == MEASUREMENTS.WEIGHT)
      this.frmTarea.patchValue({ Peso: resultValue });
    else if (this.medicion == MEASUREMENTS.VOLUME)
      this.frmTarea.patchValue({ Volumen: resultValue });
  }
}
