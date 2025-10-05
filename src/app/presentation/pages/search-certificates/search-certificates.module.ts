import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { SearchCertificatesPageRoutingModule } from './search-certificates-routing.module';
import { SearchCertificatesPage } from './search-certificates.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    SearchCertificatesPageRoutingModule
  ],
  declarations: [SearchCertificatesPage]
})
export class SearchCertificatesPageModule {}
