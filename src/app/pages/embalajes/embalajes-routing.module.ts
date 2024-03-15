import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { EmbalajesPage } from './embalajes.page';

const routes: Routes = [
  {
    path: '',
    component: EmbalajesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class EmbalajesPageRoutingModule {}
