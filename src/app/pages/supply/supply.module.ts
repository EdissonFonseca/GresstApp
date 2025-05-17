import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SupplyPageRoutingModule } from './supply-routing.module';
import { SupplyPage } from './supply.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
    SupplyPageRoutingModule
  ],
  declarations: [SupplyPage]
})
export class SupplyPageModule {}
