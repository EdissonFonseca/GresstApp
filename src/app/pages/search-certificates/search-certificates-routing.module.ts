import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { SearchCertificatesPage } from './search-certificates.page';

const routes: Routes = [
  {
    path: '',
    component: SearchCertificatesPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class SearchCertificatesPageRoutingModule {}
