import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { RegistroCorreoPage } from './registro-correo.page';

const routes: Routes = [
  {
    path: '',
    component: RegistroCorreoPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegistroCorreoPageRoutingModule {}
