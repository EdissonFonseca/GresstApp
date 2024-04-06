import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistroClavePageRoutingModule } from './registro-clave-routing.module';

import { RegistroClavePage } from './registro-clave.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistroClavePageRoutingModule
  ],
  declarations: [RegistroClavePage]
})
export class RegistroClavePageModule {}
