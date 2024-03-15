import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { InsumosPageRoutingModule } from './insumos-routing.module';

import { InsumosPage } from './insumos.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    InsumosPageRoutingModule
  ],
  declarations: [InsumosPage]
})
export class InsumosPageModule {}
