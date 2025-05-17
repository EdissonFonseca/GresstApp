import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ChatInterlocutorsPage } from './chat-interlocutors.page';

const routes: Routes = [
  {
    path: '',
    component: ChatInterlocutorsPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatInterlocutorsPageRoutingModule {}
