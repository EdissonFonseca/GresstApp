import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { Embalaje } from '../interfaces/embalaje.interface';
import { Material } from '../interfaces/material.interface';
import { Insumo } from '../interfaces/insumo.interface';
import { Tercero } from '../interfaces/tercero.interface';
import { StorageService } from './storage.service';

@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  private embalajesUrl = `${environment.apiUrl}/embalajes`;
  private insumosUrl = `${environment.apiUrl}/insumos`;
  private masterdataUrl = `${environment.apiUrl}/appmasterdata`;
  private materialesUrl = `${environment.apiUrl}/materiales`;
  private mensajesUrl = `${environment.apiUrl}/mensajes`;
  private tercerosUrl = `${environment.apiUrl}/clientes`;

  constructor(
    private storage: StorageService
  ) {}

  async get(): Promise<any>{
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: `${this.masterdataUrl}/get`, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.get(options);
      if (response.status == 200) {
        return response.data;
      } else {
        throw new Error('Request error');
      }
    } catch (error){
      throw(error);
    }
  }

  async getInterlocutores(idResiduo:string): Promise<any>{
    const token: string = await this.storage.get('Token');
    const headers = { 'Authorization': `Bearer ${token}` };
    const options = { url: `${this.mensajesUrl}/listinterlocutores/${idResiduo}`, headers };

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

  async getMensajes(idResiduo:string, idInterlocutor: string): Promise<any>{
    const token: string = await this.storage.get('Token');
    const data = { IdUsuario: idInterlocutor, IdResiduo: idResiduo};
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.masterdataUrl}/listmensajes`, data: data, headers };

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

  async postEmbalaje(embalaje: Embalaje): Promise<boolean> {
    const token: string = await this.storage.get('Token');
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

  async postInsumo(insumo: Insumo): Promise<boolean> {
    const token: string = await this.storage.get('Token');
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

  async postMaterial(material: Material): Promise<boolean> {
    const token: string = await this.storage.get('Token');
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

  async postTercero(tercero: Tercero): Promise<boolean> {
    const token: string = await this.storage.get('Token');
    const data = { IdTercero: null, Nombre: tercero.Nombre, Identificacion: tercero.Identificacion, Correo: tercero.Correo, Telefono: tercero.Telefono };
    const headers = { 'Authorization': `Bearer ${token}`,'Content-Type': 'application/json' };
    const options = { url: `${this.tercerosUrl}/post`, data:data, headers };

    try{
      const response: HttpResponse = await CapacitorHttp.post(options);
      if (response.status == 201) { //Created
        var terceroCreado = response.data;
        tercero.IdTercero = terceroCreado.IdPersona;
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
}
