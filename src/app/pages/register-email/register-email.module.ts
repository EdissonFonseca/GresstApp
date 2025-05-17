import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { RegisterEmailPageRoutingModule } from './register-email-routing.module';

import { RegisterEmailPage } from './register-email.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    RegisterEmailPageRoutingModule
  ],
  declarations: [RegisterEmailPage]
})
export class RegisterEmailPageModule {}
