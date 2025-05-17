import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { RegisterKeyPage } from './register-key.page';

const routes: Routes = [
  {
    path: '',
    component: RegisterKeyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class RegisterKeyPageRoutingModule {}
