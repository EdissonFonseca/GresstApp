import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PasswordEmailPage } from './password-email.page';

const routes: Routes = [
  {
    path: '',
    component: PasswordEmailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasswordEmailPageRoutingModule {}
