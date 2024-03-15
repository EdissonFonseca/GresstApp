import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegistroCuentaPageRoutingModule } from './registro-cuenta-routing.module';

import { RegistroCuentaPage } from './registro-cuenta.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ReactiveFormsModule,
    RegistroCuentaPageRoutingModule
  ],
  declarations: [RegistroCuentaPage]
})
export class RegistroCuentaPageModule {}
