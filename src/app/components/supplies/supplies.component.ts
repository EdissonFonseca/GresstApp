import { Component, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Insumo } from 'src/app/interfaces/insumo.interface';
import { CRUDOperacion, Permisos } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { MasterDataService } from 'src/app/services/masterdata.service';

@Component({
  selector: 'app-supplies',
  templateUrl: './supplies.component.html',
  styleUrls: ['./supplies.component.scss'],
})
export class SuppliesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  supplies : Insumo[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string = '';
  enableNew: boolean = false;
  showNew: boolean = false;
  formData: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private globales: Globales,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private masterDataService: MasterDataService,
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
    });
  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {});
    this.supplies = await this.masterDataService.getInsumos();
    this.enableNew = (await this.globales.getPermiso(Permisos.AppInsumo))?.includes(CRUDOperacion.Create);
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const insumos = await this.masterDataService.getInsumos();
    this.supplies = insumos.filter((supply) => supply.Nombre .toLowerCase().indexOf(query) > -1);
  }

  select(idMaterial: string) {
    this.selectedValue = idMaterial;
    this.modalCtrl.dismiss(this.selectedValue, 'confirm');
  }

  cancel() {
    this.modalCtrl.dismiss(null, 'cancel');
  }

  new() {
    this.showNew = true;
    this.formData.setValue({Nombre: null});
  }

  async create() {
    const formData = this.formData.value;
    const insumo: Insumo = { IdInsumo: this.globales.newId(), Nombre: formData.Nombre, IdEstado: 'A'};
    const created = await this.masterDataService.createInsumo(insumo);
    if (created)
    {
      const data = {id: insumo.IdInsumo, name: formData.Nombre};
      if (this.showHeader){
        this.modalCtrl.dismiss(data);
        this.selectedValue = insumo.IdInsumo;
      }
      else{
        this.supplies = await this.masterDataService.getInsumos();
        await this.globales.presentToast(`Insumo ${formData.Nombre} creado`, 'middle');
        this.selectedValue = '';
        this.searchText = '';
      }
      this.formData.setValue({Nombre: null});
      this.showNew = false;
    }
  }
}
