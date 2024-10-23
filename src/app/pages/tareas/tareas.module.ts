import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TareasPageRoutingModule } from './tareas-routing.module';

import { TareasPage } from './tareas.page';
import { ComponentsModule } from '@app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TareasPageRoutingModule
  ],
  declarations: [TareasPage]
})
export class TareasPageModule {}
