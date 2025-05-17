import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterCodePageRoutingModule } from './register-code-routing.module';

import { RegisterCodePage } from './register-code.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterCodePageRoutingModule
  ],
  declarations: [RegisterCodePage]
})
export class RegisterCodePageModule {}
