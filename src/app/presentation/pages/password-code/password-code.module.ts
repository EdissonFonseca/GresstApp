import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordCodePageRoutingModule } from './password-code-routing.module';

import { PasswordCodePage } from './password-code.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasswordCodePageRoutingModule
  ],
  declarations: [PasswordCodePage]
})
export class PasswordCodePageModule {}
