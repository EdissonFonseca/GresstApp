import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { GlobalesService } from './globales.service';
import { StorageService } from './storage.service';
import { AppConfig } from './constants.service';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private authenticationUrl =  `${environment.apiUrl}/authentication`;

  constructor(
    private globales: GlobalesService,
    private storage: StorageService,
  ) {}

  async ping(): Promise<boolean>{
    const options = {url: `${this.authenticationUrl}/ping`, headers: { 'Content-Type': 'application/json' }, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout};

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

  async validateToken(): Promise<boolean>{
    if (this.globales.token == '') return false;

    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.authenticationUrl}/validatetoken`, headers};

    try{
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status == 200) {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.log('Error');
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async login(username: string, password:string): Promise<string>{
    const data = {Username: username, Password: password};
    const options = {url: `${this.authenticationUrl}/authenticate`, data: data, headers: { 'Content-Type': 'application/json' }, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout};

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) {
        return response.data;
      }
      throw new Error(`Usuario no autorizado`);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      throw new Error(`Error durante el inicio de sesión: ${errorMessage}`);
    }
  }

  async reconnect(): Promise<any>{
    const username = await this.storage.get('Login');
    const password = await this.storage.get('Password');
    const data = {Username: username, Password: password};
    const options = {url: `${this.authenticationUrl}/authenticate`, data: data, headers: { 'Content-Type': 'application/json' }, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout};

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) {
        this.globales.token = response.data;
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
    const options = {url: `${this.authenticationUrl}/existuser`, data: data, headers: { 'Content-Type': 'application/json' }, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout};

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
    const options = {url: `${this.authenticationUrl}/changename`, data: data, headers: { 'Content-Type': 'application/json' }, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout};

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
    const options = {url: `${this.authenticationUrl}/changepassword`, data: data, headers: { 'Content-Type': 'application/json' }, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout};

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
    const options = {url: `${this.authenticationUrl}/register`, data: data, headers: { 'Content-Type': 'application/json' }, connectTimeout: AppConfig.connectionTimeout, readTimeout: AppConfig.readTimeout};

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
