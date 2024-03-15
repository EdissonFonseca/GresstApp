import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatInterlocutoresPageRoutingModule } from './chat-interlocutores-routing.module';

import { ChatInterlocutoresPage } from './chat-interlocutores.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatInterlocutoresPageRoutingModule
  ],
  declarations: [ChatInterlocutoresPage]
})
export class ChatInterlocutoresPageModule {}
