import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ProcessesPageRoutingModule } from './processes-routing.module';
import { ProcessesPage } from './processes.page';
import { ComponentsModule } from '@app/presentation/components/components.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TranslateModule,
    ProcessesPageRoutingModule,
    ComponentsModule
  ],
  declarations: [ProcessesPage]
})
export class ProcessesModule {}
