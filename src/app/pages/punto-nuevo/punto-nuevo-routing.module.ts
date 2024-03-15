import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { PuntoNuevoPage } from './punto-nuevo.page';

const routes: Routes = [
  {
    path: '',
    component: PuntoNuevoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PuntoNuevoPageRoutingModule {}
