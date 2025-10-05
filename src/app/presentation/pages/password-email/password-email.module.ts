import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { PasswordEmailPageRoutingModule } from './password-email-routing.module';

import { PasswordEmailPage } from './password-email.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    PasswordEmailPageRoutingModule
  ],
  declarations: [PasswordEmailPage]
})
export class PasswordEmailPageModule {}
