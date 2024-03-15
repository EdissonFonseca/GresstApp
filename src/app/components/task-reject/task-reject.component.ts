import { Component, Input, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ModalController, NavParams } from '@ionic/angular';
import { Tarea } from 'src/app/interfaces/tarea.interface';
import { Estado } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';

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
    private globales: Globales
  ) {
    this.activityId = this.navParams.get("ActivityId");
    this.transactionId = this.navParams.get("TransactionId");
    this.taskId = this.navParams.get("TaskId");
    console.log(this.taskId);

    this.frmMaterial = this.formBuilder.group({
      Cantidad: [],
      Observaciones: [],
    });
  }

  async ngOnInit() {
    this.task = await this.globales.getTarea(this.activityId, this.transactionId, this.taskId);
    if (this.task)
    {
      const materialItem = await this.globales.getMaterial(this.task.IdMaterial)
      this.material = materialItem?.Nombre ?? '';

      if (this.task.IdPunto)
      {
        const puntoItem = await this.globales.getPunto(this.task.IdPunto);
        this.point = puntoItem?.Nombre ?? '';
      }

      if (this.task.IdSolicitante)
      {
        const solicitante = await this.globales.getTercero(this.task.IdSolicitante);
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
    if (this.frmMaterial.valid)
    {
      const data = this.frmMaterial.value;
      const task = await this.globales.getTarea(this.activityId, this.transactionId, this.taskId);
      if (task)
      {
        task.Observaciones = data.Observaciones;
        task.IdEstado = Estado.Rechazado;
        this.globales.updateTarea(this.activityId, this.transactionId, task);
        this.modalCtrl.dismiss(data);
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
