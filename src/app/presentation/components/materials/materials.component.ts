import { Component, Input, OnInit, Output, EventEmitter } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Material } from '@app/domain/entities/material.entity';
import { CRUD_OPERATIONS, PERMISSIONS } from '@app/core/constants';
import { MaterialRepository } from '@app/infrastructure/repositories/material.repository';
import { AuthorizationRepository } from '@app/infrastructure/repositories/authorization.repository';
import { UserNotificationService } from '@app/presentation/services/user-notification.service';
@Component({
  selector: 'app-materials',
  templateUrl: './materials.component.html',
  styleUrls: ['./materials.component.scss'],
  standalone: false
})
export class MaterialsComponent implements OnInit {
  @Input() showHeader: boolean = true;
  @Output() materialSelected = new EventEmitter<{
    id: string;
    name: string;
    capture: string;
    measure: string;
    weight: number | undefined;
    volume: number | undefined;
  }>();

  formData: FormGroup;
  materials: Material[] = [];
  selectedValue: string = '';
  selectedName: string = '';
  selectedCaptura: string = '';
  selectedMedicion: string = '';
  searchText: string = '';
  showFactor: boolean = false;
  showNew: boolean = false;
  enableNew: boolean = false;

  constructor(
    private materialsRepository: MaterialRepository,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private authorizationRepository: AuthorizationRepository,
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
      this.materials = await this.materialsRepository.getAll();
      // Sort materials by name
      this.materials = this.materials.sort((a, b) => a.Name.localeCompare(b.Name));
      this.enableNew = (await this.authorizationRepository.getPermission(PERMISSIONS.APP_MATERIAL))?.includes(CRUD_OPERATIONS.CREATE);
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

      const materials = await this.materialsRepository.getAll();
      this.materials = materials.filter((material) => material.Name.toLowerCase().indexOf(query) > -1);
      // Sort filtered materials by name
      this.materials = this.materials.sort((a, b) => a.Name.localeCompare(b.Name));
    } catch (error) {
      console.error('Error searching materials:', error);
      this.userNotificationService.showToast('Error al buscar materiales', 'middle');
    }
  }

  async select(idMaterial: string, nombre: string, captura: string, medicion: string, weight: number | undefined = undefined, volume: number | undefined = undefined) {
    try {
      this.selectedValue = idMaterial;
      this.selectedName = nombre;
      this.selectedCaptura = captura;
      this.selectedMedicion = medicion;

      const data = {
        id: this.selectedValue,
        name: this.selectedName,
        capture: this.selectedCaptura,
        measure: this.selectedMedicion,
        weight: weight,
        volume: volume,
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
