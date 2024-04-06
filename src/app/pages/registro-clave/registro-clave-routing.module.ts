import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistroClavePage } from './registro-clave.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroClavePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistroClavePageRoutingModule {}
