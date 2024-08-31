import { Component, Input, OnInit } from '@angular/core';
import { EmailValidator, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Embalaje } from 'src/app/interfaces/embalaje.interface';
import { CRUDOperacion, Permisos } from 'src/app/services/constants.service';
import { Globales } from 'src/app/services/globales.service';
import { MasterDataService } from 'src/app/services/masterdata.service';

@Component({
  selector: 'app-packages',
  templateUrl: './packages.component.html',
  styleUrls: ['./packages.component.scss'],
})
export class PackagesComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  packages : Embalaje[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  searchText: string ='';
  enableNew: boolean = false;
  showNew: boolean = false;
  formData: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private globales: Globales,
    private masterDataService: MasterDataService,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
    });

  }

  async ngOnInit() {
    this.route.queryParams.subscribe(params => {
    });
    this.packages = await this.masterDataService.getEmbalajes();
    this.enableNew = (await this.globales.getPermiso(Permisos.AppEmbalaje))?.includes(CRUDOperacion.Create);
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    this.formData.patchValue({Nombre: this.selectedName});
    const embalajesList = await this.masterDataService.getEmbalajes();
    this.packages = embalajesList.filter((embalaje) => embalaje.Nombre .toLowerCase().indexOf(query) > -1);
  }

  new() {
    this.showNew = true;
    this.formData.setValue({Nombre: null});
  }

  select(idMaterial: string, nombre: string) {
    this.selectedValue = idMaterial;
    this.selectedName = nombre;
    const data = {id: this.selectedValue, name: this.selectedName};
    this.modalCtrl.dismiss(data);
  }

  confirm() {
    const data = {id: this.selectedValue, name: this.selectedName};
    this.modalCtrl.dismiss(data);
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  async create() {
    const formData = this.formData.value;
    const embalaje: Embalaje = { IdEmbalaje: this.globales.newId(), Nombre: formData.Nombre};
    const created = await this.masterDataService.createEmbalaje(embalaje);
    if (created)
    {
      const data = {id: embalaje.IdEmbalaje, name: formData.Nombre};
      if (this.showHeader){
        this.modalCtrl.dismiss(data);
        this.selectedValue = embalaje.IdEmbalaje;
      }
      else{
        this.packages = await this.masterDataService.getEmbalajes();
        await this.globales.presentToast(`Embalaje ${formData.Nombre} creado`, 'middle');
        this.selectedValue = '';
        this.searchText = '';
      }
      this.formData.setValue({Nombre: null});
      this.showNew = false;
    }
  }
}
