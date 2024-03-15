import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { CertificadosBuscarPage } from './certificados-buscar.page';

const routes: Routes = [
  {
    path: '',
    component: CertificadosBuscarPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class CertificadosBuscarPageRoutingModule {}
