import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PasswordKeyPage } from './password-key.page';

const routes: Routes = [
  {
    path: '',
    component: PasswordKeyPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PasswordKeyPageRoutingModule {}
