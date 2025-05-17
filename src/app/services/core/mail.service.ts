import { Injectable } from "@angular/core";
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '@env/environment';

@Injectable({
  providedIn: 'root',
})
export class MailService {
  private emailUrl = `${environment.apiUrl}/mail/send`;
  private emailTokenUrl = `${environment.apiUrl}/mail/sendwithtoken`;

  constructor() {
  }

  async send(email:string, subject: string, body: string) {
    const data = {Email: email, Subject: subject, Body: body};
    const options = {url: this.emailUrl, data: data, headers: { 'Content-Type': 'application/json' }};

    try {
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) {
        return;
      } else {
        throw new Error(`Response Status ${response.status}`);
      }
    } catch(error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        console.log(error);
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async sendWithToken(email:string, subject: string, body: string): Promise<string> {
    const data = {Email: email, Subject: subject, Body: body};
    const options = {url: this.emailTokenUrl, data: data, headers: { 'Content-Type': 'application/json' }};

    try {
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error(`Response Status ${response.status}`);
      }
    } catch(error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        console.log(error);
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }
}

