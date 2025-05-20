import { Component, OnInit } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { MaterialsComponent } from '@app/components/materials/materials.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-material-list',
  templateUrl: './material-list.page.html',
  styleUrls: ['./material-list.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    MaterialsComponent
  ]
})
export class MaterialListPage implements OnInit {
  constructor() { }

  ngOnInit() { }

  refresh(event?: any) {
    // Implementar la lógica de actualización
    if (event) {
      event.target.complete();
    }
  }

  onMaterialSelected(material: any) {
    // Implementar la lógica cuando se selecciona un material
    console.log('Material seleccionado:', material);
  }

  addMaterial() {
    // Implementar la lógica para agregar un nuevo material
    console.log('Agregar nuevo material');
  }
}
