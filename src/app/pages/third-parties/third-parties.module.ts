import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ThirdPartiesPageRoutingModule } from './third-parties-routing.module';
import { ThirdPartiesPage } from './third-parties.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ThirdPartiesPageRoutingModule,
    ThirdPartiesPage
  ],
  declarations: []
})
export class ThirdPartiesPageModule {}
