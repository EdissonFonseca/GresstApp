import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ModalController, ToastController } from '@ionic/angular';
import { Globales } from 'src/app/services/globales.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Material } from 'src/app/interfaces/material.interface';

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
  isCaptureDifferentFromMeasure: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private globales: Globales,
    private modalCtrl: ModalController,
    private formBuilder: FormBuilder,
    private toastCtrl: ToastController,
  ) {
    this.formData = this.formBuilder.group({
      Captura: ['', Validators.required],
      Medicion: ['', Validators.required],
      Factor: [],
      Aprovechable: []
    });
  }

  async ngOnInit() {
    this.materials = await this.globales.getMateriales();
  }

  async handleInput(event: any){
    this.selectedName = event.target.value;
    this.searchText = this.selectedName;
    const query = event.target.value.toLowerCase();

    const materiales = await this.globales.getMateriales();
    this.materials = materiales.filter((material) => material.Nombre .toLowerCase().indexOf(query) > -1);
  }

  changeConversion(){
    this.isCaptureDifferentFromMeasure = !this.isCaptureDifferentFromMeasure;
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

  cancel() {
    this.modalCtrl.dismiss(null);
  }

  async create() {
    if (this.formData.valid)
    {
      const formData = this.formData.value;
      const material: Material = {IdMaterial: this.globales.newId(), Nombre: this.selectedName, Captura: formData.Captura, Factor: formData.Factor, Medicion: formData.Medicion, Aprovechable: formData.Aprovechable};
      await this.globales.createMaterial(material);
      const data = {id: material.IdMaterial, name: this.selectedName};
      if (this.showHeader){
        this.modalCtrl.dismiss(data);
      }
      else{
        this.selectedValue = material.IdMaterial;
        this.searchText = '';
        this.materials = await this.globales.getMateriales();
        const toast = await this.toastCtrl.create({
          message: `Material ${this.selectedName} creado`,
          duration: 1500,
          position: 'top',
        });

        await toast.present();
      }
    }
  }
}
