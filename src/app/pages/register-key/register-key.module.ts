import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterKeyPageRoutingModule } from './register-key-routing.module';

import { RegisterKeyPage } from './register-key.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterKeyPageRoutingModule
  ],
  declarations: [RegisterKeyPage]
})
export class RegisterKeyPageModule {}
