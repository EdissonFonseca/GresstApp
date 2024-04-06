import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContrasenaClavePage } from './contrasena-clave.page';

const routes: Routes = [
  {
    path: '',
    component: ContrasenaClavePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContrasenaClavePageRoutingModule {}
