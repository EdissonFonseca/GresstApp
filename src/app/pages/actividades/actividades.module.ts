import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ActividadesPageRoutingModule } from './actividades-routing.module';

import { ActividadesPage } from './actividades.page';
import { ComponentsModule } from '@app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    ComponentsModule,
    FormsModule,
    IonicModule,
    ActividadesPageRoutingModule
  ],
  declarations: [ActividadesPage]
})
export class ActividadesPageModule {}
