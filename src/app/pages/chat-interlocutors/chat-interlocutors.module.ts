import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ChatInterlocutorsPage } from './chat-interlocutors.page';
import { ChatInterlocutorsPageRoutingModule } from './chat-interlocutors-routing.module';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatInterlocutorsPageRoutingModule
  ],
  declarations: [ChatInterlocutorsPage]
})
export class ChatInterlocutorsPageModule {}
