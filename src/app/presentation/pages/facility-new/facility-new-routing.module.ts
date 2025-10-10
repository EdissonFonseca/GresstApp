import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { FacilityNewPage } from './facility-new.page';

const routes: Routes = [
  {
    path: '',
    component: FacilityNewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class FacilityNewPageRoutingModule {}

