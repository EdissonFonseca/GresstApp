import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { SincronizacionPageRoutingModule } from './sincronizacion-routing.module';

import { SincronizacionPage } from './sincronizacion.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SincronizacionPageRoutingModule
  ],
  declarations: [SincronizacionPage]
})
export class SincronizacionPageModule {}
