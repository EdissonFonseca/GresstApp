import { Component, OnInit } from '@angular/core';
import { ModalController, NavParams } from '@ionic/angular';
import { PointsComponent } from '../points/points.component';
import { GlobalesService } from 'src/app/services/globales.service';
import { VehiclesComponent } from '../vehicles/vehicles.component';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { Material } from 'src/app/interfaces/material.interface';
import { InventarioService } from 'src/app/services/inventario.service';
import { MaterialesService } from 'src/app/services/materiales.service';

@Component({
  selector: 'app-residue-move',
  templateUrl: './residue-move.component.html',
  styleUrls: ['./residue-move.component.scss'],
})
export class ResidueMoveComponent  implements OnInit {
  //targets: any;
  date: Date | null = null;
  residueId: string = '';
  target: string = '';
  targetId: string = '';
  vehicle: string = '';
  vehicleId: string = '';
  residue: Residuo | undefined = undefined;
  material: Material | undefined = undefined;
  mode: string = '';
  unidadCantidad: string = 'un';
  unidadPeso: string = 'kg';
  unidadVolumen: string = 'lt';

  constructor(
    private navParams: NavParams,
    private modalCtrl: ModalController,
    private inventarioService: InventarioService,
    private materialesService: MaterialesService,
    private globales: GlobalesService
  ) {
    this.residueId = this.navParams.get("ResidueId");
  }

  async ngOnInit() {
    this.residue = await this.inventarioService.getResiduo(this.residueId);

    if (!this.residue) return;

    this.unidadCantidad = this.globales.unidadCantidad;
    this.unidadPeso = this.globales.unidadPeso;
    this.unidadVolumen = this.globales.unidadPeso;

    this.material = await this.materialesService.get(this.residue.IdMaterial);
  }

  async confirm() {
    if (!this.residue) return;

    this.residue.IdDeposito = this.targetId;
    this.residue.IdVehiculo = this.vehicleId;
    this.inventarioService.updateResiduo(this.residue);

    this.modalCtrl.dismiss({TargetId: this.targetId, VehicleId: this.vehicleId, Target: this.target });
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  dateTimeChanged(event: any) {
    this.date = event.detail.value;
  }

  async selectTarget() {
    const idTercero = await this.globales.getIdPersona();
    const modal =   await this.modalCtrl.create({
      component: PointsComponent,
      componentProps: {
        idTercero: idTercero
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.targetId = data.data.id;
        this.target = data.data.name;
      }
    });

    return await modal.present();
   }

   async selectVehicle() {
    const modal =   await this.modalCtrl.create({
      component: VehiclesComponent,
      componentProps: {
      },
    });

    modal.onDidDismiss().then((data) => {
      if (data && data.data) {
        this.vehicleId = data.data.id;
        this.vehicle = data.data.name;
      }
    });

    return await modal.present();
   }

   changeMode(type: string) {
    this.mode = type;
   }
}
