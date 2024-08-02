import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { AuthService } from './auth.service';
import { Embalaje } from '../interfaces/embalaje.interface';
import { Material } from '../interfaces/material.interface';
import { Insumo } from '../interfaces/insumo.interface';
import { Tercero } from '../interfaces/tercero.interface';
import { StorageService } from './storage.service';
import { Tarea } from '../interfaces/tarea.interface';
import { Transaccion } from '../interfaces/transaccion.interface';

@Injectable({
  providedIn: 'root',
})
export class IntegrationService {
  private actividadesUrl = `${environment.apiUrl}/appactividades`;
  private configuracionUrl = `${environment.apiUrl}/appconfiguracion/get`;
  private inventarioUrl = `${environment.apiUrl}/appinventario/get`;
  private bancoUrl = `${environment.apiUrl}/appbanco/get`;
  private interlocutoresUrl = `${environment.apiUrl}/appmensaje/listinterlocutores`;
  private mensajesUrl = `${environment.apiUrl}/appmensaje/listmensajes`;
  private embalajesUrl = `${environment.apiUrl}/embalajes`;
  private insumosUrl = `${environment.apiUrl}/insumos`;
  private materialesUrl = `${environment.apiUrl}/materiales`;
  private tercerosUrl = `${environment.apiUrl}/clientes`;

  constructor(
    private authService: AuthService,
    private storage: StorageService
  ) {}

  async getActividades(token: string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: `${this.actividadesUrl}/get`, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Request error');
      }
    } catch {
    }
  }

  async getBanco(token: string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: this.bancoUrl, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Request error');
      }
    } catch {
    }
  }

  async getConfiguracion(token: string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: this.configuracionUrl, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Request error');
      }
    } catch {
    }
  }

  async getInterlocutores(token: string, idResiduo:string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: `${this.interlocutoresUrl}/${idResiduo}`, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Request error');
      }
    } catch{
    }
  }

  async getInventario(token: string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: this.inventarioUrl, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Request error');
      }
    } catch {
    }
  }

  async getMensajes(token: string, idResiduo:string, idInterlocutor: string): Promise<any>{
    const data = { IdUsuario: idInterlocutor, IdResiduo: idResiduo};
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: this.mensajesUrl, data: data, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Request error');
      }
    } catch {
    }
  }

  async postEmbalaje(token: string, embalaje: Embalaje): Promise<boolean> {
    const data = { Nombre: embalaje.Nombre };
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.embalajesUrl}/post`, data:data, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 201) { //Created
        var embalajeCreated = response.data;
        embalaje.IdEmbalaje = embalajeCreated.IdEmbalaje;
        return true;
      } else {
        throw false;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async postInsumo(token: string, insumo: Insumo): Promise<boolean> {
    const data = { Nombre: insumo.Nombre };
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.insumosUrl}/post`, data:data, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 201) { //Created
        var insumoCreated = response.data;
        insumo.IdInsumo = insumoCreated.IdInsumo;
        return true;
      } else {
        throw false;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async postMaterial(token: string, material: Material): Promise<boolean> {
    const data = { IdMaterial: null, Nombre: material.Nombre, Medicion: material.TipoMedicion, Captura: material.TipoCaptura, Referencia: material.Referencia, Factor: material.Factor, Aprovechable: material.Aprovechable };
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.materialesUrl}/post`, data:data, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 201) { //Created
        var materialCreado = response.data;
        material.IdMaterial = materialCreado.IdMaterial;
        return true;
      } else {
        throw false;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async postTercero(token: string, tercero: Tercero): Promise<boolean> {
    const data = { IdTercero: null, Nombre: tercero.Nombre, Identificacion: tercero.Identificacion, Correo: tercero.Correo, Telefono: tercero.Telefono };
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.tercerosUrl}/post`, data:data, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 201) { //Created
        var terceroCreado = response.data;
        tercero.IdPersona = terceroCreado.IdPersona;
        return true;
      } else {
        throw false;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async createTarea(tarea: Tarea): Promise<boolean> {
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.actividadesUrl}/createtarea`, data:tarea, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 201) { //Created
        var residuoCreado = response.data;
        tarea.CRUD = undefined;
        tarea.CRUDDate = undefined;
        tarea.Item = residuoCreado.IdItem;
        return true;
      } else {
        throw false;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async updateTarea(tarea: Tarea): Promise<boolean> {
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.actividadesUrl}/updatetarea`, data:tarea, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) { //Ok
        var residuoCreado = response.data;
        tarea.CRUD = undefined;
        tarea.CRUDDate = undefined;
        return true;
      } else {
        throw false;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }

  async updateTransaccion(transaccion: Transaccion): Promise<boolean> {
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.actividadesUrl}/updatetransaccion`, data:transaccion, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 200) { //Ok
        var residuoCreado = response.data;
        transaccion.CRUD = undefined;
        transaccion.CRUDDate = undefined;
        return true;
      } else {
        throw false;
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Request error: ${error.message}`);
      } else {
        throw new Error(`Unknown error: ${error}`);
      }
    }
  }}
