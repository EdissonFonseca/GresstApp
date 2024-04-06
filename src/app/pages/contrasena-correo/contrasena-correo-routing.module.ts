import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ContrasenaCorreoPage } from './contrasena-correo.page';

const routes: Routes = [
  {
    path: '',
    component: ContrasenaCorreoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ContrasenaCorreoPageRoutingModule {}
