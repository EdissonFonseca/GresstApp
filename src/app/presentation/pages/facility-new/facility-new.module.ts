import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { FacilityNewPageRoutingModule } from './facility-new-routing.module';
import { FacilityNewPage } from './facility-new.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    FacilityNewPageRoutingModule,
    FacilityNewPage
  ],
  declarations: []
})
export class FacilityNewPageModule {}

