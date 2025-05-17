import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BankPage } from './bank.page';

const routes: Routes = [
  {
    path: '',
    component: BankPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class BankPageRoutingModule {}
