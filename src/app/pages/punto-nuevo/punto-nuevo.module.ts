import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PuntoNuevoPageRoutingModule } from './punto-nuevo-routing.module';

import { PuntoNuevoPage } from './punto-nuevo.page';
import { ComponentsModule } from 'src/app/components/components.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ReactiveFormsModule,
    PuntoNuevoPageRoutingModule
  ],
  declarations: [PuntoNuevoPage]
})
export class PuntoNuevoPageModule {}
