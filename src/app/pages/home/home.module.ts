import { NgModule } from '@angular/core';
import { HomePageRoutingModule } from './home-routing.module';
import { HomePage } from './home.page';

@NgModule({
  imports: [
    HomePageRoutingModule,
    HomePage
  ]
})
export class HomePageModule {}
