import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SynchronizationPageRoutingModule } from './synchronization-routing.module';
import { SynchronizationPage } from './synchronization.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SynchronizationPageRoutingModule,
    SynchronizationPage
  ],
  declarations: []
})
export class SynchronizationPageModule {}
