import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ContrasenaClavePageRoutingModule } from './contrasena-clave-routing.module';

import { ContrasenaClavePage } from './contrasena-clave.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ContrasenaClavePageRoutingModule
  ],
  declarations: [ContrasenaClavePage]
})
export class ContrasenaClavePageModule {}
