import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TreatmentListPage } from './treatment-list.page';

const routes: Routes = [
  {
    path: '',
    component: TreatmentListPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TreatmentListPageRoutingModule {}
