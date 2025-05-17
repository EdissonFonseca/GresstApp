import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ThirdPartiesPage } from './third-parties.page';

const routes: Routes = [
  {
    path: '',
    component: ThirdPartiesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ThirdPartiesPageRoutingModule {}
