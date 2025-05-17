import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { MaterialListPageRoutingModule } from './material-list-routing.module';
import { MaterialListPage } from './material-list.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    MaterialListPageRoutingModule
  ],
  declarations: [MaterialListPage]
})
export class MaterialListPageModule {}
