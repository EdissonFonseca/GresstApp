import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContrasenaCorreoPageRoutingModule } from './contrasena-correo-routing.module';

import { ContrasenaCorreoPage } from './contrasena-correo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContrasenaCorreoPageRoutingModule
  ],
  declarations: [ContrasenaCorreoPage]
})
export class ContrasenaCorreoPageModule {}
