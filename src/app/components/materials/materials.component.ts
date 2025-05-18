import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Material } from '@app/interfaces/material.interface';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/constants/constants';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { Utils } from '@app/utils/utils';
import { AuthorizationService } from '@app/services/core/authorization.services';

@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss'],
})
export class MaterialsComponent  implements OnInit {
  @Input() showHeader: boolean = true;
  formData: FormGroup;
  materials : Material[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  selectedCaptura: string = '';
  selectedMedicion: string = '';
  selectedFactor: number | null = null;
  searchText: string = '';
  showFactor: boolean = false;
  showNew: boolean = false;
  enableNew: boolean = false;

  constructor(
    private materialsService: MaterialsService,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private authorizationService: AuthorizationService
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
      Captura: ['', Validators.required],
      Medicion: [],
      Factor: [],
      Aprovechable: [],
      Referencia: [],
    });
  }

  async ngOnInit() {
    this.materials = await this.materialsService.list();
    this.enableNew = (await this.authorizationService.getPermission(PERMISSIONS.APP_MATERIAL))?.includes(CRUD_OPERATIONS.CREATE);
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();
    this.formData.patchValue({Nombre: this.selectedName});

    const materials = await this.materialsService.list();
    this.materials = materials.filter((material) => material.Nombre .toLowerCase().indexOf(query) > -1);
  }

  select(idMaterial: string, nombre: string, captura: string, medicion: string, factor: number | null) {
    this.selectedValue = idMaterial;
    this.selectedName = nombre;
    this.selectedCaptura = captura;
    this.selectedMedicion = medicion;
    this.selectedFactor = factor;
    const data = {id: this.selectedValue, name: this.selectedName, capture: this.selectedCaptura, measure: this.selectedMedicion, factor: this.selectedFactor};
    this.modalCtrl.dismiss(data);
  }

  new() {
    this.showNew = true;
    this.formData.setValue({Nombre: null, Referencia: null, Captura: null, Medicion:null, Factor: null, Aprovechable:false});
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  search() {
    this.showNew = false;
  }

  async create() {
    if (this.formData.valid)
    {
      const formData = this.formData.value;
      let medicion;
      let captura;
      let factor;

      captura = formData.Captura;
      if (formData.Medicion == undefined || formData.Medicion == null)
        medicion = captura;
      else
        medicion = formData.Medicion;

      if (formData.Factor == undefined || formData.Factor == null)
        factor = 1;
      else
        factor = formData.Factor;

      switch(medicion) {
          case "Cantidad":
            medicion = "C";
            break;
          case "Peso":
            medicion = "P";
            break;
          default:
            medicion = "V";
            break;
      }

      switch(captura) {
        case "Cantidad":
          captura = "C";
          break;
        case "Peso":
          captura = "P";
          break;
        default:
          captura = "V";
          break;
      }

      const material: Material = {IdMaterial: Utils.generateId(), Nombre: formData.Nombre, TipoCaptura: captura, Factor: factor, TipoMedicion: medicion, Aprovechable: formData.Aprovechable, Referencia: formData.Referencia};
      const created = await this.materialsService.create(material);
      if (created)
      {
        const data = {id: material.IdMaterial, name: this.selectedName};
        if (this.showHeader){
          this.modalCtrl.dismiss(data);
          this.selectedValue = material.IdMaterial;
        }
        else{
          this.materials = await this.materialsService.list();
          await Utils.showToast(`Material ${formData.Nombre} creado`, 'middle');
          this.selectedValue = '';
          this.searchText = '';
        }
        this.formData.setValue({Nombre: null, Captura: null, Medicion: null, Factor:1, Aprovechable:false, Referencia:null });
        this.showNew = false;
      }
    }
  }

  async onChangeMedida(unidadMedida: string) {
    const formData = this.formData.value;

    this.showFactor = !(unidadMedida == undefined || unidadMedida == null || unidadMedida == formData.Captura);
  }
}
