import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterEmailPage } from './register-email.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterEmailPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterEmailPageRoutingModule {}
