import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordKeyPageRoutingModule } from './password-key-routing.module';

import { PasswordKeyPage } from './password-key.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasswordKeyPageRoutingModule
  ],
  declarations: [PasswordKeyPage]
})
export class PasswordKeyPageModule {}
