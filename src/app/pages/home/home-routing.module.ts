import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'actividades',
        loadChildren: () => import('../actividades/actividades.module').then(m => m.ActividadesPageModule)
      },
      {
        path: 'inventario',
        loadChildren: () => import('../inventario/inventario.module').then(m => m.InventarioPageModule)
      },
      {
        path: 'banco',
        loadChildren: () => import('../banco/banco.module').then(m => m.BolsaPageModule)
      },
      {
        path: '',
        redirectTo: 'actividades',
        pathMatch: 'full'
      },
    ]
  },
  {
    path: '',
    redirectTo: 'actividades',
    pathMatch: 'full'
  }];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
