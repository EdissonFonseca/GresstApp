import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { CRUDOperacion, EntradaSalida, Estado, TipoServicio } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { MaterialesService } from 'src/app/services/materiales.service';
import { PuntosService } from 'src/app/services/puntos.service';
import { TareasService } from 'src/app/services/tareas.service';
import { TercerosService } from 'src/app/services/terceros.service';

@Component({
  selector: 'app-task-reject',
  templateUrl: './task-reject.component.html',
  styleUrls: ['./task-reject.component.scss'],
})
export class TaskRejectComponent  implements OnInit {
  @Input() showName: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showNotes: boolean = true;
  @Input() showSignPad: boolean = true;
  @Input() notesText: string = 'Al aprobar la operacion, todos los pendientes quedan descartados';
  activityId: string = '';
  transactionId: string = '';
  taskId: string = '';
  target: string = '';
  targetId: string = '';
  packageId: string = '';
  package: string = '';
  unit: string = '';
  material: string = '';
  point: string = '';
  stakeholder: string = '';
  task: Tarea | undefined = undefined;
  showDetails: boolean = false;
  frmMaterial!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private materialesService: MaterialesService,
    private puntosService: PuntosService,
    private tercerosService: TercerosService,
    private tareasService: TareasService,
  ) {
    this.activityId = this.navParams.get("ActivityId");
    this.transactionId = this.navParams.get("TransactionId");
    this.taskId = this.navParams.get("TaskId");

    this.frmMaterial = this.formBuilder.group({
      Cantidad: [],
      Observaciones: [],
    });
  }

  async ngOnInit() {
    this.task = await this.tareasService.get(this.activityId, this.transactionId, this.taskId);
    if (this.task)
    {
      const materialItem = await this.materialesService.get(this.task.IdMaterial)
      this.material = materialItem?.Nombre ?? '';

      if (this.task.IdPunto)
      {
        const puntoItem = await this.puntosService.get(this.task.IdPunto);
        this.point = puntoItem?.Nombre ?? '';
      }

      if (this.task.IdTercero)
      {
        const solicitante = await this.tercerosService.get(this.task.IdTercero);
        this.stakeholder = solicitante?.Nombre ?? '';
      }

      this.frmMaterial.patchValue({
        Cantidad: this.task?.Cantidad,
        CantidadEmbalaje: this.task?.CantidadEmbalaje,
        IdEmbalaje: this.task?.IdEmbalaje,
      });
      }
  }

  async confirm() {
    const now = new Date();
    const isoDate = now.toISOString();

    if (this.frmMaterial.valid)
    {
      const data = this.frmMaterial.value;
      const tarea = await this.tareasService.get(this.activityId, this.transactionId, this.taskId);
      if (tarea)
      {
        tarea.CRUD = CRUDOperacion.Update;
        tarea.CRUDDate = now;
        tarea.Observaciones = data.Observaciones;
        tarea.IdEstado = Estado.Rechazado;
        tarea.FechaEjecucion = isoDate;
        this.tareasService.update(this.activityId, this.transactionId, tarea);
        this.modalCtrl.dismiss(tarea);
      }
    }
    const data = {ActivityId:this.activityId};
    this.modalCtrl.dismiss(data);
  }
  cancel() {
    this.modalCtrl.dismiss(null);
  }

  ionViewDidEnter() {
  }

  toggleShowDetails() {
    this.showDetails = !this.showDetails;
  }
}
