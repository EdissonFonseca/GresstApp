import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SupplyPage } from './supply.page';

const routes: Routes = [
  {
    path: '',
    component: SupplyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SupplyPageRoutingModule {}
