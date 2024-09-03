import { Injectable } from '@angular/core';
import { CapacitorHttp, HttpResponse  } from '@capacitor/core';
import { environment } from '../../environments/environment';
import { Embalaje } from '../interfaces/embalaje.interface';
import { Material } from '../interfaces/material.interface';
import { Insumo } from '../interfaces/insumo.interface';
import { Tercero } from '../interfaces/tercero.interface';
import { StorageService } from './storage.service';
import { Globales } from './globales.service';

@Injectable({
  providedIn: 'root',
})
export class MasterDataService {
  private depositosUrl = `${environment.apiUrl}/depositos`;
  private embalajesUrl = `${environment.apiUrl}/embalajes`;
  private insumosUrl = `${environment.apiUrl}/insumos`;
  private materialesUrl = `${environment.apiUrl}/materiales`;
  private mensajesUrl = `${environment.apiUrl}/mensajes`;
  private serviciosUrl = `${environment.apiUrl}/servicios`;
  private tercerosUrl = `${environment.apiUrl}/terceros`;
  private tratamientosUrl = `${environment.apiUrl}/tratamientos`;
  private vehiculosUrl = `${environment.apiUrl}/vehiculos`;

  constructor(
    private globales: Globales
  ) {}

 async getEmbalajes(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.embalajesUrl}/get`, headers };

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

  async getInsumos(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.insumosUrl}/get`, headers };

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

  async getInterlocutores(idResiduo:string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
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

  async getMateriales(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.materialesUrl}/getforapp`, headers };

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

  async getMensajes(idResiduo: string, idInterlocutor: string): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.embalajesUrl}/get`, headers };

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

  async getPuntos(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.depositosUrl}/getpuntos`, headers };

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

  async getServicios(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.serviciosUrl}/get`, headers };

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

  async getTerceros(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.tercerosUrl}/get`, headers };

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

  async getTratamientos(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.tratamientosUrl}/get`, headers };

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

  async getVehiculos(): Promise<any>{
    const headers = { 'Authorization': `Bearer ${this.globales.token}` };
    const options = { url: `${this.vehiculosUrl}/get`, headers };

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

  async postEmbalaje(embalaje: Embalaje): Promise<boolean> {
    const data = { Nombre: embalaje.Nombre };
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
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
    const data = { Nombre: insumo.Nombre };
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
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
    const data = { IdMaterial: null, Nombre: material.Nombre, Medicion: material.TipoMedicion, Captura: material.TipoCaptura, Referencia: material.Referencia, Factor: material.Factor, Aprovechable: material.Aprovechable };
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
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
    const data = { IdTercero: null, Nombre: tercero.Nombre, Identificacion: tercero.Identificacion, Correo: tercero.Correo, Telefono: tercero.Telefono };
    const headers = { 'Authorization': `Bearer ${this.globales.token}`,'Content-Type': 'application/json' };
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
}
