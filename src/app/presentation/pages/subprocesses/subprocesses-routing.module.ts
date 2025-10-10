import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SubprocessesPage } from './subprocesses.page';

const routes: Routes = [
  {
    path: '',
    component: SubprocessesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SubprocessesPageRoutingModule {}

