import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContrasenaCodigoPage } from './contrasena-codigo.page';

const routes: Routes = [
  {
    path: '',
    component: ContrasenaCodigoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContrasenaCodigoPageRoutingModule {}
