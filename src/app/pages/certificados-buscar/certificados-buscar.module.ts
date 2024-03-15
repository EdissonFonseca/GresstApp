import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { CertificadosBuscarPageRoutingModule } from './certificados-buscar-routing.module';

import { CertificadosBuscarPage } from './certificados-buscar.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    CertificadosBuscarPageRoutingModule
  ],
  declarations: [CertificadosBuscarPage]
})
export class CertificadosBuscarPageModule {}
