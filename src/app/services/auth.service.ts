import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loginUrl = `${environment.apiUrl}/login/authenticate`;
  private registerUrl = `${environment.apiUrl}/login/register`;

  constructor() {}

  async login(username: string, password:string): Promise<any>{
    const data = {Username: username, Password: password};
    const options = {url: this.loginUrl, data: data, headers: { 'Content-Type': 'application/json' }};

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error(`Response Status ${response.status}`);
      }
    } catch (error){
      if (error instanceof Error){
        throw new Error(`Request error: ${error.message}`);
      }
      else
      {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async register(username: string): Promise<string> {
    const data = {Username: username};
    const options = {url: this.registerUrl, data: data, headers: { 'Content-Type': 'application/json' }};

    try {
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error(`Response Status ${response.status}`);
      }
    } catch(error) {
      if (error instanceof Error){
        throw new Error(`Request error: ${error.message}`);
      }
      else
      {
        console.log(error);
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }
}
