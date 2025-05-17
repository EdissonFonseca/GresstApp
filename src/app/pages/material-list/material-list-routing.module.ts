import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MaterialListPage } from './material-list.page';

const routes: Routes = [
  {
    path: '',
    component: MaterialListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class MaterialListPageRoutingModule {}