import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterCodePage } from './register-code.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterCodePage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterCodePageRoutingModule {}
