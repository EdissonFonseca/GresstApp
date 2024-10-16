import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Transaccion } from 'src/app/interfaces/transaccion.interface';
import { CRUDOperacion, Estado } from 'src/app/services/constants.service';
import { PuntosService } from 'src/app/services/puntos.service';
import { TercerosService } from 'src/app/services/terceros.service';
import { TransaccionesService } from 'src/app/services/transacciones.service';

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
    private transaccionesService: TransaccionesService,
    private puntosService: PuntosService,
    private tercerosService: TercerosService
  ) {
    this.activityId = this.navParams.get("ActivityId");
    this.transactionId = this.navParams.get("TransactionId");
    console.log(this.transactionId);

    this.frmTransaction = this.formBuilder.group({
      Observaciones: [],
    });
  }

  async ngOnInit() {
    this.transaction = await this.transaccionesService.get(this.activityId, this.transactionId);
    if (this.transaction)
    {
      if (this.transaction.IdDeposito)
      {
        const puntoItem = await this.puntosService.get(this.transaction.IdDeposito);
        this.point = puntoItem?.Nombre ?? '';
      }

      if (this.transaction.IdTercero)
      {
        const solicitante = await this.tercerosService.get(this.transaction.IdTercero);
        this.stakeholder = solicitante?.Nombre ?? '';
      }

      this.frmTransaction.patchValue({
      });
    }
  }

  async reject() {
    if (this.frmTransaction.valid)
    {
      const data = this.frmTransaction.value;
      const transaccion = await this.transaccionesService.get(this.activityId, this.transactionId);
      if (transaccion)
      {
        console.log(transaccion);
        transaccion.ResponsableObservaciones  = data.Observaciones;
        transaccion.IdEstado = Estado.Rechazado;
        this.transaccionesService.update(transaccion);
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
