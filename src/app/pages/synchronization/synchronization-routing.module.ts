import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SynchronizationPage } from './synchronization.page';

const routes: Routes = [
  {
    path: '',
    component: SynchronizationPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SynchronizationPageRoutingModule {}
