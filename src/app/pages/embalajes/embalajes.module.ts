import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { EmbalajesPageRoutingModule } from './embalajes-routing.module';
import { EmbalajesPage } from './embalajes.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    EmbalajesPageRoutingModule
  ],
  declarations: [EmbalajesPage]
})
export class EmbalajesPageModule {}
