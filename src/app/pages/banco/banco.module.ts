import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { BolsaPageRoutingModule } from './banco-routing.module';
import { BancoPage } from './banco.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    BolsaPageRoutingModule
  ],
  declarations: [BancoPage]
})
export class BolsaPageModule {}
