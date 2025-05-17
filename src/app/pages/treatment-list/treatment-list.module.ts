import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TreatmentListPageRoutingModule } from './treatment-list-routing.module';
import { TreatmentListPage } from './treatment-list.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TreatmentListPageRoutingModule,
    TranslateModule
  ],
  declarations: [TreatmentListPage]
})
export class TreatmentListPageModule {}
