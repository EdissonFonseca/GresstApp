import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistroCodigoPage } from './registro-codigo.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroCodigoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistroCodigoPageRoutingModule {}
