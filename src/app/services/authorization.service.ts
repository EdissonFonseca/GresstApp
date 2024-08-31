import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AuthorizationService {
  private pingUrl =  `${environment.apiUrl}/login/ping`;
  private loginUrl =  `${environment.apiUrl}/login/authenticate`;
  private registerUrl = `${environment.apiUrl}/login/register`;
  private existUserUrl = `${environment.apiUrl}/login/existuser`;
  private changePasswordUrl = `${environment.apiUrl}/login/changepassword`;
  private changeNameUrl = `${environment.apiUrl}/login/changename`;

  constructor() {}

  async ping(): Promise<boolean>{
    const options = {url: this.pingUrl, headers: { 'Content-Type': 'application/json' }};

    try{
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      return false;
    }
  }


  async login(username: string, password:string): Promise<any>{
    const data = {Username: username, Password: password};
    const options = {url: this.loginUrl, data: data, headers: { 'Content-Type': 'application/json' }};

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error(`Usuario no autorizado`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async existUser(email: string): Promise<boolean>{
    const data = {Username:email};
    const options = {url: this.existUserUrl, data: data, headers: { 'Content-Type': 'application/json' }};

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) {
        return true;
      } else {
        return false
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Usuario no existe`);
      } else {
        throw new Error(`Correo no registrado`);
      }
    }
  }

  async changeName(email:string, name: string): Promise<string> {
    const data = {Username: email, Name: name};
    const options = {url: this.changeNameUrl, data: data, headers: { 'Content-Type': 'application/json' }};

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

  async changePassword(email:string, password: string): Promise<string> {
    const data = {Username: email, Password: password};
    const options = {url: this.changePasswordUrl, data: data, headers: { 'Content-Type': 'application/json' }};

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

  async register(email:string, name: string, password: string): Promise<string> {
    const data = {Username: email, Name: name, Password: password};
    const options = {url: this.registerUrl, data: data, headers: { 'Content-Type': 'application/json' }};

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
