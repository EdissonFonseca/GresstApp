import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatInterlocutoresPage } from './chat-interlocutores.page';

const routes: Routes = [
  {
    path: '',
    component: ChatInterlocutoresPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatInterlocutoresPageRoutingModule {}
