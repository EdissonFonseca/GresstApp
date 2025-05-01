import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RutaPageRoutingModule } from './ruta-routing.module';

import { RutaPage } from './ruta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RutaPageRoutingModule
  ],
  declarations: [RutaPage],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class RutaPageModule {}
