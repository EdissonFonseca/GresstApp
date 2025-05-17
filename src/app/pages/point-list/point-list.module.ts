import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PointListPageRoutingModule } from './point-list-routing.module';
import { PointListPage } from './point-list.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    PointListPageRoutingModule
  ],
  declarations: [PointListPage]
})
export class PointListPageModule {}
