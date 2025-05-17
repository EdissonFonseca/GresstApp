import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ServiceListPageRoutingModule } from './service-list-routing.module';
import { ServiceListPage } from './service-list.page';
import { ComponentsModule } from 'src/app/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ComponentsModule,
    ServiceListPageRoutingModule
  ],
  declarations: [ServiceListPage]
})
export class ServiceListPageModule {}
