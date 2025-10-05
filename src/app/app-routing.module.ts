import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'account',
    loadChildren: () => import('./presentation/pages/account/account.module').then( m => m.AccountPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./presentation/pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./presentation/pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'point-new',
    loadChildren: () => import('./presentation/pages/point-new/point-new.module').then( m => m.PointNewPageModule)
  },
  {
    path: 'search-certificates',
    loadChildren: () => import('./presentation/pages/search-certificates/search-certificates.module').then( m => m.SearchCertificatesPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./presentation/pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'activities',
    loadChildren: () => import('./presentation/pages/processes/processes.module').then( m => m.ProcessesModule)
  },
  {
    path: 'tasks',
    loadChildren: () => import('./presentation/pages/tasks/tasks.module').then(m => m.TasksPageModule)
  },
  {
    path: 'transactions',
    loadChildren: () => import('./presentation/pages/transactions/transactions.module').then(m => m.TransactionsPageModule)
  },
  {
    path: 'password-email',
    loadChildren: () => import('./presentation/pages/password-email/password-email.module').then( m => m.PasswordEmailPageModule)
  },
  {
    path: 'password-code',
    loadChildren: () => import('./presentation/pages/password-code/password-code.module').then( m => m.PasswordCodePageModule)
  },
  {
    path: 'password-key',
    loadChildren: () => import('./presentation/pages/password-key/password-key.module').then( m => m.PasswordKeyPageModule)
  },
  {
    path: 'synchronization',
    loadChildren: () => import('./presentation/pages/synchronization/synchronization.module').then(m => m.SynchronizationPageModule)
  },
  {
    path: 'route',
    loadChildren: () => import('./presentation/pages/route/route.module').then(m => m.RoutePageModule)
  },
  {
    path: 'inventory',
    loadChildren: () => import('./presentation/pages/inventory/inventory.module').then(m => m.InventoryPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
