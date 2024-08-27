import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { CRUDOperacion, Estado } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';

@Component({
  selector: 'app-transaction-reject',
  templateUrl: './transaction-reject.component.html',
  styleUrls: ['./transaction-reject.component.scss'],
})
export class TransactionRejectComponent  implements OnInit {
  @Input() showName: boolean = true;
  @Input() showPin: boolean = true;
  @Input() showNotes: boolean = true;
  @Input() showSignPad: boolean = true;
  @Input() notesText: string = 'Al aprobar la operacion, todos los pendientes quedan descartados';
  activityId: string = '';
  transactionId: string = '';
  target: string = '';
  targetId: string = '';
  packageId: string = '';
  package: string = '';
  unit: string = '';
  material: string = '';
  point: string = '';
  stakeholder: string = '';
  transaction: Transaccion | undefined = undefined;
  showDetails: boolean = false;
  frmTransaction!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private globales: Globales,
  ) {
    this.activityId = this.navParams.get("ActivityId");
    this.transactionId = this.navParams.get("TransactionId");
    console.log(this.transactionId);

    this.frmTransaction = this.formBuilder.group({
      Observaciones: [],
    });
  }

  async ngOnInit() {
    this.transaction = await this.globales.getTransaccion(this.activityId, this.transactionId);
    if (this.transaction)
    {
      if (this.transaction.IdPunto)
      {
        const puntoItem = await this.globales.getPunto(this.transaction.IdPunto);
        this.point = puntoItem?.Nombre ?? '';
      }

      if (this.transaction.IdTercero)
      {
        const solicitante = await this.globales.getTercero(this.transaction.IdTercero);
        this.stakeholder = solicitante?.Nombre ?? '';
      }

      this.frmTransaction.patchValue({
      });
    }
  }

  async reject() {
    const now = new Date();
    const isoDate = now.toISOString();

    if (this.frmTransaction.valid)
    {
      console.log('Reject');
      const data = this.frmTransaction.value;
      const transaccion = await this.globales.getTransaccion(this.activityId, this.transactionId);
      if (transaccion)
      {
        console.log(transaccion);
        transaccion.CRUD = CRUDOperacion.Update;
        transaccion.CRUDDate = now;
        transaccion.Observaciones = data.Observaciones;
        transaccion.IdEstado = Estado.Rechazado;
        transaccion.FechaEjecucion = isoDate;
        this.globales.updateTransaccion(this.activityId, transaccion);
        this.modalCtrl.dismiss(transaccion);
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
