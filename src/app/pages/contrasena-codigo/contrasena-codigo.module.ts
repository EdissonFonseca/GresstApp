import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContrasenaCodigoPageRoutingModule } from './contrasena-codigo-routing.module';

import { ContrasenaCodigoPage } from './contrasena-codigo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContrasenaCodigoPageRoutingModule
  ],
  declarations: [ContrasenaCodigoPage]
})
export class ContrasenaCodigoPageModule {}
