import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ModalController, NavParams } from '@ionic/angular';
import { Globales } from 'src/app/services/globales.service';
import { MaterialsComponent } from '../materials/materials.component';
import { Residuo } from 'src/app/interfaces/residuo.interface';
import { TipoServicio } from 'src/app/services/constants.service';
import { InventarioService } from 'src/app/services/inventario.service';

@Component({
  selector: 'app-residue-transform',
  templateUrl: './residue-transform.component.html',
  styleUrls: ['./residue-transform.component.scss'],
})
export class ResidueTransformComponent  implements OnInit {
  //targets: any;
  residue: Residuo | undefined;
  residueId: string = '';
  residuo: string = '';
  date: Date | null = null;
  idResiduo: string = '';
  material: string = '';
  idMaterial: string = '';
  unidad:string = '';
  tituloDivisor: string ='Convertir en';
  tituloBoton: string = 'Convertir';
  colorConvert: string = 'primary';
  colorDecompose: string = 'medium';
  colorAggregate: string ='medium';
  serviceId: string = '';
  frm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private modalCtrl: ModalController,
    private navParams: NavParams,
    private inventarioService: InventarioService,
    private globales: Globales
  ) {
    this.residueId = this.navParams.get("ResidueId");
    this.frm = this.formBuilder.group({
      Quantity: []
    });

  }

  async ngOnInit() {
    this.residue = await this.inventarioService.getResiduo(this.residueId);

    this.frm.patchValue({
      Quantity: this.residue?.Cantidad
    });
  }

  confirm() {

  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  changeService(serviceId: string) {
    this.serviceId = serviceId;
    if (serviceId === TipoServicio.Tratamiento){
      this.tituloDivisor ='Convertir en';
      this.tituloBoton ='Convertir';
    }
   }

   dateTimeChanged(event: any) {
    this.date = event.detail.value;
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
        this.unidad = data.data.Unidad;
      }
    });

    return await modal.present();
   }

   async selectResiduo(){

   }
}
