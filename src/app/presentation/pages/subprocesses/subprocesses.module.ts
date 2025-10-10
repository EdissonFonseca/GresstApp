import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SubprocessesPageRoutingModule } from './subprocesses-routing.module';
import { SubprocessesPage } from './subprocesses.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SubprocessesPageRoutingModule,
    SubprocessesPage
  ],
  declarations: []
})
export class SubprocessesPageModule {}

