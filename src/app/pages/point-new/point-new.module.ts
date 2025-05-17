import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { PointNewPageRoutingModule } from './point-new-routing.module';
import { PointNewPage } from './point-new.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PointNewPageRoutingModule,
    PointNewPage
  ],
  declarations: []
})
export class PointNewPageModule {}
