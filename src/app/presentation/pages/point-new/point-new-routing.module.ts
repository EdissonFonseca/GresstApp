import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PointNewPage } from './point-new.page';

const routes: Routes = [
  {
    path: '',
    component: PointNewPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PointNewPageRoutingModule {}
