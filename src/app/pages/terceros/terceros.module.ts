import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TercerosPageRoutingModule } from './terceros-routing.module';

import { TercerosPage } from './terceros.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    TercerosPageRoutingModule
  ],
  declarations: [TercerosPage]
})
export class TercerosPageModule {}
