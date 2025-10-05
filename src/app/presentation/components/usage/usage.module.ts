import { NgModule, CUSTOM_ELEMENTS_SCHEMA } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { UsageComponent } from './usage.component';

@NgModule({
  declarations: [
    UsageComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    ReactiveFormsModule
  ],
  exports: [
    UsageComponent
  ],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
export class UsageModule { }
