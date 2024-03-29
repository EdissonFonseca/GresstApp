import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NavController } from '@ionic/angular';
import { Mensaje } from 'src/app/interfaces/mensaje.interface';
import { AuthService } from 'src/app/services/auth.service';
import { Globales } from 'src/app/services/globales.service';
import { IntegrationService } from 'src/app/services/integration.service';
import { StorageService } from 'src/app/services/storage.service';

@Component({
  selector: 'app-chat',
  templateUrl: './chat.page.html',
  styleUrls: ['./chat.page.scss'],
})
export class ChatPage implements OnInit {
  messages: Mensaje[] = [];
  newMessage: string = '';
  idInterlocutor: string = '';
  idResiduo: string = '';
  interlocutor: string = '';
  myName: string = '';

  constructor(
    private navCtrl: NavController,
    private route: ActivatedRoute,
    private globales:Globales,
    private storage: StorageService,
    private authService: AuthService,
    private integrationService: IntegrationService
  ) { }

  async ngOnInit() {
    this.globales.showLoading('Sincronizando ....');
    this.route.queryParams.subscribe(params => {
      this.idResiduo = params["IdResiduo"],
      this.idInterlocutor = params["IdInterlocutor"],
      this.interlocutor = params["Interlocutor"]
    });
    this.myName = await this.storage.get('Login');
    const password = await this.storage.get('Password');
    const token = await this.authService.login(this.myName, password);
    this.messages = await this.integrationService.getMensajes(token, this.idResiduo, this.idInterlocutor);

    this.globales.hideLoading();
  }


  sendMessage() {
    const now = new Date();

    const options: Intl.DateTimeFormatOptions = {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    };

    const formattedDate = new Intl.DateTimeFormat('es-ES', options).format(now);
    if (this.newMessage.trim() !== '') {
      this.messages.push({ Mensaje: this.newMessage, EnvioRecepcion: "E", Enviado:false, Leido:false, Fecha:formattedDate });
      this.newMessage = '';
    }
  }
}
