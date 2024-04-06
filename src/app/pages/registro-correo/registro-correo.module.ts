import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistroCorreoPageRoutingModule } from './registro-correo-routing.module';

import { RegistroCorreoPage } from './registro-correo.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegistroCorreoPageRoutingModule
  ],
  declarations: [RegistroCorreoPage]
})
export class RegistroCorreoPageModule {}
