import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistroCodigoPageRoutingModule } from './registro-codigo-routing.module';

import { RegistroCodigoPage } from './registro-codigo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistroCodigoPageRoutingModule
  ],
  declarations: [RegistroCodigoPage]
})
export class RegistroCodigoPageModule {}
