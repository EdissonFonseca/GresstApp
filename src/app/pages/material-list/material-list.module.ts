import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MaterialListPageRoutingModule } from './material-list-routing.module';
import { MaterialListPage } from './material-list.page';
import { MaterialsComponent } from '@app/components/materials/materials.component';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    MaterialListPageRoutingModule,
    MaterialsComponent
  ],
  declarations: [],
  schemas: []
})
export class MaterialListPageModule {}
