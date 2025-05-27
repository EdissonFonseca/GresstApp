import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomePage } from './home.page';
import { ActivitiesPage } from '../activities/activities.page';

const routes: Routes = [
  {
    path: '',
    component: HomePage,
    children: [
      {
        path: 'activities',
        outlet: 'activities',
        component: ActivitiesPage
      },
      {
        path: 'inventario',
        outlet: 'inventario',
        loadChildren: () => import('../inventory/inventory.module').then(m => m.InventoryPageModule)
      },
      {
        path: 'bank',
        loadChildren: () => import('../bank/bank.module').then(m => m.BankPageModule)
      },
      {
        path: '',
        redirectTo: 'activities',
        pathMatch: 'full'
      }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class HomePageRoutingModule {}
