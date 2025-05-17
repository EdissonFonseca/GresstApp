import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'chat-interlocutors',
    loadChildren: () => import('./pages/chat-interlocutors/chat-interlocutors.module').then( m => m.ChatInterlocutorsPageModule)
  },
  {
    path: 'account',
    loadChildren: () => import('./pages/account/account.module').then( m => m.AccountPageModule)
  },
  {
    path: 'home',
    loadChildren: () => import('./pages/home/home.module').then( m => m.HomePageModule)
  },
  {
    path: 'login',
    loadChildren: () => import('./pages/login/login.module').then(m => m.LoginPageModule)
  },
  {
    path: 'material-list',
    loadChildren: () => import('./pages/material-list/material-list.module').then( m => m.MaterialListPageModule)
  },
  {
    path: 'point-new',
    loadChildren: () => import('./pages/point-new/point-new.module').then( m => m.PointNewPageModule)
  },
  {
    path: 'summary',
    loadChildren: () => import('./pages/summary/summary.module').then( m => m.SummaryPageModule)
  },
  {
    path: 'chat',
    loadChildren: () => import('./pages/chat/chat.module').then( m => m.ChatPageModule)
  },
  {
    path: 'packaging',
    loadChildren: () => import('./pages/packaging/packaging.module').then( m => m.PackagingPageModule)
  },
  {
    path: 'supply',
    loadChildren: () => import('./pages/supply/supply.module').then(m => m.SupplyPageModule)
  },
  {
    path: 'third-parties',
    loadChildren: () => import('./pages/third-parties/third-parties.module').then( m => m.ThirdPartiesPageModule)
  },
  {
    path: 'point-list',
    loadChildren: () => import('./pages/point-list/point-list.module').then( m => m.PointListPageModule)
  },
  {
    path: 'search-certificates',
    loadChildren: () => import('./pages/search-certificates/search-certificates.module').then( m => m.SearchCertificatesPageModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./pages/profile/profile.module').then( m => m.ProfilePageModule)
  },
  {
    path: 'tutorial',
    loadChildren: () => import('./pages/tutorial/tutorial.module').then( m => m.TutorialPageModule)
  },
  {
    path: 'activities',
    loadChildren: () => import('./pages/activities/activities.module').then( m => m.ActivitiesPageModule)
  },
  {
    path: 'tasks',
    loadChildren: () => import('./pages/tasks/tasks.module').then(m => m.TasksPageModule)
  },
  {
    path: 'transactions',
    loadChildren: () => import('./pages/transactions/transactions.module').then(m => m.TransactionsPageModule)
  },
  {
    path: 'treatment-list',
    loadChildren: () => import('./pages/treatment-list/treatment-list.module').then( m => m.TreatmentListPageModule)
  },
  {
    path: 'register-email',
    loadChildren: () => import('./pages/register-email/register-email.module').then( m => m.RegisterEmailPageModule)
  },
  {
    path: 'register-code',
    loadChildren: () => import('./pages/register-code/register-code.module').then( m => m.RegisterCodePageModule)
  },
  {
    path: 'register-key',
    loadChildren: () => import('./pages/register-key/register-key.module').then( m => m.RegisterKeyPageModule)
  },
  {
    path: 'service-list',
    loadChildren: () => import('./pages/service-list/service-list.module').then( m => m.ServiceListPageModule)
  },
  {
    path: 'password-email',
    loadChildren: () => import('./pages/password-email/password-email.module').then( m => m.PasswordEmailPageModule)
  },
  {
    path: 'password-code',
    loadChildren: () => import('./pages/password-code/password-code.module').then( m => m.PasswordCodePageModule)
  },
  {
    path: 'password-key',
    loadChildren: () => import('./pages/password-key/password-key.module').then( m => m.PasswordKeyPageModule)
  },
  {
    path: 'production',
    loadChildren: () => import('./pages/production/production.module').then(m => m.ProductionPageModule)
  },
  {
    path: 'synchronization',
    loadChildren: () => import('./pages/synchronization/synchronization.module').then(m => m.SynchronizationPageModule)
  },
  {
    path: 'route',
    loadChildren: () => import('./pages/route/route.module').then(m => m.RoutePageModule)
  },
  {
    path: 'bank',
    loadChildren: () => import('./pages/bank/bank.module').then( m => m.BankPageModule)
  },
  {
    path: 'inventory',
    loadChildren: () => import('./pages/inventory/inventory.module').then(m => m.InventoryPageModule)
  },
  {
    path: 'third-parties',
    loadChildren: () => import('./pages/third-parties/third-parties.module').then(m => m.ThirdPartiesPageModule)
  }
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
