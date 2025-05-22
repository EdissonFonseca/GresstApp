import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { IonicModule, ModalController } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Material } from '@app/interfaces/material.interface';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/constants/constants';
import { MaterialsService } from '@app/services/masterdata/materials.service';
import { Utils } from '@app/utils/utils';
import { AuthorizationService } from '@app/services/core/authorization.services';
import { UserNotificationService } from '@app/services/core/user-notification.service';
@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule,
    FormsModule
  ],
  schemas: []
})
export class MaterialsComponent implements OnInit {
  @Input() showHeader: boolean = true;
  @Output() materialSelected = new EventEmitter<{
    id: string;
    name: string;
    capture: string;
    measure: string;
    factor: number;
  }>();

  formData: FormGroup;
  materials: Material[] = [];
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
    private authorizationService: AuthorizationService,
    private userNotificationService: UserNotificationService
  ) {
    this.formData = this.formBuilder.group({
      Nombre: ['', Validators.required],
      Captura: ['', Validators.required],
      Medicion: [],
      Factor: [],
      Referencia: [],
      Aprovechable: [false]
    });
  }

  async ngOnInit() {
    await this.loadMaterials();
  }

  async loadMaterials() {
    try {
      this.materials = await this.materialsService.list();
      this.enableNew = (await this.authorizationService.getPermission(PERMISSIONS.APP_MATERIAL))?.includes(CRUD_OPERATIONS.CREATE);
    } catch (error) {
      console.error('Error loading materials:', error);
      this.userNotificationService.showToast('Error al cargar los materiales', 'middle');
    }
  }

  async handleInput(event: any) {
    try {
      this.selectedName = event.target.value;
      this.searchText = this.selectedName;
      const query = event.target.value.toLowerCase();
      this.formData.patchValue({ Nombre: this.selectedName });

      const materials = await this.materialsService.list();
      this.materials = materials.filter((material) => material.Nombre.toLowerCase().indexOf(query) > -1);
    } catch (error) {
      console.error('Error searching materials:', error);
      this.userNotificationService.showToast('Error al buscar materiales', 'middle');
    }
  }

  async select(idMaterial: string, nombre: string, captura: string, medicion: string, factor: number) {
    try {
      this.selectedValue = idMaterial;
      this.selectedName = nombre;
      this.selectedCaptura = captura;
      this.selectedMedicion = medicion;
      this.selectedFactor = factor;

      const data = {
        id: this.selectedValue,
        name: this.selectedName,
        capture: this.selectedCaptura,
        measure: this.selectedMedicion,
        factor: this.selectedFactor
      };

      this.materialSelected.emit(data);
      this.modalCtrl.dismiss(data);
    } catch (error) {
      console.error('Error selecting material:', error);
      this.userNotificationService.showToast('Error al seleccionar el material', 'middle');
    }
  }

  new() {
    this.showNew = true;
    this.formData.reset({
      Nombre: null,
      Referencia: null,
      Captura: null,
      Medicion: null,
      Factor: null,
      Aprovechable: false
    });
  }

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  search() {
    this.showNew = false;
  }

  async create() {
    if (this.formData.valid) {
      try {
        const formData = this.formData.value;
        let medicion = formData.Medicion || formData.Captura;
        let captura = formData.Captura;
        let factor = formData.Factor || 1;

        medicion = this.convertMedida(medicion);
        captura = this.convertMedida(captura);

        const material: Material = {
          IdMaterial: Utils.generateId(),
          Nombre: formData.Nombre,
          TipoCaptura: captura,
          Factor: factor,
          TipoMedicion: medicion,
          Aprovechable: formData.Aprovechable,
          Referencia: formData.Referencia
        };

        const created = await this.materialsService.create(material);
        if (created) {
          const data = { id: material.IdMaterial, name: material.Nombre };
          if (this.showHeader) {
            this.modalCtrl.dismiss(data);
            this.selectedValue = material.IdMaterial;
          } else {
            await this.loadMaterials();
            await this.userNotificationService.showToast(`Material ${material.Nombre} creado`, 'middle');
            this.selectedValue = '';
          }
        }
      } catch (error) {
        console.error('Error creating material:', error);
        this.userNotificationService.showToast('Error al crear el material', 'middle');
      }
    }
  }

  private convertMedida(medida: string): string {
    switch (medida) {
      case 'Cantidad':
        return 'C';
      case 'Peso':
        return 'P';
      case 'Volumen':
        return 'V';
      default:
        return medida;
    }
  }

  async onChangeMedida(unidadMedida: string) {
    const formData = this.formData.value;
    this.showFactor = !(unidadMedida == undefined || unidadMedida == null || unidadMedida == formData.Captura);
  }
}
