import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PasswordCodePage } from './password-code.page';

const routes: Routes = [
  {
    path: '',
    component: PasswordCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasswordCodePageRoutingModule {}
