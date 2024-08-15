import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { SincronizacionPage } from './sincronizacion.page';

const routes: Routes = [
  {
    path: '',
    component: SincronizacionPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SincronizacionPageRoutingModule {}
